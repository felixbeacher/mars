import * as THREE from 'three';
import {
  createChalkyWindowsillTextures,
  createLinenTextures,
  createWalnutTextures,
} from '../utils/textures';

export interface RoomEnvironmentHandles {
  group: THREE.Group;
  orbGlassMaterial: THREE.ShaderMaterial;
  skyMaterial: THREE.ShaderMaterial;
  updateTimeOfDay: (
    dayFactor: number,
    twilightFactor: number,
    nightFactor: number,
    elapsedTime: number,
  ) => void;
}

export function createRoomEnvironment(
  envMap: THREE.Texture,
): RoomEnvironmentHandles {
  const group = new THREE.Group();

  const walnutTex = createWalnutTextures();
  const linenTex = createLinenTextures();
  const chalkTex = createChalkyWindowsillTextures();

  // ---------------------------------------------------------------------------
  // 1. MARTIAN SKY BACKDROP (Butterscotch Day -> Famous Blue Sunset -> Deep Starry Night)
  // ---------------------------------------------------------------------------
  const skyGeo = new THREE.SphereGeometry(28, 48, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uDayFactor: { value: 1.0 },
      uTwilightFactor: { value: 0.0 },
      uNightFactor: { value: 0.0 },
      uTime: { value: 0.0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      uniform float uDayFactor;
      uniform float uTwilightFactor;
      uniform float uNightFactor;
      uniform float uTime;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 dir = normalize(vWorldPos);
        float h = clamp(dir.y * 0.65 + 0.35, 0.0, 1.0);

        // 1. Martian Butterscotch Day Sky (airborne iron-oxide dust creates the warm salmon/butterscotch atmosphere)
        vec3 dayBottom = vec3(0.92, 0.68, 0.50); // Warm dusty salmon horizon
        vec3 dayMid    = vec3(0.80, 0.54, 0.38); // Ochre-butterscotch mid-sky
        vec3 dayTop    = vec3(0.56, 0.34, 0.22); // Deep amber-sepia zenith
        vec3 dayCol = mix(dayBottom, dayMid, smoothstep(0.0, 0.48, h));
        dayCol = mix(dayCol, dayTop, smoothstep(0.48, 1.0, h));

        // 2. The Famous Martian Blue Sunset (Rayleigh forward scattering through fine dust produces an ethereal blue twilight glow!)
        vec3 twiBottom = vec3(0.44, 0.70, 0.92); // Luminescent icy-blue sunset halo
        vec3 twiMid    = vec3(0.20, 0.38, 0.60); // Ethereal cobalt-cyan atmospheric haze
        vec3 twiTop    = vec3(0.08, 0.14, 0.28); // Indigo-violet upper sky
        vec3 twiCol = mix(twiBottom, twiMid, smoothstep(0.0, 0.45, h));
        twiCol = mix(twiCol, twiTop, smoothstep(0.45, 1.0, h));

        // 3. Deep Martian Cosmos Night Sky
        vec3 nightBottom = vec3(0.09, 0.07, 0.14);
        vec3 nightMid    = vec3(0.03, 0.03, 0.07);
        vec3 nightTop    = vec3(0.01, 0.01, 0.03);
        vec3 nightCol = mix(nightBottom, nightMid, smoothstep(0.0, 0.45, h));
        nightCol = mix(nightCol, nightTop, smoothstep(0.45, 1.0, h));

        vec3 sky = dayCol * uDayFactor + twiCol * uTwilightFactor + nightCol * uNightFactor;

        // Vivid crisp stars through Mars' thin atmosphere
        float starVisibility = clamp(uNightFactor + uTwilightFactor * 0.45, 0.0, 1.0);
        if (starVisibility > 0.01 && dir.y > -0.05) {
          vec2 grid = floor(vUv * vec2(280.0, 140.0));
          float n = hash(grid);
          if (n > 0.988) {
            float twinkle = 0.65 + 0.35 * sin(uTime * 2.8 + n * 90.0);
            vec3 starTint = n > 0.996 ? vec3(0.9, 0.95, 1.0) : vec3(1.0, 0.92, 0.85);
            sky += starTint * twinkle * starVisibility * smoothstep(-0.05, 0.25, dir.y);
          }
        }

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMaterial);
  group.add(skyMesh);

  // ---------------------------------------------------------------------------
  // 2. CHALKY WHITE LAB OBSERVATORY WINDOWSILL
  // ---------------------------------------------------------------------------
  const sillGroup = new THREE.Group();
  const chalkMat = new THREE.MeshStandardMaterial({
    map: chalkTex.map,
    bumpMap: chalkTex.bumpMap,
    bumpScale: 0.014,
    color: new THREE.Color('#f2ede6'),
    roughness: 0.88,
    metalness: 0.02,
  });

  // Main deep windowsill board
  const mainSillGeo = new THREE.BoxGeometry(11.5, 0.26, 4.4);
  const mainSill = new THREE.Mesh(mainSillGeo, chalkMat);
  mainSill.position.set(0, -2.21, 0.15);
  mainSill.receiveShadow = true;
  sillGroup.add(mainSill);

  // Classic rounded front bullnose molding
  const bullnoseGeo = new THREE.CylinderGeometry(0.13, 0.13, 11.5, 24);
  bullnoseGeo.rotateZ(Math.PI / 2);
  const bullnose = new THREE.Mesh(bullnoseGeo, chalkMat);
  bullnose.position.set(0, -2.21, 2.35);
  bullnose.receiveShadow = true;
  sillGroup.add(bullnose);

  // Lower apron trim
  const apronGeo = new THREE.BoxGeometry(11.2, 0.55, 0.22);
  const apron = new THREE.Mesh(apronGeo, chalkMat);
  apron.position.set(0, -2.6, 2.15);
  apron.receiveShadow = true;
  sillGroup.add(apron);

  // Back window frame lower rail & vertical muntin bars
  const backRailGeo = new THREE.BoxGeometry(11.5, 0.22, 0.28);
  const backRail = new THREE.Mesh(backRailGeo, chalkMat);
  backRail.position.set(0, -1.98, -1.92);
  backRail.receiveShadow = true;
  sillGroup.add(backRail);

  const leftJambGeo = new THREE.BoxGeometry(0.45, 9.0, 0.36);
  const leftJamb = new THREE.Mesh(leftJambGeo, chalkMat);
  leftJamb.position.set(-4.6, 2.4, -1.92);
  sillGroup.add(leftJamb);

  const rightJamb = new THREE.Mesh(leftJambGeo, chalkMat);
  rightJamb.position.set(4.6, 2.4, -1.92);
  sillGroup.add(rightJamb);

  group.add(sillGroup);

  // ---------------------------------------------------------------------------
  // 3. FOLDED RESEARCH LAB LINEN CLOTH
  // ---------------------------------------------------------------------------
  const linenGroup = new THREE.Group();
  const linenMat = new THREE.MeshStandardMaterial({
    map: linenTex.map,
    bumpMap: linenTex.bumpMap,
    bumpScale: 0.026,
    color: new THREE.Color('#e5dcce'),
    roughness: 0.93,
    metalness: 0.0,
  });

  const createClothFold = (
    w: number,
    h: number,
    d: number,
    y: number,
    rotY: number,
    offsetX: number,
    offsetZ: number,
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d, 20, 2, 20);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const edgeX = Math.abs(v.x) / (w * 0.5);
      const edgeZ = Math.abs(v.z) / (d * 0.5);
      const edgeFactor = Math.max(edgeX, edgeZ);
      if (edgeFactor > 0.85 && v.y > 0) {
        v.y *= 1.0 - (edgeFactor - 0.85) * 4.2;
      }
      const wave =
        Math.sin(v.x * 3.2 + v.z * 2.1) * 0.008 +
        Math.cos(v.z * 4.5) * 0.005;
      v.y += wave;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, linenMat);
    mesh.position.set(offsetX, y, offsetZ);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  linenGroup.add(createClothFold(3.35, 0.036, 2.25, -2.062, 0.09, 0.55, 0.18));
  linenGroup.add(createClothFold(3.12, 0.034, 2.02, -2.032, -0.05, 0.48, 0.14));
  linenGroup.add(createClothFold(2.86, 0.032, 1.84, -2.004, 0.04, 0.42, 0.11));

  // Woven copper-amber stripe
  const stripeMat = new THREE.MeshStandardMaterial({
    map: linenTex.map,
    bumpMap: linenTex.bumpMap,
    bumpScale: 0.028,
    color: new THREE.Color('#c29b7a'),
    roughness: 0.94,
  });
  const stripeGeo = new THREE.BoxGeometry(2.84, 0.034, 0.12);
  const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
  stripeMesh.position.set(0.42, -2.002, 0.82);
  stripeMesh.rotation.y = 0.04;
  stripeMesh.receiveShadow = true;
  linenGroup.add(stripeMesh);

  group.add(linenGroup);

  // ---------------------------------------------------------------------------
  // 4. MARS ASTROBIOLOGY SAMPLE CANISTER & GLOWING LICHEN CRUCIBLE
  // ---------------------------------------------------------------------------
  const specimenGroup = new THREE.Group();
  specimenGroup.position.set(1.95, -1.99, 0.42);

  // Turned brushed titanium & bronze specimen pedestal
  const canisterBaseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.18, 32);
  const canisterMetalMat = new THREE.MeshStandardMaterial({
    color: '#8b939e',
    metalness: 0.85,
    roughness: 0.25,
    envMap,
    envMapIntensity: 1.1,
  });
  const canisterBase = new THREE.Mesh(canisterBaseGeo, canisterMetalMat);
  canisterBase.position.y = 0.09;
  canisterBase.castShadow = true;
  canisterBase.receiveShadow = true;
  specimenGroup.add(canisterBase);

  // Glass specimen cylinder
  const glassCylinderGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.38, 32);
  const cylinderGlassMat = new THREE.MeshPhysicalMaterial({
    color: '#e2f4ff',
    transparent: true,
    opacity: 0.35,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.52,
    thickness: 0.3,
    depthWrite: false,
  });
  const glassCylinder = new THREE.Mesh(glassCylinderGeo, cylinderGlassMat);
  glassCylinder.position.y = 0.36;
  specimenGroup.add(glassCylinder);

  // Top metallic cap with pressure gauge
  const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 32);
  const capMesh = new THREE.Mesh(capGeo, canisterMetalMat);
  capMesh.position.y = 0.58;
  capMesh.castShadow = true;
  specimenGroup.add(capMesh);

  // Inside the cylinder: Martian red regolith sample bed & glowing violet crystal cluster
  const regolithBed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24),
    new THREE.MeshStandardMaterial({ color: '#b8522f', roughness: 0.95 }),
  );
  regolithBed.position.y = 0.20;
  specimenGroup.add(regolithBed);

  const crystalMat = new THREE.MeshStandardMaterial({
    color: '#b57aff',
    emissive: new THREE.Color('#7838d9'),
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.2,
    flatShading: true,
  });
  for (let c = 0; c < 5; c++) {
    const a = (c / 5) * Math.PI * 2;
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(0.026 - c * 0.003, 0.14 - c * 0.015, 5),
      crystalMat,
    );
    crystal.position.set(Math.cos(a) * 0.06, 0.28, Math.sin(a) * 0.06);
    crystal.rotation.set(0.15 * Math.sin(a), a, 0.15 * Math.cos(a));
    specimenGroup.add(crystal);
  }

  group.add(specimenGroup);

  // ---------------------------------------------------------------------------
  // 5. TURNED WALNUT STAND WITH ENGRAVED BRASS COLLAR & PLAQUE
  // ---------------------------------------------------------------------------
  const standGroup = new THREE.Group();

  // Turned walnut wood base
  const walnutPoints = [
    new THREE.Vector2(0.0, -1.99),
    new THREE.Vector2(0.88, -1.99),
    new THREE.Vector2(0.91, -1.95),
    new THREE.Vector2(0.86, -1.90),
    new THREE.Vector2(0.72, -1.84),
    new THREE.Vector2(0.56, -1.74),
    new THREE.Vector2(0.64, -1.65),
    new THREE.Vector2(0.58, -1.57),
    new THREE.Vector2(0.71, -1.49),
    new THREE.Vector2(0.68, -1.44),
    new THREE.Vector2(0.52, -1.44),
    new THREE.Vector2(0.0, -1.52),
  ];
  const walnutGeo = new THREE.LatheGeometry(walnutPoints, 64);
  const walnutMat = new THREE.MeshStandardMaterial({
    map: walnutTex.map,
    bumpMap: walnutTex.bumpMap,
    bumpScale: 0.018,
    roughness: 0.36,
    metalness: 0.06,
    envMap,
    envMapIntensity: 0.55,
  });
  const walnutMesh = new THREE.Mesh(walnutGeo, walnutMat);
  walnutMesh.castShadow = true;
  walnutMesh.receiveShadow = true;
  standGroup.add(walnutMesh);

  // Turned Brass Collar cradling the glass orb
  const brassPoints = [
    new THREE.Vector2(0.54, -1.46),
    new THREE.Vector2(0.71, -1.46),
    new THREE.Vector2(0.75, -1.41),
    new THREE.Vector2(0.73, -1.35),
    new THREE.Vector2(0.76, -1.30),
    new THREE.Vector2(0.71, -1.28),
    new THREE.Vector2(0.67, -1.33),
    new THREE.Vector2(0.54, -1.44),
  ];
  const brassGeo = new THREE.LatheGeometry(brassPoints, 64);
  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#dca85b'),
    metalness: 0.90,
    roughness: 0.20,
    envMap,
    envMapIntensity: 1.25,
  });
  const brassMesh = new THREE.Mesh(brassGeo, brassMat);
  brassMesh.castShadow = true;
  brassMesh.receiveShadow = true;
  standGroup.add(brassMesh);

  // Engraved Brass Mission Plaque on the front of the walnut stand
  // "ARES IV // MARS BIOSPHERE"
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 512;
  plaqueCanvas.height = 128;
  const pCtx = plaqueCanvas.getContext('2d')!;
  pCtx.fillStyle = '#b8893e';
  pCtx.fillRect(0, 0, 512, 128);
  pCtx.strokeStyle = '#6e4c19';
  pCtx.lineWidth = 6;
  pCtx.strokeRect(8, 8, 496, 112);
  pCtx.fillStyle = '#261706';
  pCtx.font = 'bold 36px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText('ARES IV // MARS BIOSPHERE', 256, 52);
  pCtx.font = '22px monospace';
  pCtx.fillText('OLYMPUS MONS QUADRANGLE • 18.65°N 226.2°E', 256, 92);
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTex.colorSpace = THREE.SRGBColorSpace;

  const plaqueGeo = new THREE.PlaneGeometry(0.58, 0.15);
  const plaqueMat = new THREE.MeshStandardMaterial({
    map: plaqueTex,
    metalness: 0.75,
    roughness: 0.3,
  });
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.set(0, -1.82, 0.78);
  plaqueMesh.rotation.x = -0.18;
  standGroup.add(plaqueMesh);

  group.add(standGroup);

  // ---------------------------------------------------------------------------
  // 6. CLEAR GLASS ORB (Radius = 1.50)
  // ---------------------------------------------------------------------------
  const orbGroup = new THREE.Group();

  const innerGlassGeo = new THREE.SphereGeometry(1.46, 64, 64);
  const innerGlassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#dceefa'),
    transparent: true,
    opacity: 0.05,
    roughness: 0.08,
    metalness: 0.0,
    side: THREE.BackSide,
    depthWrite: false,
    envMap,
    envMapIntensity: 0.4,
  });
  const innerGlassMesh = new THREE.Mesh(innerGlassGeo, innerGlassMat);
  innerGlassMesh.renderOrder = 10;
  orbGroup.add(innerGlassMesh);

  const outerGlassGeo = new THREE.SphereGeometry(1.5, 96, 96);
  const orbGlassMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      uDayFactor: { value: 1.0 },
      uTwilightFactor: { value: 0.0 },
      uNightFactor: { value: 0.0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormalWorld;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;

      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vNormalView = normalize(normalMatrix * normal);
        vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-viewPos.xyz);
        gl_Position = projectionMatrix * viewPos;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormalWorld;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;

      uniform float uDayFactor;
      uniform float uTwilightFactor;
      uniform float uNightFactor;

      void main() {
        float VdotN = max(dot(vViewDir, vNormalView), 0.0);
        float fresnel = pow(1.0 - VdotN, 3.8);

        float outerEdge = smoothstep(0.16, 0.0, VdotN);
        float innerWallStep = smoothstep(0.24, 0.12, VdotN) * (1.0 - smoothstep(0.12, 0.04, VdotN));

        vec3 glassGreen = vec3(0.55, 0.88, 0.78);
        vec3 R = reflect(-vViewDir, vNormalView);

        vec2 vn = vNormalView.xy;
        vec2 winCenter = vec2(-0.46, 0.42);
        vec2 p = vn - winCenter;
        p.x += vn.y * 0.14;
        p.y -= vn.x * 0.10;

        float inWinX = smoothstep(0.29, 0.25, abs(p.x));
        float inWinY = smoothstep(0.33, 0.28, abs(p.y));
        float windowMask = inWinX * inWinY;

        float mullionX = smoothstep(0.012, 0.024, abs(p.x));
        float mullionY = smoothstep(0.014, 0.026, abs(p.y));
        float panes = windowMask * mullionX * mullionY;

        float paneGrad = smoothstep(-0.32, 0.32, p.y) * 0.45 + 0.55;
        float windowReflection = panes * paneGrad;

        vec2 bounceP = vn - vec2(0.55, -0.48);
        float bounceHighlight = exp(-dot(bounceP, bounceP) * 18.0) * 0.22;

        vec3 lightDir = normalize(vec3(-0.6, 0.75, 0.5));
        float spec = pow(max(dot(R, lightDir), 0.0), 90.0) * 0.45;

        vec3 winColorDay = vec3(1.0, 0.94, 0.86);
        vec3 winColorTwi = vec3(0.68, 0.82, 1.0);
        vec3 winColorNight = vec3(0.42, 0.58, 0.88);
        vec3 winColor = winColorDay * uDayFactor + winColorTwi * uTwilightFactor + winColorNight * uNightFactor;

        vec3 col = glassGreen * (outerEdge * 0.85 + innerWallStep * 0.55);
        col = mix(col, winColor, clamp(windowReflection * 1.3 + spec, 0.0, 1.0));
        col += vec3(0.95, 0.88, 0.80) * bounceHighlight;

        float alpha =
          fresnel * 0.34 +
          outerEdge * 0.22 +
          innerWallStep * 0.18 +
          windowReflection * (0.36 * uDayFactor + 0.28 * uTwilightFactor + 0.18 * uNightFactor) +
          bounceHighlight * 0.18 +
          spec * 0.35 +
          0.012;

        float collarMask = smoothstep(-1.42, -1.22, vWorldPos.y);
        alpha *= mix(0.65, 1.0, collarMask);

        gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.78));
      }
    `,
  });

  const outerGlassMesh = new THREE.Mesh(outerGlassGeo, orbGlassMaterial);
  outerGlassMesh.renderOrder = 20;
  orbGroup.add(outerGlassMesh);

  group.add(orbGroup);

  const updateTimeOfDay = (
    dayFactor: number,
    twilightFactor: number,
    nightFactor: number,
    elapsedTime: number,
  ) => {
    skyMaterial.uniforms.uDayFactor.value = dayFactor;
    skyMaterial.uniforms.uTwilightFactor.value = twilightFactor;
    skyMaterial.uniforms.uNightFactor.value = nightFactor;
    skyMaterial.uniforms.uTime.value = elapsedTime;

    orbGlassMaterial.uniforms.uDayFactor.value = dayFactor;
    orbGlassMaterial.uniforms.uTwilightFactor.value = twilightFactor;
    orbGlassMaterial.uniforms.uNightFactor.value = nightFactor;
  };

  return {
    group,
    orbGlassMaterial,
    skyMaterial,
    updateTimeOfDay,
  };
}
