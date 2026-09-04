document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pixel-lab');
  const button = document.getElementById('animation-toggle');
  if (!canvas || !button) return;
  const context = canvas.getContext('2d');
  if (!context) { button.hidden = true; return; }
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = !preference.matches;
  let phase = 0;
  let frameId = null;
  let background = getComputedStyle(document.documentElement).getPropertyValue('--pixel-lab-bg').trim() || '#eef4f8';
  const draw = () => {
    context.fillStyle = background;
    context.fillRect(0, 0, 160, 144);
    const colors = ['#178be4', '#e08c3d', '#8c5bba'];
    for (let i = 0; i < 48; i++) {
      const angle = i * Math.PI * 2 / 48 + phase;
      const radius = 42 + Math.sin(i * .7 + phase * 3) * 13;
      context.strokeStyle = colors[i % colors.length];
      context.beginPath();
      context.moveTo(Math.round(80 + Math.cos(angle) * 12), Math.round(72 + Math.sin(angle) * 12));
      context.lineTo(Math.round(80 + Math.cos(angle) * radius), Math.round(72 + Math.sin(angle) * radius));
      context.stroke();
    }
  };
  let lastTime = 0;
  const loop = time => {
    if (!running || document.hidden) { frameId = null; return; }
    if (time - lastTime > 66) { phase += .02; draw(); lastTime = time; }
    frameId = requestAnimationFrame(loop);
  };
  const sync = () => {
    button.textContent = running ? 'PAUSE' : 'PLAY';
    button.setAttribute('aria-pressed', String(running));
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = running && !document.hidden ? requestAnimationFrame(loop) : null;
  };
  button.addEventListener('click', () => { running = !running; sync(); });
  preference.addEventListener('change', event => { running = !event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('portfolio:themechange', () => {
    background = getComputedStyle(document.documentElement).getPropertyValue('--pixel-lab-bg').trim() || '#eef4f8';
    draw();
  });
    draw(); sync();
});
