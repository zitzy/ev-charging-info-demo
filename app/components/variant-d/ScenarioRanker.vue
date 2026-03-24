<template>
  <div>
    <!-- Scenario selectors -->
    <div class="flex flex-col sm:flex-row sm:items-stretch gap-4 mb-8">
      <div class="flex-1 flex flex-col">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Typ nabíjania</p>
        <div class="flex flex-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            v-for="type in CHARGING_TYPES"
            :key="type"
            class="flex-1 py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap"
            :class="selectedType === type
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="selectedType = type"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sieť</p>
        <div class="flex flex-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            v-for="ctx in NETWORK_CONTEXTS"
            :key="ctx.id"
            class="flex-1 py-2 px-2 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap"
            :class="selectedContext === ctx.id
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="selectedContext = ctx.id"
          >
            {{ ctx.label }}
            <UIcon
              v-if="ctx.id === 'international-roaming'"
              name="i-lucide-info"
              class="w-3 h-3 opacity-70 flex-shrink-0"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- International roaming time-billing notice -->
    <div
      v-if="selectedContext === 'international-roaming'"
      class="flex gap-2.5 p-3 mb-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300"
    >
      <UIcon name="i-lucide-clock" class="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p class="text-xs leading-snug">
        <strong>Ceny za hodinu, nie za kWh.</strong> Pri medzinárodnom roamingu väčšina sietí účtuje podľa času stráveného na nabíjačke — nie podľa odobratej energie. Porovnanie s domácimi cenami preto nie je priame.
      </p>
    </div>

    <!-- Ranked results -->
    <div class="space-y-3">
      <template v-for="(item, idx) in rankedResults" :key="`${item.providerId}-${item.planId}`">
        <div
          class="flex items-center gap-4 p-4 rounded-xl border transition-all"
          :class="idx === 0 && item.price?.amount !== null
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'"
        >
          <!-- Rank -->
          <div
            class="text-xl font-bold w-8 text-center flex-shrink-0"
            :class="idx === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'"
          >
            {{ idx + 1 }}
          </div>

          <!-- Provider + Plan -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                class="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: item.providerColor }"
              />
              <span class="font-semibold text-gray-900 dark:text-white text-sm">{{ item.providerName }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {{ item.planName }}
              </span>
              <span
                v-if="item.monthlyFee?.amount != null"
                class="text-xs text-gray-400 dark:text-gray-500"
              >
                {{ item.monthlyFee.amount === 0 ? 'bez poplatku' : `+ ${formatPrice(item.monthlyFee)}` }}
              </span>
            </div>

            <!-- Price bar -->
            <div v-if="item.price?.amount !== null && item.price !== null && maxPrice > 0" class="mt-2">
              <div class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${(item.price.amount! / maxPrice) * 100}%`,
                    backgroundColor: item.providerColor,
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="text-right flex-shrink-0">
            <div
              v-if="item.price?.amount !== null && item.price !== null"
              class="text-lg font-bold"
              :class="idx === 0 ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'"
            >
              {{ formatPrice(item.price) }}
            </div>
            <div v-else-if="item.price?.note" class="text-sm text-gray-400 italic">{{ item.price.note }}</div>
            <div v-else class="text-sm text-gray-400">—</div>

            <!-- Best price badge -->
            <div
              v-if="idx === 0 && item.price?.amount !== null"
              class="text-xs text-green-600 dark:text-green-400 font-medium"
            >
              najlacnejšie
            </div>

            <!-- Time-based billing tag -->
            <div
              v-if="item.price?.unit === 'EUR/h'"
              class="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-0.5"
            >
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              za hodinu
            </div>
          </div>
        </div>
      </template>
    </div>

    <p class="text-xs text-gray-400 mt-4 text-center">
      Radené od najlacnejšieho podľa ceny za kWh.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PricingDataset, ChargingType, PriceCategoryId } from '~/types/pricing'
import { getRankedPrices } from '~/utils/pricing-helpers'

const props = defineProps<{ pricing: PricingDataset }>()

const NETWORK_CONTEXTS = [
  { id: 'home-sk' as PriceCategoryId, label: 'Domáca SK' },
  { id: 'domestic-roaming' as PriceCategoryId, label: 'Domáci roaming' },
  { id: 'international-roaming' as PriceCategoryId, label: 'Medzinárodný' },
]

const selectedType = ref<ChargingType>('DC')
const selectedContext = ref<PriceCategoryId>('home-sk')

const rankedResults = computed(() =>
  getRankedPrices(props.pricing, selectedContext.value, selectedType.value),
)

const maxPrice = computed(() => {
  const amounts = rankedResults.value
    .map(r => r.price?.amount)
    .filter((a): a is number => a !== null && a !== undefined)
  return Math.max(...amounts, 0)
})
</script>
