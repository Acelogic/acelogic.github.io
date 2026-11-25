"""Exercise the public site in Chrome and save screenshots and a JSON report."""

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin, urlsplit

from playwright.sync_api import expect, sync_playwright


def visit_from_menu(page, label):
    menu = page.get_by_role("button", name="Menu", exact=True)
    if menu.is_visible() and menu.get_attribute("aria-expanded") == "false":
        menu.click()
    page.get_by_role("navigation", name="Main navigation").get_by_role("link", name=label, exact=True).click()


def check_link_previews(page, base_url, routes):
    cards = {}
    for route in routes:
        page.goto(urljoin(base_url, route))
        canonical = urljoin("https://mcruz.me/", "" if route == "index.html" else route)
        expect(page.locator('link[rel="canonical"]')).to_have_attribute("href", canonical)
        expect(page.locator('meta[property="og:url"]')).to_have_attribute("content", canonical)
        expect(page.locator('meta[name="twitter:card"]')).to_have_attribute("content", "summary_large_image")
        title = page.locator('meta[property="og:title"]').get_attribute("content")
        assert title and title in page.title(), route
        expect(page.locator('meta[name="twitter:title"]')).to_have_attribute("content", title)
        description = page.locator('meta[name="description"]').get_attribute("content")
        expect(page.locator('meta[property="og:description"]')).to_have_attribute("content", description)
        image = page.locator('meta[property="og:image"]').get_attribute("content")
        assert image.startswith("https://mcruz.me/Assets/previews/"), route
        expect(page.locator('meta[name="twitter:image"]')).to_have_attribute("content", image)
        # Exercise the server under test even when canonical URLs point at production.
        image_url = urljoin(base_url, urlsplit(image).path)
        size = page.evaluate("""async src => {
            const image = new Image();
            image.src = src;
            await image.decode();
            return [image.naturalWidth, image.naturalHeight];
        }""", image_url)
        assert size == [1200, 630], (image, size)
        cards[canonical] = image
    for icon in page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').all():
        assert page.request.get(urljoin(base_url, icon.get_attribute("href"))).ok
    manifest_url = page.locator('link[rel="manifest"]').get_attribute("href")
    manifest = page.request.get(urljoin(base_url, manifest_url)).json()
    for icon in manifest["icons"]:
        assert page.request.get(urljoin(base_url, icon["src"])).ok, icon
    return cards


def check_site(browser, base_url, output):
    report = {"site": base_url, "browser": browser.version, "viewports": {}}
    pages = ("index.html", "projects.html", "school.html", "blog.html",
             "gallery.html", "webinfo.html", "404.html")
    for name, width, height in (("desktop", 1280, 900), ("tablet", 820, 1180), ("mobile", 390, 844)):
        context = browser.new_context(viewport={"width": width, "height": height})
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        for route in pages:
            response = page.goto(urljoin(base_url, route))
            assert response and response.ok, route
            expect(page.get_by_role("heading", level=1)).to_be_visible()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), route

        visit_from_menu(page, "Home")
        expect(page.locator(".portrait")).to_be_visible()
        assert page.locator(".portrait").evaluate("(img) => img.naturalWidth > 0")
        expect(page.get_by_role("heading", name="Miguel Cruz’s Home Page")).to_be_visible()
        page.wait_for_function("""() => {
            const layer = document.querySelector('h1 .typing-layer');
            return layer && layer.textContent.length > 2;
        }""")
        expect(page.locator(".typing-layer")).to_have_count(0)
        page.screenshot(path=output / (name + ".png"), full_page=True)

        page.get_by_role("link", name="Complete project index").click()
        page.emulate_media(reduced_motion="reduce")
        page.screenshot(path=output / ("projects-" + name + ".png"))
        if name == "mobile":
            menu = page.get_by_role("button", name="Menu", exact=True)
            expect(menu).to_have_attribute("aria-expanded", "false")
            menu.click()
            expect(page.get_by_role("navigation", name="Main navigation")).to_be_visible()
            menu.press("Escape")
            expect(menu).to_be_focused()
            expect(page.get_by_role("navigation", name="Main navigation")).to_be_hidden()
            expect(page.locator(".catalog-section[open]")).to_have_count(0)
            summary = page.locator(".catalog-section summary").filter(has_text="From The Archive")
            summary.click()
            expect(page.get_by_role("link", name="CHIP-8 C", exact=True)).to_be_visible()
            summary.click()
            expect(page.locator(".catalog-section[open]")).to_have_count(0)
            page.goto(urljoin(base_url, "projects.html#ml-dogs-vs-cats"))
            expect(page.locator("#ml-dogs-vs-cats")).to_be_in_viewport()
            # Rotating into the tablet layout reveals the directory and preserves the deep link.
            page.set_viewport_size({"width": 844, "height": 390})
            expect(page.get_by_role("navigation", name="Project categories")).to_be_visible()
            expect(page.locator(".catalog-section[open]")).to_have_count(7)
            page.set_viewport_size({"width": width, "height": height})
            expect(page.locator("#ml-dogs-vs-cats")).to_be_in_viewport()
        else:
            categories = page.get_by_role("navigation", name="Project categories")
            categories.get_by_text("From The Archive").click()
            expect(page).to_have_url(urljoin(base_url, "projects.html#from-the-archive"))
            expect(page.locator("#from-the-archive")).to_be_in_viewport()
            if name == "tablet":
                expect(categories.get_by_text("Systems & Hardware")).to_be_in_viewport()
                assert categories.bounding_box()["x"] < page.locator(".catalog-groups").bounding_box()["x"]
        expect(page.get_by_role("link", name="CHIP-8 C", exact=True)).to_have_attribute(
            "href", "https://github.com/Acelogic/CHIP-8-C"
        )
        project_count = page.locator(".catalog > li").count()

        visit_from_menu(page, "Home")
        page.get_by_role("link", name="Implementing a Unix Shell in C").click()
        shell_url = urljoin(base_url, "writing/unix-shell-job-control.html")
        expect(page).to_have_url(shell_url)
        expect(page.get_by_role("heading", name="What the shell remembers")).to_be_visible()
        expect(page.get_by_role("link", name="Project source")).to_have_attribute(
            "href", "https://github.com/Acelogic/TSHImplementation"
        )
        page.goto(urljoin(base_url, "blog.html#post-2"))
        expect(page).to_have_url(shell_url)
        page.get_by_role("link", name="← All writing").click()
        archive_data = page.request.get(urljoin(base_url, "blog-posts.json")).json()
        note_count = len(archive_data["posts"])
        page.get_by_role("navigation", name="Browse articles by year").get_by_role("link", name="2020").click()
        expect(page.locator("#year-2020")).to_be_in_viewport()
        page.evaluate("window.scrollTo(0, 0)")
        entries = page.locator(".essay-index .entry-title a")
        expect(entries).to_have_count(note_count)
        article_links = entries.evaluate_all("(links) => links.map(a => [a.href, a.textContent])")
        page.emulate_media(reduced_motion="reduce")
        expect(page.locator(".typing-layer")).to_have_count(0)
        page.screenshot(path=output / ("writing-" + name + ".png"), full_page=True)
        for url, title in article_links:
            response = page.goto(url)
            assert response and response.ok, url
            expect(page.get_by_role("heading", level=1, name=title)).to_be_visible()
            expect(page.locator(".typing-layer")).to_have_count(0)
            assert page.locator(".essay-body h2").count() >= 1, title
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), title
            if url == shell_url:
                page.screenshot(path=output / ("article-" + name + ".png"), full_page=True)
                page.locator(".article-contents summary").click()
                page.get_by_role("link", name="What the shell remembers").click()
                expect(page.get_by_role("heading", name="What the shell remembers")).to_be_in_viewport()
        page.emulate_media(reduced_motion="no-preference")

        visit_from_menu(page, "Home")
        page.get_by_role("link", name="CSC 344").click()
        expect(page.locator("#csc-344")).to_be_in_viewport()
        course_count = page.locator(".course-list li").count()
        worksites = page.get_by_role("link", name="Course worksite").evaluate_all(
            "(links) => links.map(link => link.href)"
        )
        for worksite in worksites:
            response = context.request.get(worksite)
            assert response.ok and "html" in response.headers.get("content-type", ""), worksite
        page.locator("#csc-344").get_by_role("link", name="Course worksite").click()
        expect(page).to_have_url(urljoin(base_url, "CSC-344/Worksite/index.html"))
        page.go_back()

        visit_from_menu(page, "Hardware Lab")
        expect(page).to_have_url(urljoin(base_url, "gallery.html"))
        page.emulate_media(reduced_motion="reduce")
        expect(page.get_by_role("heading", name="Hardware Lab")).to_be_visible()
        wafer = page.locator("#wafer-map")
        count = page.locator("#die-count")
        default_count = count.inner_text()
        assert int(default_count) > 5
        default_map = wafer.evaluate("canvas => canvas.toDataURL()")
        lab_screenshot = "hardware-lab-" + name + ".png"
        page.screenshot(path=output / lab_screenshot, full_page=True)

        page.get_by_label("Wafer diameter").select_option("150")
        die_width = page.get_by_label("Die width (mm)")
        die_width.fill("40")
        page.get_by_label("Die height (mm)").fill("40")
        # The central die and its four axial neighbors fit. The diagonal ones cross the rim.
        expect(count).to_have_text("5")
        expect(page.locator("#die-coverage")).to_have_text("49.1%")
        expect(wafer).to_have_accessible_name("150 mm wafer with 5 whole dies, each 40 by 40 mm")
        assert wafer.evaluate("canvas => canvas.toDataURL()") != default_map
        die_width.fill("")
        expect(page.locator("#layout-error")).to_be_visible()
        expect(count).to_have_text("5")
        page.get_by_role("button", name="Reset dimensions").click()
        expect(page.locator("#layout-error")).to_be_hidden()
        expect(count).to_have_text(default_count)
        assert wafer.evaluate("canvas => canvas.toDataURL()") == default_map

        for img in page.locator(".bench-photo img").all():
            img.scroll_into_view_if_needed()
            img.evaluate("img => img.decode()")
            assert img.evaluate("img => img.naturalWidth > 0")
        for label, article in (
            ("My Pentium 4", "writing/pentium-4-computer-architecture.html"),
            ("After the Snapdragon firmware handoff", "writing/snapdragon-firmware-handoff.html"),
        ):
            page.get_by_role("link", name=label, exact=True).click()
            expect(page).to_have_url(urljoin(base_url, article))
            visit_from_menu(page, "Hardware Lab")
            expect(page.get_by_role("heading", name="Hardware Lab")).to_be_visible()

        assert not errors, errors
        report["viewports"][name] = {
            "size": [width, height], "pages": list(pages),
            "projects": project_count, "courses": course_count, "worksites": worksites,
            "writing_entries": note_count, "legacy_article_link": "passed",
            "title_animation_and_reduced_motion": "passed", "wafer_layout_and_hardware_links": "passed",
            "projects_screenshot": "projects-" + name + ".png",
            "hardware_lab_screenshot": lab_screenshot,
            "writing_screenshots": ["writing-" + name + ".png", "article-" + name + ".png"],
            "screenshot": name + ".png",
        }
        context.close()

    offline = browser.new_context(java_script_enabled=False, viewport={"width": 390, "height": 844})
    page = offline.new_page()
    page.goto(urljoin(base_url, "blog.html"))
    expect(page.locator(".essay-index .entry-title a")).to_have_count(note_count)
    page.locator("#post-1 .entry-title a").click()
    expect(page.get_by_role("heading", name="Giving the ROM an address")).to_be_visible()
    expect(page.get_by_role("link", name="Project source")).to_be_visible()
    report["writing_without_javascript"] = "passed"
    visit_from_menu(page, "Hardware Lab")
    expect(page.locator("#wafer-fallback")).to_be_visible()
    expect(page.get_by_label("Wafer diameter")).to_be_hidden()
    page.get_by_role("link", name="My Pentium 4", exact=True).click()
    expect(page.get_by_role("heading", name="My Journey into Computer Architecture")).to_be_visible()
    report["hardware_notes_without_javascript"] = "passed"
    visit_from_menu(page, "Projects")
    expect(page.get_by_role("navigation", name="Main navigation")).to_be_visible()
    expect(page.get_by_role("navigation", name="Project categories")).to_be_visible()
    expect(page.locator(".catalog-section[open]")).to_have_count(7)
    report["phone_navigation_without_javascript"] = "passed"
    routes = [route for route in pages if route != "404.html"]
    routes.extend(urlsplit(url).path.lstrip("/") for url, _ in article_links)
    report["link_previews_without_javascript"] = check_link_previews(page, base_url, routes)
    offline.close()
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url", help="URL of the served website")
    parser.add_argument("output_directory", type=Path)
    args = parser.parse_args()
    args.output_directory.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        result = check_site(browser, args.base_url.rstrip("/") + "/", args.output_directory)
        browser.close()
    (args.output_directory / "report.json").write_text(json.dumps(result, indent=2) + "\n")
    print("Browser checks passed. Artifacts:", args.output_directory)
