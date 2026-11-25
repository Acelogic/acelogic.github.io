const phoneLayout = window.matchMedia("(max-width: 699px)");
const menuButton = document.querySelector(".nav-toggle");
const siteLinks = document.getElementById(menuButton.getAttribute("aria-controls"));

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  siteLinks.hidden = phoneLayout.matches && !open;
}

menuButton.addEventListener("click", () => setMenu(siteLinks.hidden));
document.querySelector(".masthead").addEventListener("keydown", event => {
  if (event.key === "Escape" && phoneLayout.matches && !siteLinks.hidden) {
    setMenu(false);
    menuButton.focus();
  }
});

const directory = document.querySelector(".project-page");
const categories = Array.from(document.querySelectorAll(".catalog-section"));
let openOnPhone = new Set();
for (const category of categories) {
  const count = document.createElement("span");
  count.className = "project-count";
  const total = category.querySelector(".catalog").children.length;
  count.textContent = total + (total === 1 ? " project" : " projects");
  category.querySelector("h2").append(count);
}

function revealProject(hash) {
  const target = document.getElementById(hash.slice(1));
  const category = target?.closest(".catalog-section");
  if (category) {
    category.open = true;
    target.scrollIntoView({ block: "start" });
  }
}

function fitLayout() {
  menuButton.hidden = !phoneLayout.matches;
  setMenu(false);
  if (directory) {
    if (directory.classList.contains("compact-categories")) {
      openOnPhone = new Set(categories.filter(category => category.open));
    }
    directory.classList.toggle("compact-categories", phoneLayout.matches);
    for (const category of categories) category.open = !phoneLayout.matches || openOnPhone.has(category);
    revealProject(location.hash);
  }
}

if (directory) {
  window.addEventListener("hashchange", () => revealProject(location.hash));
  // Clicking the current fragment again also reopens a manually closed category.
  directory.querySelector(".contents").addEventListener("click", event => {
    const link = event.target.closest("a");
    if (link) revealProject(link.hash);
  });
}

phoneLayout.addEventListener("change", fitLayout);
fitLayout();
