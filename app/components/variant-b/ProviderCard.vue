<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
    <!-- Provider header -->
    <div
      class="px-4 py-3 text-white font-bold text-center text-lg"
      :style="{ backgroundColor: provider.colorHex }"
    >
      {{ provider.name }}
    </div>

    <!-- Scrollable plan grid: overflows only when columns can't fit at min-width -->
    <div class="overflow-x-auto">
      <div class="min-w-full">
        <!-- Plan name sub-headers -->
        <div
          v-if="provider.plans.length > 1"
          class="grid border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
          :style="{ gridTemplateColumns: `minmax(100px, auto) repeat(${provider.plans.length}, minmax(68px, 1fr))` }"
        >
          <div class="px-3 py-2 text-xs text-gray-500" />
          <div
            v-for="plan in provider.plans"
            :key="plan.id"
            class="px-2 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300"
            :style="{ borderTop: `3px solid ${provider.colorHex}` }"
          >
            {{ plan.name }}
          </div>
        </div>

        <!-- Pricing rows -->
        <div>
          <template v-for="category in PRICE_CATEGORIES" :key="category.id">
            <!-- Simple category -->
            <div
              v-if="!category.hasChargingTypes"
              class="grid border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
              :style="{ gridTemplateColumns: `minmax(100px, auto) repeat(${provider.plans.length}, minmax(68px, 1fr))` }"
            >
              <div class="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                {{ category.labelSk }}
              </div>
              <div
                v-for="plan in provider.plans"
                :key="plan.id"
                class="px-2 py-2 text-center text-sm"
              >
                <PriceCell :value="getPlanSimplePrice(plan.id, category.id)" />
              </div>
            </div>

            <!-- Charging-type category -->
            <template v-else>
              <div
                v-for="(chargingType, idx) in CHARGING_TYPES"
                :key="`${category.id}-${chargingType}`"
                class="grid border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                :style="{ gridTemplateColumns: `minmax(100px, auto) repeat(${provider.plans.length}, minmax(68px, 1fr))` }"
              >
                <div class="px-3 py-2 flex items-center gap-1.5">
                  <span v-if="idx === 0" class="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {{ category.labelSk }}
                  </span>
                  <ChargingTypeBadge :type="chargingType" />
                </div>
                <div
                  v-for="plan in provider.plans"
                  :key="plan.id"
                  class="px-2 py-2 text-center text-sm"
                >
                  <PriceCell :value="getPlanChargingPrice(plan.id, category.id, chargingType)" />
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PricingDataset, ProviderMeta, PriceCategoryId, ChargingType } from '~/types/pricing'
import { getSimplePrice, getChargingPrice } from '~/utils/pricing-helpers'

const props = defineProps<{
  provider: ProviderMeta
  pricing: PricingDataset
}>()

const providerPricing = computed(() =>
  props.pricing.providers.find(p => p.providerId === props.provider.id),
)

function getPlanData(planId: string) {
  return providerPricing.value?.plans.find(p => p.planId === planId)
}

function getPlanSimplePrice(planId: string, categoryId: PriceCategoryId) {
  const plan = getPlanData(planId)
  if (!plan) return null
  return getSimplePrice(plan, categoryId)
}

function getPlanChargingPrice(planId: string, categoryId: PriceCategoryId, chargingType: ChargingType) {
  const plan = getPlanData(planId)
  if (!plan) return null
  return getChargingPrice(plan, categoryId as 'home-sk' | 'domestic-roaming' | 'international-roaming', chargingType)
}
</script>
