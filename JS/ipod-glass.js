import * as THREE from './vendor/three/build/three.module.js';

export const LCD_SURFACE_Z = 0.576;
export const LENS_IOR = 1.5;

// Schlick's approximation: a dielectric reflects more light at grazing angles.
export function glassReflectance(cosine, ior = LENS_IOR) {
  const f0 = ((ior - 1) / (ior + 1)) ** 2;
  return f0 + (1 - f0) * (1 - Math.max(0, Math.min(1, cosine))) ** 5;
}

export function installScreenGlass(device) {
  let lens;
  device.traverse(object => {
    if (object.isMesh && object.name.replace(/[\s_]/g, '').toLowerCase() === 'displayglass') lens = object;
  });
  if (!lens) throw new Error('The iPod model is missing its display lens.');

  // Draw a transparent aperture after the opaque enclosure. The canvas now sits
  // OVER the live HTML, and the aperture exposes the LCD behind the actual lens.
  const apertureMaterial = new THREE.ShaderMaterial({
    vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }',
    blending: THREE.NoBlending,
    depthWrite: true,
    side: THREE.FrontSide,
    toneMapped: false
  });
  const aperture = new THREE.Mesh(new THREE.PlaneGeometry(4.84, 3.63), apertureMaterial);
  aperture.name = 'Live LCD aperture';
  aperture.position.set(0, 2.5, LCD_SURFACE_Z + .002);
  aperture.renderOrder = 1;
  device.add(aperture);

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 0,
    roughness: .085,
    ior: LENS_IOR,
    specularIntensity: 1,
    specularColor: 0xf6faff,
    envMapIntensity: 1.1,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor
  });
  glass.name = 'Reflective cover lens over live LCD';
  glass.onBeforeCompile = shader => {
    shader.uniforms.lensF0 = { value: glassReflectance(1) };
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float lensF0;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      float lensCosine = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
      float lensReflection = min(lensF0 + (1.0 - lensF0) * pow(1.0 - lensCosine, 5.0), 0.98);
      // Unassociate the reflected radiance before tone mapping and sRGB conversion.
      outgoingLight /= max(lensReflection, 0.001);
      #include <opaque_fragment>
      gl_FragColor.a = lensReflection + 0.025 * (1.0 - lensReflection);
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <premultiplied_alpha_fragment>', `
      // Premultiplied reflection + attenuated HTML, without reflecting the LCD itself.
      gl_FragColor.rgb *= lensReflection;
    `);
  };
  glass.customProgramCacheKey = () => 'ipod-lens-fresnel-composite-v1';
  lens.material = glass;
  lens.renderOrder = 2;
  return { lens, aperture, material: glass };
}
