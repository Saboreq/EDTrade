# EDTrade

An Elite Dangerous Live market explorer and ship-aware multi-stop trade planner. Built for Saboreq. The Flight Deck interface follows the approved amber/graphite cockpit concept.

## Features

- Open-ended multi-stop routes, station loops, and routes finishing at a destination system.
- Editable ship profiles: cargo, pad size, loaded jump range, SCO, total balance, insurance reserve, docking and jump time.
- Saved ship presets and up to 20 saved routes in local browser storage.
- Mixed-commodity or single-commodity loads, affordability checks, cumulative stock/demand depletion on revisits, sale-price haircut, demand cap, fuel estimates.
- Approach limits, freshness, radius, jump count, session budget, permit/carrier/planetary filters, commodity exclusions and unique stations.
- Alternative routes, cargo manifests, market timestamps, copy destinations, leg completion, and fresh replanning from a completed stop.
- Market browser with search, price/freshness sorting and pagination; route CSV and market JSON exports.
- Shareable settings URLs; snapshot import/export and offline planning.
- Geographic route projections, explicit search coverage and estimate caveats.
- Responsive interface, focus states and reduced-motion support.

## Data and deployment

Server functions read the **Spansh station search API**, populated by community EDDN observations. No fabricated market prices or demo routes are shown as live. Live galaxy only; Legacy and console markets are unsupported.

- `GET /api/markets?system=Nu%20Tauri&radius=80&age=48&pad=3&maxArrival=2000&planetary=false&carriers=false&permits=false`
- `GET /api/systems?q=Nu%20Tauri`

Requests have an 18-second timeout, validated parameters, concurrent-request deduplication, and a bounded three-minute process cache. Vercel caches market responses for three minutes. Market observation timestamps are independent of snapshot retrieval time. Provider outages surface as errors, not fake fallback data.

Up to **500 nearest matching markets** are loaded. The UI exposes sample truncation. The default freshness limit is 48 hours; sparse regions may require older quotes. Provider payloads were checked against live responses during development; upstream search endpoints may evolve.

No API keys, database credentials or always-on collector are required. Vercel Git integration deploys `main` as Vite assets plus serverless `/api` functions. For larger coverage, replace the bounded provider with a self-hosted EDDN market store rather than increasing third-party traffic indefinitely.

## Route engine and practical limits

The engine runs in a Web Worker. A bounded beam (120 states with destination diversity, up to 10 legs) explores profitable paths. Up to 48 starting markets are considered if no station is specified; positioning time is included. Specifying a station assumes the ship is already docked there.

Each trade compares margin-first, ROI-first and low-price-first cargo allocations. This is a **heuristic**, not an exact knapsack or full-galaxy solver. Routes may use fewer than the maximum legs when better for the selected objective/session limit. Both ends' prohibited goods are excluded. Zero/unknown demand is excluded conservatively. The engine tracks supply/demand used within each candidate path.

Default safeguards: 10% of demand, 2% sale-price reduction, insurance reserve. These do not reproduce Elite's exact bulk-sale formula. Supply replenishment, purchases by other players, Powerplay bonuses, rare goods distance-dependent pricing, docking access, interdictions and fuel scooping are not predicted.

Travel combines straight-line loaded jump range, user jump/docking timing, a supercruise distance curve and planetary approach allowance. Jump counts are lower-bound estimates; check in-game navigation and fuel. Same-system transfers can be imprecise. Loops may include an empty final return shown in the itinerary and included in time/fuel. Destination must be present in the sample.

Known permits are filtered; missing metadata cannot verify access. Carrier position and permissions can change. Imported and saved snapshots preserve historical quotes.

## Local setup

Requires Node.js 22.12+; Node 24 supported. No environment variables needed.

```sh
npm ci
npm run dev
```

Vite development middleware serves the same provider logic as Vercel. Validate production:

```sh
npm test
npm run build
```

GitHub Actions runs the tests and TypeScript/Vite build on pushes and pull requests. Tests cover price semantics, insurance, supply/demand, mixed cargo, safety margins, illegal goods, cumulative depletion, multi-stop paths, loops, destinations, jump constraints, session limits, same-system travel, CSV escaping and validation.

## Privacy

No account, analytics or tracking scripts. Settings, presets and saved routes stay in browser storage; clearing that storage deletes them. Searches send the system and market filters to the server and Spansh. Shared URLs include balance and planning preferences. Barlow Condensed and Rajdhani fonts are bundled locally with system fallbacks. Imported snapshots are validated and held in memory; no database upload.

## Credits

Market data: [Spansh](https://spansh.co.uk), [EDDN / EDCD](https://github.com/EDCD/EDDN) and commanders contributing with community connectors. Thanks to the Elite Dangerous tools community.

Elite Dangerous belongs to Frontier Developments. EDTrade is an independent community tool, not affiliated with Frontier.

## Flight Deck design

The dashboard uses a station-by-station trading timeline, route instruments, geographic map projections and a compact ship inspector. Wireframe hull art and celestial backdrop are generated illustration assets; map paths and market data are rendered from actual observations. The hull illustration is an Anaconda reference, not an outfitting preview. See [design specification](docs/flight-deck-design.md).
