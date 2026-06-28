# ChinaMate AI MVP

High-fidelity, mobile-first inbound travel prototype built with Next.js, React,
TypeScript, Tailwind CSS, shadcn-style components and Lucide icons.

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
