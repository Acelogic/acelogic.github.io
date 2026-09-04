// Complete static project content becomes the iPod's category, album, and detail views.
document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  if (!main) return;
  const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const categories = [...main.querySelectorAll('.project-section')].map(section => ({
    id: section.id,
    title: section.querySelector('h2').textContent,
    projects: [...section.querySelectorAll('article')].map(article => {
      const image = article.querySelector('.project-figure img');
      return {
        id: article.id || slug(article.querySelector('h3').textContent),
        title: article.querySelector('h3').textContent,
        kind: article.querySelector('.project-kind, .eyebrow, .row-status')?.textContent || '',
        paragraphs: [...article.querySelectorAll('p')].map(p => p.textContent),
        tags: [...article.querySelectorAll('.project-meta li')].map(li => li.textContent),
        image: image ? { src: image.getAttribute('src'), thumbnail: image.dataset.thumbnail, alt: image.alt,
          width: Number(image.getAttribute('width')), height: Number(image.getAttribute('height')), caption: article.querySelector('figcaption')?.textContent || '' } : null,
        links: [...article.querySelectorAll('a[href]')].map(a => ({ title: a.textContent.replace(/↗/g, '').trim(), href: a.getAttribute('href') }))
      };
    })
  }));
  if (!categories.length) return;
  const categoryCover = { native: 'Ignition', extensions: 'Reddit YouTube Comments', contributions: 'Exo' };
  categories.forEach(category => { category.image = (category.projects.find(p => p.title === categoryCover[category.id]) || category.projects[0]).image; });
  const browser = document.createElement('div'); browser.className = 'game-browser'; main.replaceChildren(browser);
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const go = path => { location.hash = path; };
  const getRoute = () => { try { return decodeURIComponent(location.hash.slice(1)).split('/'); } catch { return []; } };
  const goBack = () => {
    const [category, project] = getRoute();
    if (project) go(category); else if (category) go(''); else location.href = '/index.html';
  };
  window.portfolioBack = goBack;
  let currentEntries = [];
  let coverPanel = null;
  let previewIndex = -1;
  let previousDepth = null;
  const showArtwork = index => {
    const entry = currentEntries[index];
    if (!coverPanel || !entry?.image || previewIndex === index) return;
    const direction = previewIndex > index ? -1 : 1;
    const wasVisible = previewIndex !== -1;
    previewIndex = index;
    coverPanel.replaceChildren();
    const cover = el('div', '', 'cover-art');
    const photo = el('img'); photo.src = entry.image.thumbnail || entry.image.src; photo.alt = entry.image.alt; photo.decoding = 'async';
    cover.append(photo);
    const reflection = photo.cloneNode(); reflection.alt = ''; reflection.setAttribute('aria-hidden', 'true'); reflection.className = 'cover-reflection'; cover.append(reflection);
    coverPanel.append(cover, el('strong', entry.title), el('span', entry.projects ? `${entry.projects.length} projects` : entry.kind || 'Project'));
    if (wasVisible && cover.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cover.animate([{ opacity: .25, transform: `translateX(${direction * 30}px) rotateY(${-direction * 30}deg) scale(.93)` },
        { opacity: 1, transform: 'translateX(0) rotateY(-14deg) rotateZ(-4deg) scale(1)' }], { duration: 190, easing: 'cubic-bezier(.2,.7,.25,1)' });
    }
  };
  window.addEventListener('portfolio:selectionchange', event => {
    const index = event.detail?.item?.dataset.artworkIndex;
    if (index !== undefined) showArtwork(Number(index));
  });
  function render() {
    const [categoryId, projectId] = getRoute();
    const category = categories.find(c => c.id === categoryId);
    const project = category?.projects.find(p => p.id === projectId);
    const depth = project ? 2 : category ? 1 : 0;
    const update = () => {
      browser.replaceChildren(); coverPanel = null; previewIndex = -1;
      const bar = el('div', '', 'game-status');
      bar.append(el('span', project ? 'Project details' : category ? 'Browse projects' : 'Browse categories'));
      const back = el('button', 'Back'); back.type = 'button'; back.addEventListener('click', goBack); bar.append(back); browser.append(bar);
      if (project) {
        currentEntries = [];
        const detail = el('article', '', 'game-detail'); detail.append(el('h1', project.title));
        if (project.image) {
          const figure = el('figure', '', 'project-photo');
          const link = el('a'); link.href = project.image.src; link.target = '_blank'; link.rel = 'noopener'; link.setAttribute('aria-label', `Open full-size image for ${project.title}`);
          const photo = el('img'); photo.src = project.image.src; photo.alt = project.image.alt; photo.width = project.image.width; photo.height = project.image.height; photo.decoding = 'async';
          link.append(photo); figure.append(link, el('figcaption', project.image.caption)); detail.append(figure);
        }
        if (project.kind) detail.append(el('p', project.kind, 'project-kind'));
        project.paragraphs.forEach(text => detail.append(el('p', text)));
        if (project.tags.length) { const tags = el('ul', '', 'project-meta'); project.tags.forEach(tag => tags.append(el('li', tag))); detail.append(tags); }
        const links = el('div', '', 'game-menu');
        project.links.forEach(({ title, href }) => { const a = el('a', title + ' ↗'); a.href = href; links.append(a); });
        detail.append(links); browser.append(detail);
      } else {
        browser.append(el('h1', category ? category.title : 'Projects'));
        const split = el('div', '', 'browser-split');
        const menu = el('div', '', 'game-menu browser-menu');
        currentEntries = category ? category.projects : categories;
        currentEntries.forEach((entry, index) => {
          const button = el('button', entry.title); button.type = 'button'; button.dataset.artworkIndex = String(index);
          button.addEventListener('click', () => go(category ? category.id + '/' + entry.id : entry.id)); menu.append(button);
        });
        coverPanel = el('aside', '', 'project-artwork'); coverPanel.setAttribute('aria-label', 'Selected project artwork');
        split.append(menu, coverPanel); browser.append(split);
        showArtwork(0);
        const count = category ? category.projects.length : categories.reduce((n, c) => n + c.projects.length, 0);
        browser.append(el('p', `${count} projects · Scroll wheel to browse`, 'screen-hint'));
      }
      window.dispatchEvent(new Event('portfolio:viewchange'));
    };
    if (previousDepth !== null && window.ipodTransition) window.ipodTransition(update, depth < previousDepth ? -1 : 1);
    else update();
    previousDepth = depth;
  }
  window.addEventListener('hashchange', render); render();
});
