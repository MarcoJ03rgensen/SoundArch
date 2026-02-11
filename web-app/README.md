# SoundArch Web Application

Modern web-based acoustic propagation calculator with academic validation based on ISO 9613-2:2024 standards.

## Features

### Academic Validation
- **ISO 9613-2:2024 Compliance**: Full implementation of international standard for outdoor sound propagation
- **Church Bell Acoustics**: Validated source levels based on Valencia Cathedral study (2019)
- **Frequency-Dependent Calculations**: Accurate atmospheric absorption modeling
- **Terrain Effects**: Fresnel diffraction and ground effect calculations

### Interactive Visualization
- **3D Terrain Rendering**: Real-time Three.js visualization
- **Point-and-Click Interface**: Easy source/receiver placement
- **Isophone Contours**: Sound pressure level heatmaps
- **Visual Feedback**: Audibility zones and propagation paths

### Sound Source Profiles
- **Small Church Bell** (50-100 kg): 105 dB SPL @ 1m, 400 Hz
- **Medium Church Bell** (200-500 kg): 115 dB SPL @ 1m, 300 Hz  
- **Large Cathedral Bell** (1000+ kg): 120 dB SPL @ 1m, 200 Hz
- **Custom Sources**: User-defined parameters

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Python 3.11+ and Node.js (manual setup)

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/MarcoJ03rgensen/SoundArch.git
cd SoundArch/web-app

# Start services
docker-compose up -d

# Application available at:
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Serve with any static server, e.g.:
python -m http.server 8080

# Or use Node.js:
npx http-server -p 8080
```

Update `API_URL` in `frontend/app.js` to point to backend.

## Usage Guide

### 1. Load Terrain
- Click "Use Sample Terrain" for procedural demo terrain
- Or "Load DEM File" to import GeoTIFF/ASC elevation data

### 2. Configure Sound Source
- Select bell type (Small/Medium/Large Cathedral Bell)
- Adjust source height (default: 10m bell tower)
- Set environmental parameters:
  - Temperature: -20°C to +40°C
  - Humidity: 10% to 100%
  - Ground type: Hard (concrete) to Porous (grass/forest)

### 3. Place Points
- **Left-click** on terrain to place sound source (bell tower)
- **Right-click** to place receiver (listener position)
- Drag to rotate view, scroll to zoom

### 4. Calculate
- Click "Calculate Propagation"
- View results:
  - Distance between points
  - Received sound pressure level (dB SPL)
  - Audibility status
  - Maximum audible distance
  - Attenuation breakdown by component

### 5. Visualize Contours (Optional)
- Click "Show Sound Contours" to display isophone map
- Color-coded SPL distribution around source

## Academic Methodology

### ISO 9613-2:2024 Implementation

The application implements the complete outdoor sound propagation model:

**Total Attenuation (dB):**
```
A_total = A_div + A_atm + A_gr + A_bar + A_misc
```

**Components:**

1. **Geometric Divergence** (A_div)
   ```
   A_div = 20*log10(d) + 11  (for point source)
   ```

2. **Atmospheric Absorption** (A_atm)
   - ISO 9613-1:1993 formulation
   - Temperature and humidity dependent
   - Frequency-specific coefficients
   ```
   A_atm = α * d / 1000  (dB)
   ```

3. **Ground Effect** (A_gr)
   - NEW Kgeo correction factor (ISO 9613-2:2024)
   - Accounts for source/receiver height ratio
   ```
   Kgeo = 1 + ((hs + hr) / d)^2
   ```

4. **Barrier Diffraction** (A_bar)
   - Fresnel knife-edge theory
   - Multi-edge terrain obstacles

### Church Bell Acoustic Validation

**Source Levels** based on:
- Valencia Cathedral measurements (2019): 120 dB SPL inside bell towers
- Adjusted for 1m reference distance
- Validated against "church bells heard up to 5 miles" field observations

**Frequency Characteristics:**
- Small bells: 400-600 Hz fundamental
- Medium bells: 250-400 Hz
- Large bells: 150-250 Hz

### Hearing Threshold
- ISO 226 reference: 0 dB SPL = 20 μPa
- Practical outdoor threshold: 20 dB SPL (accounting for ambient noise)

## API Reference

### Get Bell Profiles
```http
GET /bell-profiles
```

Returns available church bell configurations.

### Calculate Propagation
```http
POST /calculate-propagation
Content-Type: application/json

{
  "source": {
    "lon": -105.5,
    "lat": 36.0,
    "elevation": 100.0
  },
  "receiver": {
    "lon": -105.49,
    "lat": 36.01,
    "elevation": 95.0
  },
  "terrain_profile": [
    // Array of elevation points between source and receiver
  ],
  "parameters": {
    "temperature_c": 15.0,
    "humidity_percent": 70.0,
    "ground_factor": 0.5,
    "source_height_m": 10.0,
    "receiver_height_m": 1.6,
    "bell_type": "medium_bell"
  }
}
```

**Response:**
```json
{
  "distance_m": 1234.5,
  "sound_level_db": 65.3,
  "is_audible": true,
  "max_audible_distance_m": 5432.1,
  "attenuation_breakdown": {
    "geometric_divergence_db": 73.8,
    "atmospheric_absorption_db": 2.1,
    "ground_effect_db": -1.5,
    "barrier_diffraction_db": 0.0,
    "total_attenuation_db": 74.4
  },
  "fresnel_zones": [...],
  "bell_profile": {...}
}
```

### Calculate Isophone Contours
```http
POST /calculate-isophone-contours
```

Generates 2D sound pressure level grid for visualization.

## Deployment

### Railway.app (Free Tier)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render.com

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Fly.io

```bash
fly launch
fly deploy
```

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### API Testing

```bash
# Health check
curl http://localhost:8000/health

# Get bell profiles
curl http://localhost:8000/bell-profiles

# Calculate propagation
curl -X POST http://localhost:8000/calculate-propagation \
  -H "Content-Type: application/json" \
  -d @test_request.json
```

## Academic References

1. **ISO 9613-2:2024**. Acoustics — Attenuation of sound during propagation outdoors — Part 2: General method of calculation. International Organization for Standardization.

2. **Ribera, J. E., et al. (2019)**. Valencia's Cathedral Church Bell Acoustics Impact on the Hearing Abilities of Bell Ringers. *International Journal of Environmental Research and Public Health*, 16(9), 1564. https://doi.org/10.3390/ijerph16091564

3. **Mattioli, T., et al. (2020)**. Psychology Meets Archaeology: Psychoarchaeoacoustics for Psychological Operations Simulation. *Frontiers in Psychology*, 11, 969.

4. **ISO 9613-1:1993**. Acoustics — Attenuation of sound during propagation outdoors — Part 1: Calculation of the absorption of sound by the atmosphere.

5. **Stowell, D., et al. (2022)**. Physics-based model to predict the acoustic detection distance. *arXiv preprint* arXiv:2211.16077.

## License

MIT License - see LICENSE file

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes with academic citations
4. Push to branch
5. Create Pull Request

## Support

- Issues: https://github.com/MarcoJ03rgensen/SoundArch/issues
- Email: soundarch@example.com
- Documentation: https://soundarch.readthedocs.io

## Citation

If using this tool for research:

```bibtex
@software{soundarch2026,
  title={SoundArch: Academic-Grade Acoustic Propagation Calculator},
  author={SoundArch Development Team},
  year={2026},
  url={https://github.com/MarcoJ03rgensen/SoundArch},
  note={ISO 9613-2:2024 compliant implementation}
}
```
