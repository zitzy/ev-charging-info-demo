<template>
  <div>
    <!-- Desktop: horizontal tabs -->
    <div class="hidden sm:block">
      <div class="flex gap-1 flex-wrap mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          v-for="cat in PRICE_CATEGORIES"
          :key="cat.id"
          class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px"
          :class="selected === cat.id
            ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
          @click="selected = cat.id"
        >
          {{ cat.labelSk }}
        </button>
      </div>
    </div>

    <!-- Mobile: accordion -->
    <div class="sm:hidden mb-6 space-y-2">
      <div
        v-for="cat in PRICE_CATEGORIES"
        :key="cat.id"
        class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <button
          class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors"
          :class="selected === cat.id
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900'"
          @click="selected = selected === cat.id ? null : cat.id"
        >
          {{ cat.labelSk }}
          <UIcon
            :name="selected === cat.id ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
            class="w-4 h-4"
          />
        </button>
        <div v-if="selected === cat.id" class="p-3 bg-gray-50 dark:bg-gray-800/50">
          <VariantCCategoryPanel :category="cat" :pricing="pricing" />
        </div>
      </div>
    </div>

    <!-- Desktop: panel content -->
    <div v-if="selectedCategory" class="hidden sm:block">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ selectedCategory.labelSk }}
      </h2>
      <VariantCCategoryPanel :category="selectedCategory" :pricing="pricing" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PricingDataset, PriceCategoryId } from '~/types/pricing'

const props = defineProps<{ pricing: PricingDataset }>()

const selected = ref<PriceCategoryId | null>(PRICE_CATEGORIES[0]?.id ?? null)
const selectedCategory = computed(() =>
  PRICE_CATEGORIES.find(c => c.id === selected.value),
)
</script>
