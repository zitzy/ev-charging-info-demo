<template>
  <span :class="colorClass" class="text-xs font-bold px-1.5 py-0.5 rounded">
    {{ type }}
  </span>
</template>

<script setup lang="ts">
import type { ChargingType } from '~/types/pricing'

const props = defineProps<{ type: ChargingType }>()

const colorClass = computed(() => ({
  AC: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  DC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  UFC: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}[props.type]))
</script>
