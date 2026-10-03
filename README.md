# Dead Reckoning

A self-contained, browser-based location guessing companion for **DayZ Standalone / Chernarus+**. Works on GitHub Pages and any ordinary static host. No accounts, API keys, paid services, CDN libraries or server database.

Included: **34 real in-game 360° panoramas**, a local Chernarus satellite map, five-round runs, metre-based distance/scoring, timed or relaxed mode, personal bests, seeded challenge links, keyboard controls, mobile layout, and a visual location workshop. Regular flat screenshots are fully supported and are the default for new uploads. Drag and zoom a panorama; inspect and zoom a flat photo without stretching it onto a sphere.

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
