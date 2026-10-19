import * as THREE from 'three';

export type PlacedObjectType =
  | 'house'
  | 'windmill'
  | 'lighthouse'
  | 'well'
  | 'fence'
  | 'path'
  | 'oak'
  | 'pine'
  | 'palm'
  | 'flower'
  | 'dock'
  | 'bridge'
  | 'campfire'
  | 'watchtower'
  | 'beehive'
  | 'lantern'
  | 'rainbow';

export interface PlacedObjectEntity {
  id: string;
  type: PlacedObjectType;
  dir: THREE.Vector3;
  yaw: number;
  mesh: THREE.Group;
  baseScale: number;
  growth: number;
  targetGrowth: number;
  bounceTime: number;
  bounceActive: boolean;
  windmillRotor?: THREE.Object3D;
  lighthouseBeamPivot?: THREE.Object3D;
  lighthouseConeMats?: THREE.MeshBasicMaterial[];
  lighthousePointLight?: THREE.PointLight;
  windowMaterials?: THREE.MeshStandardMaterial[];
  campfireFlameGroup?: THREE.Group;
  campfireEmbers?: THREE.Points;
  campfireLight?: THREE.PointLight;
  watchtowerFlag?: THREE.Mesh;
  butterflySwarm?: THREE.Group;
  removable: boolean;
}

export interface VillagerEntity {
  id: string;
  mesh: THREE.Group;
  bodyMesh: THREE.Object3D;
  headGroup: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  dir: THREE.Vector3;
  targetDir: THREE.Vector3;
  speed: number;
  walkPhase: number;
  pauseTimer: number;
  headingToWell: boolean;
  bounceTime: number;
  yaw: number;
  stuckTimer?: number;
  steerSign?: number;
}

export interface SheepEntity {
  id: string;
  mesh: THREE.Group;
  headGroup: THREE.Group;
  legs: THREE.Group[];
  tailMesh: THREE.Object3D;
  dir: THREE.Vector3;
  targetDir: THREE.Vector3;
  speed: number;
  walkPhase: number;
  grazeTimer: number;
  isGrazing: boolean;
  bounceTime: number;
  yaw: number;
  inPasture?: boolean;
}

export interface CloudEntity {
  id: string;
  isSnow: boolean;
  mesh: THREE.Group;
  rainLines: THREE.LineSegments;
  rainMat: THREE.LineBasicMaterial;
  snowPoints?: THREE.Points;
  snowMat?: THREE.PointsMaterial;
  orbitAxis: THREE.Vector3;
  currentDir: THREE.Vector3;
  orbitSpeed: number;
  altitude: number;
  rainTimer: number;
  isRaining: boolean;
  bounceTime: number;
}

export interface SailboatEntity {
  id: string;
  mesh: THREE.Group;
  hullGroup: THREE.Group;
  lanternMat: THREE.MeshStandardMaterial;
  dir: THREE.Vector3;
  targetDir: THREE.Vector3;
  speed: number;
  bobPhase: number;
  yaw: number;
}

export interface DuckEntity {
  id: string;
  mesh: THREE.Group;
  rippleRings: THREE.Mesh[];
  dir: THREE.Vector3;
  targetDir: THREE.Vector3;
  speed: number;
  bobPhase: number;
  yaw: number;
}

export interface BalloonEntity {
  id: string;
  mesh: THREE.Group;
  burnerMat: THREE.MeshStandardMaterial;
  orbitAxis: THREE.Vector3;
  currentDir: THREE.Vector3;
  orbitSpeed: number;
  baseAltitude: number;
  phase: number;
}

export interface ShootingStarEntity {
  id: string;
  mesh: THREE.Group;
  orbitAxis: THREE.Vector3;
  currentDir: THREE.Vector3;
  speed: number;
  altitude: number;
  age: number;
  maxAge: number;
  sparkleTimer: number;
}

// -----------------------------------------------------------------------------
// 1. ARES GEODESIC HABITATION DOME ('house')
// Pressurized geodesic biodome with multi-pane observation windows, airlock tunnel,
// comms mast & life-support conduits
// -----------------------------------------------------------------------------
export function createPastelHouseMesh(_index?: number): {
  group: THREE.Group;
  windowMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const windowMaterials: THREE.MeshStandardMaterial[] = [];

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: '#e5eaef',
    roughness: 0.35,
    metalness: 0.65,
    flatShading: true,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: '#343840',
    roughness: 0.5,
    metalness: 0.8,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: '#d46536', // Martian safety orange
    roughness: 0.4,
    metalness: 0.3,
  });

  // Base platform plinth anchored into regolith
  const basePlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.046, 0.052, 0.012, 12),
    darkTrimMat,
  );
  basePlinth.position.y = 0.006;
  basePlinth.castShadow = true;
  basePlinth.receiveShadow = true;
  group.add(basePlinth);

  // Main geodesic biodome
  const domeGeo = new THREE.IcosahedronGeometry(0.042, 2);
  const domeMesh = new THREE.Mesh(domeGeo, titaniumMat);
  domeMesh.position.y = 0.012;
  domeMesh.scale.set(1.0, 0.88, 1.0);
  domeMesh.castShadow = true;
  domeMesh.receiveShadow = true;
  group.add(domeMesh);

  // Glowing pressurized hydroponic window panels
  const winMat = new THREE.MeshStandardMaterial({
    color: '#a8ffbe',
    emissive: new THREE.Color('#38c968'),
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.1,
    flatShading: true,
  });
  windowMaterials.push(winMat);

  // Pentagonal observation skylight on top
  const skylight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.004, 5),
    winMat,
  );
  skylight.position.y = 0.048;
  group.add(skylight);

  // Side viewing ports around the dome
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + 0.35;
    const port = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.004, 6),
      winMat,
    );
    port.rotation.x = Math.PI / 2;
    port.position.set(
      Math.sin(angle) * 0.038,
      0.024,
      Math.cos(angle) * 0.038,
    );
    port.lookAt(
      Math.sin(angle) * 0.08,
      0.024,
      Math.cos(angle) * 0.08,
    );
    group.add(port);
  }

  // Cylindrical airlock tunnel extending outward to the entrance
  const airlockTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.024, 10),
    titaniumMat,
  );
  airlockTube.rotation.x = Math.PI / 2;
  airlockTube.position.set(0, 0.015, 0.044);
  airlockTube.castShadow = true;
  group.add(airlockTube);

  // Airlock outer collar & seal hatch
  const airlockHatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10),
    hazardMat,
  );
  airlockHatch.rotation.x = Math.PI / 2;
  airlockHatch.position.set(0, 0.015, 0.056);
  group.add(airlockHatch);

  // Top communications mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0015, 0.002, 0.022, 6),
    darkTrimMat,
  );
  mast.position.set(0, 0.058, 0);
  group.add(mast);

  const commsDish = new THREE.Mesh(
    new THREE.ConeGeometry(0.006, 0.004, 8),
    hazardMat,
  );
  commsDish.rotation.x = -Math.PI / 3;
  commsDish.position.set(0, 0.068, 0);
  group.add(commsDish);

  return { group, windowMaterials };
}

// -----------------------------------------------------------------------------
// 2. VORTEX WIND TURBINE & SOLAR ARRAY ('windmill')
// Aerodynamic composite mast, rotating 3-blade turbine & photovoltaic panels
// -----------------------------------------------------------------------------
export function createWhiteWindmillMesh(): {
  group: THREE.Group;
  rotor: THREE.Group;
  windowMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const windowMaterials: THREE.MeshStandardMaterial[] = [];

  const mastMat = new THREE.MeshStandardMaterial({
    color: '#edf1f5',
    metalness: 0.6,
    roughness: 0.35,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: '#282d36',
    metalness: 0.8,
    roughness: 0.3,
  });

  const solarMat = new THREE.MeshStandardMaterial({
    color: '#1a3b5c',
    emissive: new THREE.Color('#0c2036'),
    emissiveIntensity: 0.2,
    metalness: 0.85,
    roughness: 0.15,
  });

  // Base tripod footing
  const baseMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.028, 0.014, 8),
    darkMat,
  );
  baseMesh.position.y = 0.007;
  baseMesh.castShadow = true;
  group.add(baseMesh);

  // Tower pylon
  const pylon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.014, 0.105, 8),
    mastMat,
  );
  pylon.position.y = 0.062;
  pylon.castShadow = true;
  group.add(pylon);

  // Generator nacelle at summit
  const nacelle = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.014, 0.032),
    mastMat,
  );
  nacelle.position.set(0, 0.116, -0.004);
  nacelle.castShadow = true;
  group.add(nacelle);

  // Telemetry indicator window on nacelle
  const teleMat = new THREE.MeshStandardMaterial({
    color: '#65d6ff',
    emissive: new THREE.Color('#288eb8'),
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });
  windowMaterials.push(teleMat);
  const teleLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.006, 0.004, 0.002),
    teleMat,
  );
  teleLight.position.set(0, 0.120, -0.020);
  group.add(teleLight);

  // Dual tracking photovoltaic solar wings
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, 0.003, 0.018),
      solarMat,
    );
    wing.position.set(s * 0.022, 0.116, 0);
    wing.rotation.z = -s * 0.15;
    group.add(wing);
  }

  // Rotating 3-Blade Aerodynamic Turbine Rotor
  const rotor = new THREE.Group();
  rotor.position.set(0, 0.116, 0.014);

  const hubCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.007, 0.014, 10),
    darkMat,
  );
  hubCone.rotation.x = Math.PI / 2;
  rotor.add(hubCone);

  const bladeMat = new THREE.MeshStandardMaterial({
    color: '#f4f6fa',
    roughness: 0.3,
    metalness: 0.4,
  });

  const bladeCount = 3;
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = angle;

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.054, 0.0025),
      bladeMat,
    );
    blade.position.y = 0.028;
    blade.rotation.x = 0.22;
    blade.castShadow = true;
    bladeGroup.add(blade);
    rotor.add(bladeGroup);
  }

  group.add(rotor);

  return { group, rotor, windowMaterials };
}

// -----------------------------------------------------------------------------
// 3. DEEP SPACE COMMS ARRAY & RELAY TOWER ('lighthouse')
// High-gain parabolic antenna dish with rotating telemetry searchlight beam
// -----------------------------------------------------------------------------
export function createStripedLighthouseMesh(): {
  group: THREE.Group;
  beamPivot: THREE.Group;
  coneMats: THREE.MeshBasicMaterial[];
  pointLight: THREE.PointLight;
  windowMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const coneMats: THREE.MeshBasicMaterial[] = [];
  const windowMaterials: THREE.MeshStandardMaterial[] = [];

  const trussMat = new THREE.MeshStandardMaterial({
    color: '#424854',
    metalness: 0.85,
    roughness: 0.3,
  });

  const dishMat = new THREE.MeshStandardMaterial({
    color: '#e5e9ef',
    metalness: 0.7,
    roughness: 0.25,
    flatShading: true,
  });

  const beaconHazardMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    metalness: 0.4,
    roughness: 0.4,
  });

  // Base platform footing
  const baseMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.042, 0.015, 8),
    trussMat,
  );
  baseMesh.position.y = 0.0075;
  baseMesh.castShadow = true;
  group.add(baseMesh);

  // Triangular communication truss tower
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.026, 0.12, 3),
    trussMat,
  );
  tower.position.y = 0.072;
  tower.castShadow = true;
  group.add(tower);

  // Equipment housing platform
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.024, 0.010, 8),
    beaconHazardMat,
  );
  deck.position.y = 0.134;
  deck.castShadow = true;
  group.add(deck);

  // Status indicator light
  const relayStatusMat = new THREE.MeshStandardMaterial({
    color: '#8fe8ff',
    emissive: new THREE.Color('#38b8e0'),
    emissiveIntensity: 0.6,
  });
  windowMaterials.push(relayStatusMat);

  // Rotating Comms Dish & Telemetry Beam Pivot
  const beamPivot = new THREE.Group();
  beamPivot.position.set(0, 0.144, 0);

  // Parabolic high-gain antenna dish
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.42),
    dishMat,
  );
  dish.rotation.x = -Math.PI / 2.6;
  dish.castShadow = true;
  beamPivot.add(dish);

  // Central feed horn
  const horn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.004, 0.022, 6),
    trussMat,
  );
  horn.rotation.x = -Math.PI / 2.6;
  horn.position.set(0, 0.014, 0.014);
  beamPivot.add(horn);

  // Volumetric sweeping telemetry searchlight beam
  const coneGeo = new THREE.ConeGeometry(0.18, 0.95, 16, 1, true);
  coneGeo.translate(0, -0.48, 0);
  coneGeo.rotateX(-Math.PI / 2);

  const coneMat = new THREE.MeshBasicMaterial({
    color: '#8fe8ff',
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  coneMats.push(coneMat);

  const beamCone = new THREE.Mesh(coneGeo, coneMat);
  beamCone.position.set(0, 0.018, 0.022);
  beamPivot.add(beamCone);

  const pointLight = new THREE.PointLight('#9deeff', 0.8, 1.4);
  pointLight.position.set(0, 0.02, 0.025);
  beamPivot.add(pointLight);

  group.add(beamPivot);

  // Flashing red aviation warning beacon on the pinnacle
  const beaconLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.004, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#ff3b30' }),
  );
  beaconLight.position.set(0, 0.185, 0);
  group.add(beaconLight);

  return { group, beamPivot, coneMats, pointLight, windowMaterials };
}

// -----------------------------------------------------------------------------
// 4. STARSHIP ROCKET GANTRY & LAUNCH COMPLEX ('watchtower')
// Modular steel launch umbilical tower, Starship rocket silhouette & warning beacons
// -----------------------------------------------------------------------------
export function createStoneWatchtowerMesh(): {
  group: THREE.Group;
  flagMesh: THREE.Mesh;
  windowMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const windowMaterials: THREE.MeshStandardMaterial[] = [];

  const steelMat = new THREE.MeshStandardMaterial({
    color: '#363d4a',
    metalness: 0.85,
    roughness: 0.3,
  });

  const rocketMat = new THREE.MeshStandardMaterial({
    color: '#f0f3f7',
    metalness: 0.8,
    roughness: 0.18,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    metalness: 0.5,
    roughness: 0.4,
  });

  // Launch pad foundation
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.014, 0.075),
    steelMat,
  );
  pad.position.y = 0.007;
  pad.castShadow = true;
  group.add(pad);

  // Steel lattice gantry tower
  const gantryPillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.155, 0.016),
    steelMat,
  );
  gantryPillar.position.set(-0.024, 0.082, 0);
  gantryPillar.castShadow = true;
  group.add(gantryPillar);

  // Gantry umbilical arm extending to rocket
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.026, 0.006, 0.008),
    hazardMat,
  );
  arm.position.set(-0.010, 0.118, 0);
  group.add(arm);

  // Pennant fin
  const flagMat = new THREE.MeshStandardMaterial({
    color: '#ff4d42',
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const flagMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.014, 0.008),
    flagMat,
  );
  flagMesh.position.set(-0.024, 0.162, 0.008);
  group.add(flagMesh);

  // Stainless-steel Starship rocket
  const rocketBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.098, 12),
    rocketMat,
  );
  rocketBody.position.set(0.012, 0.058, 0);
  rocketBody.castShadow = true;
  group.add(rocketBody);

  const noseCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.014, 0.032, 12),
    rocketMat,
  );
  noseCone.position.set(0.012, 0.122, 0);
  noseCone.castShadow = true;
  group.add(noseCone);

  // Aerodynamic fins on base of rocket
  for (let f = 0; f < 3; f++) {
    const fa = (f / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.024, 0.002),
      hazardMat,
    );
    fin.position.set(
      0.012 + Math.cos(fa) * 0.016,
      0.022,
      Math.sin(fa) * 0.016,
    );
    fin.rotation.y = -fa;
    group.add(fin);
  }

  // Illuminated launch status lights
  const statusMat = new THREE.MeshStandardMaterial({
    color: '#ffe066',
    emissive: new THREE.Color('#d4a018'),
    emissiveIntensity: 0.6,
  });
  windowMaterials.push(statusMat);
  const statusLamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.004, 6, 6),
    statusMat,
  );
  statusLamp.position.set(-0.024, 0.158, 0);
  group.add(statusLamp);

  return { group, flagMesh, windowMaterials };
}

// -----------------------------------------------------------------------------
// 5. GEOTHERMAL THERMAL TAP & VOLCANIC FUMAROLE ('campfire')
// Basalt rock cairn tapping into subsurface heat vent with plasma glow & embers
// -----------------------------------------------------------------------------
export function createCampfireMesh(): {
  group: THREE.Group;
  flameGroup: THREE.Group;
  embers: THREE.Points;
  light: THREE.PointLight;
  campfireLight: THREE.PointLight;
} {
  const group = new THREE.Group();

  const basaltMat = new THREE.MeshStandardMaterial({
    color: '#2e2524',
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  // Basalt volcanic rock ring around geothermal vent
  const rockCount = 8;
  for (let i = 0; i < rockCount; i++) {
    const angle = (i / rockCount) * Math.PI * 2;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.008 + (i % 2) * 0.003, 0),
      basaltMat,
    );
    rock.position.set(
      Math.sin(angle) * 0.026,
      0.006,
      Math.cos(angle) * 0.026,
    );
    rock.rotation.set(angle, angle * 0.5, 0);
    rock.castShadow = true;
    group.add(rock);
  }

  // Glowing volcanic vent core
  const ventCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.020, 12),
    new THREE.MeshBasicMaterial({ color: '#ff6200' }),
  );
  ventCore.rotation.x = -Math.PI / 2;
  ventCore.position.y = 0.003;
  group.add(ventCore);

  // Rising heat plasma flame group
  const flameGroup = new THREE.Group();
  const flameCoreMat = new THREE.MeshBasicMaterial({ color: '#ffea75' });
  const flameOuterMat = new THREE.MeshBasicMaterial({
    color: '#ff4d00',
    transparent: true,
    opacity: 0.8,
  });

  const coreCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.010, 0.038, 6),
    flameCoreMat,
  );
  coreCone.position.y = 0.019;
  flameGroup.add(coreCone);

  const outerCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.016, 0.046, 6),
    flameOuterMat,
  );
  outerCone.position.y = 0.023;
  flameGroup.add(outerCone);

  group.add(flameGroup);

  // Rising glowing embers
  const emberCount = 18;
  const emberPositions = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    emberPositions[i * 3] = (Math.random() - 0.5) * 0.028;
    emberPositions[i * 3 + 1] = 0.01 + Math.random() * 0.045;
    emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.028;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(emberPositions, 3),
  );
  const emberMat = new THREE.PointsMaterial({
    color: '#ffaa33',
    size: 0.006,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  group.add(embers);

  const campfireLight = new THREE.PointLight('#ff7b24', 1.1, 0.55);
  campfireLight.position.set(0, 0.025, 0);
  group.add(campfireLight);

  return { group, flameGroup, embers, light: campfireLight, campfireLight };
}

// -----------------------------------------------------------------------------
// 6. SOLAR NAVIGATION WAYPOINT BEACON ('lantern')
// Composite navigation pylon with solar cap & illuminated laser/optical guide band
// -----------------------------------------------------------------------------
export function createLanternPostMesh(): {
  group: THREE.Group;
  lanternMat: THREE.MeshStandardMaterial;
  windowMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const windowMaterials: THREE.MeshStandardMaterial[] = [];

  const postMat = new THREE.MeshStandardMaterial({
    color: '#474d57',
    metalness: 0.8,
    roughness: 0.3,
  });

  // Base mount
  const baseMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.009, 0.006, 8),
    postMat,
  );
  baseMesh.position.y = 0.003;
  group.add(baseMesh);

  // Pylon mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.004, 0.052, 8),
    postMat,
  );
  mast.position.y = 0.028;
  mast.castShadow = true;
  group.add(mast);

  // Glowing solar beacon lens
  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#ffd066',
    emissive: new THREE.Color('#ffae1a'),
    emissiveIntensity: 0.65,
    roughness: 0.2,
  });
  windowMaterials.push(lanternMat);

  const beaconLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.010, 8),
    lanternMat,
  );
  beaconLens.position.y = 0.056;
  group.add(beaconLens);

  // Solar cap
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.009, 0.006, 8),
    postMat,
  );
  cap.position.y = 0.064;
  group.add(cap);

  return { group, lanternMat, windowMaterials };
}

// -----------------------------------------------------------------------------
// 7. AUTOMATED REGOLITH MINING CRAWLER ('beehive')
// Modular excavator crawler with rotary core-sample drill & micro-survey drone swarm
// -----------------------------------------------------------------------------
export function createBeehiveMesh(): {
  group: THREE.Group;
  butterflySwarm: THREE.Group;
} {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: '#e5ab36', // Caterpillar yellow
    metalness: 0.5,
    roughness: 0.4,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: '#2b2e36',
    metalness: 0.8,
    roughness: 0.3,
  });

  // Caterpillar tracks
  for (const s of [-1, 1]) {
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.010, 0.038),
      darkMat,
    );
    track.position.set(s * 0.015, 0.006, 0);
    track.castShadow = true;
    group.add(track);
  }

  // Excavator body hull
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.018, 0.032),
    bodyMat,
  );
  hull.position.set(0, 0.016, 0);
  hull.castShadow = true;
  group.add(hull);

  // Front rotary drill bit
  const drill = new THREE.Mesh(
    new THREE.ConeGeometry(0.006, 0.022, 8),
    darkMat,
  );
  drill.rotation.x = Math.PI / 2;
  drill.position.set(0, 0.012, 0.025);
  group.add(drill);

  // Swarm of micro-survey drones
  const butterflySwarm = new THREE.Group();
  const droneMat = new THREE.MeshBasicMaterial({ color: '#59d2fe' });

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const drone = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.0035, 0),
      droneMat,
    );
    drone.position.set(
      Math.cos(a) * 0.028,
      0.035 + (i % 2) * 0.01,
      Math.sin(a) * 0.028,
    );
    butterflySwarm.add(drone);
  }
  group.add(butterflySwarm);

  return { group, butterflySwarm };
}

// -----------------------------------------------------------------------------
// 8. CENTRAL MOXIE LIFE-SUPPORT HUB ('well')
// Atmospheric oxygen & water recycling hub at the heart of Ares Base
// -----------------------------------------------------------------------------
export function createStoneWellMesh(): THREE.Group {
  const group = new THREE.Group();

  const titanMat = new THREE.MeshStandardMaterial({
    color: '#dce3ea',
    metalness: 0.75,
    roughness: 0.28,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    metalness: 0.5,
    roughness: 0.4,
  });

  // Base circular foundation ring
  const baseRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.042, 0.014, 16),
    titanMat,
  );
  baseRing.position.y = 0.007;
  baseRing.castShadow = true;
  group.add(baseRing);

  // Central extraction dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hazardMat,
  );
  dome.position.y = 0.014;
  dome.castShadow = true;
  group.add(dome);

  // Central holographic status sphere
  const holoSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 12, 12),
    new THREE.MeshBasicMaterial({
      color: '#47ddff',
      transparent: true,
      opacity: 0.85,
    }),
  );
  holoSphere.position.y = 0.045;
  group.add(holoSphere);

  // 4 Intake air ducts radiating out
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const duct = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.016, 8),
      titanMat,
    );
    duct.rotation.z = Math.PI / 2;
    duct.rotation.y = a;
    duct.position.set(Math.cos(a) * 0.032, 0.014, Math.sin(a) * 0.032);
    group.add(duct);
  }

  return group;
}

// -----------------------------------------------------------------------------
// 9. PRESSURIZED PIPELINE & UTILITY PERIMETER ('fence')
// Insulated cryogenic utility pipes with support pylons and warning stripes
// -----------------------------------------------------------------------------
export function createWoodenFenceMesh(): THREE.Group {
  const group = new THREE.Group();

  const pipeMat = new THREE.MeshStandardMaterial({
    color: '#b0bcc7',
    metalness: 0.8,
    roughness: 0.25,
  });

  const pylonMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    metalness: 0.4,
    roughness: 0.5,
  });

  const pipeLen = 0.068;
  const upperPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, pipeLen, 8),
    pipeMat,
  );
  upperPipe.rotation.z = Math.PI / 2;
  upperPipe.position.set(0, 0.018, 0);
  upperPipe.castShadow = true;
  group.add(upperPipe);

  const lowerPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0028, 0.0028, pipeLen, 8),
    pipeMat,
  );
  lowerPipe.rotation.z = Math.PI / 2;
  lowerPipe.position.set(0, 0.009, 0);
  lowerPipe.castShadow = true;
  group.add(lowerPipe);

  // Support stanchions
  for (const sx of [-pipeLen * 0.45, pipeLen * 0.45]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.024, 0.006),
      pylonMat,
    );
    post.position.set(sx, 0.012, 0);
    post.castShadow = true;
    group.add(post);
  }

  return group;
}

// -----------------------------------------------------------------------------
// 10. SOLAR NAVIGATION RUNWAY WAYPOINT ('path')
// Embedded composite paving slab with illuminated solar LED guide strip
// -----------------------------------------------------------------------------
export function createSteppingPathMesh(): THREE.Group {
  const group = new THREE.Group();

  const slabMat = new THREE.MeshStandardMaterial({
    color: '#6e5e54',
    roughness: 0.85,
    metalness: 0.1,
  });

  const ledMat = new THREE.MeshStandardMaterial({
    color: '#ffe58f',
    emissive: new THREE.Color('#ffaa1a'),
    emissiveIntensity: 0.65,
  });

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.004, 0.042),
    slabMat,
  );
  slab.position.y = 0.002;
  slab.receiveShadow = true;
  group.add(slab);

  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.004, 0.005, 0.036),
    ledMat,
  );
  ledStrip.position.y = 0.0025;
  group.add(ledStrip);

  return group;
}

// -----------------------------------------------------------------------------
// 11. BIO-ENGINEERED MARTIAN FLORA ('oak', 'pine', 'palm' - 'tree')
// Bio-engineered succulents, terraforming pines & oxygen scrubbers
// -----------------------------------------------------------------------------
export function createOakTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#5e4334',
    roughness: 0.8,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: '#4ea863',
    roughness: 0.45,
    flatShading: true,
  });

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.011, 0.038, 8),
    trunkMat,
  );
  stem.position.y = 0.019;
  stem.castShadow = true;
  group.add(stem);

  for (let t = 0; t < 3; t++) {
    const tier = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.026 - t * 0.006, 1),
      leafMat,
    );
    tier.position.y = 0.038 + t * 0.018;
    tier.scale.set(1.0, 0.75, 1.0);
    tier.castShadow = true;
    group.add(tier);
  }

  return group;
}

export function createPineTreeMesh(_isSnowy?: boolean): THREE.Group {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#423329',
    roughness: 0.85,
  });

  const needleMat = new THREE.MeshStandardMaterial({
    color: _isSnowy ? '#5da386' : '#2e6b46',
    roughness: 0.6,
    flatShading: true,
  });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.008, 0.048, 6),
    trunkMat,
  );
  trunk.position.y = 0.024;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 4; i++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.025 - i * 0.005, 0.026, 6),
      needleMat,
    );
    cone.position.y = 0.034 + i * 0.018;
    cone.castShadow = true;
    group.add(cone);
  }

  return group;
}

export function createPalmTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#695140',
    roughness: 0.7,
  });

  const frondMat = new THREE.MeshStandardMaterial({
    color: '#348e64',
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.007, 0.075, 6),
    trunkMat,
  );
  trunk.position.set(0.008, 0.037, 0);
  trunk.rotation.z = -0.15;
  trunk.castShadow = true;
  group.add(trunk);

  const frondCount = 6;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const frond = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.002, 0.008),
      frondMat,
    );
    frond.position.set(
      0.014 + Math.cos(angle) * 0.014,
      0.074,
      Math.sin(angle) * 0.014,
    );
    frond.rotation.y = angle;
    frond.rotation.z = 0.35;
    frond.castShadow = true;
    group.add(frond);
  }

  return group;
}

// -----------------------------------------------------------------------------
// 12. BIO-LUMINESCENT LICHEN & CRYSTAL GEODES ('flower')
// Glowing violet silica crystals & fluorescent cyanobacteria patches
// -----------------------------------------------------------------------------
export function createFlowerClusterMesh(): THREE.Group {
  const group = new THREE.Group();

  const crystalMat = new THREE.MeshStandardMaterial({
    color: '#ba77ff',
    emissive: new THREE.Color('#8236d9'),
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.3,
    flatShading: true,
  });

  const lichenMat = new THREE.MeshStandardMaterial({
    color: '#45c994',
    roughness: 0.6,
  });

  const lichenPatch = new THREE.Mesh(
    new THREE.CircleGeometry(0.022, 10),
    lichenMat,
  );
  lichenPatch.rotation.x = -Math.PI / 2;
  lichenPatch.position.y = 0.002;
  group.add(lichenPatch);

  for (let c = 0; c < 5; c++) {
    const angle = (c / 5) * Math.PI * 2;
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(0.005 - c * 0.0006, 0.024 - c * 0.003, 5),
      crystalMat,
    );
    crystal.position.set(
      Math.cos(angle) * 0.010,
      0.010,
      Math.sin(angle) * 0.010,
    );
    crystal.rotation.set(0.2 * Math.sin(angle), angle, 0.2 * Math.cos(angle));
    crystal.castShadow = true;
    group.add(crystal);
  }

  return group;
}

// -----------------------------------------------------------------------------
// 13. CARGO LANDING HUB & AIRLOCK PIER ('dock')
// Elevated reinforced platform over crater basin with landing ring & beacons
// -----------------------------------------------------------------------------
export function createWoodenDockMesh(_isBridge?: boolean): {
  group: THREE.Group;
  windowMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const windowMaterials: THREE.MeshStandardMaterial[] = [];

  const metalMat = new THREE.MeshStandardMaterial({
    color: '#4a5260',
    metalness: 0.8,
    roughness: 0.35,
  });

  const deckMat = new THREE.MeshStandardMaterial({
    color: '#828c9b',
    metalness: 0.6,
    roughness: 0.3,
  });

  const targetRingMat = new THREE.MeshBasicMaterial({ color: '#ffb338' });

  for (let px of [-0.024, 0.024]) {
    for (let pz of [-0.038, 0.038]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.045, 8),
        metalMat,
      );
      leg.position.set(px, 0.015, pz);
      leg.castShadow = true;
      group.add(leg);
    }
  }

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(0.062, 0.008, 0.095),
    deckMat,
  );
  deck.position.y = 0.038;
  deck.castShadow = true;
  group.add(deck);

  const targetRing = new THREE.Mesh(
    new THREE.RingGeometry(0.016, 0.020, 16),
    targetRingMat,
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.set(0, 0.043, 0);
  group.add(targetRing);

  // Status beacons
  const dockLightMat = new THREE.MeshStandardMaterial({
    color: '#ffe066',
    emissive: new THREE.Color('#d4a018'),
    emissiveIntensity: 0.6,
  });
  windowMaterials.push(dockLightMat);

  return { group, windowMaterials };
}

// -----------------------------------------------------------------------------
// 14. MARTIAN IONOSPHERIC AURORA ARCH ('rainbow')
// Shimmering translucent emerald & violet magnetic aurora arch
// -----------------------------------------------------------------------------
export function createRainbowArchMesh(): THREE.Group {
  const group = new THREE.Group();

  const auroraGeo = new THREE.TorusGeometry(0.38, 0.028, 8, 36, Math.PI);
  const auroraMat = new THREE.MeshBasicMaterial({
    color: '#4eed98',
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const arch = new THREE.Mesh(auroraGeo, auroraMat);
  arch.rotation.z = Math.PI;
  group.add(arch);

  const violetGeo = new THREE.TorusGeometry(0.395, 0.022, 8, 36, Math.PI);
  const violetMat = new THREE.MeshBasicMaterial({
    color: '#b265ff',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const violetArch = new THREE.Mesh(violetGeo, violetMat);
  violetArch.rotation.z = Math.PI;
  group.add(violetArch);

  return group;
}

// -----------------------------------------------------------------------------
// 15. HIGH-ALTITUDE SURVEY AEROSTAT ('balloon')
// Pressurized exploration blimp with sensor gondola & solar propulsion wings
// -----------------------------------------------------------------------------
export function createHotAirBalloonMesh(_counter?: number): {
  group: THREE.Group;
  burnerMat: THREE.MeshStandardMaterial;
  burnerGroup: THREE.Group;
} {
  const group = new THREE.Group();

  const envelopeMat = new THREE.MeshStandardMaterial({
    color: '#f2ece4',
    roughness: 0.4,
    metalness: 0.3,
  });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    roughness: 0.4,
    metalness: 0.2,
  });

  const envelope = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 16, 12),
    envelopeMat,
  );
  envelope.scale.set(1.0, 1.45, 1.0);
  envelope.position.y = 0.11;
  envelope.castShadow = true;
  group.add(envelope);

  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.053, 0.005, 8, 24),
    stripeMat,
  );
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 0.11;
  group.add(stripe);

  const gondola = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.014, 0.022),
    new THREE.MeshStandardMaterial({ color: '#383e4a', metalness: 0.8 }),
  );
  gondola.position.y = 0.022;
  group.add(gondola);

  const burnerMat = new THREE.MeshStandardMaterial({
    color: '#47ddff',
    emissive: new THREE.Color('#2288cc'),
    emissiveIntensity: 0.6,
  });

  const burnerGroup = new THREE.Group();
  burnerGroup.position.set(0, 0.016, 0);
  const burnerMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.006, 0.014, 8),
    burnerMat,
  );
  burnerMesh.rotation.x = Math.PI;
  burnerGroup.add(burnerMesh);
  group.add(burnerGroup);

  return { group, burnerMat, burnerGroup };
}

// -----------------------------------------------------------------------------
// 16. EVA ASTRONAUT ('villager')
// Pressurized spacesuit with NASA orange bands, gold visor & oxygen backpack
// -----------------------------------------------------------------------------
export function createVillagerMesh(_index?: number): {
  group: THREE.Group;
  bodyMesh: THREE.Object3D;
  headGroup: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
} {
  const group = new THREE.Group();

  const suitMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.5,
    metalness: 0.15,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: '#ffc83b',
    metalness: 0.95,
    roughness: 0.1,
  });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: '#e06028',
    roughness: 0.4,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: '#333842',
    roughness: 0.6,
  });

  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.026, 0.013),
    suitMat,
  );
  bodyMesh.position.y = 0.028;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.022, 0.010),
    darkMat,
  );
  backpack.position.set(0, 0.028, -0.010);
  group.add(backpack);

  const teleDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.002, 6, 6),
    new THREE.MeshBasicMaterial({ color: '#38e068' }),
  );
  teleDot.position.set(0.004, 0.034, -0.015);
  group.add(teleDot);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.046, 0);

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    suitMat,
  );
  headGroup.add(helmet);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.0085, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    visorMat,
  );
  visor.rotation.x = Math.PI / 2;
  visor.position.set(0, 0, 0.006);
  headGroup.add(visor);

  group.add(headGroup);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.006, 0.018, 0);
  const lMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.0065, 0.018, 0.0075),
    suitMat,
  );
  lMesh.position.y = -0.009;
  lMesh.castShadow = true;
  leftLeg.add(lMesh);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.006, 0.018, 0);
  const rMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.0065, 0.018, 0.0075),
    suitMat,
  );
  rMesh.position.y = -0.009;
  rMesh.castShadow = true;
  rightLeg.add(rMesh);
  group.add(rightLeg);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.012, 0.036, 0);
  const laMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.020, 0.005),
    stripeMat,
  );
  laMesh.position.y = -0.010;
  leftArm.add(laMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.012, 0.036, 0);
  const raMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.020, 0.005),
    stripeMat,
  );
  raMesh.position.y = -0.010;
  rightArm.add(raMesh);
  group.add(rightArm);

  return { group, bodyMesh, headGroup, leftLeg, rightLeg, leftArm, rightArm };
}

// -----------------------------------------------------------------------------
// 17. QUADRUPED ROBODOG SCOUT ('sheep')
// Agile robotic scout unit with carbon chassis, 4 articulating legs & sensor head
// -----------------------------------------------------------------------------
export function createSheepMesh(): {
  group: THREE.Group;
  headGroup: THREE.Group;
  legs: THREE.Group[];
  tailMesh: THREE.Object3D;
} {
  const group = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: '#fab328', // Boston Dynamics yellow
    metalness: 0.6,
    roughness: 0.35,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: '#2a2d33',
    metalness: 0.8,
    roughness: 0.3,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.014, 0.038),
    chassisMat,
  );
  body.position.y = 0.022;
  body.castShadow = true;
  group.add(body);

  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.004, 0.032),
    carbonMat,
  );
  spine.position.y = 0.030;
  group.add(spine);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.026, 0.022);

  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.010, 0.014),
    carbonMat,
  );
  headGroup.add(headMesh);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.003, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#47ddff' }),
  );
  eye.position.set(0, 0, 0.008);
  headGroup.add(eye);

  group.add(headGroup);

  const legs: THREE.Group[] = [];
  const legPositions = [
    [-0.013, 0.014],
    [0.013, 0.014],
    [-0.013, -0.014],
    [0.013, -0.014],
  ];

  for (let i = 0; i < 4; i++) {
    const [lx, lz] = legPositions[i];
    const legGroup = new THREE.Group();
    legGroup.position.set(lx, 0.018, lz);

    const legUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.004, 0.018, 0.004),
      carbonMat,
    );
    legUpper.position.y = -0.009;
    legUpper.castShadow = true;
    legGroup.add(legUpper);

    group.add(legGroup);
    legs.push(legGroup);
  }

  const tailMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.001, 0.0015, 0.018, 6),
    carbonMat,
  );
  tailMesh.position.set(0, 0.028, -0.020);
  tailMesh.rotation.x = -0.65;
  group.add(tailMesh);

  return { group, headGroup, legs, tailMesh };
}

// -----------------------------------------------------------------------------
// 18. 6-WHEELED SCIENTIFIC MARS ROVER ('sailboat')
// Curiosity / Perseverance style rover with rocker-bogie wheels, Mastcam & RTG
// -----------------------------------------------------------------------------
export function createSailboatMesh(_counter?: number): {
  group: THREE.Group;
  hullGroup: THREE.Group;
  lanternMat: THREE.MeshStandardMaterial;
} {
  const group = new THREE.Group();
  const hullGroup = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: '#e5e9ef',
    metalness: 0.65,
    roughness: 0.3,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: '#343840',
    metalness: 0.8,
    roughness: 0.4,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    metalness: 0.4,
    roughness: 0.4,
  });

  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(0.034, 0.014, 0.052),
    bodyMat,
  );
  chassis.position.y = 0.018;
  chassis.castShadow = true;
  hullGroup.add(chassis);

  const rtg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.018, 8),
    hazardMat,
  );
  rtg.rotation.z = Math.PI / 2;
  rtg.position.set(0, 0.022, -0.032);
  hullGroup.add(rtg);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.0025, 0.045, 6),
    bodyMat,
  );
  mast.position.set(0.008, 0.042, 0.014);
  mast.castShadow = true;
  hullGroup.add(mast);

  const cameraHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.008, 0.008),
    wheelMat,
  );
  cameraHead.position.set(0.008, 0.065, 0.014);
  hullGroup.add(cameraHead);

  const wheelZ = [-0.020, 0, 0.020];
  for (const z of wheelZ) {
    for (const x of [-0.024, 0.024]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.006, 12),
        wheelMat,
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.008, z);
      wheel.castShadow = true;
      hullGroup.add(wheel);
    }
  }

  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#65d6ff',
    emissive: new THREE.Color('#288eb8'),
    emissiveIntensity: 0.65,
  });
  const antennaGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.003, 6, 6),
    lanternMat,
  );
  antennaGlow.position.set(-0.010, 0.038, -0.016);
  hullGroup.add(antennaGlow);

  group.add(hullGroup);

  return { group, hullGroup, lanternMat };
}

// -----------------------------------------------------------------------------
// 19. INGENUITY SCOUT DRONE HELICOPTER ('duck')
// Lightweight aerial drone with twin counter-rotating carbon blades
// -----------------------------------------------------------------------------
export function createSwanDuckFlockMesh(): {
  group: THREE.Group;
  rippleRings: THREE.Mesh[];
} {
  const group = new THREE.Group();
  const rippleRings: THREE.Mesh[] = [];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: '#d46536',
    metalness: 0.5,
    roughness: 0.35,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: '#282d33',
    metalness: 0.8,
    roughness: 0.3,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.014, 0.014),
    bodyMat,
  );
  body.position.y = 0.024;
  body.castShadow = true;
  group.add(body);

  const solarCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.002, 0.018),
    carbonMat,
  );
  solarCap.position.y = 0.048;
  group.add(solarCap);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0008, 0.0008, 0.024, 4),
      carbonMat,
    );
    leg.position.set(Math.cos(a) * 0.012, 0.010, Math.sin(a) * 0.012);
    leg.rotation.z = Math.cos(a) * 0.35;
    leg.rotation.x = Math.sin(a) * 0.35;
    group.add(leg);
  }

  const rotorA = new THREE.Mesh(
    new THREE.BoxGeometry(0.054, 0.001, 0.004),
    carbonMat,
  );
  rotorA.position.y = 0.038;
  group.add(rotorA);

  const rotorB = new THREE.Mesh(
    new THREE.BoxGeometry(0.054, 0.001, 0.004),
    carbonMat,
  );
  rotorB.position.y = 0.044;
  group.add(rotorB);

  const dustRingGeo = new THREE.RingGeometry(0.016, 0.024, 16);
  const dustRingMat = new THREE.MeshBasicMaterial({
    color: '#d4885b',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });
  const dustRing = new THREE.Mesh(dustRingGeo, dustRingMat);
  dustRing.rotation.x = -Math.PI / 2;
  dustRing.position.y = 0.002;
  group.add(dustRing);
  rippleRings.push(dustRing);

  return { group, rippleRings };
}

// -----------------------------------------------------------------------------
// 20. SWIRLING DUST DEVIL & CIRRUS ICE CLOUDS ('cloud' / 'snowcloud')
// Red dust vortex spinning across plains or high-altitude CO2 ice cloud
// -----------------------------------------------------------------------------
export function createPuffyCloudMesh(isSnow: boolean): {
  group: THREE.Group;
  rainLines: THREE.LineSegments;
  rainMat: THREE.LineBasicMaterial;
  snowPoints?: THREE.Points;
  snowMat?: THREE.PointsMaterial;
} {
  const group = new THREE.Group();

  const cloudMat = new THREE.MeshStandardMaterial({
    color: isSnow ? '#f2f8fc' : '#d47b4b',
    roughness: 0.9,
    metalness: 0.05,
    transparent: true,
    opacity: isSnow ? 0.85 : 0.78,
    flatShading: true,
  });

  const puffCount = isSnow ? 6 : 7;
  for (let i = 0; i < puffCount; i++) {
    const puff = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.028 + (i % 3) * 0.008, 1),
      cloudMat,
    );
    if (isSnow) {
      puff.position.set(
        (i - 2.5) * 0.024,
        Math.sin(i) * 0.006,
        (Math.sin(i * 2) - 0.5) * 0.015,
      );
    } else {
      const height = i * 0.014;
      const radius = 0.010 + i * 0.005;
      puff.position.set(
        Math.cos(i * 1.8) * radius,
        height,
        Math.sin(i * 1.8) * radius,
      );
    }
    group.add(puff);
  }

  const linePositions = new Float32Array(18 * 6);
  for (let i = 0; i < 18; i++) {
    const lx = (Math.random() - 0.5) * 0.06;
    const lz = (Math.random() - 0.5) * 0.06;
    linePositions[i * 6] = lx;
    linePositions[i * 6 + 1] = 0;
    linePositions[i * 6 + 2] = lz;
    linePositions[i * 6 + 3] = lx;
    linePositions[i * 6 + 4] = -0.06;
    linePositions[i * 6 + 5] = lz;
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const rainMat = new THREE.LineBasicMaterial({
    color: isSnow ? '#cce8ff' : '#d97d4c',
    transparent: true,
    opacity: 0.0,
  });
  const rainLines = new THREE.LineSegments(lineGeo, rainMat);
  group.add(rainLines);

  let snowPoints: THREE.Points | undefined;
  let snowMat: THREE.PointsMaterial | undefined;

  if (isSnow) {
    const sCount = 28;
    const sPositions = new Float32Array(sCount * 3);
    for (let i = 0; i < sCount; i++) {
      sPositions[i * 3] = (Math.random() - 0.5) * 0.07;
      sPositions[i * 3 + 1] = -Math.random() * 0.06;
      sPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.07;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPositions, 3));
    snowMat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.006,
      transparent: true,
      opacity: 0.0,
    });
    snowPoints = new THREE.Points(sGeo, snowMat);
    group.add(snowPoints);
  }

  return { group, rainLines, rainMat, snowPoints, snowMat };
}

// -----------------------------------------------------------------------------
// 21. FIERY MARTIAN METEOR ('shootingstar')
// Fiery orange-gold meteor head with glowing incandescent ion trail
// -----------------------------------------------------------------------------
export function createShootingStarMesh(): THREE.Group {
  const group = new THREE.Group();

  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.010, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#ffea78' }),
  );
  group.add(headMesh);

  const trailPositions = new Float32Array(12 * 6);
  for (let i = 0; i < 12; i++) {
    const spread = (i / 12) * 0.008;
    trailPositions[i * 6] = 0;
    trailPositions[i * 6 + 1] = 0;
    trailPositions[i * 6 + 2] = 0;
    trailPositions[i * 6 + 3] = (Math.random() - 0.5) * spread;
    trailPositions[i * 6 + 4] = 0;
    trailPositions[i * 6 + 5] = -0.06 - Math.random() * 0.08;
  }
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(trailPositions, 3),
  );
  const trailMat = new THREE.LineBasicMaterial({
    color: '#ff7722',
    transparent: true,
    opacity: 0.8,
  });
  const trailLines = new THREE.LineSegments(trailGeo, trailMat);
  group.add(trailLines);

  return group;
}
