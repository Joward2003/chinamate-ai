# ChinaMate AI

ChinaMate is a local-help prototype for foreign travelers in China. It focuses
on actionable help cards, Chinese phrase cards, saved travel help, and a local
travel preference profile.

## Current Features

- Unified `/help` flow for:
  - `I need to do something`
  - `Something went wrong`
  - AI Chinese phrase generation
- Scenario-specific LLM prompts for task completion and problem recovery.
- AI-generated related help cards.
- Requery/clarification guard for overly vague user prompts.
- Chinese show cards with copy and browser speech playback.
- Admin-only Profile preference center stored in localStorage.
- Profile-aware AI request payloads when personalization is enabled.
- Shanghai starter guide cards that prefill the AI help flow.

## Demo User

The project currently supports one local demo user only:

```text
userId: admin
displayName: Admin
role: admin
```

There is no registration, login, password recovery, multi-user permission
system, or backend admin panel.

## Run Locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. If that port is already used, Next.js may choose a
different port.

## Environment Variables

Copy `.env.local.example` to `.env.local` and add your server-only key:

```bash
cp .env.local.example .env.local
```

Required for LLM features:

```text
DEEPSEEK_API_KEY=...
```

Never prefix the key with `NEXT_PUBLIC_`. Do not commit `.env.local`.

## Validation

```bash
npm run typecheck
npm run build
```

Optional model connectivity check:

```bash
npm run test:models
```

## Deployment

This app can be deployed on Vercel as a Next.js project. Configure
`DEEPSEEK_API_KEY` and related optional model variables in Vercel Project
Settings, not in Git.

The local `.vercel/` folder is intentionally ignored.
