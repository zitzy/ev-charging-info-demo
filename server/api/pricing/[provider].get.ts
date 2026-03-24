import { readPricingData } from '~~/server/utils/pricing-store'

export default defineEventHandler(async (event) => {
  const providerId = getRouterParam(event, 'provider')
  if (!providerId) throw createError({ statusCode: 400, message: 'Missing provider' })

  const data = await readPricingData()

  const provider = data.providers.find(p => p.providerId === providerId)
  if (!provider) {
    throw createError({ statusCode: 404, message: `Provider "${providerId}" not found` })
  }

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=3600',
  })

  return {
    lastUpdated: data.lastUpdated,
    dataSource: data.dataSource,
    provider,
  }
})
