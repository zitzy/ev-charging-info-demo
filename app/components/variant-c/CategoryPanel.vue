<template>
  <div>
    <!-- Simple category: one grid showing all providers+plans -->
    <div v-if="!category.hasChargingTypes" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <template v-for="provider in PROVIDERS" :key="provider.id">
        <div
          v-for="plan in provider.plans"
          :key="plan.id"
          class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div
            class="px-3 py-1.5 text-white text-xs font-bold"
            :style="{ backgroundColor: provider.colorHex }"
          >
            {{ provider.name }}
          </div>
          <div class="px-3 py-2">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ plan.name }}</div>
            <div class="text-base font-semibold text-gray-900 dark:text-white">
              <PriceCell :value="getPlanSimplePrice(provider.id, plan.id)" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Charging-type category: grouped by AC/DC/UFC -->
    <div v-else class="space-y-6">
      <div v-for="chargingType in CHARGING_TYPES" :key="chargingType">
        <div class="flex items-center gap-2 mb-3">
          <ChargingTypeBadge :type="chargingType" />
          <span class="text-sm text-gray-600 dark:text-gray-400">nabíjanie</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <template v-for="provider in PROVIDERS" :key="provider.id">
            <div
              v-for="plan in provider.plans"
              :key="plan.id"
              class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              :class="isChargingCheapest(provider.id, plan.id, chargingType) ? 'ring-2 ring-green-500' : ''"
            >
              <div
                class="px-3 py-1.5 text-white text-xs font-bold"
                :style="{ backgroundColor: provider.colorHex }"
              >
                {{ provider.name }}
              </div>
              <div class="px-3 py-2">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ plan.name }}</div>
                <div class="text-base font-semibold text-gray-900 dark:text-white">
                  <PriceCell
                    :value="getPlanChargingPrice(provider.id, plan.id, chargingType)"
                    :highlighted="isChargingCheapest(provider.id, plan.id, chargingType)"
                  />
                </div>
                <div
                  v-if="isChargingCheapest(provider.id, plan.id, chargingType)"
                  class="text-xs text-green-600 dark:text-green-400 mt-1 font-medium"
                >
                  najlacnejšie
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PricingDataset, PriceCategory, ProviderId, ChargingType, PriceCategoryId } from '~/types/pricing'
import { getSimplePrice, getChargingPrice } from '~/utils/pricing-helpers'

const props = defineProps<{
  category: PriceCategory
  pricing: PricingDataset
}>()

function getProviderPlans(providerId: ProviderId) {
  return props.pricing.providers.find(p => p.providerId === providerId)
}

function getPlanSimplePrice(providerId: ProviderId, planId: string) {
  const plan = getProviderPlans(providerId)?.plans.find(p => p.planId === planId)
  if (!plan) return null
  return getSimplePrice(plan, props.category.id)
}

function getPlanChargingPrice(providerId: ProviderId, planId: string, chargingType: ChargingType) {
  const plan = getProviderPlans(providerId)?.plans.find(p => p.planId === planId)
  if (!plan) return null
  return getChargingPrice(plan, props.category.id as 'home-sk' | 'domestic-roaming' | 'international-roaming', chargingType)
}

// Find cheapest price across all plans for a given charging type
const cheapestByType = computed(() => {
  const result: Record<ChargingType, number | null> = { AC: null, DC: null, UFC: null }
  if (!props.category.hasChargingTypes) return result
  for (const type of CHARGING_TYPES) {
    let min: number | null = null
    for (const provider of PROVIDERS) {
      for (const plan of provider.plans) {
        const price = getPlanChargingPrice(provider.id, plan.id, type)
        if (price?.amount !== null && price?.amount !== undefined) {
          min = min === null ? price.amount : Math.min(min, price.amount)
        }
      }
    }
    result[type] = min
  }
  return result
})

function isChargingCheapest(providerId: ProviderId, planId: string, chargingType: ChargingType): boolean {
  const price = getPlanChargingPrice(providerId, planId, chargingType)
  if (price?.amount === null || price === null) return false
  return price.amount === cheapestByType.value[chargingType]
}
</script>
