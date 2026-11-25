"""Render the site's wafer icons and 1200 × 630 social cards using Chrome."""

import base64
from html import escape
from html.parser import HTMLParser
from io import BytesIO
import json
import mimetypes
from pathlib import Path
import re

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PREVIEWS = ROOT / "Assets/previews"
ICONS = ROOT / "Assets/icons"

# Each page uses the site's masthead and its own subject or an artifact from that page.
PAGES = {
    "index": ("Software engineer", "Miguel Cruz", "Assets/miguel-at-google.png"),
    "projects": ("Software & open source", "Projects", None),
    "school": ("SUNY Oswego", "Coursework", "Assets/344Worksite.png"),
    "blog": ("Engineering notes", "Writing", None),
    "gallery": ("Computer architecture", "Hardware Lab", "Assets/CPU.jpg"),
    "webinfo": ("Design & source", "About this site", None),
}


class Description(HTMLParser):
    text = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name") == "description":
            self.text = attrs["content"]


def image_uri(path):
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


ICON_CSS = """
* { box-sizing: border-box; }
html, body { margin: 0; width: 100%; height: 100%; }
body { display: grid; place-items: center; }
body.app { background: #20252d; }
.wafer {
  width: 96vmin; height: 96vmin; border-radius: 50%;
  background: #28252c; display: grid; place-items: center;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 55% 100%, 50% 94%, 45% 100%, 0 100%);
}
.app .wafer { width: 78vmin; height: 78vmin; background: #eddbac; }
.dies {
  width: 94%; height: 94%; border-radius: inherit;
  background:
    repeating-linear-gradient(90deg, transparent 0 18%, #443f4e 18% 20%),
    repeating-linear-gradient(0deg, transparent 0 18%, #443f4e 18% 20%),
    linear-gradient(125deg, #679ba4 9%, #adbed4 35%, #b997b4 54%, #da9c73 75%, #e6c48b 96%);
}
"""


def render_icons(page):
    ICONS.mkdir(exist_ok=True)
    for size, app, file in [
        (256, False, ROOT / "favicon.ico"), (96, False, ICONS / "wafer-96.png"),
        (180, True, ROOT / "apple-touch-icon.png"), (192, True, ICONS / "wafer-192.png"),
        (512, True, ICONS / "wafer-512.png"),
    ]:
        page.set_viewport_size({"width": size, "height": size})
        page.set_content(f'<style>{ICON_CSS}</style><body class="{"app" if app else ""}">'
                         '<div class="wafer"><div class="dies"></div></div>')
        pixels = page.screenshot(omit_background=not app)
        if file.suffix == ".ico":
            Image.open(BytesIO(pixels)).save(file, sizes=[(16, 16), (32, 32), (48, 48)])
        elif app:
            Image.open(BytesIO(pixels)).convert("RGB").save(file, optimize=True)
        else:
            file.write_bytes(pixels)


CARD_CSS = """
* { box-sizing: border-box; }
html, body { margin: 0; width: 1200px; height: 630px; }
body {
  background: #ffffee; color: #24231e; padding: 44px 60px;
  font-family: Georgia, 'Times New Roman', serif;
}
header {
  display: flex; align-items: baseline; justify-content: space-between;
  padding-bottom: 20px; border-bottom: 3px double #bdb79e;
  font-size: 28px;
}
header strong { font: bold 29px ui-monospace, monospace; letter-spacing: -2px; }
header span { font-style: italic; }
main {
  height: 466px; display: grid; grid-template-columns: minmax(0, 1fr) 350px;
  align-items: center; gap: 34px;
}
section { min-width: 0; }
.subject { margin: 0 0 18px; color: #a32620; font: 24px ui-monospace, monospace; }
h1 { margin: 0; font-size: 86px; line-height: 1.045; letter-spacing: -0.045em; text-wrap: balance; }
p { margin: 22px 0 0; font-size: 29px; line-height: 1.31; color: #504d43; }
figure { width: 350px; height: 350px; position: relative; margin: 0; }
.disc { width: 100%; height: 100%; object-fit: contain; }
figure.with-photo .disc { width: 90%; height: 90%; display: block; margin-left: auto; }
.photo {
  position: absolute; bottom: 0; left: 0;
  width: 60%; max-height: 60%; object-fit: contain;
  border: 2px solid #a39c88; padding: 5px; background: #ffffee;
}
"""


def render_card(page, wafer, file, subject, title, description="", photo=None):
    art = f'<img class="disc" src="{wafer}">'
    if photo:
        art += f'<img class="photo" src="{image_uri(ROOT / photo)}">'
    display_title = escape(title).replace("CHIP-8", "CHIP&#8209;8")
    template = f"""<!doctype html><meta charset="utf-8"><style>{CARD_CSS}</style>
      <header><strong>mcruz.me</strong>{'<span>Miguel Cruz</span>' if title != "Miguel Cruz" else ""}</header>
      <main><section><div class="subject">{escape(subject)}</div><h1>{display_title}</h1>
      {f'<p>{escape(description)}</p>' if description else ''}</section>
      <figure class="{'with-photo' if photo else ''}">{art}</figure></main>"""
    page.set_content(template)
    page.evaluate("""async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, image => image.decode()));
      const title = document.querySelector("h1");
      const section = document.querySelector("section");
      let size = parseFloat(getComputedStyle(title).fontSize);
      while (section.offsetHeight > 385 || title.scrollWidth > title.clientWidth) {
        if (size < 32) throw Error("Share card title does not fit: " + title.textContent);
        title.style.fontSize = (--size) + "px";
      }
    }""")
    file.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=file, type="jpeg", quality=90)


if __name__ == "__main__":
    posts = json.loads((ROOT / "blog-posts.json").read_text())["posts"]
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page(device_scale_factor=1)
        render_icons(page)
        page.set_viewport_size({"width": 1200, "height": 630})
        wafer = image_uri(ROOT / "Assets/silicon-wafer.webp")
        for slug, (subject, title, photo) in PAGES.items():
            summary = Description()
            summary.feed((ROOT / (slug + ".html")).read_text())
            render_card(page, wafer, PREVIEWS / (slug + ".jpg"), subject, title, summary.text, photo)
        for post in posts:
            slug = post.get("slug") or f"post-{post['id']}"
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
                raise ValueError("Invalid article slug: " + slug)
            photo = post.get("image") or ""
            if not photo.startswith("Assets/") or not (ROOT / photo).resolve().is_relative_to(ROOT / "Assets"):
                photo = None
            render_card(page, wafer, PREVIEWS / "writing" / (slug + ".jpg"),
                        post["category"], post["title"], photo=photo)
        browser.close()
    print(f"Rendered icons and {len(PAGES) + len(posts)} share cards.")
