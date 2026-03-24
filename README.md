# EV Charging Info Demo

A responsive web application for comparing EV charging prices across major Slovak charging networks. Built for [TOSK (Tesla Owners Slovakia)](https://tosk.sk) to help EV drivers make informed decisions about charging plans.

## Overview

Pricing data from five charging providers is scraped daily and presented in four interactive visualization formats — giving users multiple ways to compare costs across charging types (AC, DC, UFC), subscription plans, and usage scenarios.

**Supported providers:**
- ZSE Drive
- GreenWay
- ejoin
- Ionity
- Tesla Supercharger

## Features

- **4 comparison views** — table, cards, category-based, and scenario ranker
- **Automatic daily updates** — prices scraped every day at 6 AM UTC
- **Multi-plan support** — compares all available subscription tiers per provider
- **Full pricing breakdown** — monthly fees, RFID card costs, per-kWh rates, free kWh allowances, domestic & international roaming
- **Responsive design** — works on mobile and desktop, with dark mode support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Nuxt 4](https://nuxt.com) + Vue 3 |
| UI | [Nuxt UI](https://ui.nuxt.com) + Tailwind CSS 4 |
| Language | TypeScript |
| Server | Nitro (built into Nuxt) |
| Scraping | cheerio (HTML), unpdf (PDF) |
| Package manager | pnpm |

## Getting Started

**Prerequisites:** Node.js ≥ 20.0.0, pnpm

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm generate` | Generate a static site |

## Pricing Data

Pricing data is fetched automatically via server-side scrapers and stored using Nitro's built-in KV storage. A seed dataset (`server/data/seed-pricing.json`) acts as a fallback when scrapers are unavailable.

**Scrapers:**

| Provider | Source | Method |
|----------|--------|--------|
| ejoin | ejoin.eu/cennik | HTML (cheerio) |
| Ionity | ionity.eu/sk/predplatne | HTML (cheerio) |
| GreenWay | PDF pricelist | PDF text extraction (unpdf) |
| ZSE Drive | Site + PDF | Next.js `__NEXT_DATA__` + PDF |

To manually trigger a price update:

```bash
npx nuxi task run pricing:update
```

## Project Structure

```
├── app/
│   ├── components/         # Shared and variant-specific Vue components
│   │   ├── variant-a/      # Responsive table view
│   │   ├── variant-b/      # Provider cards view
│   │   ├── variant-c/      # Category-based view
│   │   └── variant-d/      # Scenario ranker view
│   ├── composables/        # Data fetching (usePricingData)
│   ├── pages/              # Route pages for each variant
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Formatting, provider metadata, pricing helpers
└── server/
    ├── api/                # REST API endpoints
    ├── tasks/              # Scheduled pricing update task
    └── utils/
        ├── scrapers/       # Per-provider scraping logic
        └── pricing-store.ts # KV read/write with in-memory caching
```

## The Four Comparison Views

| Variant | Format | Best for |
|---------|--------|----------|
| **A — Table** | Classic grid with sticky columns | Side-by-side full comparison |
| **B — Cards** | One card per provider | Browsing a specific provider |
| **C — Categories** | Filter by pricing category | Comparing a single cost dimension |
| **D — Ranker** | Sorted cheapest → most expensive | Finding the best deal for a scenario |

## License

MIT
