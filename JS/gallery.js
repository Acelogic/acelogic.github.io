// A die counts only if all four corners lie inside the usable circle.
const controls = document.querySelector("#wafer-controls");
const canvas = document.querySelector("#wafer-map");
const ctx = canvas.getContext("2d");
const edgeMargin = 3;
const cutWidth = 0.1;

function edgePattern() {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 12;
  const brush = tile.getContext("2d");
  brush.fillStyle = "#e6e1cc";
  brush.fillRect(0, 0, 12, 12);
  brush.strokeStyle = "#a49e87";
  brush.lineWidth = 2;
  brush.beginPath();
  brush.moveTo(-1, 1);
  brush.lineTo(1, -1);
  brush.moveTo(-1, 13);
  brush.lineTo(13, -1);
  brush.moveTo(11, 13);
  brush.lineTo(13, 11);
  brush.stroke();
  return ctx.createPattern(tile, "repeat");
}

function drawLayout(diameter, width, height, hatching) {
  const radius = diameter / 2;
  const usableRadius = radius - edgeMargin;
  const center = canvas.width / 2;
  const rim = center - 12;
  const scale = rim / radius;
  const pitchX = width + cutWidth;
  const pitchY = height + cutWidth;
  const columns = Math.ceil((usableRadius + width / 2) / pitchX);
  const rows = Math.ceil((usableRadius + height / 2) / pitchY);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(center, center);

  const silicon = ctx.createLinearGradient(-rim, -rim, rim, rim);
  silicon.addColorStop(0, "#353e58");
  silicon.addColorStop(0.35, "#a5adb2");
  silicon.addColorStop(0.7, "#c3aa86");
  silicon.addColorStop(1, "#485866");
  ctx.fillStyle = silicon;
  ctx.strokeStyle = "#4f5353";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, rim, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const film = ctx.createLinearGradient(-rim, -rim * 0.55, rim, rim * 0.55);
  for (const [stop, color] of [
    [0, "#505a78"], [0.19, "#6b9b9c"], [0.36, "#a4b7a8"],
    [0.52, "#c08da0"], [0.68, "#c99277"], [0.8, "#e3c397"], [1, "#7d858d"],
  ]) film.addColorStop(stop, color);

  ctx.beginPath();
  ctx.arc(0, 0, usableRadius * scale, 0, Math.PI * 2);
  ctx.fillStyle = "#67666a";
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = "rgba(61, 56, 62, 0.65)";
  ctx.lineWidth = 0.8;
  let count = 0;
  for (let row = -rows; row <= rows; row++) {
    const y = row * pitchY;
    for (let col = -columns; col <= columns; col++) {
      const x = col * pitchX;
      const nearX = Math.max(0, Math.abs(x) - width / 2);
      const nearY = Math.max(0, Math.abs(y) - height / 2);
      if (nearX ** 2 + nearY ** 2 >= usableRadius ** 2) continue;

      const farX = Math.abs(x) + width / 2;
      const farY = Math.abs(y) + height / 2;
      const whole = farX ** 2 + farY ** 2 <= usableRadius ** 2;
      if (whole) count++;
      ctx.fillStyle = whole ? film : hatching;
      const left = (x - width / 2) * scale;
      const top = (y - height / 2) * scale;
      ctx.fillRect(left, top, width * scale, height * scale);
      ctx.strokeRect(left, top, width * scale, height * scale);
    }
  }
  ctx.restore();
  const coverage = 100 * count * width * height / (Math.PI * usableRadius ** 2);
  return { count, coverage };
}

if (ctx) {
  const hatching = edgePattern();
  const error = document.querySelector("#layout-error");
  function updateLayout() {
    const { diameter, dieWidth, dieHeight } = controls.elements;
    error.hidden = controls.checkValidity();
    if (!error.hidden) return;
    const width = dieWidth.valueAsNumber;
    const height = dieHeight.valueAsNumber;
    const { count, coverage } = drawLayout(Number(diameter.value), width, height, hatching);
    document.querySelector("#die-count").textContent = count.toLocaleString("en-US");
    document.querySelector("#die-coverage").textContent = coverage.toFixed(1) + "%";
    canvas.setAttribute("aria-label", `${diameter.value} mm wafer with ${count} whole dies, each ${width} by ${height} mm`);
  }
  controls.addEventListener("input", updateLayout);
  // The browser restores the fields after dispatching the reset event.
  controls.addEventListener("reset", () => requestAnimationFrame(updateLayout));
  controls.addEventListener("submit", event => event.preventDefault());
  updateLayout();
  document.querySelector("#wafer-fallback").hidden = true;
  canvas.hidden = false;
  document.querySelector("#wafer-key").hidden = false;
  controls.hidden = false;
}
