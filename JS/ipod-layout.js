// Layout math stays independent of device names, toolbar height, and physical pixel density.
export function calculateIpodLayout(width, height, pixelRatio = 1, touch = false) {
  const w = Math.max(1, Number.isFinite(width) ? width : 1);
  const h = Math.max(1, Number.isFinite(height) ? height : 1);
  const aspect = w / h;
  const halfFov = 16 * Math.PI / 180;
  const distance = Math.max(11.45 / (2 * Math.tan(halfFov)), 7.1 / (2 * Math.tan(halfFov) * aspect));
  const density = Math.max(1, Number.isFinite(pixelRatio) ? pixelRatio : 1);
  const budget = touch ? 1500000 : 2400000;
  const resolution = Math.min(density, 2, Math.sqrt(budget / (w * h)));
  const scale = .01 * h / (2 * Math.tan(halfFov) * (distance - .576));
  return { width: w, height: h, aspect, distance, pixelRatio: resolution, fallbackScale: scale };
}
