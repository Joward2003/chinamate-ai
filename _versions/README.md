# ChinaMate project versions

## `ChinaMate-original`

Frozen copy of the original high-fidelity ChinaMate MVP before the mobile Agent
changes. Source and lock files are preserved; generated folders are excluded.

## `ChinaMate-agent-mobile`

Independent working copy containing the mobile-first Agent trip entry,
mock voice interaction, parsed trip summary, route-node itinerary,
last-mile tips, plan adjustments and simplified mobile Local Help.

Each project is run independently:

```bash
cd "ChinaMate-original" # or ChinaMate-agent-mobile
npm install
npm run dev
```
