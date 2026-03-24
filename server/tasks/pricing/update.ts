import { runAllScrapers } from '~~/server/utils/scrapers/index'
import { writePricingData } from '~~/server/utils/pricing-store'

export default defineTask({
  meta: {
    name: 'pricing:update',
    description: 'Fetch latest EV charging prices from all providers',
  },
  async run() {
    console.log('[pricing:update] Starting price update...')

    const data = await runAllScrapers()
    await writePricingData(data)

    console.log(`[pricing:update] Done — updated ${data.providers.length} providers at ${data.lastUpdated}`)
    return { result: 'OK', providers: data.providers.map(p => p.providerId), lastUpdated: data.lastUpdated }
  },
})
