<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <span class="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
          TOSK <span class="text-gray-400 font-normal">/ Nabíjanie</span>
        </span>
      </NuxtLink>
      <div class="flex items-center gap-2">
        <UButton
          v-for="variant in variants"
          :key="variant.path"
          :to="variant.path"
          :label="variant.label"
          size="sm"
          :variant="isActive(variant.path) ? 'solid' : 'ghost'"
          :color="isActive(variant.path) ? 'primary' : 'neutral'"
          class="hidden sm:inline-flex"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()

const variants = [
  { path: '/variant-a', label: 'A: Tabuľka' },
  { path: '/variant-b', label: 'B: Karty' },
  { path: '/variant-c', label: 'C: Kategórie' },
  { path: '/variant-d', label: 'D: Porovnanie' },
]

function isActive(path: string) {
  return route.path === path
}
</script>
