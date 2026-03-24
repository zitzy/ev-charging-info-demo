export default defineNuxtConfig({
  compatibilityDate: "2025-03-24",
  devtools: { enabled: true },

  modules: ["@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "Porovnanie cien nabíjania | TOSK Demo",
      meta: [
        {
          name: "description",
          content: "Porovnanie cien nabíjania elektromobilov na Slovensku",
        },
      ],
    },
  },

  // @ts-expect-error – `nitro` is valid at runtime (https://nuxt.com/docs/4.x/api/nuxt-config#nitro)
  // but @nuxt/schema@4.4.2 incorrectly types it as `never`
  nitro: {
    experimental: { tasks: true },
    scheduledTasks: {
      "0 6 * * *": ["pricing:update"],
    },
  },
});
