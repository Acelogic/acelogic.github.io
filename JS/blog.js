import { renderArticle, renderIndex } from "./writing.mjs";

const content = document.querySelector("#writing-content");
const standaloneId = content.dataset.postId;
const root = standaloneId ? "../" : "";
const published = new Map([...content.querySelectorAll(".essay-index li")].map(entry =>
  [entry.id.slice(5), entry.querySelector(".entry-title a").getAttribute("href")]));
const previewId = new URLSearchParams(location.search).get("post");

function followOldLink() {
  if (standaloneId || previewId) return false;
  const id = /^#post-(\d+)$/.exec(location.hash)?.[1];
  if (!id) return false;
  location.replace(published.get(id) || "blog.html?post=" + id);
  return true;
}

async function refreshWriting() {
  // The checked-in pages already contain the full archive. JSON edits can also
  // be previewed immediately, including entries without a generated page yet.
  const original = content.innerHTML.trim();
  try {
    const response = await fetch(root + "blog-posts.json");
    if (!response.ok) return;
    const { posts } = await response.json();
    const id = standaloneId || previewId;
    const post = posts.find(entry => String(entry.id) === id);
    if (standaloneId && !post) return;
    const template = document.createElement("template");
    if (post) {
      document.title = post.title + " · Miguel Cruz";
      template.innerHTML = renderArticle(post, root);
      document.querySelector(".earlier-notes")?.setAttribute("hidden", "");
    } else {
      template.innerHTML = renderIndex(posts, entry =>
        published.get(String(entry.id)) || "blog.html?post=" + encodeURIComponent(entry.id));
    }
    if (template.innerHTML.trim() !== original) {
      content.replaceChildren(template.content);
      document.dispatchEvent(new Event("writing-rendered"));
    }
  } catch {
    // Keep the static edition available while offline.
  }
}

if (!followOldLink()) refreshWriting();
window.addEventListener("hashchange", followOldLink);
