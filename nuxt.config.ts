// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  devtools: { enabled: true },
  ssr: false,
  
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxt/content', '@pinia/nuxt'],
  
  components: {
    global: true,
    dirs: [
      '~/components'
    ]
  },

  css: ['~/assets/css/main.css'],
  
  app: {
    head: {
      titleTemplate: 'Shop System United',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Meta description' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  
  vue: {},
  
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 8000,
        clientPort: 8000,
        path: '/__vite_hmr',
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiPath: process.env.NUXT_PUBLIC_API_PATH,
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || ''
    }
  },
  
  content: {
    watch: { enabled: false },
  },
})