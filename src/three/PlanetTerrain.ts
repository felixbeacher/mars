import * as THREE from 'three';

export interface UniqueVertex {
  baseDir: THREE.Vector3;
  jitteredDir: THREE.Vector3;
  radius: number;
  attrIndices: number[];
}

export interface FacetInfo {
  index: number;
  v0: number;
  v1: number;
  v2: number;
  centerDir: THREE.Vector3;
  normal: THREE.Vector3;
  moisture: number;
  snowCover: number;
  noiseSeed: number;
}

export interface PlanetTerrainHandles {
  group: THREE.Group;
  terrainMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
  baseRadius: number;
  seaLevel: number;
  uniqueVertices: UniqueVertex[];
  facets: FacetInfo[];
  getSurfaceRadiusAtDir: (dir: THREE.Vector3) => number;
  getSurfacePointAndNormal: (dir: THREE.Vector3) => {
    point: THREE.Vector3;
    normal: THREE.Vector3;
    radius: number;
    isWater: boolean;
    isBeach: boolean;
    isMountain: boolean;
  };
  findNearestWaterDirection: (dir: THREE.Vector3, maxAngle?: number) => THREE.Vector3 | null;
  sculptAtDirection: (
    dir: THREE.Vector3,
    mode: 'raise' | 'lower' | 'mountain' | 'lake',
  ) => boolean;
  applyRainAtDirection: (dir: THREE.Vector3, dt: number) => void;
  applySnowAtDirection: (dir: THREE.Vector3, dt: number) => void;
  update: (elapsedTime: number, dt: number, nightFactor: number) => void;
}

function pseudoNoise3D(x: number, y: number, z: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

export function createPlanetTerrain(): PlanetTerrainHandles {
  const group = new THREE.Group();
  const baseRadius = 0.75; // Half the specimen orb's 1.50 radius
  const seaLevel = 0.738;

  const baseGeo = new THREE.IcosahedronGeometry(1.0, 4);
  const nonIndexedGeo = baseGeo.index ? baseGeo.toNonIndexed() : baseGeo;
  const posAttr = nonIndexedGeo.attributes.position;
  const vertexCount = posAttr.count;
  const facetCount = vertexCount / 3;

  const uniqueMap = new Map<string, number>();
  const uniqueVertices: UniqueVertex[] = [];
  const attrToUnique = new Int32Array(vertexCount);

  const tempV = new THREE.Vector3();
  for (let i = 0; i < vertexCount; i++) {
    tempV.fromBufferAttribute(posAttr, i).normalize();
    const key = `${Math.round(tempV.x * 10000)}_${Math.round(tempV.y * 10000)}_${Math.round(tempV.z * 10000)}`;
    let uIdx = uniqueMap.get(key);
    if (uIdx === undefined) {
      uIdx = uniqueVertices.length;
      uniqueMap.set(key, uIdx);

      const n1 = pseudoNoise3D(tempV.x * 3.3, tempV.y * 3.3, tempV.z * 3.3) - 0.5;
      const n2 = pseudoNoise3D(tempV.y * 4.9, tempV.z * 4.9, tempV.x * 4.9) - 0.5;
      const up =
        Math.abs(tempV.y) < 0.9
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(1, 0, 0);
      const t1 = new THREE.Vector3().crossVectors(tempV, up).normalize();
      const t2 = new THREE.Vector3().crossVectors(tempV, t1).normalize();

      const jitteredDir = tempV
        .clone()
        .addScaledVector(t1, n1 * 0.024)
        .addScaledVector(t2, n2 * 0.024)
        .normalize();

      uniqueVertices.push({
        baseDir: tempV.clone(),
        jitteredDir,
        radius: baseRadius,
        attrIndices: [i],
      });
    } else {
      uniqueVertices[uIdx].attrIndices.push(i);
    }
    attrToUnique[i] = uIdx;
  }

  // ---------------------------------------------------------------------------
  // MARTIAN GEOGRAPHIC LANDMARKS:
  // 1. Olympus Mons (Massive shield volcano with sunken caldera)
  // 2. Valles Marineris (Equatorial canyon gorge chasm)
  // 3. Jezero / Gale Crater Paleolake Basins
  // 4. Elysium / Tharsis volcanic plateaus
  // 5. Ares Colony low-altitude plain
  // ---------------------------------------------------------------------------
  const olympusMonsCenter = new THREE.Vector3(0.08, 0.94, -0.28).normalize();
  const jezeroPaleolakeCenter = new THREE.Vector3(0.66, -0.18, 0.73).normalize();
  const galeCraterCenter = new THREE.Vector3(-0.70, -0.15, -0.69).normalize();
  const aresColonyPlain = new THREE.Vector3(-0.18, 0.22, 0.96).normalize();
  const canyonCenter = new THREE.Vector3(0.55, 0.08, 0.82).normalize();

  for (let i = 0; i < uniqueVertices.length; i++) {
    const uv = uniqueVertices[i];
    const d = uv.jitteredDir;

    // Martian undulating dune waves & ridgelines
    const wave1 =
      Math.sin(d.x * 4.5 + d.y * 3.2) *
      Math.cos(d.z * 4.1 - d.y * 2.5) *
      0.022;
    const wave2 =
      Math.sin(d.x * 10.2 - d.z * 8.6) *
      Math.sin(d.y * 7.8) *
      0.010;
    let r = baseRadius + 0.019 + wave1 + wave2;

    // 1. Olympus Mons: Huge shield volcano with caldera depression at the peak
    const distOlympus = d.distanceTo(olympusMonsCenter);
    if (distOlympus < 0.64) {
      const shieldFalloff = Math.pow(1.0 - distOlympus / 0.64, 1.6);
      const ridgeNoise =
        0.88 + 0.32 * Math.sin(d.x * 18.0 + d.z * 18.0) * Math.cos(d.y * 14.0);
      let volcanoHeight = shieldFalloff * 0.175 * ridgeNoise;

      // Caldera depression at the summit
      if (distOlympus < 0.13) {
        const calderaDepression = Math.pow(1.0 - distOlympus / 0.13, 2.0) * 0.038;
        volcanoHeight -= calderaDepression;
      }
      r += volcanoHeight;
    }

    // 2. Valles Marineris Canyon Chasm
    const distCanyon = d.distanceTo(canyonCenter);
    if (distCanyon < 0.32) {
      const canyonCut = Math.pow(1.0 - distCanyon / 0.32, 1.8) * 0.045;
      r -= canyonCut;
    }

    // 3. Jezero Paleolake Basin (ancient delta with mineral lakebed)
    const distJezero = d.distanceTo(jezeroPaleolakeCenter);
    if (distJezero < 0.68) {
      const sFactor = Math.pow(1.0 - distJezero / 0.68, 1.5);
      r -= sFactor * 0.082;
      // Central rebound crater peak
      if (distJezero < 0.12) {
        const peak = Math.pow(1.0 - distJezero / 0.12, 2.0) * 0.028;
        r += peak;
      }
    }

    // 4. Gale Crater / Southern Basin
    const distGale = d.distanceTo(galeCraterCenter);
    if (distGale < 0.65) {
      const sFactor = Math.pow(1.0 - distGale / 0.65, 1.5);
      r -= sFactor * 0.076;
      // Mount Sharp central mound inside Gale Crater
      if (distGale < 0.14) {
        const mountSharp = Math.pow(1.0 - distGale / 0.14, 1.8) * 0.032;
        r += mountSharp;
      }
    }

    // 5. Ares Colony Habitation Plateau (smooth habitable regolith basin)
    const distColony = d.distanceTo(aresColonyPlain);
    if (distColony < 0.54) {
      const blend = Math.pow(1.0 - distColony / 0.54, 1.3);
      const targetPlateau = baseRadius + 0.027 + wave2 * 0.4;
      r = THREE.MathUtils.lerp(r, targetPlateau, blend * 0.65);
    }

    // Keep non-basin terrain safely above the ancient meltwater/ice level
    if (distJezero >= 0.56 && distGale >= 0.54) {
      r = Math.max(r, seaLevel + 0.012);
    }

    uv.radius = r;
  }

  const facets: FacetInfo[] = [];
  for (let f = 0; f < facetCount; f++) {
    const v0 = attrToUnique[f * 3];
    const v1 = attrToUnique[f * 3 + 1];
    const v2 = attrToUnique[f * 3 + 2];
    const centerDir = new THREE.Vector3()
      .add(uniqueVertices[v0].jitteredDir)
      .add(uniqueVertices[v1].jitteredDir)
      .add(uniqueVertices[v2].jitteredDir)
      .normalize();
    const seed = pseudoNoise3D(
      centerDir.x * 11.3,
      centerDir.y * 11.3,
      centerDir.z * 11.3,
    );
    facets.push({
      index: f,
      v0,
      v1,
      v2,
      centerDir,
      normal: centerDir.clone(),
      moisture: 0,
      snowCover: 0,
      noiseSeed: seed,
    });
  }

  const colorAttr = new THREE.Float32BufferAttribute(
    new Float32Array(vertexCount * 3),
    3,
  );
  nonIndexedGeo.setAttribute('color', colorAttr);

  // ---------------------------------------------------------------------------
  // AUTHENTIC MARTIAN PALETTE (Iron-oxide hematite, basalt, ochre, polar CO2 ice)
  // ---------------------------------------------------------------------------
  const colBasinSediment = new THREE.Color('#945d42'); // Ancient dried clay / delta silt
  const colPaleoShore = new THREE.Color('#ba7b56');    // Ochre crater shoreline
  const colRegolithLight = new THREE.Color('#e0834f'); // Warm rolling Martian dust dunes
  const colRegolithMid = new THREE.Color('#c96434');   // Classic rich rust-orange hematite
  const colRegolithDeep = new THREE.Color('#af4824');  // Deeper iron-oxide red plateaus
  const colCanyonWall = new THREE.Color('#8a3219');   // Stratified canyon cliff rock
  const colVolcanicBasalt = new THREE.Color('#4d3731'); // Dark basalt lava flows on Olympus Mons
  const colCalderaDark = new THREE.Color('#382723');   // Dark sunken caldera floor
  const colPolarIce = new THREE.Color('#f6f9fc');      // Planum Boreum / Australe dry-ice white
  const colPolarIceShade = new THREE.Color('#d9e8f5'); // Soft crystalline frost shade

  const tempColor = new THREE.Color();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();

  const updateTerrainGeometryAndColors = () => {
    for (let u = 0; u < uniqueVertices.length; u++) {
      const uv = uniqueVertices[u];
      const x = uv.jitteredDir.x * uv.radius;
      const y = uv.jitteredDir.y * uv.radius;
      const z = uv.jitteredDir.z * uv.radius;
      for (let k = 0; k < uv.attrIndices.length; k++) {
        posAttr.setXYZ(uv.attrIndices[k], x, y, z);
      }
    }
    posAttr.needsUpdate = true;
    nonIndexedGeo.computeVertexNormals();

    for (let f = 0; f < facets.length; f++) {
      const facet = facets[f];
      const u0 = uniqueVertices[facet.v0];
      const u1 = uniqueVertices[facet.v1];
      const u2 = uniqueVertices[facet.v2];
      p0.copy(u0.jitteredDir).multiplyScalar(u0.radius);
      p1.copy(u1.jitteredDir).multiplyScalar(u1.radius);
      p2.copy(u2.jitteredDir).multiplyScalar(u2.radius);
      e1.subVectors(p1, p0);
      e2.subVectors(p2, p0);
      facet.normal.crossVectors(e1, e2).normalize();
    }
  };

  const updateTerrainColorsOnly = () => {
    for (let f = 0; f < facets.length; f++) {
      const facet = facets[f];
      const r0 = uniqueVertices[facet.v0].radius;
      const r1 = uniqueVertices[facet.v1].radius;
      const r2 = uniqueVertices[facet.v2].radius;
      const avgR = (r0 + r1 + r2) / 3;
      const maxR = Math.max(r0, r1, r2);
      const absY = Math.abs(facet.centerDir.y);

      // Polar Ice Caps (Planum Boreum & Planum Australe)
      if (absY > 0.84 || (absY > 0.74 && facet.noiseSeed > 0.42)) {
        tempColor.copy(facet.noiseSeed > 0.5 ? colPolarIce : colPolarIceShade);
      } else if (avgR < seaLevel - 0.008) {
        // Deep ancient basin sediment
        tempColor.copy(colBasinSediment);
      } else if (avgR < seaLevel + 0.015) {
        // Paleolake shorelines
        tempColor.copy(facet.noiseSeed > 0.5 ? colPaleoShore : colRegolithLight);
      } else if (maxR > 0.852) {
        // High volcanic peak & caldera rim
        tempColor.copy(facet.noiseSeed > 0.4 ? colVolcanicBasalt : colCalderaDark);
      } else if (avgR > 0.814) {
        // High plateaus & canyon cliff scarps
        tempColor.copy(facet.noiseSeed > 0.5 ? colCanyonWall : colRegolithDeep);
      } else {
        // Rolling Martian dunes and regolith plains
        const hNorm =
          (avgR - (seaLevel + 0.015)) / (0.814 - (seaLevel + 0.015)) +
          (facet.noiseSeed - 0.5) * 0.26;
        if (hNorm < 0.35) {
          tempColor.copy(colRegolithLight);
        } else if (hNorm < 0.68) {
          tempColor.copy(colRegolithMid);
        } else {
          tempColor.copy(colRegolithDeep);
        }
      }

      // Moisture darkening (simulated wet clay / terraformed ground)
      if (facet.moisture > 0.001) {
        const darken = 1.0 - facet.moisture * 0.32;
        tempColor.multiplyScalar(darken);
      }

      // Dry-ice / water-ice frost cover (from CO2 ice clouds or frost storms)
      if (facet.snowCover > 0.001 && avgR >= seaLevel) {
        const frostTarget = facet.noiseSeed > 0.45 ? colPolarIce : colPolarIceShade;
        tempColor.lerp(frostTarget, Math.min(1.0, facet.snowCover * 0.94));
      }

      const baseIdx = f * 3;
      colorAttr.setXYZ(baseIdx, tempColor.r, tempColor.g, tempColor.b);
      colorAttr.setXYZ(baseIdx + 1, tempColor.r, tempColor.g, tempColor.b);
      colorAttr.setXYZ(baseIdx + 2, tempColor.r, tempColor.g, tempColor.b);
    }
    colorAttr.needsUpdate = true;
  };

  updateTerrainGeometryAndColors();
  updateTerrainColorsOnly();

  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.88,
    metalness: 0.04,
  });

  const terrainMesh = new THREE.Mesh(nonIndexedGeo, terrainMaterial);
  terrainMesh.castShadow = true;
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // ---------------------------------------------------------------------------
  // ANCIENT CRATER PALEOLAKE / TERRAFORMED CRYO-RESERVOIRS
  // Clear, crystalline turquoise meltwater with glistening mineral clarity
  // ---------------------------------------------------------------------------
  const waterBaseGeo = new THREE.IcosahedronGeometry(seaLevel, 4);
  const waterGeo = waterBaseGeo.index
    ? waterBaseGeo.toNonIndexed()
    : waterBaseGeo;
  const waterPos = waterGeo.attributes.position;
  const waterCount = waterPos.count;
  const waterDirs: THREE.Vector3[] = [];
  const waterPhases = new Float32Array(waterCount);
  const waterColorAttr = new THREE.Float32BufferAttribute(
    new Float32Array(waterCount * 3),
    3,
  );
  waterGeo.setAttribute('color', waterColorAttr);

  for (let i = 0; i < waterCount; i++) {
    const d = new THREE.Vector3().fromBufferAttribute(waterPos, i).normalize();
    waterDirs.push(d);
    waterPhases[i] =
      d.x * 11.0 + d.y * 9.0 + d.z * 13.0 + pseudoNoise3D(d.x, d.y, d.z) * 4.0;
  }

  const getSurfaceRadiusAtDir = (dir: THREE.Vector3): number => {
    let bestDot = -2;
    let bestRadius = baseRadius;
    for (let i = 0; i < uniqueVertices.length; i++) {
      const dot = dir.dot(uniqueVertices[i].jitteredDir);
      if (dot > bestDot) {
        bestDot = dot;
        bestRadius = uniqueVertices[i].radius;
      }
    }
    return bestRadius;
  };

  // Martian terraformed mineral reservoir colors (icy cyan, turquoise brine, deep cobalt)
  const colShallowMelt = new THREE.Color('#6dd8d0');
  const colMidBrine = new THREE.Color('#2298a8');
  const colDeepBasin = new THREE.Color('#12536b');
  const wColor = new THREE.Color();

  const updateWaterColors = () => {
    for (let f = 0; f < facets.length; f++) {
      const facet = facets[f];
      const terrainR =
        (uniqueVertices[facet.v0].radius +
          uniqueVertices[facet.v1].radius +
          uniqueVertices[facet.v2].radius) /
        3;
      const depth = Math.max(0, seaLevel - terrainR);

      const t = THREE.MathUtils.clamp(depth / 0.062, 0, 1);
      if (t < 0.45) {
        wColor.copy(colShallowMelt).lerp(colMidBrine, t / 0.45);
      } else {
        wColor.copy(colMidBrine).lerp(colDeepBasin, (t - 0.45) / 0.55);
      }

      const i = f * 3;
      waterColorAttr.setXYZ(i, wColor.r, wColor.g, wColor.b);
      waterColorAttr.setXYZ(i + 1, wColor.r, wColor.g, wColor.b);
      waterColorAttr.setXYZ(i + 2, wColor.r, wColor.g, wColor.b);
    }
    waterColorAttr.needsUpdate = true;
  };

  updateWaterColors();

  const waterMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    flatShading: true,
    transparent: true,
    opacity: 0.84,
    roughness: 0.20,
    metalness: 0.06,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMaterial);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  const getSurfacePointAndNormal = (dir: THREE.Vector3) => {
    const normDir = dir.clone().normalize();
    let bestDot = -2;
    let bestFacet = facets[0];

    for (let f = 0; f < facets.length; f++) {
      const dot = normDir.dot(facets[f].centerDir);
      if (dot > bestDot) {
        bestDot = dot;
        bestFacet = facets[f];
      }
    }

    const r0 = uniqueVertices[bestFacet.v0].radius;
    const r1 = uniqueVertices[bestFacet.v1].radius;
    const r2 = uniqueVertices[bestFacet.v2].radius;
    const r = (r0 + r1 + r2) / 3;

    const uprightNormal = normDir
      .clone()
      .lerp(bestFacet.normal, 0.28)
      .normalize();

    return {
      point: normDir.clone().multiplyScalar(r),
      normal: uprightNormal,
      radius: r,
      isWater: r < seaLevel + 0.002,
      isBeach: r >= seaLevel + 0.002 && r < seaLevel + 0.018,
      isMountain: r > 0.814,
    };
  };

  const findNearestWaterDirection = (
    dir: THREE.Vector3,
    maxDist = 0.65,
  ): THREE.Vector3 | null => {
    const normDir = dir.clone().normalize();
    let bestDist = maxDist;
    let bestDir: THREE.Vector3 | null = null;
    for (let f = 0; f < facets.length; f++) {
      const facet = facets[f];
      const avgR =
        (uniqueVertices[facet.v0].radius +
          uniqueVertices[facet.v1].radius +
          uniqueVertices[facet.v2].radius) /
        3;
      if (avgR < seaLevel - 0.004) {
        const d = normDir.distanceTo(facet.centerDir);
        if (d < bestDist) {
          bestDist = d;
          bestDir = facet.centerDir.clone();
        }
      }
    }
    return bestDir;
  };

  const sculptAtDirection = (
    dir: THREE.Vector3,
    mode: 'raise' | 'lower' | 'mountain' | 'lake',
  ): boolean => {
    const normDir = dir.clone().normalize();
    let brushRadius = 0.26;
    let deltaStrength = 0.028;
    const minR = 0.65;
    const maxR = 0.94;

    if (mode === 'mountain') {
      brushRadius = 0.34;
      deltaStrength = 0.072;
    } else if (mode === 'lake') {
      brushRadius = 0.35;
      deltaStrength = -0.065;
    } else if (mode === 'raise') {
      brushRadius = 0.25;
      deltaStrength = 0.026;
    } else if (mode === 'lower') {
      brushRadius = 0.26;
      deltaStrength = -0.028;
    }

    let modified = false;
    for (let i = 0; i < uniqueVertices.length; i++) {
      const uv = uniqueVertices[i];
      const dist = uv.jitteredDir.distanceTo(normDir);
      if (dist < brushRadius) {
        const falloff = Math.pow(1.0 - dist / brushRadius, 1.5);
        // For impact crater (lake tool), create raised circular rim and sunken center
        let shapeMultiplier = 1.0;
        if (mode === 'lake') {
          const normD = dist / brushRadius;
          if (normD > 0.68) {
            // Raised crater rim
            shapeMultiplier = -0.45;
          } else if (normD < 0.22) {
            // Central peak
            shapeMultiplier = 0.25;
          }
        } else if (mode === 'mountain') {
          // Shield caldera profile
          const normD = dist / brushRadius;
          if (normD < 0.25) {
            shapeMultiplier = 0.65; // Sunken central caldera
          } else {
            shapeMultiplier = 1.15;
          }
        }

        uv.radius = THREE.MathUtils.clamp(
          uv.radius + deltaStrength * falloff * shapeMultiplier,
          minR,
          maxR,
        );
        modified = true;
      }
    }

    if (modified) {
      updateTerrainGeometryAndColors();
      updateTerrainColorsOnly();
      updateWaterColors();
    }
    return modified;
  };

  let moistureDirty = false;
  const applyRainAtDirection = (dir: THREE.Vector3, dt: number) => {
    const normDir = dir.clone().normalize();
    for (let f = 0; f < facets.length; f++) {
      const facet = facets[f];
      const dist = facet.centerDir.distanceTo(normDir);
      if (dist < 0.28) {
        const intensity = 1.0 - dist / 0.28;
        facet.moisture = Math.min(1.0, facet.moisture + dt * 1.65 * intensity);
        if (facet.snowCover > 0) {
          facet.snowCover = Math.max(0, facet.snowCover - dt * 0.8 * intensity);
        }
        moistureDirty = true;
      }
    }
  };

  const applySnowAtDirection = (dir: THREE.Vector3, dt: number) => {
    const normDir = dir.clone().normalize();
    for (let f = 0; f < facets.length; f++) {
      const facet = facets[f];
      const dist = facet.centerDir.distanceTo(normDir);
      if (dist < 0.28) {
        const intensity = 1.0 - dist / 0.28;
        facet.snowCover = Math.min(1.0, facet.snowCover + dt * 1.45 * intensity);
        moistureDirty = true;
      }
    }
  };

  const update = (elapsedTime: number, dt: number, _nightFactor: number) => {
    for (let i = 0; i < waterCount; i++) {
      const d = waterDirs[i];
      const terrainRadius = uniqueVertices[attrToUnique[i]].radius;
      const depth = seaLevel - terrainRadius;

      if (depth <= 0.001) {
        const dryR = Math.min(seaLevel - 0.004, terrainRadius - 0.004);
        waterPos.setXYZ(i, d.x * dryR, d.y * dryR, d.z * dryR);
      } else {
        const phase = waterPhases[i];
        const shoreMask = THREE.MathUtils.clamp(depth / 0.014, 0.0, 1.0);
        const wave =
          (Math.sin(elapsedTime * 1.8 + phase) * 0.0018 +
            Math.cos(elapsedTime * 1.4 - phase * 0.7) * 0.0012) *
          shoreMask;
        const r = seaLevel + wave;
        waterPos.setXYZ(i, d.x * r, d.y * r, d.z * r);
      }
    }
    waterPos.needsUpdate = true;

    let anyWetOrSnow = false;
    for (let f = 0; f < facets.length; f++) {
      if (facets[f].moisture > 0) {
        facets[f].moisture = Math.max(0, facets[f].moisture - dt * 0.14);
        anyWetOrSnow = true;
      }
      if (facets[f].snowCover > 0) {
        facets[f].snowCover = Math.max(0, facets[f].snowCover - dt * 0.055);
        anyWetOrSnow = true;
      }
    }
    if (anyWetOrSnow || moistureDirty) {
      updateTerrainColorsOnly();
      moistureDirty = false;
    }
  };

  return {
    group,
    terrainMesh,
    waterMesh,
    baseRadius,
    seaLevel,
    uniqueVertices,
    facets,
    getSurfaceRadiusAtDir,
    getSurfacePointAndNormal,
    findNearestWaterDirection,
    sculptAtDirection,
    applyRainAtDirection,
    applySnowAtDirection,
    update,
  };
}
