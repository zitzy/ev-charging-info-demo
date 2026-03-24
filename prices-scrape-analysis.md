# EV Charging Price Data — Scraping & API Analysis

## Why scraping, not an API?

The only structured API covering all Slovak EV charging providers is **Chargeprice** (chargeprice.net).
All four providers (ZSE Drive, GreenWay, ejoin, Ionity) publish pricing exclusively via their own websites or PDFs — none expose a public JSON API for pricing.

---

## Current approach: direct scraping

Each provider has a different method. All scrapers run inside a Nitro scheduled task (`pricing:update`, daily at 6 AM).

### ejoin — HTML scraping
- **URL**: `https://ejoin.eu/cennik`
- **Tech**: WordPress + Bricks Builder, 100% server-rendered
- **Method**: `$fetch` → `cheerio` → parse `<figure class="wp-block-table"> table`
- **Alt**: WordPress REST API at `/wp-json/wp/v2/pages?slug=cennik&_fields=content` (returns JSON with rendered HTML)
- **Selectors**: `tbody tr:nth-child(2) td:nth-child(n)` for AC, DC, monthly fee, card fee
- **Reliability**: High — no anti-bot, no Cloudflare, stable WordPress structure
- **Change risk**: Low — WordPress table unlikely to restructure

### Ionity — HTML scraping (Webflow CMS)
- **URL**: `https://ionity.eu/sk/predplatne`
- **Tech**: Webflow CMS — all country data server-rendered as Collection Items
- **Method**: `$fetch` → `cheerio` → find `.combi-pricing_cli.w-dyn-item` where country = "Slovensko"
- **Key insight**: All country prices are embedded in the initial HTML via custom attributes (`[power-kwh-price="parent"]`, `[motion-kwh-price="parent"]`, etc.). No JS execution needed.
- **Plans extracted**: Motion (kWh + monthly), Power (kWh + monthly), Go (ad-hoc), Direct (no subscription)
- **Reliability**: Medium — Webflow CMS structure is stable, but attribute names could change on redesign
- **Change risk**: Medium — Webflow redesigns can change attribute names

### GreenWay — PDF download + parsing
- **URL**: `https://data.greenway.sk/clientzone/pricelist_EN.pdf` (stable canonical, always current)
- **Slovak version**: `https://data.greenway.sk/clientzone/pricelist_SK.pdf`
- **Method**: `$fetch` (ArrayBuffer) → `unpdf.getDocumentProxy` → `extractText` → regex
- **Change detection**: `Last-Modified` + `ETag` headers available for conditional requests
- **Reliability**: Medium — stable URL, but PDF text layout changes break regex
- **Change risk**: Medium — PDF layout changes require regex updates

### ZSE Drive — `__NEXT_DATA__` discovery + PDF parsing
- **Discovery page**: `https://zsedrive.sk/materialy-na-stiahnutie`
- **Tech**: Next.js site — PDF file metadata embedded in `__NEXT_DATA__` JSON
- **Method**:
  1. Fetch downloads page → extract `<script id="__NEXT_DATA__">` → parse JSON
  2. Find latest PDF in `props.pageProps.homePage.downloadFiles.DRIVERS[]` (lowest `order` = newest)
  3. Construct URL: `https://zsedrive.sk/api/web/v1/files{filePath}`
  4. Download PDF → `unpdf` → regex
- **Gotcha**: Title uses Slovak diacritics (`Cenník`, not `Cennik`) — must normalize with `String.normalize('NFD')` before filtering
- **Reliability**: Medium — `__NEXT_DATA__` is stable for Next.js, but key names could change
- **Change risk**: Medium-High — site redesign or Next.js migration would break discovery

---

## Chargeprice API — the alternative

**Website**: chargeprice.net | **Docs**: chargeprice.github.io/chargeprice-api-docs

The cleanest solution for structured data. Covers all four providers in Slovakia with proper JSON.

### What it provides
| Endpoint | Data |
|----------|------|
| `GET /v1/tariffs` | Provider name, tariff name, monthly fee, currency, supported countries |
| `POST /v1/tariff_details` | Per-kWh prices, AC/DC split, time-of-day ranges, billing increments |
| `POST /v1/charge_prices` | Total cost for a specific session (given kWh/duration + station) |
| `GET /v1/companies` | CPO/EMP registry with EVSE operator IDs |

Pricing is returned as `restricted_segments[]` with fields:
- `dimension`: `"kwh"`, `"minute"`, `"session"`, `"parking_minute"`
- `charge_point_energy_type`: `"ac"`, `"dc"`, or `null` (both)
- `price`: float (e.g. `0.39`)
- `time_of_day_start` / `time_of_day_end`: for peak/off-peak pricing

### Access tiers
| Tier | Cost | Limits | Commercial use |
|------|------|--------|----------------|
| **Demo** | Free | Restricted data, evaluation only | **Not allowed** |
| **Commercial** | Contact sales@chargeprice.net | Up to 1000 req/min | Yes |

- **Demo key**: Request via https://tally.so/r/w4pJAX — automatic email delivery
- **Commercial**: Email sales@chargeprice.net for pricing

### Can we use it for weekly updates?

The **demo tier explicitly prohibits commercial use**, so it can't be used in production even at low frequency. However:

- Chargeprice syncs their own data **twice per week** from providers
- A commercial plan with weekly polling (e.g. `0 6 * * 1` — every Monday) would be 52 requests/year — minimal cost
- The TOSK admin should reach out to Chargeprice — as an EV community site they may offer a discounted or non-profit rate
- **Recommended flow**: `GET /v1/tariffs` to list all SK tariffs → `POST /v1/tariff_details` per tariff → store results in Nitro KV storage

### Why Chargeprice would be better long-term

- Single integration, all providers covered
- No scraper maintenance when providers redesign sites or change PDF layouts
- Structured JSON — no regex guessing
- Chargeprice handles provider data freshness
- Covers edge cases: time-of-day pricing, per-minute billing, roaming rates

---

## Tesla Supercharger pricing

### Current situation: no official API

Tesla has no public API for Supercharger pricing. Pricing is only accessible through:
- Tesla mobile app (requires Tesla account)
- Tesla website (`tesla.com/findus`) — shows pricing per location in the UI

### Current Slovakia Supercharger prices (as of early 2026)

Per-kWh pricing (same for Tesla owners and non-Tesla):
- **00:00–16:00**: ~0.53–0.55 €/kWh
- **16:00–20:00**: ~0.60–0.63 €/kWh (peak)
- **20:00–00:00**: ~0.53–0.55 €/kWh
- **Idle fee**: 0.35 €/min (when charged but still connected, applies above 50% occupancy)

Locations: Bratislava (Aupark/Einsteinova), Zvolen, Košice, Trenčín, Demänová Village

### Options for getting the data programmatically

| Method | Reliability | Auth needed | Notes |
|--------|-------------|-------------|-------|
| **Tesla website scraping** | Medium | No | `tesla.com/findus` renders pricing in HTML, but may require JS execution |
| **Unofficial GraphQL API** | Low | Partial (Tesla token) | Used by community apps for "Charge Your Non-Tesla" — Tesla can break it anytime |
| **Manual maintenance** | High | No | Prices change infrequently; admin updates JSON manually |
| **supercharge.info API** | N/A | No | Location/status only, no pricing |
| **superchargers.io GraphQL** | N/A | No | Location/metadata only, no pricing |

### Recommendation for Tesla Supercharger inclusion

**Short-term**: Add Tesla as a manually-maintained provider in the seed data. Prices change rarely (a few times per year) and the admin can update them directly.

**Data model approach**:
- Add `tesla` as a new `ProviderId`
- Plans: `non-member` (no subscription), `member` (if Tesla+ subscription applies in SK)
- The `home-sk` category maps to Supercharger DC/UFC pricing
- No AC charging at Superchargers

**Long-term**: Monitor whether Tesla opens a public API (unlikely near-term) or whether Chargeprice covers Supercharger pricing (they do have Tesla data for some regions).

### Complexity estimate

| Task | Effort |
|------|--------|
| Add Tesla to providers metadata + seed data | Low (1–2h) |
| Add Supercharger scraper (website HTML) | Medium (brittle, 4–8h) |
| Add via Chargeprice API | Low (if commercial key obtained) |
| Manual maintenance via admin UI | Medium (requires adding an admin update endpoint) |

---

## Summary recommendation

| Priority | Action |
|----------|--------|
| **Now** | Keep current scrapers (ejoin, Ionity, GreenWay, ZSE Drive) — all working |
| **Next** | Contact Chargeprice for community/non-profit rate — replace PDF scrapers if granted |
| **Tesla** | Add manually-maintained seed entry first; revisit scraping after core demo is accepted |
| **Fallback** | If Chargeprice is too expensive, ejoin + Ionity HTML scrapers are reliable long-term; only ZSE Drive + GreenWay PDFs are fragile |
