import { extractText, getDocumentProxy } from 'unpdf'
import type { ProviderPricing, PriceValue } from '~~/app/types/pricing'

const PDF_URL = 'https://data.greenway.sk/clientzone/pricelist_EN.pdf'

/**
 * Scrape GreenWay pricing from their stable PDF URL.
 * Parses text content of the PDF to extract tariff pricing.
 */
export async function scrapeGreenway(): Promise<ProviderPricing> {
  const response = await $fetch<ArrayBuffer>(PDF_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pricing-bot/1.0)' },
    responseType: 'arrayBuffer',
  })

  const pdf = await getDocumentProxy(new Uint8Array(response))
  const { text } = await extractText(pdf, { mergePages: true })

  function findPrice(pattern: RegExp): number | null {
    const match = text.match(pattern)
    if (!match?.[1]) return null
    return parseFloat(match[1].replace(',', '.'))
  }

  // GreenWay PDF structure: look for plan names and associated prices
  // Plans: Energia Standard, Energia Plus, Energia Max, Energia Premium
  // Prices in format like "0.39 EUR/kWh" or "0,39 EUR/kWh"

  // Monthly fees
  const plusMonthly = findPrice(/Energia Plus[^€]*?(\d+[.,]\d+)\s*EUR/)
  const maxMonthly = findPrice(/Energia Max[^€]*?(\d+[.,]\d+)\s*EUR/)
  const premiumMonthly = findPrice(/Energia Premium[^€]*?(\d+[.,]\d+)\s*EUR/)

  // RFID card fee (usually consistent across plans)
  const rfidFee = findPrice(/RFID[^€\n]*?(\d+[.,]\d+)\s*EUR/)

  // Per kWh prices — look for AC/DC patterns
  // This is heuristic and may need adjustment based on actual PDF structure
  const acPrices = [...text.matchAll(/AC[^€\n]*?(\d+[.,]\d+)\s*EUR\/kWh/g)].map(
    m => parseFloat(m[1]!.replace(',', '.')),
  )
  const dcPrices = [...text.matchAll(/DC[^€\n]*?(\d+[.,]\d+)\s*EUR\/kWh/g)].map(
    m => parseFloat(m[1]!.replace(',', '.')),
  )

  function priceVal(amount: number | null, unit = 'EUR/kWh'): PriceValue {
    return { amount, unit }
  }

  // Map extracted prices to plans (order: Standard, Plus, Max, Premium)
  // Standard has no monthly fee
  return {
    providerId: 'greenway',
    plans: [
      {
        planId: 'standard',
        'monthly-fee': priceVal(null, 'EUR'),
        'rfid-card': priceVal(rfidFee ?? 3, 'EUR'),
        'free-kwh': priceVal(null, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(acPrices[0] ?? 0.39),
          DC: priceVal(dcPrices[0] ?? 0.59),
          UFC: priceVal(dcPrices[0] ?? 0.69),
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
      },
      {
        planId: 'plus',
        'monthly-fee': priceVal(plusMonthly, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee ?? 3, 'EUR'),
        'free-kwh': priceVal(30, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(acPrices[1] ?? 0.29),
          DC: priceVal(dcPrices[1] ?? 0.49),
          UFC: priceVal(dcPrices[1] ?? 0.59),
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
      },
      {
        planId: 'max',
        'monthly-fee': priceVal(maxMonthly, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee ?? 3, 'EUR'),
        'free-kwh': priceVal(50, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(acPrices[2] ?? 0.29),
          DC: priceVal(dcPrices[2] ?? 0.45),
          UFC: priceVal(dcPrices[2] ?? 0.45),
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
      },
      {
        planId: 'premium',
        'monthly-fee': priceVal(premiumMonthly, 'EUR/mes.'),
        'rfid-card': priceVal(rfidFee ?? 3, 'EUR'),
        'free-kwh': priceVal(150, 'kWh'),
        'free-kwh-recalculated': priceVal(null, 'EUR/kWh'),
        'home-sk': {
          AC: priceVal(acPrices[3] ?? 0.29),
          DC: priceVal(dcPrices[3] ?? 0.40),
          UFC: priceVal(dcPrices[3] ?? 0.40),
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena len v aplikácii' },
        },
      },
    ],
  }
}
