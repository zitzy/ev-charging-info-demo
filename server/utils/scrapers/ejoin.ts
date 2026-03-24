import * as cheerio from 'cheerio'
import type { ProviderPricing } from '~~/app/types/pricing'

/**
 * Scrape ejoin pricing from ejoin.eu/cennik
 * The page is a WordPress site with a simple server-rendered HTML table
 */
export async function scrapeEjoin(): Promise<ProviderPricing> {
  const html = await $fetch<string>('https://ejoin.eu/cennik', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pricing-bot/1.0)' },
    responseType: 'text',
  })

  const $ = cheerio.load(html)

  // The pricing table is the first wp-block-table on the page
  const table = $('figure.wp-block-table table').first()
  const dataRow = table.find('tbody tr').eq(1) // second row = data row

  function extractPrice(cell: cheerio.Cheerio<cheerio.Element>): number | null {
    const text = cell.text().trim()
    const match = text.match(/(\d+[.,]\d+)/)
    if (!match) return null
    return parseFloat(match[1]!.replace(',', '.'))
  }

  const cells = dataRow.find('td')
  const acAmount = extractPrice(cells.eq(1))
  const dcAmount = extractPrice(cells.eq(2))
  const monthlyText = cells.eq(3).text().trim()
  const monthlyAmount = monthlyText.includes('0') ? 0 : (extractPrice(cells.eq(3)) ?? null)
  const cardAmount = extractPrice(cells.eq(4))

  return {
    providerId: 'ejoin',
    plans: [
      {
        planId: 'default',
        'monthly-fee': { amount: monthlyAmount, unit: 'EUR' },
        'rfid-card': { amount: cardAmount, unit: 'EUR' },
        'free-kwh': { amount: null, unit: 'kWh' },
        'free-kwh-recalculated': { amount: null, unit: 'EUR/kWh' },
        'home-sk': {
          AC: { amount: acAmount, unit: 'EUR/kWh' },
          DC: { amount: dcAmount, unit: 'EUR/kWh' },
          UFC: { amount: dcAmount, unit: 'EUR/kWh' },
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
