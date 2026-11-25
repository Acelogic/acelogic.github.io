// Refresh the static edition from the same renderer used by the live archive.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { articleFile, renderArticle, renderIndex } from "../JS/writing.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { posts } = JSON.parse(await readFile(path.join(root, "blog-posts.json"), "utf8"));
const indexPath = path.join(root, "blog.html");
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
  await writeFile(path.join(root, articleFile(post)), head + body + footer);
}
const index = page.slice(0, page.indexOf(start) + start.length)
  + '\n    <div id="writing-content">\n' + renderIndex(posts) + '\n    </div>\n    '
  + page.slice(page.indexOf(end));
await writeFile(indexPath, index);
console.log("Rendered the writing index and " + posts.length + " articles.");
