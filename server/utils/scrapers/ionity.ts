import * as cheerio from 'cheerio'
import type { ProviderPricing, PriceValue } from '~~/app/types/pricing'

/**
 * Scrape Ionity pricing from ionity.eu/sk/predplatne
 * The page is Webflow with all country data embedded as CMS Collection Items in the HTML.
 * Slovakia prices are in the item where country name = "Slovensko".
 *
 * Available price attributes per country item (verified 2026-03-25):
 *   power-kwh-price, power-monthly-price, power-annual-price, power-annual-discount-price
 *   motion-kwh-price, motion-monthly-price, motion-annual-price, motion-annual-discount-price
 *   go-kwh-price, direct-kwh-price
 */
export async function scrapeIonity(): Promise<ProviderPricing> {
  const html = await $fetch<string>('https://ionity.eu/sk/predplatne', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pricing-bot/1.0)' },
    responseType: 'text',
  })

  const $ = cheerio.load(html)

  // Find the Slovakia CMS item
  let $sk: cheerio.Cheerio<cheerio.Element> | null = null
  $('.combi-pricing_cli.w-dyn-item').each((_, el) => {
    const name = $(el).find('[fs-cmsfilter-field="country-2"]').first().text().trim()
    if (name === 'Slovensko') {
      $sk = $(el)
    }
  })

  if (!$sk) {
    throw new Error('Ionity: Slovakia pricing item not found on page')
  }

  function parseIonityPrice(selector: string): PriceValue {
    const text = ($sk as cheerio.Cheerio<cheerio.Element>).find(selector).first().text().trim()
    // Formats: "0.39 €/kWh", "€11.99"
    const numMatch = text.match(/[\d.]+/)
    const amount = numMatch ? parseFloat(numMatch[0]) : null
    const unit = text.includes('kWh') ? 'EUR/kWh' : 'EUR/mes.'
    return { amount, unit }
  }

  const powerKwh = parseIonityPrice('[power-kwh-price="parent"]')
  const powerMonthly = parseIonityPrice('[power-monthly-price="parent"]')
  const motionKwh = parseIonityPrice('[motion-kwh-price="parent"]')
  const motionMonthly = parseIonityPrice('[motion-monthly-price="parent"]')
  const goKwh = parseIonityPrice('[go-kwh-price="parent"]')
  const directKwh = parseIonityPrice('[direct-kwh-price="parent"]')

  return {
    providerId: 'ionity',
    plans: [
      {
        planId: 'motion',
        'monthly-fee': { amount: motionMonthly.amount, unit: 'EUR/mes.' },
        'rfid-card': { amount: null, unit: 'EUR', note: 'nie je k dispozícii' },
        'free-kwh': { amount: null, unit: 'kWh' },
        'free-kwh-recalculated': { amount: null, unit: 'EUR/kWh' },
        'home-sk': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: motionKwh.amount, unit: 'EUR/kWh' },
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: motionKwh.amount, unit: 'EUR/kWh', note: 'cena podľa krajiny' },
        },
      },
      {
        planId: 'power',
        'monthly-fee': { amount: powerMonthly.amount, unit: 'EUR/mes.' },
        'rfid-card': { amount: null, unit: 'EUR', note: 'nie je k dispozícii' },
        'free-kwh': { amount: null, unit: 'kWh' },
        'free-kwh-recalculated': { amount: null, unit: 'EUR/kWh' },
        'home-sk': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: powerKwh.amount, unit: 'EUR/kWh' },
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: powerKwh.amount, unit: 'EUR/kWh', note: 'cena podľa krajiny' },
        },
      },
      {
        planId: 'go',
        'monthly-fee': { amount: 0, unit: 'EUR' },
        'rfid-card': { amount: null, unit: 'EUR', note: 'nie je k dispozícii' },
        'free-kwh': { amount: null, unit: 'kWh' },
        'free-kwh-recalculated': { amount: null, unit: 'EUR/kWh' },
        'home-sk': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: goKwh.amount, unit: 'EUR/kWh', note: 'od (cez aplikáciu)' },
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena podľa krajiny' },
        },
      },
      {
        planId: 'direct',
        'monthly-fee': { amount: 0, unit: 'EUR' },
        'rfid-card': { amount: null, unit: 'EUR', note: 'nie je k dispozícii' },
        'free-kwh': { amount: null, unit: 'kWh' },
        'free-kwh-recalculated': { amount: null, unit: 'EUR/kWh' },
        'home-sk': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: directKwh.amount, unit: 'EUR/kWh', note: 'od (bez registrácie)' },
        },
        'domestic-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'len Ionity stanice' },
        },
        'international-roaming': {
          AC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          DC: { amount: null, unit: 'EUR/kWh', note: 'len UFC' },
          UFC: { amount: null, unit: 'EUR/kWh', note: 'cena podľa krajiny' },
        },
      },
    ],
  }
}
