# Flight Deck — approved implementation specification

Reference: user-selected Concept 01 / Flight Deck, 1536 × 1024 pixels.

## Locked design system

- Near-black graphite page #080e11; panel #0c1317; subtle raised section #111a1f; neutral slate borders #293339.
- Warm amber #ff9a24 primary control, route line and selected state. Off-white #e4e9ec primary text; gray-blue #8c9aa5 captions; restrained green #36c239 market status.
- Condensed technical typography (Barlow Condensed) for station names, metrics and utility chrome; Rajdhani semibold wordmark and table numerals. Headings 14 px with 1 px tracking, body 14–16 px, captions 12 px. No marketing headline.
- 58 px horizontal navigation, 14 px outside gutters, 12 px panel gaps. 262 px left sidebar. Main workspace: flexible itinerary and 384 px right navigation rail at 1536 px.
- Instrument strip spans the workspace above itinerary/map. Thin ruled metric cells, small amber outline icons. Six-stop itinerary, orange linked station markers, separate buy/sell lines, aligned quantity, price, total and quote age columns. Totals band below table.
- Alternatives are compact ruled table rows below the itinerary. Navigation map uses generated muted celestial texture under code-rendered route labels and nodes. Summary is a compact definition list below the map.
- Controls: rectangular graphite fields with 3 px radius; amber filled primary action; small uppercase outline utility buttons; small checkbox/radio indicators.
- Sidebar: ship selector and wireframe; key ship values; configuration disclosure; start location; route mode radio group; common route options; amber Plan route button. Extended settings live in disclosures with the same tokens.
- Icons use thin angular outline treatment from Lucide, typically 14–20 px. No decorative hero, navy SaaS cards or pills.

## Functional adaptations

- Production labels use Flight Deck instead of the concept number. Market data attribution remains Spansh / EDDN.
- Real quote timestamps, coordinates and estimates replace all illustrative figures. Freshness means the percentage of route market observations within the selected age threshold, never a claimed confidence score.
- Map controls switch between planar and isometric geographic projections. They are not hyperspace navigation or a full-galaxy map.
- Current location is set manually or from a completed route leg; browser location cannot access the game's commander position. No fake current-location control is shipped.
- Existing saves, imports, exports, ship presets, alternative runs, safety settings, leg completion and replanning are retained.
- Small screens stack the same panels with horizontally scrollable trade data, keeping ship controls accessible. Desktop density and geometry are the reference baseline.
