# Release verification — 4 October 2026

## Functional checks

- 25 automated tests passed; production TypeScript and Vite build passed.
- Public Vercel deployment tested with real Spansh / EDDN quotes around Nu Tauri.
- Five-leg mixed-cargo route generated; cargo manifests, market timestamps and geographic projection rendered. Search completed in approximately two seconds for the observed snapshot.
- Saved a named route, reopened it, marked its first leg complete, and replanned from the arrival station with the updated estimated balance and remaining session budget.
- Market browser rendered observed commodity prices, supply/demand and timestamps with pagination.
- Regression tests cover initial-positioning fuel, cumulative supply consumption, loops, destination transfers, budget reserve, demand caps, blocked goods, CSV escaping and validation.

## Visual fidelity ledger

The generated concept establishes the navy three-column dashboard, orange planning actions, mint profit figures, compact outlined controls, restrained borders and dense station itinerary. The production desktop preserves these relationships.

Intentional changes: the initial screen contains no invented live figures; every result uses fetched observations. Route rows expand into actionable cargo manifests. The geographic projection uses actual system coordinates. Additional controls and market/saved/data pages support the shipped functionality. Labels describe maximum trade legs and estimated values accurately.

Responsive CSS stacks the planner, ship settings and supporting panels below 760 px, and uses two columns at intermediate widths. Exact mobile viewport testing could not be completed in this environment: the browser tool lacks viewport resizing and the alternative browser download failed. Mobile visual verification remains a release follow-up. Browser automation also timed out waiting for a blob CSV download event; CSV content generation and escaping are covered by automated tests, but a downloaded file was not inspected.

## Scope limits

The provider loads at most 500 nearby market observations. Search is a bounded beam heuristic, so results are best-found paths rather than a proven global optimum. Quotes, travel time, navigation, supply and demand may differ in game. Saved routes and ship presets are local to the browser. No full-galaxy EDDN collector, cross-device accounts or exact bulk-sale pricing model is included.
