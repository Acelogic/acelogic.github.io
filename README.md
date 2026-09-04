# Miguel Cruz / mcruz.me

A static personal portfolio inside a 3D iPod Classic, modeled in Blender. The project library covers systems work, Apple Silicon and MLX ports, native apps, finance tools, extensions, upstream contributions, and older projects.

## Preview

```sh
python3 scripts/build.py
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. No package installation is needed. The production site remains GitHub Pages on `master`, with its existing `CNAME`.

## Edit

- `projects.html`: complete project content. `JS/projects.js` enhances it into category, project, and detail menus; the full HTML remains the fallback.
- `index.html`: home, bio, terminal, and contact screens.
- `blog.html` / `school.html`: static notes and course entries, enhanced by `JS/reader.js`.
- `htmlComponents/`: the shared iPod interface. Run `python3 scripts/build.py` after editing it. `--check` verifies the embedded fragments are current.
- `CSS/ipod.css`: the screen, click targets, responsive fallback, and page styling.
- `JS/compLoader.js`: keyboard navigation and click-wheel gestures.
- `JS/ipod-scene.js`: Three.js model, lighting, screen registration, and view controls.
- `JS/ipod-glass.js`: reflective lens material and transparent LCD aperture.

The page and model load locally; Three.js 0.180.0 is vendored with its MIT license in `JS/vendor/three/`. WebGL failure falls back to the Blender front render while keeping the HTML interface usable.

## Click wheel

Drag around the ring to move selection. The center and play buttons open an item; MENU goes back; previous/next step through items. Arrow keys, Enter, Escape, direct taps, and Tab also work.

On mobile, only the wheel uses `touch-action: none` and pointer capture. Pointer-up, cancellation, and lost capture release the gesture. Drag completion suppresses the synthesized tap. Selection movement scrolls the display directly, never the outer document.

## Blender source

`Assets/models/ipod-classic.blend` is the editable scene. `Assets/models/ipod-classic.glb` contains the exported model, and `ipod-front.png` is the fallback render of the same geometry.

Rebuild with Blender 5.2:

```sh
blender --background --python scripts/model_ipod.py
```

The model uses centimeters: 6.18 × 10.35 cm, with a front UI plane of 618 × 1035 CSS pixels at scale 0.01. The LCD is centered at `(0, 2.5)` with an HTML area of 4.84 × 3.63 cm. The model and its live screen rotate together.

## Content notes

Repository descriptions and linked PR statuses were reviewed in September 2026. Aurora Silicon and the daVinci port are labeled experimental. Omarchy is listed as community involvement; this does not claim an upstream maintainer role or merged contribution. Links on individual entries provide the primary sources.

## Project pictures and motion

Each of the 56 entries has a full-size picture and a thumbnail in `Assets/projects/`. `sources.json` records the source and caption. Screenshots, generated project examples, icons, and repository previews are distinguished in their captions. The category and project menus update the artwork pane as the wheel selection moves; project details include a full-size image link.

`JS/ipod-transitions.js` supplies forward/back menu slides and cleans up interrupted transitions. It respects reduced-motion preferences. The artwork pane has a short cover transition and reflection. Menu movement scrolls its own column without moving the document.

## Screen glass

The live HTML display sits at the LCD surface behind the WebGL canvas. An aperture in the opaque render exposes it; the cover lens then reflects the same studio environment as the metal enclosure. Fresnel reflectance strengthens at oblique angles, with a small amount of lens absorption. The optical layer has no pointer events, so the wheel and screen retain their native touch behavior. The Blender scene includes separate LCD backing and a transmissive cover lens.

## Device finishes

The finish selector changes the front aluminum and center button, with a dark wheel for very dark finishes. Presets and a native custom color picker share the existing metal lighting. The lens and polished back retain their materials. The selected finish is saved under the device-local `mcruz.ipod.finish.v1` key and restored on each page. If 3D rendering is unavailable, the selector stays hidden and the static silver fallback remains usable.

## Mobile Safari

The touch layout uses stable small-viewport units and safe-area padding, larger menu rows, native momentum scrolling, and 44px finish/view controls. Pinch zoom remains available outside the click wheel. Touch devices open with the iPod facing forward. Landscape keeps the device readable in a vertically scrollable layout.

`JS/ipod-layout.js` fits the body within the stage and caps the mobile canvas backing buffer at 1.5 million pixels. Resize work is coalesced and skips unchanged dimensions as Safari's browser chrome moves. Returning from the background or the back-forward cache redraws the scene. If WebGL is reclaimed, the usable still view appears; restoring the context rebuilds the environment reflections and brings back the selected finish.

Wheel gestures cancel on app switching, page navigation, and orientation changes. Crossing the wheel center or leaving its ring cannot generate a selection jump. These interactions and representative phone viewport dimensions are covered by local checks; a physical iPhone Safari run has not been performed.

## Appearance

Dark mode follows the device setting until the header switch is used. The `Auto` button removes the manual override and resumes live device updates. `JS/theme.js` runs before the styles paint, restores the device-local `mcruz.appearance.v1` preference, updates Safari's toolbar color, and keeps open tabs synchronized. `CSS/theme.css` themes the page and LCD without altering project images; the 3D studio lighting and pixel lab follow the same appearance event.
