# Dead Reckoning

A self-contained, browser-based location guessing companion for **DayZ Standalone / Chernarus+**. Works on GitHub Pages and any ordinary static host. No accounts, API keys, paid services, CDN libraries or server database.

Included: **34 real in-game 360° panoramas**, a local Chernarus satellite map, five-round runs, metre-based distance/scoring, timed or relaxed mode, personal bests, seeded challenge links, keyboard controls, mobile layout, and a visual location workshop. Regular flat screenshots are fully supported and are the default for new uploads. Drag and zoom a panorama; inspect and zoom a flat photo without stretching it onto a sphere.

## Publish on GitHub Pages

1. Extract this archive. Create a **public GitHub repository** named whatever you like.
2. Upload the **contents of `dead-reckoning/`** to the repository root. Include `.github/workflows/pages.yml` (hidden folders may not be included by a drag-and-drop upload; create this exact file in GitHub's web editor if needed). Use branch `main` or `master`.
3. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Scan locations and deploy game → Run workflow**. Subsequent commits to `main` or `master` run it automatically.
5. Open the Pages URL shown by the deployment. Project URLs such as `username.github.io/repository-name/` work: all app paths are relative.

GitHub Actions scans `locations/`, validates every image's coordinates, generates the location manifest, and publishes `dist/`. An invalid new entry fails the build, leaving the previous deployed site intact. If Pages asks you to allow Actions or set an environment branch rule, use the repository's normal Pages setup. No GitHub token is stored in the game.

To publish with Git locally instead, run these from the extracted project folder after creating your repository:

```sh
git init -b main
git add .
git commit -m "Add Dead Reckoning DayZ game"
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

Then select GitHub Actions as the Pages source. This archive is ready for deployment; it has **not** been published to a GitHub account for you.

## Add locations: easiest method

Open **Location workshop** in the game:

1. Choose or drop a JPG, PNG or WebP. Files stay on your device.
2. Enter a title and photographer. Select **Standard screenshot** (default) or **360° panorama**.
3. Click the camera's position on the map, or enter its DayZ world **X and Z** in metres.
4. Download and extract the location ZIP. It contains the image and matching JSON inside `locations/chernarus/`.
5. Upload both files to that folder in your repository and commit. The scanner adds them to the next deployment automatically.

A landmark visible in the distance is not the camera position! Take coordinates at the place where you captured the image. X increases east, Z increases north, and the southwest corner is 0,0. The world spans 15360 × 15360 metres. Ignore altitude/Y. GPS displays and third-party map grid conventions may differ: convert them to world metres before entering them.

Full equirectangular panoramas should be **2:1**, e.g. 4096 × 2048. Ordinary screenshots can use any landscape/portrait aspect ratio and are letterboxed without cropping. A wide screenshot is not automatically considered a panorama.

## Add locations: filename-only method

Put files anywhere below `locations/`. All nested folders are scanned.

```text
locations/chernarus/my-trip/gorka__x9500__z8800.jpg
locations/chernarus/my-trip/hill__x7200__z6600__panorama.webp
```

Coordinates above are examples, not verified scene locations. Without `__panorama`, the image is a normal photo. Do not use Earth GPS latitude/longitude or include Y altitude.

## Add locations: sidecar metadata

Put `road.jpg` and `road.json` together:

```json
{
  "title": "A road through Gorka",
  "map": "chernarus",
  "x": 9500,
  "z": 8800,
  "type": "photo",
  "author": "Your name",
  "source": "Your screenshot / optional original URL",
  "license": "Your chosen permitted reuse terms",
  "approximate": false,
  "enabled": true
}
```

A JSON sidecar takes priority over filename coordinates. Types are `photo` and `panorama`. Set `enabled` to false to omit a scene from play. The build rejects out-of-bounds, missing, malformed or nonnumeric coordinates, unsupported maps and images over 25 MB. Broken image decoding is also handled by the game with a skip option. JPEG, PNG and WebP only; convert HEIC or AVIF first. Filenames are URL encoded. No HTML from metadata is executed.

## Run locally / continuously watch a folder

Install Node.js **22 or newer**. There are **no npm dependencies to install**.

```sh
npm run dev
```

Open `http://localhost:4173`. In a second terminal:

```sh
npm run watch
```

The watcher checks `locations/` and `public/` every 1.5 seconds and rebuilds on changes. Refresh the browser to load the updated pack. It does not commit or upload your files. GitHub Pages is static: it cannot discover arbitrary files at runtime, watch your computer, or accept public uploads. The build-time scanner is the reliable solution. GitHub upload → commit → automatic scan → deployment is the no-code workflow.

Other commands:

```sh
npm test
npm run build
```

Upload the contents of `dist/` to another static host if desired. Serve via HTTP/HTTPS, rather than double-clicking `index.html`; browsers block local-file fetches. Built output is also provided in this archive as `dist/` for immediate hosting. Source lives under `source/` in the output, with shared location assets at the site's `locations/` path; reconstruct a project by combining those two folders if using only the built output.

## Scoring and rounds

- Euclidean distance in DayZ world metres, not geographic great-circle distance.
- Up to 5,000 points per round; 30 metres or closer is perfect. Otherwise `round(5000 * exp(-(distance - 30) / 2000))`.
- Up to five unique locations per run, fewer if the pack contains fewer than five.
- Relaxed play is the default. Enable two-minute rounds in **?**, then start a new run. On timeout an existing pin is submitted; no pin earns zero.
- Personal bests are stored only in this browser and separated by mode and round count.
- Challenge URLs preserve seed, pack version and timing. If the location pack changes, the game warns that a challenge may differ.
- This is a casual static game, not an anti-cheat platform: source, images and answers are public by design.

## Independence, map integration and long-term maintenance

The shipped game makes **no third-party runtime requests**. Map and photos are local files, and the renderer has no external libraries. It is independent of iZurvive availability, changing tile URLs, embedding restrictions and API keys. An optional link opens iZurvive as a separate reference.

The local map is Bohemia Interactive's official Central Economy map, an older snapshot; it may differ from current patches. Imported panoramas also reflect their capture date. Source markers were registered against the bundled map; they are approximate, not independently surveyed. Review or replace individual JSON coordinates if your gameplay measurements are more accurate. `ATTRIBUTION.md` documents the conversion.

Only Chernarus+ is configured. Adding Livonia/Sakhal requires a suitable local map, bounds, labels and locations; do not mix different maps into this pack. For a very large pack, compress ordinary screenshots to around 1920px wide and panoramas to 4096 × 2048 WebP. A static host with object storage or a separate media origin can be a later extension; there is no silent hotlinking in this build.

## Can screenshots be collected automatically?

The folder ingestion **is automated**. The starter's 34 real scenes mean you can play immediately. Ordinary DayZ screenshots generally do not contain trustworthy camera coordinates, so the scanner deliberately does not infer them from scenery or read Earth GPS EXIF as game positions.

For a large new collection, capture on a server you control using an admin camera/teleport tool, record X/Z at each stop, and save a matching JSON or coordinate filename. A screenshot hotkey plus your own camera-coordinate logging tool can feed this folder. Automatic teleport/capture requires access to a running DayZ client and permitted server tooling; it cannot be performed by this static webpage and is not included as an untested game mod. Public web crawling would still need image reuse permission and verified camera coordinates.

## Licenses

This starter distribution is **noncommercial**. The panorama collection is from tv104's **Lost in Cherno**, under LiCL-1.0, requiring attribution and public same-license source for distribution. The application retains that license. The official map has separate **ADPL-SA** terms. See `LICENSE.md` and `ATTRIBUTION.md` for complete provenance and the original license links. Keep these notices with the game. No monetization permission or endorsement is implied.

## Project layout

```text
public/                 App, renderer, styles, local map, map labels
locations/chernarus/    Drop screenshots + JSON here
scripts/build.mjs       Recursive scanner, validation, static build, watcher
scripts/dev.mjs         Local HTTP server
tests/                  Coordinate/scoring/import/ZIP checks
.github/workflows/      Automatic GitHub Pages deployment
dist/                   Ready-to-host build (regenerated, ignored by Git)
```
