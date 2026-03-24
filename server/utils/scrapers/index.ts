import type { PricingDataset, ProviderPricing } from '~~/app/types/pricing'
import { scrapeEjoin } from './ejoin'
import { scrapeIonity } from './ionity'
import { scrapeGreenway } from './greenway'
import { scrapeZseDrive } from './zse-drive'

interface ScraperResult {
  success: boolean
  data?: ProviderPricing
  error?: string
}

/**
 * Run all scrapers and merge results into a PricingDataset.
 * Individual scraper failures are caught and logged so one failure
 * does not prevent others from updating.
 */
export async function runAllScrapers(): Promise<PricingDataset> {
  const scrapers: Array<{ name: string, fn: () => Promise<ProviderPricing> }> = [
    { name: 'ejoin', fn: scrapeEjoin },
    { name: 'ionity', fn: scrapeIonity },
    { name: 'greenway', fn: scrapeGreenway },
    { name: 'zse-drive', fn: scrapeZseDrive },
  ]

  const results = await Promise.allSettled(scrapers.map(s => s.fn()))

  const providers: ProviderPricing[] = []
  const errors: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      providers.push(result.value)
      console.log(`[scrapers] ✓ ${scrapers[i]!.name}`)
    }
    else {
      const msg = result.reason instanceof Error ? result.reason.message : String(result.reason)
      errors.push(`${scrapers[i]!.name}: ${msg}`)
      console.error(`[scrapers] ✗ ${scrapers[i]!.name}: ${msg}`)
    }
  })

  if (providers.length === 0) {
    throw new Error(`All scrapers failed: ${errors.join(', ')}`)
  }

  return {
    lastUpdated: new Date().toISOString(),
    dataSource: 'scraped',
    providers,
  }
}
