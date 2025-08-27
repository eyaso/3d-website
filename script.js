// Global variables - Apartment Building Showcase MVP
let scene, camera, renderer, house, currentPhase = 0;
let scrollProgress = 0;
const totalPhases = 10; // Professional apartment building tour
let gltfLoader; // GLB/GLTF loader for modern web 3D
let externalModel = null;
let isInsideHouse = false; // Always false for exterior showcase
let currentFloor = null; // Not used in exterior tour
let isScrolling = false;
let scrollTimeout = null;
let lastScrollTime = 0;

// Building reveal system - Progressive interior showcase
let buildingParts = {
    walls: [],           // Plastic.003 - Main structural walls
    roof: [],            // roof.003 - Roof elements
    floors: [],          // podlaha.002 - Floor surfaces
    windows: [],         // Glass.002 - Window elements
    iron: [],            // iron.002 - Structural elements
    exterior: [],        // Omitka.002 - Exterior plaster
    wood: [],            // wood dark.002 - Wooden elements
    shutters: []         // roleta.002 - Shutters/blinds
};
let revealMode = false;  // Whether building reveal is active

// Phase data - Professional exterior architectural showcase
const phases = [
    // APARTMENT BUILDING ARCHITECTURAL TOUR - OPTIMIZED FOR LARGER BUILDING
    {
        number: "01", title: "Building Overview", subtitle: "Modern Apartment Complex",
        description: "Experience our modern apartment building showcasing contemporary architecture and multi-story living design.",
        camera: { x: 15, y: 35, z: 25 }, target: { x: 0, y: 5, z: 0 }, type: "exterior"
    },
    {
        number: "02", title: "Main Entrance", subtitle: "Lobby & Reception Design",
        description: "Detailed view of the main entrance featuring modern lobby design and residential access systems.",
        camera: { x: 0, y: 8, z: 35 }, target: { x: 0, y: 4, z: 0 }, type: "exterior"
    },
    {
        number: "03", title: "Left Wing Elevation", subtitle: "Unit Layout & Windows",
        description: "Left side perspective showcasing apartment unit layouts, balconies, and window arrangements.",
        camera: { x: -32, y: 12, z: 15 }, target: { x: 0, y: 6, z: 0 }, type: "exterior"
    },
    {
        number: "04", title: "Interior Reveal", subtitle: "First Interior Glimpse",
        description: "Walls begin to fade revealing the interior layout and apartment arrangements within the building.",
        camera: { x: 0, y: 10, z: -38 }, target: { x: 0, y: 5, z: 0 }, type: "interior_reveal"
    },
    {
        number: "05", title: "Interior Layout", subtitle: "Apartment Arrangements", 
        description: "Enhanced interior view showcasing individual apartment units and their spatial relationships.",
        camera: { x: 32, y: 12, z: 15 }, target: { x: 0, y: 6, z: 0 }, type: "interior_reveal"
    },
    {
        number: "06", title: "Multi-Floor Interior", subtitle: "Vertical Living Spaces",
        description: "Progressive roof removal reveals upper floor apartments and vertical circulation systems.",
        camera: { x: 20, y: 8, z: 20 }, target: { x: 0, y: 4, z: 0 }, type: "interior_focus"
    },
    {
        number: "07", title: "Full Interior View", subtitle: "Complete Layout Revealed",
        description: "Complete interior visibility with walls and roof removed, showcasing full apartment layouts.",
        camera: { x: 15, y: 30, z: 25 }, target: { x: 0, y: 8, z: 0 }, type: "interior_focus"
    },
    {
        number: "08", title: "Interior Details", subtitle: "Living Space Design",
        description: "Close examination of interior spaces, room layouts, and residential design features.",
        camera: { x: 12, y: 6, z: 18 }, target: { x: 0, y: 3, z: 0 }, type: "interior_focus"
    },
    {
        number: "09", title: "Clean Interior View", subtitle: "Pure Layout Focus", 
        description: "Minimalist interior view with exterior elements hidden to focus on spatial organization.",
        camera: { x: 40, y: 15, z: 35 }, target: { x: 0, y: 3, z: 0 }, type: "interior_focus"
    },
    {
        number: "10", title: "Aerial Complex View", subtitle: "Complete Development",
        description: "Bird's eye view revealing the complete apartment complex and property development layout.",
        camera: { x: 12, y: 38, z: 22 }, target: { x: 0, y: 5, z: 0 }, type: "exterior"
    }
];

// Initialize the apartment building showcase application
async function init() {
    // Wait for THREE.js to load
    if (typeof THREE === 'undefined') {
        console.error('THREE.js not loaded, retrying...');
        setTimeout(init, 100);
        return;
    }
    
    console.log('🚀 Initializing Apartment Building Showcase...');
    console.log('✅ THREE.js loaded successfully');
    console.log('✅ GLTFLoader ready for apartment building');
    
    createScene();
    initializeLoaders();
    await createApartmentShowcase();
    createLighting();
    setupEventListeners();
    
    // Initialize smooth scrolling variables
    targetScrollProgress = 0;
    currentScrollProgress = 0;
    
    // FIXED: Set camera to correct Phase 0 position on initial load
    initializeCameraToPhase0();
    
    animate();
    hideLoadingScreen();
}

// Initialize camera to Phase 0 position for correct first load
function initializeCameraToPhase0() {
    if (!phases || phases.length === 0) {
        console.warn('No phases available for camera initialization');
        return;
    }
    
    const phase0 = phases[0];
    if (phase0 && phase0.camera && phase0.target) {
        // Set camera to exact Phase 0 position
        camera.position.set(phase0.camera.x, phase0.camera.y, phase0.camera.z);
        camera.lookAt(phase0.target.x, phase0.target.y, phase0.target.z);
        
        // Initialize scroll state properly
        currentPhase = 0;
        scrollProgress = 0;
        
        console.log('Camera initialized to Phase 0:', {
            position: phase0.camera,
            target: phase0.target,
            title: phase0.title
        });
        
        // Update UI for initial state
        updateHouseState();
        updateUI();
    } else {
        console.warn('Phase 0 data missing, using fallback camera position');
        camera.position.set(15, 35, 25);
        camera.lookAt(0, 5, 0);
    }
}

// Initialize GLB/GLTF loader for apartment building
function initializeLoaders() {
    gltfLoader = new THREE.GLTFLoader();
    console.log('GLB/GLTF loader initialized for apartment building showcase');
}

// GLB/GLTF models have perfect materials - no fixing needed!

// Load apartment building GLB model - Clean MVP version
function loadApartmentBuilding(modelPath) {
    return new Promise((resolve, reject) => {
        console.log('Loading apartment building:', modelPath);
        
        gltfLoader.load(
            modelPath,
            (gltf) => {
                const object = gltf.scene;
                
                // Smart scaling and positioning for apartment building
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const maxDimension = Math.max(size.x, size.y, size.z);
                
                console.log('🏢 Apartment Building Loaded Successfully!');
                console.log('📏 Dimensions:', size);
                console.log('📍 Center:', center);
                
                // Intelligent scaling for apartment buildings
                let scale = 1;
                if (maxDimension > 100) {
                    scale = 25 / maxDimension;
                    console.log('🔧 Large building scaled to:', scale);
                } else if (maxDimension < 5) {
                    scale = 5;
                    console.log('🔧 Small building scaled up to:', scale);
                }
                
                object.scale.set(scale, scale, scale);
                
                // Perfect positioning on grass field
                object.position.set(
                    -center.x * scale, 
                    -box.min.y * scale - 1,  // On ground level
                    -center.z * scale
                );
                
                // Enable professional shadows and lighting + Collect building parts for reveal system
                collectBuildingParts(object);
                
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        console.log('✨ Material optimized:', child.material ? child.material.name : 'unnamed');
                    }
                });
                
                console.log('🎯 Apartment building positioned perfectly!');
                externalModel = object;
                resolve(object);
            },
            (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`🏗️ Loading Apartment Building: ${percent}%`);
                    
                    // Update professional loading screen
                    const loadingText = document.querySelector('#loading-screen p');
                    if (loadingText) {
                        loadingText.textContent = `Loading Apartment Building: ${percent}%`;
                    }
                }
            },
            (error) => {
                console.error('❌ Failed to load apartment building:', error.message);
                reject(error);
            }
        );
    });
}

// Collect building parts by material for progressive reveal system
function collectBuildingParts(object) {
    // Reset building parts arrays
    Object.keys(buildingParts).forEach(key => {
        buildingParts[key] = [];
    });
    
    console.log('🔍 Collecting building parts for reveal system...');
    
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            const materialName = child.material.name;
            
            // Categorize meshes by material for targeted control
            switch (materialName) {
                case 'Plastic.003':
                    buildingParts.walls.push(child);
                    break;
                case 'roof.003':
                    buildingParts.roof.push(child);
                    break;
                case 'podlaha.002':
                    buildingParts.floors.push(child);
                    break;
                case 'Glass.002':
                    buildingParts.windows.push(child);
                    break;
                case 'iron.002':
                    buildingParts.iron.push(child);
                    break;
                case 'Omitka.002':
                    buildingParts.exterior.push(child);
                    break;
                case 'wood dark.002':
                    buildingParts.wood.push(child);
                    break;
                case 'roleta.002':
                    buildingParts.shutters.push(child);
                    break;
            }
            
            // Make materials transparent-ready for smooth transitions
            if (child.material && !child.material.transparent) {
                child.material.transparent = true;
                child.material.opacity = 1.0;
            }
        }
    });
    
    // Log collected parts for debugging
    console.log('🏗️ Building parts collected:');
    console.log('   🧱 Walls:', buildingParts.walls.length);
    console.log('   🏠 Roof:', buildingParts.roof.length);
    console.log('   🔳 Floors:', buildingParts.floors.length);
    console.log('   🪟 Windows:', buildingParts.windows.length);
    console.log('   ⚙️ Iron:', buildingParts.iron.length);
    console.log('   🎨 Exterior:', buildingParts.exterior.length);
    console.log('   🪵 Wood:', buildingParts.wood.length);
    console.log('   🪟 Shutters:', buildingParts.shutters.length);
}

// Progressive building reveal based on scroll progress and current phase
function updateBuildingReveal() {
    if (!externalModel || buildingParts.walls.length === 0) {
        return; // No model loaded or no parts collected
    }
    
    // Determine reveal progress based on current phase
    const revealPhases = [
        { phase: 0, walls: 1.0, roof: 1.0, exterior: 1.0 },     // Phase 1: Full building
        { phase: 1, walls: 1.0, roof: 1.0, exterior: 1.0 },     // Phase 2: Full building
        { phase: 2, walls: 1.0, roof: 1.0, exterior: 1.0 },     // Phase 3: Full building
        { phase: 3, walls: 0.7, roof: 1.0, exterior: 0.8 },     // Phase 4: Start revealing interior
        { phase: 4, walls: 0.4, roof: 1.0, exterior: 0.6 },     // Phase 5: More interior visible
        { phase: 5, walls: 0.2, roof: 0.8, exterior: 0.4 },     // Phase 6: Interior focus
        { phase: 6, walls: 0.1, roof: 0.3, exterior: 0.2 },     // Phase 7: Roof start disappearing
        { phase: 7, walls: 0.0, roof: 0.0, exterior: 0.1 },     // Phase 8: Full interior view
        { phase: 8, walls: 0.0, roof: 0.0, exterior: 0.0 },     // Phase 9: Clean interior
        { phase: 9, walls: 0.2, roof: 0.5, exterior: 0.3 }      // Phase 10: Partial restore for aerial view
    ];
    
    const currentReveal = revealPhases[currentPhase] || revealPhases[0];
    
    // Apply smooth opacity transitions
    buildingParts.walls.forEach(mesh => {
        mesh.material.opacity = currentReveal.walls;
        mesh.visible = currentReveal.walls > 0.05;
    });
    
    buildingParts.roof.forEach(mesh => {
        mesh.material.opacity = currentReveal.roof;
        mesh.visible = currentReveal.roof > 0.05;
    });
    
    buildingParts.exterior.forEach(mesh => {
        mesh.material.opacity = currentReveal.exterior;
        mesh.visible = currentReveal.exterior > 0.05;
    });
    
    // Keep windows, floors, and structural elements visible for interior views
    buildingParts.windows.forEach(mesh => {
        mesh.material.opacity = 0.8; // Slightly transparent windows
    });
    
    buildingParts.floors.forEach(mesh => {
        mesh.material.opacity = 1.0; // Always show floors
    });
    
    buildingParts.iron.forEach(mesh => {
        mesh.material.opacity = 1.0; // Always show structure
    });
}

// Load apartment building - Clean MVP focused approach
async function tryLoadApartmentBuilding() {
    const apartmentPath = './models/Apartment_building.glb';
    
    try {
        console.log('🏢 Loading apartment building for professional showcase...');
        const loadedModel = await loadApartmentBuilding(apartmentPath);
        console.log('✅ Apartment building loaded successfully for client demo!');
        return loadedModel;
    } catch (error) {
        console.error('❌ Failed to load apartment building:', error.message);
        console.log('💡 Please ensure Apartment_building.glb is in the models/ folder');
        return null;
    }
}

// Create the Three.js scene
function createScene() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
    
    // Camera - Initialize closer to Phase 0 position to minimize visual jump
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 35, 25); // Match Phase 0 position
    camera.lookAt(0, 5, 0); // Match Phase 0 target
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('three-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Optimize renderer for GLB files (which often use PBR materials)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Additional settings optimized for GLB/GLTF files
    renderer.physicallyCorrectLights = true; // Better for GLB PBR materials
    console.log('Renderer configured for GLB/GLTF optimization');
}

// Create the apartment building showcase with professional landscaping
async function createApartmentShowcase() {
    house = new THREE.Group();
    
    // Create professional grass field environment
    createEnvironment();
    
    // Load apartment building for client presentation
    try {
        const apartmentBuilding = await tryLoadApartmentBuilding();
        if (apartmentBuilding) {
            house.add(apartmentBuilding);
            console.log('🏢 Apartment building ready for professional showcase!');
            
            // Optimize fog for apartment building scale
            scene.fog = new THREE.Fog(0x87CEEB, 60, 140);
        } else {
            throw new Error('Apartment building GLB file not found');
        }
    } catch (error) {
        console.error('❌ Could not load apartment building for demo:', error.message);
        console.log('💡 Please ensure Apartment_building.glb is available');
        
        // Create fallback geometry if needed
        createBasicHouseGeometry();
        scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
    }
    
    scene.add(house);
}

// Create environment (ground, etc.)
function createEnvironment() {
    // Load grass texture for realistic ground
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
        './models/grass.jpg',
        (grassTexture) => {
            // Configure grass texture for realistic field effect
            grassTexture.wrapS = THREE.RepeatWrapping;
            grassTexture.wrapT = THREE.RepeatWrapping;
            grassTexture.repeat.set(25, 25); // Larger repeat for apartment building field
            grassTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            
            // Create grass field with your texture
            const groundGeometry = new THREE.PlaneGeometry(100, 100);
            const groundMaterial = new THREE.MeshLambertMaterial({ 
                map: grassTexture,
                color: 0xffffff // White to show texture true colors
            });
            
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1.5; // Lower to avoid z-fighting with building base
            ground.receiveShadow = true;
            scene.add(ground);
            
            console.log('Grass texture loaded and applied successfully! 🌱');
        },
        (progress) => {
            console.log('Loading grass texture...', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        (error) => {
            console.log('Could not load grass texture, using fallback green:', error.message);
            
            // Fallback to green color if texture fails
            const groundGeometry = new THREE.PlaneGeometry(100, 100);
            const groundMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x6b8e3d // Fallback green
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1.5;
            ground.receiveShadow = true;
            scene.add(ground);
        }
    );
    
    // Temporarily disable landscaping to avoid z-fighting
    // createLandscaping();
}

// Create basic landscaping
function createLandscaping() {
    // Trees
    for (let i = 0; i < 8; i++) {
        const treeGroup = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        treeGroup.add(trunk);
        
        // Tree foliage
        const foliageGeometry = new THREE.SphereGeometry(2.5);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x0f5132 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 4;
        treeGroup.add(foliage);
        
        // Position trees around the house
        const angle = (i / 8) * Math.PI * 2;
        const radius = 20 + Math.random() * 10;
        treeGroup.position.x = Math.cos(angle) * radius;
        treeGroup.position.z = Math.sin(angle) * radius;
        treeGroup.position.y = -1;
        
        treeGroup.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(treeGroup);
    }
}

// Create detailed house geometry with interiors
function createBasicHouseGeometry() {
    // Create foundation and exterior structure
    createFoundationAndExterior();
    
    // Create detailed windows and doors
    createDetailedWindowsAndDoors();
    
    // Create interior rooms and furniture
    createInteriorRooms();
    
    // Create architectural details
    createArchitecturalDetails();
}

// Foundation and main structure
function createFoundationAndExterior() {
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(14, 1, 10);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = -0.5;
    foundation.castShadow = true;
    house.add(foundation);
    
    // Ground floor walls
    createWalls(0, 3, 12, 8, 0xF5F5DC); // Beige walls
    
    // First floor walls
    createWalls(3, 3, 12, 8, 0xF5F5DC);
    
    // Second floor walls (smaller)
    createWalls(6, 2.5, 10, 7, 0xF5F5DC);
    
    // Create detailed roof system
    createDetailedRoof();
}

// Create walls with openings
function createWalls(yPos, height, width, depth, color) {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: color });
    const wallThickness = 0.2;
    
    // Front wall (with door opening on ground floor)
    const frontWallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, yPos + height/2, depth/2);
    frontWall.castShadow = true;
    house.add(frontWall);
    
    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, yPos + height/2, -depth/2);
    backWall.castShadow = true;
    house.add(backWall);
    
    // Left wall
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, height, depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-width/2, yPos + height/2, 0);
    leftWall.castShadow = true;
    house.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(width/2, yPos + height/2, 0);
    rightWall.castShadow = true;
    house.add(rightWall);
    
    // Floor
    const floorGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xDDD8AA });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, yPos, 0);
    floor.receiveShadow = true;
    house.add(floor);
}

// Detailed roof system
function createDetailedRoof() {
    // Main roof
    const roofGeometry = new THREE.ConeGeometry(8, 4, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(1, 3, 1);
    const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(3, 10, 1);
    chimney.castShadow = true;
    house.add(chimney);
    
    // Roof tiles detail
    for (let i = 0; i < 20; i++) {
        const tileGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.3);
        const tile = new THREE.Mesh(tileGeometry, roofMaterial);
        const angle = (i / 20) * Math.PI * 2;
        tile.position.set(
            Math.cos(angle) * 6,
            9 + Math.sin(i * 0.5) * 0.2,
            Math.sin(angle) * 6
        );
        tile.rotation.y = angle;
        house.add(tile);
    }
}

// Detailed windows and doors
function createDetailedWindowsAndDoors() {
    // Front entrance door
    createDoor(0, 1.25, 4.1);
    
    // Ground floor windows
    createWindow(-3, 1.5, 4.1);
    createWindow(3, 1.5, 4.1);
    createWindow(-6, 1.5, 0);
    createWindow(6, 1.5, 0);
    
    // First floor windows
    createWindow(-3, 4.5, 4.1);
    createWindow(3, 4.5, 4.1);
    createWindow(-6, 4.5, 0);
    createWindow(6, 4.5, 0);
    
    // Second floor windows
    createWindow(-2, 7, 3.6);
    createWindow(2, 7, 3.6);
}

// Create a detailed window
function createWindow(x, y, z) {
    // Window frame
    const frameGeometry = new THREE.BoxGeometry(1.5, 1.8, 0.15);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(x, y, z);
    house.add(frame);
    
    // Window glass
    const glassGeometry = new THREE.BoxGeometry(1.3, 1.6, 0.05);
    const glassMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.6 
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.set(x, y, z + 0.05);
    house.add(glass);
    
    // Window dividers
    const dividerMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    // Horizontal divider
    const hDividerGeometry = new THREE.BoxGeometry(1.3, 0.05, 0.1);
    const hDivider = new THREE.Mesh(hDividerGeometry, dividerMaterial);
    hDivider.position.set(x, y, z + 0.08);
    house.add(hDivider);
    
    // Vertical divider
    const vDividerGeometry = new THREE.BoxGeometry(0.05, 1.6, 0.1);
    const vDivider = new THREE.Mesh(vDividerGeometry, dividerMaterial);
    vDivider.position.set(x, y, z + 0.08);
    house.add(vDivider);
}

// Create detailed door
function createDoor(x, y, z) {
    // Door frame
    const frameGeometry = new THREE.BoxGeometry(2, 2.5, 0.2);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(x, y, z);
    house.add(frame);
    
    // Door
    const doorGeometry = new THREE.BoxGeometry(1.8, 2.3, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(x, y, z + 0.05);
    house.add(door);
    
    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.05);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(x + 0.7, y, z + 0.1);
    house.add(handle);
    
    // Door steps
    const stepGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    const stepMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const step = new THREE.Mesh(stepGeometry, stepMaterial);
    step.position.set(x, 0.1, z + 0.5);
    house.add(step);
}

// Create interior rooms with furniture
function createInteriorRooms() {
    // Ground floor interior
    createGroundFloorInterior();
    
    // First floor interior
    createFirstFloorInterior();
    
    // Second floor interior
    createSecondFloorInterior();
}

function createGroundFloorInterior() {
    // Living room furniture
    createSofa(-3, 0.5, 1);
    createTable(-3, 0.3, -1);
    createChairs(-4, 0.4, -1);
    createChairs(-2, 0.4, -1);
    
    // Kitchen area
    createKitchen(4, 0, 2);
    
    // Interior walls (room dividers)
    createInteriorWall(0, 0.5, 1.5, 'horizontal');
    createInteriorWall(-1, 0.5, 0, 'vertical');
}

function createFirstFloorInterior() {
    // Master bedroom
    createBed(-3, 3.2, 1);
    createNightstand(-4.5, 3.4, 1);
    createNightstand(-1.5, 3.4, 1);
    createWardrobe(-5, 3.8, -1);
    
    // Second bedroom
    createBed(3, 3.2, 1);
    createDesk(4, 3.4, -1);
    createChair(4, 3.4, -0.5);
    
    // Bathroom
    createBathroom(0, 3, -2);
}

function createSecondFloorInterior() {
    // Attic/Study room
    createDesk(0, 6.4, 1);
    createChair(0, 6.4, 1.5);
    createBookshelf(-3, 6.8, 0);
    createBookshelf(3, 6.8, 0);
}

// Furniture creation functions
function createSofa(x, y, z) {
    const sofaGeometry = new THREE.BoxGeometry(2, 0.8, 1);
    const sofaMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
    sofa.position.set(x, y, z);
    house.add(sofa);
    
    // Sofa back
    const backGeometry = new THREE.BoxGeometry(2, 1, 0.2);
    const back = new THREE.Mesh(backGeometry, sofaMaterial);
    back.position.set(x, y + 0.5, z - 0.4);
    house.add(back);
}

function createTable(x, y, z) {
    // Table top
    const topGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
    const topMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(x, y, z);
    house.add(top);
    
    // Table legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        const xOffset = (i % 2) * 1.4 - 0.7;
        const zOffset = Math.floor(i / 2) * 0.8 - 0.4;
        leg.position.set(x + xOffset, y - 0.35, z + zOffset);
        house.add(leg);
    }
}

function createChairs(x, y, z) {
    const chairGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(x, y, z);
    house.add(chair);
    
    // Chair back
    const backGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.1);
    const back = new THREE.Mesh(backGeometry, chairMaterial);
    back.position.set(x, y + 0.4, z - 0.2);
    house.add(back);
}

function createKitchen(x, y, z) {
    // Kitchen counter
    const counterGeometry = new THREE.BoxGeometry(2, 0.8, 1);
    const counterMaterial = new THREE.MeshLambertMaterial({ color: 0xDDD8AA });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(x, y + 0.4, z);
    house.add(counter);
    
    // Refrigerator
    const fridgeGeometry = new THREE.BoxGeometry(0.6, 1.8, 0.6);
    const fridgeMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 });
    const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
    fridge.position.set(x + 1.2, y + 0.9, z);
    house.add(fridge);
}

function createBed(x, y, z) {
    // Mattress
    const mattressGeometry = new THREE.BoxGeometry(2, 0.3, 1.5);
    const mattressMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.position.set(x, y, z);
    house.add(mattress);
    
    // Bed frame
    const frameGeometry = new THREE.BoxGeometry(2.2, 0.8, 1.7);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(x, y - 0.25, z);
    house.add(frame);
}

function createNightstand(x, y, z) {
    const standGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.4);
    const standMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(x, y, z);
    house.add(stand);
}

function createWardrobe(x, y, z) {
    const wardrobeGeometry = new THREE.BoxGeometry(1, 2, 0.6);
    const wardrobeMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const wardrobe = new THREE.Mesh(wardrobeGeometry, wardrobeMaterial);
    wardrobe.position.set(x, y, z);
    house.add(wardrobe);
}

function createDesk(x, y, z) {
    const deskGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8);
    const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(x, y, z);
    house.add(desk);
    
    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, deskMaterial);
        const xOffset = (i % 2) * 1.3 - 0.65;
        const zOffset = Math.floor(i / 2) * 0.6 - 0.3;
        leg.position.set(x + xOffset, y - 0.4, z + zOffset);
        house.add(leg);
    }
}

function createChair(x, y, z) {
    const chairGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(x, y, z);
    house.add(chair);
}

function createBathroom(x, y, z) {
    // Toilet
    const toiletGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.6);
    const toiletMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const toilet = new THREE.Mesh(toiletGeometry, toiletMaterial);
    toilet.position.set(x - 1, y + 0.4, z);
    house.add(toilet);
    
    // Sink
    const sinkGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
    const sink = new THREE.Mesh(sinkGeometry, toiletMaterial);
    sink.position.set(x + 1, y + 0.9, z);
    house.add(sink);
}

function createBookshelf(x, y, z) {
    const shelfGeometry = new THREE.BoxGeometry(0.8, 2, 0.3);
    const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(x, y, z);
    house.add(shelf);
    
    // Books
    for (let i = 0; i < 3; i++) {
        const bookGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.05);
        const bookMaterial = new THREE.MeshLambertMaterial({ 
            color: [0xFF0000, 0x00FF00, 0x0000FF][i] 
        });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(x, y - 0.5 + i * 0.5, z + 0.1);
        house.add(book);
    }
}

function createInteriorWall(x, y, z, orientation) {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC, transparent: true, opacity: 0.8 });
    let wallGeometry;
    
    if (orientation === 'horizontal') {
        wallGeometry = new THREE.BoxGeometry(8, 3, 0.1);
    } else {
        wallGeometry = new THREE.BoxGeometry(0.1, 3, 6);
    }
    
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    house.add(wall);
}

// Architectural details
function createArchitecturalDetails() {
    // Front porch columns
    createColumn(-2, 1.5, 3.5);
    createColumn(2, 1.5, 3.5);
    
    // Balcony
    createBalcony();
    
    // Decorative elements
    createDecorations();
}

function createColumn(x, y, z) {
    const columnGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3);
    const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(x, y, z);
    house.add(column);
    
    // Column capital
    const capitalGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
    const capital = new THREE.Mesh(capitalGeometry, columnMaterial);
    capital.position.set(x, y + 1.6, z);
    house.add(capital);
}

function createBalcony() {
    // Balcony floor
    const floorGeometry = new THREE.BoxGeometry(6, 0.1, 2);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, 6, 4.5);
    house.add(floor);
    
    // Balcony railing
    for (let i = -2; i <= 2; i++) {
        const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const rail = new THREE.Mesh(railGeometry, railMaterial);
        rail.position.set(i * 1.2, 6.5, 5.5);
        house.add(rail);
    }
}

function createDecorations() {
    // Garden elements around house
    createGardenElements();
    
    // Outdoor lighting
    createOutdoorLights();
}

function createGardenElements() {
    // Flower beds
    for (let i = 0; i < 6; i++) {
        const flowerGeometry = new THREE.SphereGeometry(0.2);
        const flowerMaterial = new THREE.MeshLambertMaterial({ 
            color: [0xFF69B4, 0xFF0000, 0xFFFF00, 0xFF4500, 0x9370DB, 0x00FF00][i] 
        });
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        const angle = (i / 6) * Math.PI * 2;
        flower.position.set(
            Math.cos(angle) * 8 + Math.random() * 2,
            0.2,
            Math.sin(angle) * 6 + Math.random() * 2
        );
        house.add(flower);
    }
}

function createOutdoorLights() {
    // Street lamps
    for (let i = 0; i < 2; i++) {
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(i * 16 - 8, 2, 8);
        house.add(pole);
        
        // Light fixture
        const lightGeometry = new THREE.SphereGeometry(0.3);
        const lightMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(i * 16 - 8, 4, 8);
        house.add(light);
    }
}

// Old functions removed - now using detailed geometry

// Create balanced lighting to show true colors without oversaturation
function createLighting() {
    // Moderate ambient light - not too bright to preserve color balance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Main sun light - natural white light, moderate intensity
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(30, 25, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.radius = 8;
    scene.add(sunLight);
    
    // Gentle fill light to balance colors without washing them out
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight1.position.set(-25, 15, -15);
    scene.add(fillLight1);
    
    // Soft side lighting for even illumination
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight2.position.set(15, 10, -25);
    scene.add(fillLight2);
    
    console.log('Balanced lighting setup complete for color preservation');
}

// Particle system removed for cleaner architectural presentation

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onWindowResize);
    
    // Add mouse wheel for fine control with smoother scrolling
    window.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        // Mark that we're scrolling
        setScrollingState(true);
        
        const scrollDelta = event.deltaY * 0.0005; // Reduced for smoother scrolling
        updateScrollProgress(scrollProgress + scrollDelta);
    }, { passive: false });
    
    // Add keyboard navigation with smoother increments
    window.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowDown':
            case 'PageDown':
            case ' ': // Space bar
                event.preventDefault();
                setScrollingState(true);
                updateScrollProgress(Math.min(scrollProgress + 0.08, 1)); // Smaller increments
                break;
            case 'ArrowUp':
            case 'PageUp':
                event.preventDefault();
                setScrollingState(true);
                updateScrollProgress(Math.max(scrollProgress - 0.08, 0)); // Smaller increments
                break;
            case 'Home':
                event.preventDefault();
                setScrollingState(true);
                smoothScrollToProgress(0);
                break;
            case 'End':
                event.preventDefault();
                setScrollingState(true);
                smoothScrollToProgress(1);
                break;
        }
    });
    
    // Add touch gesture support for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', (event) => {
        touchStartY = event.changedTouches[0].screenY;
    }, { passive: false });
    
    window.addEventListener('touchend', (event) => {
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: false });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            setScrollingState(true);
            if (diff > 0) {
                // Swipe up - next phase
                updateScrollProgress(Math.min(scrollProgress + 0.08, 1)); // Smoother increments
            } else {
                // Swipe down - previous phase
                updateScrollProgress(Math.max(scrollProgress - 0.08, 0)); // Smoother increments
            }
        }
    }
}

// Jump directly to a specific phase
function jumpToPhase(phaseIndex) {
    const targetProgress = phaseIndex / (totalPhases - 1);
    smoothScrollToProgress(targetProgress);
}

// Smooth scroll to target progress
function smoothScrollToProgress(targetProgress, duration = 1000) {
    const startProgress = scrollProgress;
    const difference = targetProgress - startProgress;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeInOutQuad = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentProgress = startProgress + (difference * easeInOutQuad);
        updateScrollProgress(currentProgress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Handle scroll
function onScroll() {
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const newProgress = Math.min(scrollTop / scrollHeight, 1);
    
    // Mark that we're scrolling
    setScrollingState(true);
    
    // Use the smooth update system
    targetScrollProgress = newProgress;
}

// Set scrolling state with timeout to detect when scrolling stops
function setScrollingState(scrolling) {
    isScrolling = scrolling;
    lastScrollTime = Date.now();
    
    // Clear any existing timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    if (scrolling) {
        // Set timeout to detect when scrolling stops
        scrollTimeout = setTimeout(() => {
            const timeSinceLastScroll = Date.now() - lastScrollTime;
            if (timeSinceLastScroll >= 500) { // 500ms after scrolling stops
                isScrolling = false;
                console.log("Scrolling stopped");
            }
        }, 500);
    }
}

// Update navbar appearance on scroll
function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (scrollProgress > 0.1) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Update scroll progress manually with damping
let targetScrollProgress = 0;
let currentScrollProgress = 0;
const dampingFactor = 0.06; // FINAL VERSION: Extra smooth for apartment building showcase

function updateScrollProgress(newProgress) {
    targetScrollProgress = Math.max(0, Math.min(newProgress, 1));
    
    // Update actual scroll position
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, targetScrollProgress * scrollHeight);
}

// Smooth damped update function called in animation loop
function updateSmoothScrollProgress() {
    // Apply damping to scroll progress
    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * dampingFactor;
    
    // Update only if there's significant change
    if (Math.abs(targetScrollProgress - currentScrollProgress) > 0.001) {
        scrollProgress = currentScrollProgress;
        updateCamera();
        updateBuildingReveal(); // Progressive interior reveal
        updateUI();
        updateNavbar();
    } else {
        // Snap to target if very close
        scrollProgress = targetScrollProgress;
    }
}

// Update camera position based on scroll with smooth easing
function updateCamera() {
    // FIXED: Safety checks to prevent crashes
    if (!phases || phases.length === 0 || totalPhases === 0) {
        console.warn('No valid phases data available');
        return;
    }
    
    // Handle infinite loop - when reaching end, loop back to beginning
    let adjustedScrollProgress = scrollProgress;
    if (scrollProgress >= 1) {
        adjustedScrollProgress = 0; // Loop back to start
        targetScrollProgress = 0;
        currentScrollProgress = 0;
        scrollProgress = 0;
        // Reset actual scroll position
        window.scrollTo(0, 0);
    }
    
    const phaseProgress = adjustedScrollProgress * (totalPhases - 1);
    const phaseIndex = Math.max(0, Math.min(Math.floor(phaseProgress), totalPhases - 1));
    const phaseLocal = phaseProgress - phaseIndex;
    
    // Apply smooth easing to the local progress
    const easedProgress = easeInOutCubic(phaseLocal);
    
    // FIXED: Proper bounds checking to prevent undefined errors
    if (phaseIndex >= totalPhases - 1 || phaseIndex + 1 >= totalPhases) {
        // Last phase - about to loop
        const phase = phases[totalPhases - 1];
        if (phase && phase.camera && phase.target) {
            camera.position.set(phase.camera.x, phase.camera.y, phase.camera.z);
            camera.lookAt(phase.target.x, phase.target.y, phase.target.z);
            currentPhase = totalPhases - 1;
        }
    } else {
        // Interpolate between phases with easing - with safety checks
        const currentPhaseData = phases[phaseIndex];
        const nextPhaseData = phases[phaseIndex + 1];
        
        if (currentPhaseData && nextPhaseData && 
            currentPhaseData.camera && nextPhaseData.camera &&
            currentPhaseData.target && nextPhaseData.target) {
            
            // Smooth interpolation with easing
            camera.position.x = lerp(currentPhaseData.camera.x, nextPhaseData.camera.x, easedProgress);
            camera.position.y = lerp(currentPhaseData.camera.y, nextPhaseData.camera.y, easedProgress);
            camera.position.z = lerp(currentPhaseData.camera.z, nextPhaseData.camera.z, easedProgress);
            
            // Interpolate camera target with easing
            const targetX = lerp(currentPhaseData.target.x, nextPhaseData.target.x, easedProgress);
            const targetY = lerp(currentPhaseData.target.y, nextPhaseData.target.y, easedProgress);
            const targetZ = lerp(currentPhaseData.target.z, nextPhaseData.target.z, easedProgress);
            
            camera.lookAt(targetX, targetY, targetZ);
            currentPhase = phaseIndex;
        } else {
            // Fallback to last valid phase if data is corrupted
            console.warn('Invalid phase data detected:', {
                phaseIndex, 
                nextPhaseIndex: phaseIndex + 1,
                totalPhases,
                currentPhaseData: !!currentPhaseData,
                nextPhaseData: !!nextPhaseData,
                scrollProgress: adjustedScrollProgress
            });
            const fallbackPhase = phases[Math.max(0, Math.min(phaseIndex, totalPhases - 1))];
            if (fallbackPhase && fallbackPhase.camera && fallbackPhase.target) {
                camera.position.set(fallbackPhase.camera.x, fallbackPhase.camera.y, fallbackPhase.camera.z);
                camera.lookAt(fallbackPhase.target.x, fallbackPhase.target.y, fallbackPhase.target.z);
                currentPhase = Math.max(0, Math.min(phaseIndex, totalPhases - 1));
            }
        }
    }
    
    // Adjust camera distances for very small models
    if (window.modelInfo && window.modelInfo.scale < 0.2) {
        // Model was heavily scaled down, move camera closer
        const distance = camera.position.length();
        if (distance > 50) {
            camera.position.multiplyScalar(0.3); // Move 70% closer
            console.log('Adjusted camera distance for small model');
        }
    }
    
    // Update house state based on current phase
    updateHouseState();
}

// Smooth easing function for camera movements
// FINAL VERSION: Extra smooth easing for apartment building showcase
function easeInOutCubic(t) {
    // Slightly modified for even smoother apartment building transitions
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Update house state based on current phase (exterior-only tour)
function updateHouseState() {
    // FIXED: Safety check for valid phase data
    if (!phases || currentPhase >= phases.length || currentPhase < 0) {
        console.warn('Invalid currentPhase or phases data in updateHouseState');
        return;
    }
    
    const phase = phases[currentPhase];
    if (!phase) {
        console.warn('Phase data is undefined for currentPhase:', currentPhase);
        return;
    }
    
    // Always exterior for this tour
    isInsideHouse = false;
    currentFloor = null;
    
    // Log current phase for debugging
    console.log(`Viewing: ${phase.title} (Phase ${currentPhase + 1}/${phases.length})`);
}

// Update UI based on current phase
function updateUI() {
    // Update progress bar (continuous loop)
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${scrollProgress * 100}%`;
    }
    
    // Update text content - FIXED: Safety check for valid phase data
    if (!phases || currentPhase >= phases.length || currentPhase < 0) {
        console.warn('Invalid currentPhase or phases data in updateUI');
        return;
    }
    
    const phase = phases[currentPhase];
    if (!phase) {
        console.warn('Phase data is undefined for currentPhase in updateUI:', currentPhase);
        return;
    }
    
    // Update phase number with loop indicator
    const phaseNumber = document.querySelector('.phase-number');
    const currentPhaseText = document.querySelector('.current-phase-text');
    
    if (phaseNumber) {
        if (isInsideHouse && currentFloor) {
            phaseNumber.textContent = `${currentFloor}`;
            phaseNumber.style.fontSize = '0.8rem';
        } else {
            phaseNumber.textContent = phase.number;
            phaseNumber.style.fontSize = '1.2rem';
        }
    }
    
    // Add visual indicator for inside house
    if (currentPhaseText) {
        currentPhaseText.classList.toggle('inside', isInsideHouse);
    }
    
    // Update phase title
    const phaseTitle = document.getElementById('phase-title');
    if (phaseTitle) {
        phaseTitle.textContent = phase.title;
    }
    
    // Update phase subtitle with floor info
    const phaseSubtitle = document.getElementById('phase-subtitle');
    if (phaseSubtitle) {
        if (isInsideHouse && currentFloor) {
            phaseSubtitle.textContent = `${phase.subtitle} • ${currentFloor}`;
        } else {
            phaseSubtitle.textContent = phase.subtitle;
        }
    }
    
    // Update description
    const descriptionText = document.getElementById('description-text');
    if (descriptionText) {
        descriptionText.textContent = phase.description;
    }
    
    // Update scroll hint based on current location (FINAL VERSION)
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        if (currentPhase === 0) {
            if (isScrolling) {
                scrollHint.style.opacity = '0.8';
                scrollHint.textContent = '↓ Exploring';
            } else {
                scrollHint.style.opacity = '0.6';
                scrollHint.textContent = '↓ Begin Tour';
            }
        } else if (isInsideHouse) {
            scrollHint.style.opacity = '0.4';
            scrollHint.textContent = '↓ Continue';
        } else if (currentPhase === totalPhases - 1) {
            scrollHint.style.opacity = '0.4';
            scrollHint.textContent = '↓ Restart';
        } else {
            scrollHint.style.opacity = '0.2';
            scrollHint.textContent = '↓ Next View';
        }
    }
    
    // Update navigation instruction (FINAL APARTMENT BUILDING VERSION)
    const navInstruction = document.querySelector('.nav-instruction p');
    if (navInstruction) {
        if (currentPhase === totalPhases - 1) {
            navInstruction.textContent = 'Scroll to restart apartment building showcase';
        } else if (currentPhase === 0) {
            if (isScrolling) {
                navInstruction.textContent = 'Exploring modern apartment complex architecture';
            } else {
                navInstruction.textContent = 'Scroll to begin apartment building tour';
            }
        } else {
            navInstruction.textContent = 'Scroll to explore next architectural perspective';
        }
    }
    
    // Show contact footer on last phase before loop
    const contactFooter = document.querySelector('.contact-footer');
    if (contactFooter) {
        contactFooter.classList.toggle('show', currentPhase >= totalPhases - 2);
    }
}

// Linear interpolation
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update smooth scroll progress with damping
    updateSmoothScrollProgress();
    
    // House rotation removed per user request
    
    // Particle animation removed for cleaner presentation
    
    renderer.render(scene, camera);
}

// House rotation functionality removed

// Hide loading screen
function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
}

// Initialize when page loads
window.addEventListener('load', init);

// Add CSS custom property for progress bar
const style = document.createElement('style');
style.textContent = `
    .scroll-progress::after {
        height: var(--progress, 0%) !important;
    }
`;
document.head.appendChild(style);
