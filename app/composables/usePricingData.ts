import type { PricingDataset } from '~/types/pricing'

export function usePricingData() {
  const { data, pending, error, refresh } = useFetch<PricingDataset>('/api/pricing', {
    key: 'pricing-data',
  })

  return {
    pricing: data,
    loading: pending,
    error,
    refresh,
  }
}
