# Flight Deck release verification — 4 October 2026

## Design fidelity

Implemented the user-selected Flight Deck reference (1536 × 1024): graphite surfaces, amber primary actions and route markers, condensed technical typography, thin slate borders, horizontal navigation, compact ship sidebar, seven-cell instrument strip, station timeline, alternatives table, navigation map and summary rail. Design tokens and geometry are recorded in [the specification](flight-deck-design.md).

Compared the accepted image with the [rendered production desktop](flight-deck-desktop.jpg). The principal panel hierarchy, amber/green action treatment, vertical linked station markers, table columns and compact utility controls match the reference. Fonts and illustration assets are served locally. The generated hull silhouette and star-field texture are approximations of the reference artwork; this is a close implementation, not a pixel-identical raster copy.

Intentional differences: production quotes, route geography and estimates replace mockup values. Freshness is the percentage of observations within the configured age threshold, not a confidence claim. Data attribution is Spansh / EDDN. Manual system selection replaces a fictional game-location connection. The ship illustration is an Anaconda reference, not a dynamic outfitting preview. Additional preferences, manifests, progress and replanning support the working service. The 3D button selects an isometric coordinate projection; Galaxy opens the actual systems browser.

## Verification

- All 28 automated tests pass; TypeScript and production Vite build pass. Three new presentation tests cover mixed cargo stop transitions, observed quote-age freshness and empty destination transfers.
- Real nearby market observations loaded around Nu Tauri: 251 markets, a five-leg mixed cargo route and three alternative runs. The observed search took approximately two seconds. Prices, quantities, quote ages and actual coordinates populated the redesigned view.
- Browser checks: alternative selection updates the instruments and itinerary; expanded stop manifests show incoming sales and next purchases; the save dialog opens with a route name; completing a leg enables replanning; 2D and 3D map switches render their projections.
- Prior functional release checks also saved/reopened a named route, replanned from an arrival station and browsed observed commodity prices with pagination.
- Sized browser frames exercised desktop 1536, tablet 768, mobile 390 and mobile 360 layouts. Frames render the unchanged production app bundle and API at native CSS widths. Desktop trade table fits at the reference width; smaller trade tables scroll inside their containers. Small mobile layouts have no outer page overflow. Tablet review identified a crowded header clock, corrected by hiding the clock in the affected breakpoint; the repeat check showed equal viewport and document widths (753 px).
- The browser cannot resize its top-level viewport. A temporary same-origin viewport review page was used for responsive testing and removed from the final release. A separate browser could not initialize its graphics system. Full-page screenshot capture also timed out, so the visual evidence uses a viewport screenshot rather than claiming a full-page capture.
- CSV escaping/content is covered by tests; the earlier automated blob-download event timed out, so a downloaded CSV file was not inspected.

## Scope limits

The provider loads at most 500 nearby market observations. Search is a bounded beam heuristic: best-found routes rather than a proven global optimum. Quotes, travel time, supply and demand may differ in game. Saves and ship presets are local to the browser. No full-galaxy EDDN collector, cross-device accounts or exact bulk-sale pricing model is included.
