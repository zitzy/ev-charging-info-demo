<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Nabíjanie — Porovnanie cien</h1>
      <p class="text-sm text-gray-500 mb-3">Variant B — Karty poskytovateľov</p>
      <DataFreshness
        v-if="pricing"
        :last-updated="pricing.lastUpdated"
        :data-source="pricing.dataSource"
      />
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      Chyba pri načítaní dát: {{ error.message }}
    </div>
    <div v-else-if="pricing" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <VariantBProviderCard
        v-for="provider in PROVIDERS"
        :key="provider.id"
        :provider="provider"
        :pricing="pricing"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PROVIDERS } from '~/composables/useProviders'

const { pricing, loading, error } = usePricingData()
</script>
