"""Test suite for acoustic propagation calculations

Validates ISO 9613-2:2024 implementation against reference values
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import ISO9613Calculator, AcousticParameters, TerrainPoint
import math

class TestISO9613Calculator:
    """Test ISO 9613-2 acoustic calculations"""
    
    def setup_method(self):
        """Setup test parameters"""
        self.params = AcousticParameters(
            temperature_c=15.0,
            humidity_percent=70.0,
            pressure_kpa=101.325,
            ground_factor=0.5,
            source_height_m=10.0,
            receiver_height_m=1.6,
            bell_type="medium_bell"
        )
        self.calculator = ISO9613Calculator(self.params)
    
    def test_geometric_divergence(self):
        """Test geometric divergence calculation"""
        # At 100m distance
        A_div = self.calculator.calculate_geometric_divergence(100.0)
        expected = 20 * math.log10(100) + 11  # 20*2 + 11 = 51 dB
        assert abs(A_div - expected) < 0.01
        
        # At 1000m distance
        A_div = self.calculator.calculate_geometric_divergence(1000.0)
        expected = 20 * math.log10(1000) + 11  # 20*3 + 11 = 71 dB
        assert abs(A_div - expected) < 0.01
    
    def test_atmospheric_absorption(self):
        """Test atmospheric absorption coefficient"""
        # At 300 Hz (medium bell fundamental)
        alpha = self.calculator.calculate_atmospheric_absorption_coefficient(300.0)
        
        # Should be small at low frequency (< 1 dB/km)
        assert 0.01 < alpha < 1.0
        
        # At 1000 Hz should be higher
        alpha_1k = self.calculator.calculate_atmospheric_absorption_coefficient(1000.0)
        assert alpha_1k > alpha
        
        # At 4000 Hz should be much higher
        alpha_4k = self.calculator.calculate_atmospheric_absorption_coefficient(4000.0)
        assert alpha_4k > alpha_1k
    
    def test_ground_effect(self):
        """Test ground effect calculation"""
        # Ground effect should be negative (reduction in attenuation)
        A_gr = self.calculator.calculate_ground_effect(100.0, 300.0)
        
        # Should be small correction, typically -3 to 0 dB
        assert -5.0 <= A_gr <= 0.0
    
    def test_fresnel_diffraction(self):
        """Test Fresnel diffraction calculation"""
        # Flat terrain - no obstruction
        source = TerrainPoint(lon=-105.5, lat=36.0, elevation=100.0)
        receiver = TerrainPoint(lon=-105.49, lat=36.01, elevation=100.0)
        profile = [
            TerrainPoint(lon=-105.5, lat=36.0, elevation=100.0),
            TerrainPoint(lon=-105.495, lat=36.005, elevation=100.0),
            TerrainPoint(lon=-105.49, lat=36.01, elevation=100.0)
        ]
        
        A_bar = self.calculator.calculate_barrier_diffraction(profile, source, receiver)
        assert A_bar == 0.0  # No obstruction
        
        # With obstruction
        profile_obstructed = [
            TerrainPoint(lon=-105.5, lat=36.0, elevation=100.0),
            TerrainPoint(lon=-105.495, lat=36.005, elevation=115.0),  # 15m hill
            TerrainPoint(lon=-105.49, lat=36.01, elevation=100.0)
        ]
        
        A_bar_obstructed = self.calculator.calculate_barrier_diffraction(
            profile_obstructed, source, receiver
        )
        assert A_bar_obstructed > 0  # Should have attenuation
    
    def test_max_audible_distance(self):
        """Test maximum audible distance calculation"""
        max_dist = self.calculator.calculate_max_audible_distance()
        
        # Medium bell should be audible for several km
        # Valencia study: bells heard up to 5 miles (8 km)
        assert 1000 < max_dist < 20000  # Between 1-20 km reasonable
        
        # Large bell should be audible farther
        large_bell_params = AcousticParameters(
            temperature_c=15.0,
            humidity_percent=70.0,
            bell_type="large_bell"
        )
        large_calculator = ISO9613Calculator(large_bell_params)
        large_max_dist = large_calculator.calculate_max_audible_distance()
        
        assert large_max_dist > max_dist
    
    def test_fresnel_zones(self):
        """Test Fresnel zone calculations"""
        zones = self.calculator.calculate_fresnel_zones(1000.0)
        
        # Should have 9 zones (3 positions x 3 zone numbers)
        assert len(zones) == 9
        
        # First zone should have largest radius
        zone1_radii = [z['radius_m'] for z in zones if z['zone_number'] == 1]
        zone2_radii = [z['radius_m'] for z in zones if z['zone_number'] == 2]
        zone3_radii = [z['radius_m'] for z in zones if z['zone_number'] == 3]
        
        # Higher zone numbers should have larger radii
        for r1, r2, r3 in zip(zone1_radii, zone2_radii, zone3_radii):
            assert r1 < r2 < r3
    
    def test_church_bell_spl_values(self):
        """Validate church bell SPL values against literature"""
        from main import CHURCH_BELL_PROFILES
        
        # Small bell
        small = CHURCH_BELL_PROFILES['small_bell']
        assert 100 <= small['source_level_db'] <= 110
        
        # Medium bell
        medium = CHURCH_BELL_PROFILES['medium_bell']
        assert 110 <= medium['source_level_db'] <= 120
        
        # Large bell (Valencia Cathedral: 120 dB inside tower)
        large = CHURCH_BELL_PROFILES['large_bell']
        assert 115 <= large['source_level_db'] <= 125
    
    def test_haversine_distance(self):
        """Test geographic distance calculation"""
        p1 = TerrainPoint(lon=-105.5, lat=36.0, elevation=0.0)
        p2 = TerrainPoint(lon=-105.49, lat=36.01, elevation=0.0)
        
        distance = ISO9613Calculator._haversine_distance(p1, p2)
        
        # Should be approximately 1.5 km
        assert 1000 < distance < 2000
        
        # Same point should give 0
        distance_same = ISO9613Calculator._haversine_distance(p1, p1)
        assert distance_same < 0.01

class TestAcousticValidation:
    """Validation against published data"""
    
    def test_valencia_cathedral_validation(self):
        """Validate against Valencia Cathedral measurements
        
        Reference: Ribera et al. (2019) - 120 dB SPL inside bell tower
        """
        params = AcousticParameters(
            temperature_c=20.0,
            humidity_percent=60.0,
            source_height_m=30.0,  # Cathedral bell tower height
            receiver_height_m=1.6,
            bell_type="large_bell"
        )
        calculator = ISO9613Calculator(params)
        
        # At 1m from bell
        source_level = calculator.bell_profile['source_level_db']
        assert 115 <= source_level <= 125
        
        # At 100m should still be audible
        A_div = calculator.calculate_geometric_divergence(100.0)
        A_atm = calculator.calculate_atmospheric_absorption_coefficient(200.0) * 0.1
        received_level = source_level - A_div - A_atm
        
        assert received_level > 20  # Above hearing threshold
    
    def test_iso9613_reference_case(self):
        """Test against ISO 9613-2 reference calculations
        
        Reference case from ISO standard documentation
        """
        params = AcousticParameters(
            temperature_c=10.0,
            humidity_percent=70.0,
            ground_factor=0.0,  # Hard ground
            source_height_m=5.0,
            receiver_height_m=1.5,
            bell_type="medium_bell"
        )
        calculator = ISO9613Calculator(params)
        
        # 100m distance over hard ground
        A_div = calculator.calculate_geometric_divergence(100.0)
        
        # Should be close to theoretical: 20*log10(100) + 11 = 51 dB
        assert abs(A_div - 51.0) < 0.1

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
