# ChinaMate AI — Mobile Agent Edition

Mobile Agent extension of the original ChinaMate MVP. On 375–430px screens,
the first view is a natural-language trip planner with mock voice input,
AI-style profile parsing, route-node cards, expandable last-mile tips and
one-tap plan adjustments. The original desktop demo and step-by-step planner
remain available.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Validation

```bash
npm run typecheck
npm run build
node scripts/visual-check.mjs
```

The visual check uses the local Google Chrome installation and writes desktop
and mobile screenshots to `qa/`.

## Included flows

- Mobile-first Agent trip input and mock voice state
- Prompt examples and one-question fallback
- Parsed trip-profile summary
- Route-node itinerary with last-mile tips
- Context-aware family, elderly, child, luggage and payment cues
- One-tap route adjustments without restarting
- Compact mobile Local Help entry points
- Splash and inspiration feed
- Place detail and bilingual phrase cards
- Manual/GPS-assisted entry status
- Low-input travel profile
- Pre-arrival checklist
- Executable two-day Beijing itinerary
- Foreigner-friendly map filters and traveler contributions
- Task-oriented dynamic trip adjustment
- Local service marketplace
- Feedback and shareable travel recap

All data and external actions are mocked. The app does not process payments.

## Photo credits

Prototype travel imagery is stored locally under `public/images/` and sourced
from free-to-use Unsplash photographs by Hanson Lu, Ray W, Sergio Kian,
Ekaterina Zlotnikova, Sacha Canivet, Vincent Guth and Luc L.
