// Refresh the static edition from the same renderer used by the live archive.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { articleFile, renderArticle, renderIndex } from "../JS/writing.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { posts } = JSON.parse(await readFile(path.join(root, "blog-posts.json"), "utf8"));
const indexPath = path.join(root, "blog.html");
const previewBlock = /<!-- Link preview begins -->[\s\S]*?<!-- Link preview ends -->/;
const origin = "https://mcruz.me";

// Titles and descriptions are already HTML-escaped, either in the source head
// or by escapeHead below. Crawlers can read this block without running scripts.
function withPreview(html, file, title, description, article = false) {
  if (!previewBlock.test(html)) throw new Error("Missing link preview markers in " + file);
  const url = origin + "/" + (file === "index.html" ? "" : file);
  let artwork = "Assets/previews/" + file.replace(/\.html$/, ".jpg");
  let alt = title + " on mcruz.me, with a silicon wafer illustration.";
  if (!existsSync(path.join(root, artwork))) {
    if (!article) throw new Error("Missing preview image: " + artwork);
    artwork = "Assets/previews/blog.jpg";
    alt = "Writing by Miguel Cruz, with a silicon wafer illustration.";
  }
  const image = origin + "/" + artwork;
  return html.replace(previewBlock, () => `<!-- Link preview begins -->
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${article ? "article" : "website"}">
  <meta property="og:site_name" content="mcruz.me">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${alt}">
  <!-- Link preview ends -->`);
}

for (const file of ["index.html", "projects.html", "school.html", "blog.html", "gallery.html", "webinfo.html"]) {
  const source = path.join(root, file);
  const html = await readFile(source, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/<meta name="description" content="([^"]*)">/)[1];
  const updated = withPreview(html, file, title, description);
  if (html !== updated) await writeFile(source, updated);
}

const page = await readFile(indexPath, "utf8");
const start = "<!-- Writing index begins -->";
const end = "<!-- Writing index ends -->";
if (!page.includes(start) || !page.includes(end)) throw new Error("Writing index markers are missing");

function parentLinks(html) {
  return html.replace(/(href|src)="(?![a-z]+:|\/|#)/gi, '$1="../');
}

function escapeHead(text) {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

const header = parentLinks(page.slice(0, page.indexOf('  <main id="main">')));
const footer = parentLinks(page.slice(page.indexOf("  <footer class=\"page-footer\">")));
const files = new Set();
for (const post of posts) {
  const file = articleFile(post);
  if (files.has(file)) throw new Error("Duplicate article filename: " + file);
  files.add(file);
}

await mkdir(path.join(root, "writing"), { recursive: true });
for (const post of posts) {
  const head = header
    .replace(/<title>.*?<\/title>/, () => `<title>${escapeHead(post.title)} · Miguel Cruz</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () =>
      `<meta name="description" content="${escapeHead(post.excerpt)}">`);
  const body = `  <main id="main">
    <div id="writing-content" data-post-id="${post.id}">
${renderArticle(post, "../")}
    </div>
  </main>
`;
  const file = articleFile(post);
  const articleHead = withPreview(head, file, escapeHead(post.title), escapeHead(post.excerpt), true);
  await writeFile(path.join(root, file), articleHead + body + footer);
}
const index = page.slice(0, page.indexOf(start) + start.length)
  + '\n    <div id="writing-content">\n' + renderIndex(posts) + '\n    </div>\n    '
  + page.slice(page.indexOf(end));
await writeFile(indexPath, index);
console.log("Rendered the writing index and " + posts.length + " articles.");
