// Small document reader shared by field notes and coursework; static HTML is the fallback.
document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const articles = [...document.querySelectorAll('[data-entry]')];
  const menu = document.getElementById('reader-menu');
  if (!main || !menu || !articles.length) return;
  let initialized = false;
  const render = () => {
    const article = articles.find(entry => '#' + entry.id === location.hash);
    const update = () => {
      menu.hidden = Boolean(article);
      articles.forEach(entry => { entry.hidden = entry !== article; });
      window.dispatchEvent(new Event('portfolio:viewchange'));
    };
    if (initialized && window.ipodTransition) window.ipodTransition(update, article ? 1 : -1);
    else update();
    initialized = true;
  };
  window.portfolioBack = () => {
    if (location.hash) location.hash = '';
    else location.href = '/index.html';
  };
  window.addEventListener('hashchange', render);
  render();
});
