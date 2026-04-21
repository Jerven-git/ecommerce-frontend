// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  devtools: { enabled: true },
  ssr: false,
  
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxt/content', '@pinia/nuxt', '@nuxt/fonts'],

  fonts: {
    // Font choice is driven by admin settings at runtime (via CSS variables),
    // so the @font-face scanner can't detect which families are used.
    // `global: true` forces each family to be injected on every page regardless.
    families: [
      // Sans-serif (UI / general)
      { name: 'Inter',             weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Poppins',           weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Roboto',            weights: [300, 400, 500, 700],      global: true },
      { name: 'Lato',              weights: [300, 400, 700],           global: true },
      { name: 'Montserrat',        weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Open Sans',         weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Nunito',            weights: [300, 400, 600, 700],      global: true },
      { name: 'Work Sans',         weights: [300, 400, 500, 600, 700], global: true },
      { name: 'DM Sans',           weights: [400, 500, 700],           global: true },
      { name: 'Raleway',           weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Fira Sans',         weights: [300, 400, 500, 600, 700], global: true },
      // Serif (editorial / premium)
      { name: 'Playfair Display',  weights: [400, 500, 600, 700],      global: true },
      { name: 'Merriweather',      weights: [300, 400, 700],           global: true },
      { name: 'Lora',              weights: [400, 500, 600, 700],      global: true },
      { name: 'Crimson Pro',       weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Libre Baskerville', weights: [400, 700],                global: true },
      // Display / headings
      { name: 'Bebas Neue',        weights: [400],                     global: true },
      { name: 'Oswald',            weights: [300, 400, 500, 600, 700], global: true },
      { name: 'Archivo Black',     weights: [400],                     global: true },
      { name: 'Space Grotesk',     weights: [300, 400, 500, 600, 700], global: true },
    ],
  },
  
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
        { 'http-equiv': 'pragma', content: 'no-cache' },
        { 'http-equiv': 'cache-control', content: 'no-cache' },
        { 'http-equiv': 'expires', content: '0' }
      ],
      link: [],
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
        host: '0.0.0.0',
        port: 24678,
        clientPort: 8000,
        path: '/__vite_hmr',
      },
      watch: {
        usePolling: true,
        interval: 2000,
        ignored: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**'],
      },
    },
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiPath: process.env.NUXT_PUBLIC_API_PATH,
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || '',
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || 'localhost',
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || '8080',
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'http'
    }
  },
  
  content: {
    watch: { enabled: false },
  },
})