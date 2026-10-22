// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  nitro: {
    preset: 'static',

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
});
