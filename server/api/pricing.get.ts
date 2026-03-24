import { readPricingData } from '~~/server/utils/pricing-store'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  })

  return readPricingData()
})
