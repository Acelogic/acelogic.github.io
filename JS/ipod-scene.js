import * as THREE from 'three';
import { calculateIpodLayout } from './ipod-layout.js';
import { createFinishController } from './ipod-finishes.js';
import { installScreenGlass, LCD_SURFACE_Z } from './ipod-glass.js';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from './vendor/three/examples/jsm/renderers/CSS3DRenderer.js';
import { RoomEnvironment } from './vendor/three/examples/jsm/environments/RoomEnvironment.js';

const stage = document.getElementById('ipod-stage');
const ui = document.getElementById('ipod-ui');
const state = document.getElementById('model-state');
const rotate = document.getElementById('rotate-device');
const reset = document.getElementById('reset-device');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
} catch {
  if (state) state.textContent = 'Still view · all controls available';
}
if (renderer && stage && ui) {
  const scene = new THREE.Scene();
  const cssScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  const device = new THREE.Group();
  const interfaceGroup = new THREE.Group();
  scene.add(device); cssScene.add(interfaceGroup);
  const touchDevice = matchMedia('(hover: none) and (pointer: coarse)').matches;
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.className = 'ipod-webgl';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  let environment;
  const rebuildEnvironment = () => {
    environment?.dispose();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    environment = pmrem.fromScene(room, .015);
    scene.environment = environment.texture;
    room.dispose(); pmrem.dispose();
  };
  rebuildEnvironment();
  const softbox = new THREE.DirectionalLight(0xffffff, 2.5);
  softbox.position.set(-4, 6, 10); scene.add(softbox);
  const rim = new THREE.DirectionalLight(0xdce9ff, 1.8);
  rim.position.set(6, -2, 4); scene.add(rim);
  const ambient = new THREE.AmbientLight(0xffffff, .65);
  scene.add(ambient);
  const css = new CSS3DRenderer();
  css.domElement.className = 'ipod-css3d';
  let loaded = false;
  let finishController;
  let pose = touchDevice ? 0 : -.10;
  let contextLost = false;
  let finishName = 'Silver';
  let layoutFrame = null;
  let lastLayout = null;
  let savedUiStyle = '';
  let animation = null;
  const render = () => {
    if (!loaded || contextLost || document.hidden) return;
    device.rotation.set(touchDevice ? 0 : .025, pose, 0);
    interfaceGroup.rotation.copy(device.rotation);
    ui.style.visibility = Math.cos(pose) > .025 ? 'visible' : 'hidden';
    renderer.render(scene, camera);
    css.render(cssScene, camera);
  };
  const applyAppearance = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    renderer.toneMappingExposure = dark ? .9 : 1.15;
    scene.environmentIntensity = dark ? .68 : 1;
    softbox.intensity = dark ? 1.7 : 2.5;
    rim.intensity = dark ? 1.6 : 1.8;
    ambient.intensity = dark ? .25 : .65;
    render();
  };
  window.addEventListener('portfolio:themechange', applyAppearance);
  applyAppearance();
  const resize = (force = false) => {
    if (!stage.clientWidth || !stage.clientHeight) return;
    const next = calculateIpodLayout(stage.clientWidth, stage.clientHeight, devicePixelRatio, touchDevice);
    stage.style.setProperty('--fallback-width', `${618 * next.fallbackScale}px`);
    stage.style.setProperty('--fallback-height', `${1035 * next.fallbackScale}px`);
    stage.style.setProperty('--fallback-scale', String(next.fallbackScale));
    if (!loaded || contextLost) return;
    if (!force && lastLayout && next.width === lastLayout.width && next.height === lastLayout.height && next.pixelRatio === lastLayout.pixelRatio) return;
    lastLayout = next;
    camera.aspect = next.aspect;
    camera.position.set(0, 0, next.distance);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(next.pixelRatio);
    renderer.setSize(next.width, next.height);
    css.setSize(next.width, next.height);
    render();
  };
  const scheduleResize = () => {
    if (layoutFrame !== null) return;
    layoutFrame = requestAnimationFrame(() => { layoutFrame = null; resize(); });
  };
  const cancelMotion = () => {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
  };
  const showFallback = () => {
    if (stage.classList.contains('is-3d')) savedUiStyle = ui.style.cssText;
    stage.classList.remove('is-3d');
    ui.removeAttribute('style');
    ui.inert = false;
    stage.append(ui);
    renderer.domElement.remove(); css.domElement.remove();
    finishController?.disable();
    if (rotate) rotate.hidden = true;
    if (reset) reset.hidden = true;
    if (state) state.textContent = 'Still view · all controls available';
  };
  const turn = destination => {
    if (!loaded || contextLost) return;
    cancelMotion();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { pose = destination; render(); return; }
    const start = performance.now();
    const from = pose;
    const step = now => {
      const t = Math.min((now - start) / 550, 1);
      pose = from + (destination - from) * (1 - Math.pow(1 - t, 3));
      render();
      animation = t < 1 ? requestAnimationFrame(step) : null;
    };
    animation = requestAnimationFrame(step);
  };
  new GLTFLoader().load('/Assets/models/ipod-classic.glb', gltf => {
    device.add(gltf.scene);
    installScreenGlass(device);
    finishController = createFinishController(device, document.getElementById('ipod-finish-picker'), finish => {
      finishName = finish.name;
      if (state) state.textContent = `${finishName} · Portfolio edition`;
      if (loaded) render();
    });
    const screenPlane = new CSS3DObject(ui);
    screenPlane.scale.setScalar(.01);
    screenPlane.position.set(0, 0, LCD_SURFACE_Z);
    interfaceGroup.add(screenPlane);
    stage.append(renderer.domElement, css.domElement);
    stage.classList.add('is-3d');
    loaded = true;
    resize();
    if (!finishController && state) state.textContent = 'Silver · Portfolio edition';
    rotate?.addEventListener('click', () => turn(pose + Math.PI / 2));
    reset?.addEventListener('click', () => turn(Math.round(pose / (Math.PI * 2)) * Math.PI * 2));
    new ResizeObserver(scheduleResize).observe(stage);
    window.addEventListener('resize', scheduleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true });
    window.addEventListener('pageshow', () => resize(true));
    window.addEventListener('pagehide', cancelMotion);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelMotion();
      else resize(true);
    });
    // The canvas composites the lit glass above the selectable HTML LCD.
    window.addEventListener('portfolio:viewchange', render);
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      contextLost = true;
      cancelMotion();
      showFallback();
    });
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      try {
        // Safari can reclaim GPU targets in the background; rebuild the studio reflections.
        rebuildEnvironment();
        contextLost = false;
        ui.style.cssText = savedUiStyle;
        stage.append(renderer.domElement, css.domElement);
        stage.classList.add('is-3d');
        finishController?.enable();
        if (rotate) rotate.hidden = false;
        if (reset) reset.hidden = false;
        if (state) state.textContent = `${finishName} · Portfolio edition`;
        resize(true);
      } catch {
        contextLost = true;
        showFallback();
      }
    });
  }, undefined, () => {
    renderer.dispose(); environment.dispose();
    if (rotate) rotate.hidden = true;
    if (reset) reset.hidden = true;
    if (state) state.textContent = 'Still view · all controls available';
  });
} else {
  if (rotate) rotate.hidden = true;
  if (reset) reset.hidden = true;
}
