// SoundArch Web Application
// Academic-grade acoustic propagation calculator

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://your-backend-url.com';  // Update for production

// ============================================================================
// APPLICATION STATE
// ============================================================================

const AppState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    terrainMesh: null,
    sourceMarker: null,
    receiverMarker: null,
    isophoneContours: null,
    
    sourcePoint: null,
    receiverPoint: null,
    terrainData: null,
    
    parameters: {
        temperature_c: 15.0,
        humidity_percent: 70.0,
        pressure_kpa: 101.325,
        ground_factor: 0.5,
        source_height_m: 10.0,
        receiver_height_m: 1.6,
        bell_type: 'medium_bell'
    },
    
    bellProfiles: null,
    calculationInProgress: false
};

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
    console.log('Initializing SoundArch Application...');
    
    // Load bell profiles from API
    await loadBellProfiles();
    
    // Initialize Three.js scene
    initThreeJS();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI with initial values
    updateBellInfo();
    
    // Load sample terrain
    loadSampleTerrain();
    
    console.log('Application initialized successfully');
}

// ============================================================================
// THREE.JS SETUP
// ============================================================================

function initThreeJS() {
    const container = document.getElementById('three-container');
    
    // Scene
    AppState.scene = new THREE.Scene();
    AppState.scene.background = new THREE.Color(0x0f172a);
    AppState.scene.fog = new THREE.Fog(0x0f172a, 100, 1000);
    
    // Camera
    AppState.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        10000
    );
    AppState.camera.position.set(0, 200, 300);
    
    // Renderer
    AppState.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    AppState.renderer.setSize(container.clientWidth, container.clientHeight);
    AppState.renderer.setPixelRatio(window.devicePixelRatio);
    AppState.renderer.shadowMap.enabled = true;
    AppState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(AppState.renderer.domElement);
    
    // Controls
    AppState.controls = new THREE.OrbitControls(AppState.camera, AppState.renderer.domElement);
    AppState.controls.enableDamping = true;
    AppState.controls.dampingFactor = 0.05;
    AppState.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    AppState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    AppState.scene.add(directionalLight);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(1000, 50, 0x475569, 0x334155);
    AppState.scene.add(gridHelper);
    
    // Raycaster for picking
    AppState.raycaster = new THREE.Raycaster();
    AppState.mouse = new THREE.Vector2();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Mouse events for placing points
    AppState.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    AppState.controls.update();
    AppState.renderer.render(AppState.scene, AppState.camera);
}

function onWindowResize() {
    const container = document.getElementById('three-container');
    AppState.camera.aspect = container.clientWidth / container.clientHeight;
    AppState.camera.updateProjectionMatrix();
    AppState.renderer.setSize(container.clientWidth, container.clientHeight);
}

// ============================================================================
// TERRAIN GENERATION
// ============================================================================

function loadSampleTerrain() {
    console.log('Loading sample terrain...');
    
    // Generate procedural terrain
    const size = 200;
    const segments = 100;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Apply heightmap using Perlin-like noise
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Simple procedural height
        const height = Math.sin(x * 0.05) * 10 + 
                      Math.cos(y * 0.05) * 10 +
                      Math.random() * 3;
        positions[i + 2] = height;
    }
    
    geometry.computeVertexNormals();
    
    // Create terrain material
    const material = new THREE.MeshStandardMaterial({
        color: 0x3b7a57,
        flatShading: false,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    AppState.terrainMesh = new THREE.Mesh(geometry, material);
    AppState.terrainMesh.rotation.x = -Math.PI / 2;
    AppState.terrainMesh.receiveShadow = true;
    AppState.terrainMesh.castShadow = false;
    
    AppState.scene.add(AppState.terrainMesh);
    
    // Store terrain data for calculations
    AppState.terrainData = {
        size: size,
        segments: segments,
        positions: positions,
        center: { lon: -105.5, lat: 36.0 }  // Sample coordinates
    };
    
    // Update terrain info
    document.getElementById('terrain-name').textContent = 'Sample Procedural Terrain';
    document.getElementById('terrain-size').textContent = `${segments}x${segments} (${size}m x ${size}m)`;
    document.getElementById('terrain-info').style.display = 'block';
    
    // Enable calculation button
    document.getElementById('calculate-btn').disabled = false;
    document.getElementById('show-isophone').disabled = false;
    
    console.log('Sample terrain loaded');
}

// ============================================================================
// POINT PLACEMENT
// ============================================================================

function onMouseDown(event) {
    event.preventDefault();
    
    if (!AppState.terrainMesh) return;
    
    // Calculate mouse position in normalized device coordinates
    const container = document.getElementById('three-container');
    const rect = container.getBoundingClientRect();
    AppState.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    AppState.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast
    AppState.raycaster.setFromCamera(AppState.mouse, AppState.camera);
    const intersects = AppState.raycaster.intersectObject(AppState.terrainMesh);
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        
        if (event.button === 0) {  // Left click - source
            placeSourceMarker(point);
        } else if (event.button === 2) {  // Right click - receiver
            placeReceiverMarker(point);
        }
        
        // Enable calculate button if both points are placed
        if (AppState.sourcePoint && AppState.receiverPoint) {
            document.getElementById('calculate-btn').disabled = false;
        }
    }
}

function placeSourceMarker(point) {
    // Remove existing marker
    if (AppState.sourceMarker) {
        AppState.scene.remove(AppState.sourceMarker);
    }
    
    // Create bell tower marker
    const markerGroup = new THREE.Group();
    
    // Bell shape
    const bellGeometry = new THREE.CylinderGeometry(3, 5, 8, 16);
    const bellMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xffd700,
        emissiveIntensity: 0.2
    });
    const bell = new THREE.Mesh(bellGeometry, bellMaterial);
    bell.position.y = AppState.parameters.source_height_m / 2;
    bell.castShadow = true;
    markerGroup.add(bell);
    
    // Support pole
    const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, AppState.parameters.source_height_m, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = AppState.parameters.source_height_m / 2;
    markerGroup.add(pole);
    
    markerGroup.position.copy(point);
    markerGroup.position.y = point.y + 0.1;
    
    AppState.scene.add(markerGroup);
    AppState.sourceMarker = markerGroup;
    
    // Store point with terrain coordinates
    AppState.sourcePoint = worldToGeo(point);
    
    console.log('Source placed at:', AppState.sourcePoint);
}

function placeReceiverMarker(point) {
    // Remove existing marker
    if (AppState.receiverMarker) {
        AppState.scene.remove(AppState.receiverMarker);
    }
    
    // Create person marker
    const markerGroup = new THREE.Group();
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffdbac,
        emissive: 0xff6b35,
        emissiveIntensity: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    markerGroup.add(head);
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    markerGroup.add(body);
    
    markerGroup.position.copy(point);
    markerGroup.position.y = point.y + 0.1;
    markerGroup.castShadow = true;
    
    AppState.scene.add(markerGroup);
    AppState.receiverMarker = markerGroup;
    
    // Store point
    AppState.receiverPoint = worldToGeo(point);
    
    console.log('Receiver placed at:', AppState.receiverPoint);
}

function worldToGeo(worldPoint) {
    if (!AppState.terrainData) return null;
    
    const size = AppState.terrainData.size;
    const center = AppState.terrainData.center;
    
    // Convert world coordinates to geographic
    // Approximate: 111km per degree at equator
    const metersPerDegree = 111000;
    
    const lon = center.lon + (worldPoint.x / metersPerDegree);
    const lat = center.lat + (worldPoint.z / metersPerDegree);
    const elevation = worldPoint.y;
    
    return { lon, lat, elevation };
}

// ============================================================================
// API COMMUNICATION
// ============================================================================

async function loadBellProfiles() {
    try {
        const response = await fetch(`${API_URL}/bell-profiles`);
        if (!response.ok) {
            throw new Error('Failed to load bell profiles');
        }
        AppState.bellProfiles = await response.json();
        console.log('Bell profiles loaded:', AppState.bellProfiles);
    } catch (error) {
        console.error('Error loading bell profiles:', error);
        // Use fallback profiles
        AppState.bellProfiles = {
            medium_bell: {
                name: "Medium Church Bell",
                source_level_db: 115,
                fundamental_hz: 300
            }
        };
    }
}

async function calculatePropagation() {
    if (AppState.calculationInProgress) return;
    if (!AppState.sourcePoint || !AppState.receiverPoint) {
        alert('Please place both source and receiver points');
        return;
    }
    
    AppState.calculationInProgress = true;
    showCalculationStatus(true);
    
    try {
        // Generate terrain profile between points
        const terrainProfile = generateTerrainProfile(
            AppState.sourcePoint,
            AppState.receiverPoint
        );
        
        const requestData = {
            source: AppState.sourcePoint,
            receiver: AppState.receiverPoint,
            terrain_profile: terrainProfile,
            parameters: AppState.parameters
        };
        
        console.log('Sending calculation request:', requestData);
        
        const response = await fetch(`${API_URL}/calculate-propagation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Calculation failed');
        }
        
        const result = await response.json();
        console.log('Calculation result:', result);
        
        displayResults(result);
        
    } catch (error) {
        console.error('Calculation error:', error);
        alert(`Calculation error: ${error.message}`);
    } finally {
        AppState.calculationInProgress = false;
        showCalculationStatus(false);
    }
}

function generateTerrainProfile(source, receiver, numSamples = 50) {
    // Generate intermediate points along path
    const profile = [];
    
    for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;
        const lon = source.lon + (receiver.lon - source.lon) * t;
        const lat = source.lat + (receiver.lat - source.lat) * t;
        const elevation = source.elevation + (receiver.elevation - source.elevation) * t;
        
        profile.push({ lon, lat, elevation });
    }
    
    return profile;
}

function displayResults(result) {
    // Show results container
    document.getElementById('results-content').style.display = 'none';
    document.getElementById('results-data').style.display = 'block';
    
    // Distance
    document.getElementById('result-distance').textContent = 
        `${result.distance_m.toFixed(1)} m (${(result.distance_m / 1000).toFixed(2)} km)`;
    
    // Sound level
    const splElement = document.getElementById('result-spl');
    splElement.textContent = `${result.sound_level_db.toFixed(1)} dB SPL`;
    
    // Color code based on audibility
    if (result.sound_level_db >= 60) {
        splElement.style.color = '#10b981';
    } else if (result.sound_level_db >= 40) {
        splElement.style.color = '#f59e0b';
    } else {
        splElement.style.color = '#ef4444';
    }
    
    // SPL indicator bar
    const splIndicator = document.getElementById('spl-indicator');
    const splPercent = Math.min(100, (result.sound_level_db / 120) * 100);
    splIndicator.style.width = `${splPercent}%`;
    
    // Audibility
    const audibleElement = document.getElementById('result-audible');
    if (result.is_audible) {
        audibleElement.textContent = '✅ Audible';
        audibleElement.style.color = '#10b981';
    } else {
        audibleElement.textContent = '❌ Not Audible';
        audibleElement.style.color = '#ef4444';
    }
    
    // Max distance
    document.getElementById('result-max-distance').textContent = 
        `${result.max_audible_distance_m.toFixed(0)} m (${(result.max_audible_distance_m / 1000).toFixed(2)} km)`;
    
    // Attenuation breakdown
    const breakdown = result.attenuation_breakdown;
    document.getElementById('atten-divergence').textContent = 
        `${breakdown.geometric_divergence_db.toFixed(1)} dB`;
    document.getElementById('atten-atmospheric').textContent = 
        `${breakdown.atmospheric_absorption_db.toFixed(1)} dB`;
    document.getElementById('atten-ground').textContent = 
        `${breakdown.ground_effect_db.toFixed(1)} dB`;
    document.getElementById('atten-barrier').textContent = 
        `${breakdown.barrier_diffraction_db.toFixed(1)} dB`;
    document.getElementById('atten-total').textContent = 
        `${breakdown.total_attenuation_db.toFixed(1)} dB`;
}

// ============================================================================
// UI EVENT HANDLERS
// ============================================================================

function setupEventListeners() {
    // Bell type selector
    document.getElementById('bell-type').addEventListener('change', (e) => {
        AppState.parameters.bell_type = e.target.value;
        updateBellInfo();
    });
    
    // Parameter sliders
    document.getElementById('temperature').addEventListener('input', (e) => {
        AppState.parameters.temperature_c = parseFloat(e.target.value);
        document.getElementById('temp-value').textContent = e.target.value;
    });
    
    document.getElementById('humidity').addEventListener('input', (e) => {
        AppState.parameters.humidity_percent = parseFloat(e.target.value);
        document.getElementById('humidity-value').textContent = e.target.value;
    });
    
    document.getElementById('ground-factor').addEventListener('input', (e) => {
        AppState.parameters.ground_factor = parseFloat(e.target.value);
        const types = ['Hard', 'Mixed-Hard', 'Mixed', 'Mixed-Porous', 'Porous'];
        const index = Math.floor(parseFloat(e.target.value) * (types.length - 1));
        document.getElementById('ground-type').textContent = types[index];
    });
    
    document.getElementById('source-height').addEventListener('input', (e) => {
        AppState.parameters.source_height_m = parseFloat(e.target.value);
        document.getElementById('source-height-value').textContent = e.target.value;
        // Update marker if exists
        if (AppState.sourceMarker) {
            AppState.sourceMarker.children[1].position.y = parseFloat(e.target.value) / 2;
            AppState.sourceMarker.children[0].position.y = parseFloat(e.target.value) / 2;
        }
    });
    
    document.getElementById('receiver-height').addEventListener('input', (e) => {
        AppState.parameters.receiver_height_m = parseFloat(e.target.value);
        document.getElementById('receiver-height-value').textContent = e.target.value;
    });
    
    // Buttons
    document.getElementById('calculate-btn').addEventListener('click', calculatePropagation);
    document.getElementById('use-sample-terrain').addEventListener('click', loadSampleTerrain);
    
    // Modal
    const modal = document.getElementById('references-modal');
    const closeBtn = modal.querySelector('.close');
    
    document.querySelectorAll('a[href="#references"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Prevent right-click menu
    document.getElementById('three-container').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

function updateBellInfo() {
    if (!AppState.bellProfiles) return;
    
    const profile = AppState.bellProfiles[AppState.parameters.bell_type];
    if (!profile) return;
    
    document.getElementById('source-level').textContent = `${profile.source_level_db} dB`;
    document.getElementById('fundamental-freq').textContent = `${profile.fundamental_hz} Hz`;
    document.getElementById('bell-reference').textContent = profile.reference || 'Academic reference';
}

function showCalculationStatus(show) {
    document.getElementById('calculation-status').style.display = show ? 'flex' : 'none';
}

// ============================================================================
// APPLICATION START
// ============================================================================

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('SoundArch Application Loaded');
