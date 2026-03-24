# Chargeprice API — Community/Non-Profit Access Request

## Draft email to sales@chargeprice.net

---

**Subject**: Community/Non-Profit API Access Request — TOSK (Tesla Owners Slovakia)

---

Dear Chargeprice Team,

My name is [NAME] and I represent **TOSK (Tesla Owners Slovakia)** — a community website at **tosk.sk** serving Slovak EV owners with news, guides, charging station information, and pricing comparisons for the Slovak market.

We are currently building a publicly accessible EV charging price comparison tool for Slovak drivers. The tool compares tariffs from the major Slovak charging networks (ZSE Drive, GreenWay, ejoin, Ionity, and Tesla Supercharger) across multiple dimensions: per-kWh pricing, monthly fees, roaming rates, and free kWh allowances.

---

## Who we are

- **TOSK** (tosk.sk) is a non-commercial, volunteer-run community for Slovak EV owners
- We do not sell products or charge users — the site is a free community resource
- Our audience is Slovak EV drivers looking for objective, up-to-date information on charging costs
- We have no advertising revenue model — the site is maintained by community volunteers

---

## What we are building

A **responsive, publicly accessible EV charging price comparison table** to replace our current static HTML table (last updated September 2024). The tool will:

- Display current tariffs for all major Slovak charging networks side by side
- Allow users to compare plans within and across providers
- Show AC / DC / UFC price breakdowns per provider and plan
- Refresh pricing data automatically on a weekly basis

---

## Why we need the Chargeprice API

Currently we maintain separate scrapers for each provider:
- **ZSE Drive** — `__NEXT_DATA__` JSON extraction + PDF parsing
- **GreenWay** — PDF download + text extraction via regex
- **ejoin** — HTML scraping (WordPress)
- **Ionity** — HTML scraping (Webflow CMS)

These scrapers are fragile — a site redesign or PDF layout change breaks them. Chargeprice already maintains structured, validated data for all four providers in Slovakia, updated twice per week from primary sources.

Integrating with the Chargeprice API would:
1. Replace 4 fragile scrapers with a single reliable integration
2. Ensure prices always reflect what Chargeprice has verified
3. Cover edge cases our scrapers miss (time-of-day pricing, per-minute billing)

---

## Specific API needs

Our usage would be minimal:

| Endpoint | Purpose | Frequency |
|----------|---------|-----------|
| `GET /v1/tariffs` | List all SK tariffs | Once per week |
| `POST /v1/tariff_details` | Per-plan kWh/fee breakdown | Once per week, ~10–15 tariffs |

**Total estimated requests**: ~20–30 per week (well under 1000/min rate limits).

We would run a scheduled job every Monday at 06:00 UTC. We have no need for real-time or per-session price calculation — a weekly snapshot stored in our own KV store is entirely sufficient.

---

## What TOSK can offer in return

- **Attribution on the site**: A visible "Powered by Chargeprice" badge with a link on the pricing comparison page
- **Community visibility**: TOSK reaches Slovak EV owners directly — many of whom also use Chargeprice. A natural referral channel.
- **Feedback loop**: We can report data discrepancies for the Slovak market back to Chargeprice as we encounter them

---

## Request

We are asking for access to a **community or non-profit tier** of the Chargeprice API — or if such a tier does not exist, a discounted commercial arrangement reflecting our non-commercial nature and minimal usage volume.

We are happy to discuss terms, sign attribution agreements, or provide any further information about TOSK or the project.

Thank you for considering our request.

Best regards,
[NAME]
TOSK — Tesla Owners Slovakia
tosk.sk

---

## Notes for TOSK admin before sending

- Replace `[NAME]` with your actual name
- Consider attaching a screenshot of the current price comparison table and/or a preview of the new tool
- If you have usage analytics for tosk.sk (monthly visitors, registered members), include them — it strengthens the community-value argument
- Chargeprice is based in Austria and founded by EV enthusiasts; they are generally community-friendly
- Demo API key request form: https://tally.so/r/w4pJAX (for evaluation only — not for production use per their ToS)
- If granted a commercial key, implement using `GET /v1/tariffs?country=SVK` to filter to Slovakia only, then `POST /v1/tariff_details` per tariff ID
