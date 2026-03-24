<template>
  <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
    <span :class="isStale ? 'text-amber-500' : 'text-green-600 dark:text-green-400'">
      ●
    </span>
    <span>
      <span v-if="isStale" class="text-amber-600 dark:text-amber-400 font-medium">Staré dáta — </span>
      <span>posledná aktualizácia: <time :datetime="lastUpdated">{{ formattedDate }}</time></span>
    </span>
    <span v-if="dataSource === 'seed'" class="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
      seed data
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  lastUpdated: string
  dataSource: 'seed' | 'scraped'
}>()

const formattedDate = computed(() => {
  return new Date(props.lastUpdated).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Consider data stale if older than 7 days
const isStale = computed(() => {
  const age = Date.now() - new Date(props.lastUpdated).getTime()
  return age > 7 * 24 * 60 * 60 * 1000
})
</script>
