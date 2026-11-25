# Miguel Cruz’s Home Page

My personal site at [mcruz.me](https://mcruz.me) collects software, writing, and computer science coursework. The design takes its cue from [Doug Lea’s home page](https://gee.cs.oswego.edu/).

To preview the site with the original course worksites, run these commands in the checkout.

```sh
git submodule update --init
python3 -m http.server --bind 127.0.0.1 8000
```

Open [the local homepage](http://127.0.0.1:8000/). GitHub Pages serves the HTML directly.

The writing archive reads `blog-posts.json`. After editing an article, run `node scripts/build-writing.mjs` to refresh its standalone HTML page and the index for readers with JavaScript disabled. Existing `blog.html#post-N` bookmarks lead to the corresponding articles.

To refresh the share images and wafer icons, run `python3 scripts/build-previews.py` with Chrome, Python Playwright, and Pillow installed. Then run `node scripts/build-writing.mjs` to update the Open Graph and X card tags. New articles use the Writing cover until their own card has been rendered.

With Chrome and Python Playwright installed, run the browser checks against the preview. The output directory receives desktop and mobile screenshots and a JSON report.

```sh
python3 tests/site_e2e.py http://127.0.0.1:8000/ /tmp/mcruz-site-check
```
