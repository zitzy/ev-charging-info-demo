import { extractText, getDocumentProxy } from 'unpdf'
import type { ProviderPricing, PriceValue } from '~~/app/types/pricing'

const DOWNLOADS_URL = 'https://zsedrive.sk/materialy-na-stiahnutie'
const BASE_URL = 'https://zsedrive.sk/api/web/v1/files'

interface ZseNextData {
  props?: {
    pageProps?: {
      homePage?: {
        downloadFiles?: {
          DRIVERS?: Array<{ id: number, title: string, filePath: string, order: number }>
          [key: string]: unknown
        }
      }
    }
  }
}

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/**
 * Scrape ZSE Drive pricing.
 * 1. Fetch the downloads page, extract __NEXT_DATA__ JSON to find the latest public pricelist PDF
 * 2. Download and parse the PDF with unpdf
 *
 * PDF format (2026):
 *   PLAN_NAME  MONTHLY_FEE  FREE_KWH  AC_DAY/AC_NIGHT  DC_DAY/DC_NIGHT  ...
 *   e.g.: ECO 0,00 € - 0,39 € 0,49 € 0,59 € 0,69 €
 */
export async function scrapeZseDrive(): Promise<ProviderPricing> {
  // Step 1: Find the latest PDF URL via __NEXT_DATA__
  const html = await $fetch<string>(DOWNLOADS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pricing-bot/1.0)' },
    responseType: 'text',
  })

  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (!nextDataMatch?.[1]) {
    throw new Error('ZSE Drive: __NEXT_DATA__ not found on downloads page')
  }

  const nextData: ZseNextData = JSON.parse(nextDataMatch[1])
  const drivers = nextData?.props?.pageProps?.homePage?.downloadFiles?.DRIVERS ?? []

  // Find public pricelist PDFs (title contains "cennik"), sorted by order (lowest = newest)
  const pricePdfs = drivers
    .filter(f => {
      const t = stripDiacritics(f.title ?? '')
      // Match "cennik sluzby zse drive" but not wallbox/household pricelists
      return t.includes('cennik') && t.includes('zse drive') && !t.includes('wallbox') && !t.includes('rodinne')
    })
    .sort((a, b) => a.order - b.order)

  if (pricePdfs.length === 0) {
    throw new Error('ZSE Drive: no pricelist PDF found in __NEXT_DATA__')
  }

  const pdfPath = pricePdfs[0]!.filePath
  const pdfUrl = `${BASE_URL}${pdfPath}`

  // Step 2: Download and parse the PDF
  const response = await $fetch<ArrayBuffer>(pdfUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pricing-bot/1.0)' },
    responseType: 'arrayBuffer',
  })

  const pdf = await getDocumentProxy(new Uint8Array(response))
  const { text } = await extractText(pdf, { mergePages: true })

  // PDF table format (one line per plan):
  // PLAN  MONTHLY  FREE_KWH  AC_DAY/AC_NIGHT  DC_DAY/DC_NIGHT  ULTRA_DAY/ULTRA_NIGHT  DRIVEX_DAY/DRIVEX_NIGHT
  // e.g.: ECO 0,00 € - 0,39 € 0,49 € 0,59 € 0,69 €
  // e.g.: PARTNER SAFE*2 13,90 € 40 kWh 0,29 €/0,24 € 0,39 €/0,32 € 0,49 €/0,39 € 0,59 €/0,39 €

  // Extract a price from text following a plan name
  function extractPlanLine(planPattern: RegExp): string | null {
    const match = text.match(planPattern)
    return match?.[1] ?? null
  }

  function firstPrice(line: string | null): number | null {
    if (!line) return null
    const m = line.match(/(\d+[.,]\d+)/)
    return m ? parseFloat(m[1]!.replace(',', '.')) : null
  }

  // Extract AC/DC/Ultra prices from a plan's text line
  function getPlanPrices(planName: string): { monthly: number | null, ac: number | null, dc: number | null, ufc: number | null, freeKwh: number | null } {
    const re = new RegExp(`${planName}[*\\d\\s]*?(\\d+[.,]\\d+\\s*€.{0,200}?)(?=\\n|ECO|START|PARTNER|ROAD|FLAT|PRO|GUEST|$)`, 's')
    const match = text.match(re)
    if (!match?.[1]) return { monthly: null, ac: null, dc: null, ufc: null, freeKwh: null }

    const segment = match[1]!
    const prices = [...segment.matchAll(/(\d+[.,]\d+)\s*€/g)].map(m => parseFloat(m[1]!.replace(',', '.')))
    const kwhMatch = segment.match(/(\d+)\s*kWh/)
    const freeKwh = kwhMatch ? parseInt(kwhMatch[1]!) : null

    return {
      monthly: prices[0] ?? null,
      freeKwh,
      ac: prices[1] ?? null, // First per-kWh price = AC (day rate)
      dc: prices[3] ?? null, // Third per-kWh price = DC (day rate)
      ufc: prices[5] ?? null, // Fifth per-kWh price = Ultra/UFC (day rate)
    }
  }

  function priceVal(amount: number | null, unit = 'EUR/kWh'): PriceValue {
    return { amount, unit }
  }

  const eco = getPlanPrices('ECO')
  const start = getPlanPrices('START')
  const partner = getPlanPrices('PARTNER SAFE')
  const road = getPlanPrices('ROAD SAFE')
  const flat = getPlanPrices('FLAT SAFE')

  const rfidFee = text.match(/karta.*?(\d+[.,]?\d*)\s*€/i)?.[1]
    ? parseFloat(text.match(/karta.*?(\d+[.,]?\d*)\s*€/i)![1]!.replace(',', '.'))
    : 8

  return {
    providerId: 'zse-drive',
    plans: [
      {
        planId: 'eco',
        'monthly-fee': priceVal(eco.monthly ?? 0, 'EUR'),
        'rfid-card': priceVal(rfidFee, 'EUR'),
        'free-kwh': priceVal(eco.freeKwh, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(eco.ac ?? 0.39),
          DC: priceVal(eco.dc ?? 0.49),
          UFC: priceVal(eco.ufc ?? 0.59),
        },
        'domestic-roaming': { AC: priceVal(0.49), DC: priceVal(0.59), UFC: priceVal(0.69) },
        'international-roaming': { AC: priceVal(9.00, 'EUR/h'), DC: priceVal(25.00, 'EUR/h'), UFC: priceVal(35.00, 'EUR/h') },
      },
      {
        planId: 'start',
        'monthly-fee': priceVal(start.monthly ?? 2.99, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee, 'EUR'),
        'free-kwh': priceVal(start.freeKwh, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(start.ac ?? 0.29),
          DC: priceVal(start.dc ?? 0.39),
          UFC: priceVal(start.ufc ?? 0.49),
        },
        'domestic-roaming': { AC: priceVal(0.49), DC: priceVal(0.59), UFC: priceVal(0.69) },
        'international-roaming': { AC: priceVal(9.00, 'EUR/h'), DC: priceVal(25.00, 'EUR/h'), UFC: priceVal(35.00, 'EUR/h') },
      },
      {
        planId: 'partner-safe',
        'monthly-fee': priceVal(partner.monthly ?? 13.90, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee, 'EUR'),
        'free-kwh': priceVal(partner.freeKwh ?? 40, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(partner.ac ?? 0.29),
          DC: priceVal(partner.dc ?? 0.39),
          UFC: priceVal(partner.ufc ?? 0.49),
        },
        'domestic-roaming': { AC: priceVal(0.49), DC: priceVal(0.59), UFC: priceVal(0.69) },
        'international-roaming': { AC: priceVal(9.00, 'EUR/h'), DC: priceVal(25.00, 'EUR/h'), UFC: priceVal(35.00, 'EUR/h') },
      },
      {
        planId: 'road-safe',
        'monthly-fee': priceVal(road.monthly ?? 33.90, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee, 'EUR'),
        'free-kwh': priceVal(road.freeKwh ?? 100, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(road.ac ?? 0.29),
          DC: priceVal(road.dc ?? 0.35),
          UFC: priceVal(road.ufc ?? 0.45),
        },
        'domestic-roaming': { AC: priceVal(0.49), DC: priceVal(0.59), UFC: priceVal(0.69) },
        'international-roaming': { AC: priceVal(9.00, 'EUR/h'), DC: priceVal(25.00, 'EUR/h'), UFC: priceVal(35.00, 'EUR/h') },
      },
      {
        planId: 'flat-safe',
        'monthly-fee': priceVal(flat.monthly ?? 99.00, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee, 'EUR'),
        'free-kwh': priceVal(flat.freeKwh ?? 300, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(flat.ac ?? 0.29),
          DC: priceVal(flat.dc ?? 0.29),
          UFC: priceVal(flat.ufc ?? 0.39),
        },
        'domestic-roaming': { AC: priceVal(0.49), DC: priceVal(0.59), UFC: priceVal(0.69) },
        'international-roaming': { AC: priceVal(9.00, 'EUR/h'), DC: priceVal(25.00, 'EUR/h'), UFC: priceVal(35.00, 'EUR/h') },
      },
    ],
  }
}
