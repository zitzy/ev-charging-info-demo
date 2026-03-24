<template>
  <div class="relative">
    <!-- Scroll fade indicators -->
    <div
      class="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-r from-white dark:from-gray-950 to-transparent transition-opacity duration-200"
      :class="scrollLeft > 10 ? 'opacity-100' : 'opacity-0'"
    />
    <div
      class="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-l from-white dark:from-gray-950 to-transparent transition-opacity duration-200"
      :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
    />

    <div
      ref="scrollContainer"
      class="overflow-x-auto"
      @scroll="onScroll"
    >
      <table class="border-collapse text-sm" style="min-width: 900px">
        <thead>
          <!-- Row 1: Provider names (color-coded) -->
          <tr>
            <th class="sticky left-0 z-10 bg-white dark:bg-gray-950 w-44 min-w-[176px] p-3 text-left" />
            <th class="w-6 min-w-[24px]" /><!-- charging type column -->
            <th
              v-for="provider in PROVIDERS"
              :key="provider.id"
              :colspan="provider.plans.length"
              class="text-center text-white font-bold py-2 px-3 text-sm"
              :style="{ backgroundColor: provider.colorHex }"
            >
              {{ provider.name }}
            </th>
          </tr>
          <!-- Row 2: Plan names -->
          <tr>
            <th class="sticky left-0 z-10 bg-white dark:bg-gray-950 p-3 text-left text-gray-500 dark:text-gray-400 font-normal text-xs">
              Kategória
            </th>
            <th class="w-6 min-w-[24px]" />
            <template v-for="provider in PROVIDERS" :key="provider.id">
              <th
                v-for="plan in provider.plans"
                :key="plan.id"
                class="text-center py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                :style="{ borderTopColor: provider.colorHex, borderTopWidth: '3px' }"
                style="min-width: 80px"
              >
                {{ plan.name }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <template v-for="category in PRICE_CATEGORIES" :key="category.id">
            <!-- Simple category: one row -->
            <tr
              v-if="!category.hasChargingTypes"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td class="sticky left-0 z-10 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 p-3 font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight w-44">
                {{ category.labelSk }}
              </td>
              <td />
              <template v-for="provider in PROVIDERS" :key="provider.id">
                <td
                  v-for="plan in provider.plans"
                  :key="plan.id"
                  class="text-center py-2 px-2"
                  :class="getCategoryBg(category.id)"
                >
                  <PriceCell :value="getPlanSimplePrice(provider.id, plan.id, category.id)" />
                </td>
              </template>
            </tr>
            <!-- Charging-type category: 3 sub-rows (AC, DC, UFC) -->
            <template v-else>
              <tr
                v-for="(chargingType, idx) in CHARGING_TYPES"
                :key="`${category.id}-${chargingType}`"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td
                  v-if="idx === 0"
                  rowspan="3"
                  class="sticky left-0 z-10 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 p-3 font-medium text-gray-800 dark:text-gray-200 text-sm w-44 align-top"
                >
                  {{ category.labelSk }}
                </td>
                <td class="py-2 pl-2 pr-1">
                  <ChargingTypeBadge :type="chargingType" />
                </td>
                <template v-for="provider in PROVIDERS" :key="provider.id">
                  <td
                    v-for="plan in provider.plans"
                    :key="plan.id"
                    class="text-center py-2 px-2"
                    :class="getCategoryBg(category.id)"
                  >
                    <PriceCell :value="getPlanChargingPrice(provider.id, plan.id, category.id, chargingType)" />
                  </td>
                </template>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile scroll hint -->
    <p v-if="showScrollHint" class="text-xs text-gray-400 text-center mt-2 sm:hidden">
      ← Potiahnite pre viac stĺpcov →
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PricingDataset, ProviderId, PriceCategoryId, ChargingType } from '~/types/pricing'
import { getSimplePrice, getChargingPrice } from '~/utils/pricing-helpers'

const props = defineProps<{ pricing: PricingDataset }>()
const scrollContainer = ref<HTMLElement | null>(null)
const scrollLeft = ref(0)
const canScrollRight = ref(true)
const showScrollHint = ref(false)

onMounted(() => {
  showScrollHint.value = window.innerWidth < 640
  updateScrollState()
})

function onScroll() {
  updateScrollState()
}

function updateScrollState() {
  const el = scrollContainer.value
  if (!el) return
  scrollLeft.value = el.scrollLeft
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

function getProviderPricing(providerId: ProviderId) {
  return props.pricing.providers.find(p => p.providerId === providerId)
}

function getPlanData(providerId: ProviderId, planId: string) {
  return getProviderPricing(providerId)?.plans.find(p => p.planId === planId)
}

function getPlanSimplePrice(providerId: ProviderId, planId: string, categoryId: PriceCategoryId) {
  const plan = getPlanData(providerId, planId)
  if (!plan) return null
  return getSimplePrice(plan, categoryId)
}

function getPlanChargingPrice(providerId: ProviderId, planId: string, categoryId: PriceCategoryId, chargingType: ChargingType) {
  const plan = getPlanData(providerId, planId)
  if (!plan) return null
  return getChargingPrice(plan, categoryId as 'home-sk' | 'domestic-roaming' | 'international-roaming', chargingType)
}

function getCategoryBg(categoryId: PriceCategoryId) {
  const chargingCats = ['home-sk', 'domestic-roaming', 'international-roaming']
  return chargingCats.includes(categoryId) ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''
}
</script>
