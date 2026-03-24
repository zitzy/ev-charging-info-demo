import type { PricingDataset, PriceValue, ProviderId, ChargingType, PriceCategoryId, PlanData } from '~/types/pricing'
import { PROVIDERS } from '~/utils/providers'

/**
 * Get the simple PriceValue for a plan's non-charging category
 */
export function getSimplePrice(plan: PlanData, categoryId: PriceCategoryId): PriceValue | null {
  return (plan[categoryId as keyof PlanData] as PriceValue | undefined) ?? null
}

/**
 * Get the PriceValue for a specific charging type within a charging category
 */
export function getChargingPrice(
  plan: PlanData,
  categoryId: 'home-sk' | 'domestic-roaming' | 'international-roaming',
  chargingType: ChargingType,
): PriceValue | null {
  const category = plan[categoryId]
  if (!category) return null
  return category[chargingType] ?? null
}

/**
 * Get the note for a charging-type category (e.g. "podľa GreenWay aplikácie")
 */
export function getChargingNote(
  plan: PlanData,
  categoryId: 'home-sk' | 'domestic-roaming' | 'international-roaming',
): string | undefined {
  return plan[categoryId]?._note
}

/**
 * Get all plan+price combos for a given category+chargingType, sorted cheapest first
 */
export function getRankedPrices(
  dataset: PricingDataset,
  categoryId: PriceCategoryId,
  chargingType?: ChargingType,
) {
  const results: Array<{
    providerId: ProviderId
    providerName: string
    providerColor: string
    planId: string
    planName: string
    price: PriceValue | null
    monthlyFee: PriceValue | null
    note?: string
  }> = []

  const chargingCategories = ['home-sk', 'domestic-roaming', 'international-roaming']

  for (const providerPricing of dataset.providers) {
    const providerMeta = PROVIDERS.find(p => p.id === providerPricing.providerId)
    if (!providerMeta) continue

    for (const plan of providerPricing.plans) {
      const planMeta = providerMeta.plans.find(p => p.id === plan.planId)
      if (!planMeta) continue

      let price: PriceValue | null = null
      let note: string | undefined

      if (chargingType && chargingCategories.includes(categoryId)) {
        price = getChargingPrice(plan, categoryId as 'home-sk' | 'domestic-roaming' | 'international-roaming', chargingType)
        note = getChargingNote(plan, categoryId as 'home-sk' | 'domestic-roaming' | 'international-roaming')
      }
      else {
        price = getSimplePrice(plan, categoryId)
      }

      results.push({
        providerId: providerPricing.providerId,
        providerName: providerMeta.name,
        providerColor: providerMeta.colorHex,
        planId: plan.planId,
        planName: planMeta.name,
        price,
        monthlyFee: plan['monthly-fee'] ?? null,
        note,
      })
    }
  }

  // Sort by price ascending (nulls/N/A last)
  return results.sort((a, b) => {
    if (a.price === null || a.price.amount === null) return 1
    if (b.price === null || b.price.amount === null) return -1
    return a.price.amount - b.price.amount
  })
}
