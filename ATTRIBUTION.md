# Attribution and asset provenance

Dead Reckoning is an unofficial, noncommercial DayZ navigation companion. No affiliation with Bohemia Interactive, iZurvive or Lost in Cherno is implied.

## Panoramas, map labels and original location markers

Author: **tv104 / Lost in Cherno**

Source: https://github.com/tv104/lost-in-cherno

Pinned source revision: `569787d88fee42c89f18a44f48a1c21cd87071ba`

Files: `src/config/chernarus/panoramas/*.webp`, `locations.ts`, `map-labels.ts`.

License: **Lost in Cherno License (LiCL-1.0)**, retained verbatim in LICENSE.md. The collection is distributed by its author as part of that licensed repository; its license describes the software as a whole and does not supply a separate image-specific grant. Underlying DayZ imagery remains Bohemia Interactive content. No independent ownership of game imagery is asserted.

Changes: images resized to at most 4096 × 2048 and recompressed as WebP. Source map markers converted from Web Mercator to normalized image coordinates, then registered to the official map with a measured scale of 0.96454214. They are **approximate community camera positions**, not independently measured in-game positions. Labels identify the nearest source place label, not necessarily the exact settlement or building. Per-image JSON retains original marker coordinates and provenance. No changes were made to scene contents.

The application is distributed under LiCL-1.0 with publicly readable source under `source/` in the built site. It uses independently written interface, renderer, scoring and import code. Keep the source and license public when sharing derivatives. No commercial or monetized use is granted by this starter pack.

## Chernarus map

© 2019 BOHEMIA INTERACTIVE a.s. DAYZ®, ENFUSION®, and BOHEMIA INTERACTIVE® are registered trademarks of BOHEMIA INTERACTIVE a.s. All rights reserved.

Source: https://github.com/BohemiaInteractive/DayZ-Central-Economy/blob/master/CETool/ChernarusPlus/map.png

Source repository license: https://github.com/BohemiaInteractive/DayZ-Central-Economy/blob/master/README.md

License: **Arma and DayZ Public License Share Alike (ADPL-SA)**

Full terms and disclaimer of warranties: https://www.bohemia.net/en/licenses/arma-and-dayz-public-license-share-alike-adpl-sa

Retained original map geometry, converted PNG to WebP. In-browser map brightness is increased for legibility. Map material and any adapted map material remain under ADPL-SA, requiring attribution, noncommercial use, Arma/DayZ-directed use, and share alike. The licensor supplies the material as-is without warranties, as specified in the full license.

This project is for learning navigation in DayZ. Do not repurpose its map assets into unrelated games. Application licensing does not supersede the map's separate terms.

## Additional uploads

Add only screenshots you have the right to share. Keep photographer, source and applicable license information with each image. The default `Contributor supplied` metadata is a placeholder, not a license grant.

## External services

No external service is contacted during ordinary play. The iZurvive link is an optional external reference only. No iZurvive tiles, scraping endpoints, proprietary APIs, or fonts are required at runtime.
