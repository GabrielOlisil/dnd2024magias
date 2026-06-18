// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@nuxtjs/sitemap'],
  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      /* vuetify options */
    }
  },
  site: {
    url: 'https://dndmagias.letsplaysrpg.com',
    name: 'Magias D&D 2024 em Português'
  },
  sitemap: {
    zeroRuntime: true
  },
  app: {
    baseURL: '/',
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }
      ],
      link: [
        {
          rel: 'canonical',
          href: 'https://dndmagias.letsplaysrpg.com'
        },
        { rel: 'icon', type: 'image/x-icon', href: 'favicon.png' }
      ]
    }
  }
})