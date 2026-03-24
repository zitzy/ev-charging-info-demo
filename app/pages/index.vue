<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Nabíjanie EV na Slovensku
      </h1>
      <p class="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
        Porovnanie cien nabíjania pre Tesla a ďalšie elektromobily. Vyber štýl zobrazenia, ktorý ti najviac vyhovuje.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="variant in variants"
        :key="variant.path"
        :to="variant.path"
        class="group relative rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-200"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            :class="variant.bgClass"
          >
            {{ variant.emoji }}
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Variant {{ variant.letter }}
              </span>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ variant.title }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ variant.description }}
            </p>
          </div>
        </div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors">
          →
        </div>
      </NuxtLink>
    </div>

    <div class="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
      <p class="text-sm text-amber-700 dark:text-amber-400">
        <strong>Demo verzia</strong> — Dáta sú scrapeované automaticky z webov poskytovateľov.
        Pred rozhodnutím o tarifu si vždy over aktuálny cenník priamo u poskytovateľa.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const variants = [
  {
    path: '/variant-a',
    letter: 'A',
    emoji: '📊',
    title: 'Responzívna tabuľka',
    description: 'Klasická tabuľka s posuvom doprava na mobile. Poskytovateľská farebné záhlavie, fixný prvý stĺpec.',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  {
    path: '/variant-b',
    letter: 'B',
    emoji: '🃏',
    title: 'Karty poskytovateľov',
    description: 'Každý poskytovateľ ako samostatná karta. Na mobile 1 stĺpec, na deskope 2–4.',
    bgClass: 'bg-green-50 dark:bg-green-900/30',
  },
  {
    path: '/variant-c',
    letter: 'C',
    emoji: '🗂',
    title: 'Prehľad podľa kategórií',
    description: 'Vyber kategóriu (napr. DC nabíjanie) a porovnaj všetkých poskytovateľov naraz. Akordeón na mobile.',
    bgClass: 'bg-purple-50 dark:bg-purple-900/30',
  },
  {
    path: '/variant-d',
    letter: 'D',
    emoji: '💶',
    title: 'Nájdi najlacnejšie',
    description: 'Vyber typ nabíjania a sieť. Poskytovatelia sa zoradí od najlacnejšieho po najdrahšie.',
    bgClass: 'bg-orange-50 dark:bg-orange-900/30',
  },
]
</script>
