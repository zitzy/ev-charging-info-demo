<template>
  <span v-if="!value" class="text-gray-400">—</span>
  <span v-else-if="value.amount === null && value.note" class="text-xs text-gray-400 italic">{{ value.note }}</span>
  <span v-else-if="value.amount === null" class="text-gray-400">—</span>
  <span v-else :class="highlighted ? 'font-semibold text-green-700 dark:text-green-400' : ''">
    {{ formatted }}
    <span v-if="value.note" class="block text-xs text-gray-400 font-normal">{{ value.note }}</span>
  </span>
</template>

<script setup lang="ts">
import type { PriceValue } from '~/types/pricing'

const props = defineProps<{
  value?: PriceValue | null
  highlighted?: boolean
}>()

const formatted = computed(() => formatPrice(props.value ?? null))
</script>
