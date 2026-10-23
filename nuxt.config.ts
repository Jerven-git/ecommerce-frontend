const apexEntryLoaderCriticalCss = `
  .apex-entry-loader {
    position: fixed;
    z-index: 11000;
    inset: 0;
    display: flex;
    min-height: 100vh;
    min-height: 100svh;
    flex-direction: column;
    overflow: hidden;
    background: #fcfcfc;
    color: #1a1a1a;
    font-family: 'Space Grotesk', Inter, Arial, sans-serif;
  }

  .apex-entry-loader__header,
  .apex-entry-loader__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-inline: clamp(1.25rem, 4vw, 4.5rem);
  }

  .apex-entry-loader__header {
    min-height: 5rem;
    border-bottom: 1px solid #e9e9e7;
  }

  .apex-entry-loader__brand {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .apex-entry-loader__status {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: #626262;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .apex-entry-loader__status > span {
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 50%;
    background: #285095;
    animation: apex-entry-critical-pulse 900ms ease-in-out infinite alternate;
  }

  .apex-entry-loader__body {
    display: flex;
    width: min(calc(100% - 2.5rem), 78rem);
    flex: 1;
    flex-direction: column;
    justify-content: center;
    margin-inline: auto;
    padding-block: 3rem;
  }

  .apex-entry-loader__statement {
    margin: 0;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 7.5vw, 6rem);
    font-weight: 600;
    line-height: 1.04;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .apex-entry-loader__statement span { color: #676767; }

  .apex-entry-loader__progress {
    position: relative;
    width: min(100%, 32rem);
    height: 1px;
    margin-top: clamp(2rem, 5vw, 4rem);
    overflow: hidden;
    background: #cfcfca;
  }

  .apex-entry-loader__progress span {
    position: absolute;
    inset: 0;
    background: #1a1a1a;
    transform: scaleX(0);
    transform-origin: left;
    animation: apex-entry-critical-progress 1.15s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  .apex-entry-loader__footer {
    min-height: 4.5rem;
    border-top: 1px solid #e9e9e7;
    color: #626262;
    font-size: 0.72rem;
    font-weight: 600;
  }

  @keyframes apex-entry-critical-progress {
    0% { transform: scaleX(0); transform-origin: left; }
    48% { transform: scaleX(1); transform-origin: left; }
    52% { transform: scaleX(1); transform-origin: right; }
    100% { transform: scaleX(0); transform-origin: right; }
  }

  @keyframes apex-entry-critical-pulse {
    from { opacity: 0.35; transform: scale(0.78); }
    to { opacity: 1; transform: scale(1); }
  }

  @media (max-width: 560px) {
    .apex-entry-loader__header { min-height: 4.5rem; }
    .apex-entry-loader__body { padding-block: 2.5rem; }
    .apex-entry-loader__statement { font-size: clamp(2.8rem, 14vw, 4.25rem); }
    .apex-entry-loader__footer {
      align-items: flex-start;
      flex-direction: column;
      justify-content: center;
      gap: 0.2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .apex-entry-loader *,
    .apex-entry-loader *::before,
    .apex-entry-loader *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }

    .apex-entry-loader__progress span { transform: scaleX(0.72); }
  }
`

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  // Keep generated Nuxt artifacts in the project-owned directory. Nuxt 4's
  // node_modules cache default can be owned by the container user, which makes
  // local production builds fail before compilation begins.
  buildDir: process.env.NUXT_BUILD_DIR || '.nuxt',
  // DevTools exposes development-only RPC and project metadata endpoints.
  // Never include it in preview or production server builds.
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  ssr: true,

  routeRules: {
    '/admin/**': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/super-admin/**': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/register': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/subscribe': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/cart': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/checkout': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/favorites': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/tracking': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/order-success': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/payment/**': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
    '/backorder/pay/**': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow, noarchive' },
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@pinia/nuxt', '@nuxt/fonts'],

  fonts: {
    // Tenant-selected fonts are applied through runtime CSS variables, so the
    // families remain global. Limit every family to the faces the storefront
    // actually uses instead of generating italic and non-Latin variants too.
    defaults: {
      styles: ['normal'],
      subsets: ['latin'],
      preload: false,
    },
    // Font choice is driven by admin settings at runtime (via CSS variables),
    // so the @font-face scanner can't detect which families are used.
    // `global: true` forces each family to be injected on every page regardless.
    // Weight set kept minimal (regular/semibold/bold) — light/medium weights
    // are rarely used in body or headings and roughly double the font payload.
    families: [
      // Sans-serif (UI / general)
      { name: 'Inter', weights: [400, 600, 700], global: true },
      { name: 'Poppins', weights: [400, 600, 700], global: true },
      { name: 'Roboto', weights: [400, 700], global: true },
      { name: 'Lato', weights: [400, 700], global: true },
      { name: 'Montserrat', weights: [400, 600, 700], global: true },
      { name: 'Open Sans', weights: [400, 600, 700], global: true },
      { name: 'Nunito', weights: [400, 600, 700], global: true },
      { name: 'Work Sans', weights: [400, 600, 700], global: true },
      { name: 'DM Sans', weights: [400, 700], global: true },
      { name: 'Raleway', weights: [400, 600, 700], global: true },
      { name: 'Fira Sans', weights: [400, 600, 700], global: true },
      // Serif (editorial / premium)
      { name: 'Playfair Display', weights: [400, 600, 700], global: true },
      { name: 'Merriweather', weights: [400, 700], global: true },
      { name: 'Lora', weights: [400, 600, 700], global: true },
      { name: 'Crimson Pro', weights: [400, 600, 700], global: true },
      { name: 'Libre Baskerville', weights: [400, 700], global: true },
      // Display / headings
      { name: 'Bebas Neue', weights: [400], global: true },
      { name: 'Oswald', weights: [400, 600, 700], global: true },
      { name: 'Archivo Black', weights: [400], global: true },
      { name: 'Space Grotesk', weights: [400, 600, 700], global: true },
    ],
  },

  // Keep Nuxt's component auto-imports, but only include components used by a
  // route. Global registration imported the entire component tree on every page.
  components: {
    dirs: ['~/components'],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'DATABASY',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [],
      // The SSR entry loader is emitted before the page and must be styled
      // before external CSS arrives, otherwise hard refreshes expose raw HTML.
      style: [
        {
          key: 'apex-entry-loader-critical',
          innerHTML: apexEntryLoaderCriticalCss,
        },
      ],
    },
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  vue: {},

  vite: {
    optimizeDeps: {
      include: [
        'vue3-apexcharts',
        'country-state-city',
        'i18n-iso-countries',
        'philippines',
        'marked',
        'isomorphic-dompurify',
        'motion-v',
        'laravel-echo',
        'pusher-js',
      ],
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 24678,
        clientPort: 8000,
        path: '/__vite_hmr',
      },
      watch: {
        // Native filesystem events are substantially cheaper. Polling remains
        // available for Docker hosts that do not propagate file events.
        usePolling: process.env.NUXT_VITE_USE_POLLING === 'true',
        interval: Number(process.env.NUXT_VITE_POLL_INTERVAL || 1000),
        ignored: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**'],
      },
    },
  },

  runtimeConfig: {
    // Used only by Nitro during SSR. In Docker this points to nginx on the
    // internal network; a local non-Docker dev server falls back to the public
    // API origin.
    apiBase: process.env.NUXT_API_BASE || process.env.NUXT_PUBLIC_API_BASE || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiPath: process.env.NUXT_PUBLIC_API_PATH,
      staticGeneration: process.env.NUXT_PUBLIC_STATIC_GENERATION === 'true',
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || '',
      storefrontBaseDomain: process.env.NUXT_PUBLIC_STOREFRONT_BASE_DOMAIN || 'localhost',
      seoIndexingEnabled: process.env.NUXT_PUBLIC_SEO_INDEXING_ENABLED
        ? process.env.NUXT_PUBLIC_SEO_INDEXING_ENABLED === 'true'
        : process.env.NODE_ENV === 'production',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || '',
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || 'localhost',
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || '8080',
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'http'
    }
  },

})
