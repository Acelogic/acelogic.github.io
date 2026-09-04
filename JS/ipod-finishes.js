import * as THREE from './vendor/three/build/three.module.js';

export const FINISHES = Object.freeze({
  silver: { name: 'Silver', color: '#d1d7dd' },
  black: { name: 'Black', color: '#242930' },
  blue: { name: 'Blue', color: '#387fba' },
  purple: { name: 'Purple', color: '#9770b7' },
  green: { name: 'Green', color: '#549578' },
  red: { name: 'Red', color: '#c43d51' }
});
const STORAGE_KEY = 'mcruz.ipod.finish.v1';
const validColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
export function normalizeFinish(value) {
  if (value && Object.hasOwn(FINISHES, value.preset)) return { preset: value.preset, ...FINISHES[value.preset] };
  if (value?.preset === 'custom' && validColor(value.color)) return { preset: 'custom', color: value.color.toLowerCase(), name: 'Custom' };
  return { preset: 'silver', ...FINISHES.silver };
}

export function createFinishController(device, picker, onChange) {
  if (!picker) return null;
  const parts = [];
  device.traverse(mesh => {
    if (!mesh.isMesh || !mesh.material?.color) return;
    const name = mesh.name.replace(/[\s_.]/g, '').toLowerCase();
    const role = name === 'anodizedaluminumface' ? 'body'
      : name === 'centerbutton' ? 'center'
      : name === 'clickwheel' ? 'wheel'
      : /^(menulabel|previous|next|play|pause)/.test(name) ? 'marking' : null;
    if (!role) return;
    // Some engraved markings share their material with the back. Keep the finish local.
    mesh.material = mesh.material.clone();
    parts.push({ role, material: mesh.material, original: mesh.material.color.clone() });
  });
  if (!parts.some(part => part.role === 'body')) return null;
  const radios = [...picker.querySelectorAll('input[name="ipod-finish"]')];
  const custom = picker.querySelector('#ipod-custom-color');
  const label = picker.querySelector('#ipod-finish-name');
  let storage;
  let current;
  try { storage = window.localStorage; current = JSON.parse(storage.getItem(STORAGE_KEY)); } catch { /* Storage can be unavailable in private browsing. */ }
  const apply = (value, save = true) => {
    current = normalizeFinish(value);
    const body = new THREE.Color(current.color);
    const dark = body.r * .2126 + body.g * .7152 + body.b * .0722 < .06;
    for (const part of parts) {
      if (current.preset === 'silver') { part.material.color.copy(part.original); continue; }
      if (part.role === 'body') part.material.color.copy(body);
      if (part.role === 'center') part.material.color.copy(dark ? new THREE.Color('#373d44') : body.clone().lerp(new THREE.Color('#ffffff'), .12));
      if (part.role === 'wheel') part.material.color.copy(dark ? new THREE.Color('#292d32') : part.original);
      if (part.role === 'marking') part.material.color.copy(dark ? new THREE.Color('#a9b1b9') : part.original);
    }
    radios.forEach(radio => { radio.checked = radio.value === current.preset; });
    if (custom) {
      if (current.preset === 'custom') custom.value = current.color;
      custom.closest('label').classList.toggle('is-selected', current.preset === 'custom');
    }
    if (label) label.textContent = current.name;
    if (save) { try { storage?.setItem(STORAGE_KEY, JSON.stringify({ preset: current.preset, color: current.color })); } catch { /* Applying a color does not require storage. */ } }
    onChange?.(current);
  };
  radios.forEach(radio => radio.addEventListener('change', () => { if (radio.checked) apply({ preset: radio.value }); }));
  const applyCustom = () => apply({ preset: 'custom', color: custom.value });
  custom?.addEventListener('input', applyCustom);
  custom?.addEventListener('change', applyCustom);
  // Keep open tabs in sync while retaining the preference across ordinary page navigation.
  const sync = event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try { apply(JSON.parse(event.newValue), false); } catch { apply(null, false); }
  };
  window.addEventListener('storage', sync);
  apply(current, false);
  picker.hidden = false;
  picker.disabled = false;
  return {
    apply,
    enable() { picker.disabled = false; picker.hidden = false; window.addEventListener('storage', sync); },
    disable() { picker.disabled = true; picker.hidden = true; window.removeEventListener('storage', sync); }
  };
}
