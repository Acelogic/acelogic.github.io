function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function dateTag(label, showYear = true) {
  const date = new Date(label);
  const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")].join("-");
  const display = showYear ? label : date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `<time datetime="${iso}">${escape(display)}</time>`;
}

function readingTime(post) {
  const words = post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 225)) + " min read";
}

export function articleFile(post) {
  const slug = post.slug || "post-" + post.id;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid article filename");
  return "writing/" + slug + ".html";
}

export function renderIndex(posts, linkFor = articleFile) {
  const entries = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const years = new Map();
  for (const post of entries) {
    const year = new Date(post.date).getFullYear();
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(post);
  }
  return `<header class="page-title">
      <h1>Writing</h1>
      <p>Engineering notes on bringing up hardware, porting models, and building tools for markets. Earlier articles follow the coursework that got me started.</p>
      <nav class="year-links links" aria-label="Browse articles by year">
        ${[...years.keys()].map(year => `<a href="#year-${year}">${year}</a>`).join(" ")}
      </nav>
    </header>
${[...years].map(([year, articles]) => `<section class="year-group" aria-labelledby="year-${year}">
    <h2 id="year-${year}">${year}</h2>
    <ol class="essay-index">
${articles.map(post => `      <li id="post-${escape(post.id)}">
        <div class="entry-date">${dateTag(post.date, false)}</div>
        <div>
          <h3 class="entry-title"><a href="${escape(linkFor(post))}">${escape(post.title)}</a></h3>
          <p>${escape(post.excerpt)}</p>
          <p class="entry-meta">${escape(post.category)} · ${readingTime(post)}</p>
        </div>
      </li>`).join("\n")}
    </ol>
    </section>`).join("\n")}`;
}

export function renderArticle(post, root = "") {
  const sections = [];
  const sectionedBody = post.content.replace(/<h2>([^<]+)<\/h2>/g, (_, label) => {
    const id = "section-" + (sections.length + 1);
    sections.push(`<li><a href="#${id}">${label}</a></li>`);
    return `<h2 id="${id}">${label}</h2>`;
  });
  const body = sectionedBody.replace(/<table\b[\s\S]*?<\/table>/gi, table =>
    `<div class="essay-table" tabindex="0" role="region" aria-label="Data table">${table}</div>`);
  const image = post.image?.startsWith("Assets/") ? `
      <figure class="essay-photo">
        <a href="${root}${escape(post.image)}"><img src="${root}${escape(post.image)}" alt="${escape(post.imageAlt || post.title)}"></a>
        ${post.caption ? `<figcaption>${escape(post.caption)}</figcaption>` : ""}
      </figure>` : "";
  return `<article class="essay">
      <header class="essay-header">
        <a class="back-to-writing" href="${root}blog.html">← All writing</a>
        <h1>${escape(post.title)}</h1>
        <p class="essay-deck">${escape(post.excerpt)}</p>
        <p class="entry-meta">Miguel Cruz · ${dateTag(post.date)} · ${readingTime(post)}${post.revised ? `
          <span class="revision">Revised ${dateTag(post.revised)}</span>` : ""}
        </p>
      </header>
      ${sections.length ? `<details class="article-contents">
        <summary>On this page</summary>
        <ul>${sections.join("\n")}</ul>
      </details>` : ""}
      <div class="essay-body">${image}
${body}
      </div>
      <footer class="essay-footer links">
        <a href="${root}blog.html">All writing</a>${post.githubUrl ? `
        <a href="${escape(post.githubUrl)}">Project source</a>` : ""}
      </footer>
    </article>`;
}
