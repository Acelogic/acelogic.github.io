import TypeIt from "./vendor/typeit-8.8.7/typeit.mjs";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let lastHeading;
let stopTyping;

function typeHeading() {
  const heading = document.querySelector("main h1");
  if (!heading || heading === lastHeading) return;
  stopTyping?.();
  lastHeading = heading;
  if (reducedMotion.matches) return;

  // Preserve the original text for assistive technology and reserve the
  // completed title's height as the visual copy types across multiple lines.
  const title = heading.textContent;
  const layer = document.createElement("span");
  layer.className = "typing-layer";
  layer.setAttribute("aria-hidden", "true");
  heading.append(layer);

  const instance = new TypeIt(layer, {
    strings: title,
    html: false,
    speed: Math.min(65, 1500 / title.length),
    startDelay: 65,
    afterComplete: () => stopTyping?.(),
  });
  stopTyping = () => {
    instance.destroy();
    layer.remove();
    heading.classList.remove("typing-title");
    stopTyping = undefined;
  };
  heading.classList.add("typing-title");
  instance.go();
}

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) stopTyping?.();
});
document.addEventListener("writing-rendered", typeHeading);
typeHeading();
