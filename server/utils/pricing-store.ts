import type { PricingDataset } from '~~/app/types/pricing'
import seedData from '~~/server/data/seed-pricing.json'

const STORAGE_KEY = 'pricing:current'
// In-memory cache with 1-hour TTL
let cachedData: PricingDataset | null = null
let cacheExpiry = 0

export async function readPricingData(): Promise<PricingDataset> {
  // Return in-memory cache if still valid
  if (cachedData && Date.now() < cacheExpiry) {
    return cachedData
  }

  // Try Nitro storage (populated by scheduled task)
  try {
    const stored = await useStorage('data').getItem<PricingDataset>(STORAGE_KEY)
    if (stored) {
      cachedData = stored
      cacheExpiry = Date.now() + 60 * 60 * 1000 // 1 hour
      return stored
    }
  }
  catch {
    // Storage not available, fall through to seed
  }

  // Fall back to seed data
  return seedData as PricingDataset
}

export async function writePricingData(data: PricingDataset): Promise<void> {
  await useStorage('data').setItem(STORAGE_KEY, data)
  // Invalidate in-memory cache so next read gets fresh data
  cachedData = null
  cacheExpiry = 0
}
