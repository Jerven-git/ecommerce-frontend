<template>
  <div>
    <!-- ─────────────────────────  HERO  ───────────────────────── -->
    <section
      class="hero relative isolate flex overflow-hidden"
      :class="isFullBleed ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'"
      :style="heroStyle"
      :aria-label="heroAltText || undefined"
    >
      <!-- Video background (autoplay, muted, loop for performance) -->
      <video
        v-if="isHeroVideo && siteConfig?.hero_image_url"
        ref="heroVideoRef"
        class="absolute inset-0 h-full w-full object-cover"
        :style="{ objectPosition: heroFocalPosition }"
        :aria-label="heroAltText || undefined"
        autoplay
        loop
        muted
        playsinline
        preload="metadata"
        @canplay="videoReady = true"
      >
        <source :src="siteConfig.hero_image_url" />
      </video>

      <!-- Rich, theme-driven gradient when no hero media is set -->
      <template v-if="!siteConfig?.hero_image_url">
        <div class="hero-gradient absolute inset-0" aria-hidden="true" />
        <div class="hero-grain absolute inset-0" aria-hidden="true" />
      </template>

      <!-- Slide progress bar while hero media loads -->
      <Transition name="fade">
        <div v-if="mediaLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <!-- Admin overlay scrim (only over real media) -->
      <Transition name="fade">
        <div
          v-if="siteConfig?.hero_image_url && mediaReady"
          class="absolute inset-0"
          :style="{
            backgroundColor: siteConfig?.hero_overlay_color || '#000000',
            opacity: (siteConfig?.hero_overlay_opacity ?? 45) / 100,
          }"
        />
      </Transition>

      <!-- Editorial legibility gradient, weighted to the lower-left where the copy sits -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" aria-hidden="true" />

      <!-- Copy, anchored lower-left -->
      <div class="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-6 pb-20 pt-32 lg:px-8 lg:pb-28">
        <div class="max-w-2xl">
          <h1 class="hero-stagger display-1 font-bold text-white text-balance drop-shadow-sm" style="animation-delay: 0.15s">
            {{ heroTitle }}
          </h1>
          <p class="hero-stagger mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl" style="animation-delay: 0.35s">
            {{ heroSubtitle }}
          </p>
          <div class="hero-stagger mt-10 flex flex-wrap items-center gap-4" style="animation-delay: 0.55s">
            <NuxtLink to="/shop" class="hero-cta-primary">
              Shop Now
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
            <button type="button" class="hero-cta-ghost" @click="scrollToFeatured">
              Discover more
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Scroll cue -->
      <button
        type="button"
        class="hero-scroll hidden md:flex"
        aria-label="Scroll to products"
        @click="scrollToFeatured"
      >
        <span class="hero-scroll-track"><span class="hero-scroll-dot" /></span>
      </button>
    </section>

    <!-- ────────────────────  FEATURED PRODUCTS  ──────────────────── -->
    <section id="featured" class="bg-white py-24 lg:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref="featuredHeadingRef" class="reveal flex items-end justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <h2 class="display-2 font-bold text-gray-900">New Arrivals</h2>
            <p class="mt-3 max-w-md text-gray-600">Fresh additions to the shop, hand-picked and just in.</p>
          </div>
          <NuxtLink to="/shop" class="link-arrow mb-1 hidden shrink-0 sm:inline-flex">
            View all
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          <div v-for="i in 8" :key="i" class="animate-pulse">
            <div class="aspect-[4/5] rounded-xl bg-gray-100"></div>
            <div class="mx-auto mt-3.5 h-3.5 w-2/3 rounded bg-gray-100"></div>
            <div class="mx-auto mt-2 h-3 w-1/3 rounded bg-gray-100"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="mt-16 flex flex-col items-center text-center">
          <svg class="h-9 w-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 text-sm font-medium text-red-600">{{ error }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="products.length === 0" class="mt-16 flex flex-col items-center text-center">
          <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="mt-4 max-w-xs text-gray-500">New products are on their way — check back soon.</p>
          <NuxtLink to="/shop" class="btn-primary mt-6 inline-flex items-center gap-2">Browse the shop</NuxtLink>
        </div>

        <!-- Products: row 1 slides from right, row 2 slides from left -->
        <div v-else class="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            :ref="addFeaturedRevealRef"
            :class="['featured-card', Math.floor(index / 4) % 2 === 0 ? 'from-right' : 'from-left']"
            :style="{ animationDelay: `${Math.floor(index / 4) * 600 + (index % 4) * 100}ms` }"
          >
            <ProductCard :product="product" />
          </div>
        </div>

        <div :ref="addRevealRef" class="reveal mt-12 text-center sm:hidden">
          <NuxtLink to="/shop" class="link-arrow">
            View all products
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Showcase (admin-configurable promo block) -->
    <HomepageShowcase />

    <!-- Watch & Shop (admin-configurable video carousel) -->
    <HomepageWatchShop />

    <!-- Best Sellers (auto from order data, with admin-curated fallback) -->
    <HomepageBestSellers />

    <!-- ────────────────────────  HOW IT WORKS  ──────────────────────── -->
    <section class="section-accent py-24">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref="howItWorksHeadingRef" class="reveal max-w-2xl">
          <p v-if="stepsLabel" class="mb-3 text-sm font-medium" :style="{ color: 'var(--color-primary-700)' }">{{ stepsLabel }}</p>
          <h2 class="display-2 font-bold text-gray-900">{{ stepsHeading }}</h2>
          <p class="mt-4 text-lg text-gray-600">{{ stepsSubtitle }}</p>
        </div>

        <ol class="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-3">
          <li
            v-for="(step, i) in steps"
            :key="i"
            :ref="addRevealRef"
            class="reveal"
            :style="{ transitionDelay: `${0.1 + i * 0.12}s` }"
          >
            <div class="flex items-center gap-4">
              <span class="text-3xl font-bold tabular-nums" :style="{ color: 'var(--color-primary-600)', fontFamily: 'var(--font-heading)' }">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <span class="h-px flex-1 bg-gray-300"></span>
            </div>
            <h3 class="mt-5 text-lg font-semibold text-gray-900">{{ step.title }}</h3>
            <p class="mt-2 leading-relaxed text-gray-600">{{ step.description }}</p>
          </li>
        </ol>

        <div :ref="addRevealRef" class="reveal mt-14" style="transition-delay: 0.5s">
          <NuxtLink to="/shop" class="btn-primary inline-flex items-center gap-2">
            Start Shopping
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  FEATURE STRIP  ────────────────────── -->
    <section class="border-t border-gray-100 bg-white py-16">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid gap-y-10 md:grid-cols-3 md:gap-y-0">
          <div
            v-for="(feature, i) in features"
            :key="i"
            :ref="addRevealRef"
            class="reveal md:px-10 md:first:pl-0 md:last:pr-0"
            :class="i > 0 ? 'md:border-l md:border-gray-200' : ''"
            :style="{ transitionDelay: `${0.1 + i * 0.12}s` }"
          >
            <Icon :name="feature.icon ?? defaultFeatureIcons[i % defaultFeatureIcons.length]!" class="h-7 w-7" :style="{ color: 'var(--color-primary-600)' }" />
            <h3 class="mt-5 text-lg font-semibold text-gray-900">{{ feature.title }}</h3>
            <p class="mt-2 leading-relaxed text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  BY THE NUMBERS  ────────────────────── -->
    <section class="section-accent py-20">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            :ref="addRevealRef"
            class="reveal text-center md:px-8 md:text-left md:first:pl-0"
            :class="i > 0 ? 'md:border-l md:border-gray-300' : ''"
            :style="{ transitionDelay: `${i * 0.1}s` }"
          >
            <div class="text-4xl font-bold tabular-nums text-gray-900 md:text-5xl" :style="{ fontFamily: 'var(--font-heading)' }">{{ stat.value }}</div>
            <div class="mt-2 text-sm text-gray-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ────────────────────  STATEMENT (editorial)  ──────────────────── -->
    <section v-if="showStatement" class="border-t border-gray-100 bg-white py-24 lg:py-28">
      <div class="mx-auto max-w-6xl px-6 lg:px-8">
        <div class="grid items-center gap-10 lg:gap-16" :class="statement?.image_url ? 'md:grid-cols-2' : 'md:grid-cols-1'">
          <!-- Image -->
          <div v-if="statement?.image_url" :ref="addRevealRef" class="reveal">
            <img :src="statement.image_url" :alt="statement.attribution || statement.eyebrow || 'Statement'" class="aspect-[4/5] w-full rounded-2xl object-cover" />
          </div>

          <!-- Statement -->
          <div :ref="addRevealRef" class="reveal" :class="statement?.image_url ? '' : 'mx-auto max-w-3xl text-center'" style="transition-delay: 0.1s">
            <p v-if="statement?.eyebrow" class="mb-5 text-sm font-medium" :style="{ color: 'var(--color-primary-700)' }">{{ statement.eyebrow }}</p>
            <blockquote class="whitespace-pre-line text-[1.6rem] font-light leading-[1.4] text-gray-900 sm:text-3xl lg:text-[2.1rem]">{{ statement?.quote }}</blockquote>
            <div v-if="statement?.attribution" class="mt-7">
              <p class="text-sm font-semibold text-gray-900">{{ statement.attribution }}</p>
              <p v-if="statement.role" class="mt-0.5 text-xs text-gray-500">{{ statement.role }}</p>
            </div>
            <NuxtLink
              v-if="statement?.cta_label && statement?.cta_link"
              :to="statement.cta_link"
              class="link-arrow mt-8"
            >
              {{ statement.cta_label }}
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  NEWSLETTER  ────────────────────── -->
    <section class="relative overflow-hidden bg-secondary-900 py-24 text-white">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.06]"
        style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 22px 22px;"
        aria-hidden="true"
      />
      <div ref="newsletterRef" class="reveal relative mx-auto max-w-5xl px-6 lg:px-8">
        <div class="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p v-if="newsletterLabel" class="mb-3 text-sm font-medium text-white/60">{{ newsletterLabel }}</p>
            <h2 class="display-2 font-bold">{{ newsletterHeading }}</h2>
            <p class="mt-4 max-w-md text-white/70">{{ newsletterSubtitle }}</p>
          </div>
          <div>
            <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="subscribeNewsletter">
              <input
                v-model="newsletterEmail"
                type="email"
                placeholder="Enter your email"
                class="newsletter-input flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder-white/40 transition focus:border-transparent focus:outline-none focus:ring-2"
                :disabled="newsletterSubmitting"
              />
              <button
                type="submit"
                class="btn-primary shrink-0 disabled:opacity-50"
                :disabled="newsletterSubmitting || !newsletterEmail"
              >
                {{ newsletterSubmitting ? 'Subscribing…' : 'Subscribe' }}
              </button>
            </form>
            <p v-if="newsletterMsg" class="mt-4 text-sm font-medium text-white/90">{{ newsletterMsg }}</p>
            <p v-else class="mt-4 text-xs text-white/50">{{ newsletterDisclaimer }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { HomepageStep, HomepageFeature } from '~/composables/useSiteConfig'
import type { Product } from '~/types/product'

interface ProductsResponse {
  data: Product[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

const { $apiFetch } = useNuxtApp()
const { siteConfig } = useSiteConfig()

// Scroll reveal
const { revealRef: featuredHeadingRef } = useScrollReveal()
const { revealRef: howItWorksHeadingRef } = useScrollReveal()
const { revealRef: newsletterRef } = useScrollReveal()
const { addRevealRef } = useScrollRevealAll()
const { addRevealRef: addFeaturedRevealRef } = useScrollRevealAll({ threshold: 0.15 })

const defaultFeatureIcons = [
  'heroicons:cube',
  'heroicons:currency-dollar',
  'heroicons:bolt',
]

const defaultSteps: HomepageStep[] = [
  { icon: 'heroicons:magnifying-glass', title: 'Browse Products', description: 'Explore our wide selection of quality items across all categories.' },
  { icon: 'heroicons:shopping-cart', title: 'Add to Cart', description: 'Pick your favourites and add them to your cart with one click.' },
  { icon: 'heroicons:shield-check', title: 'Fast Checkout', description: 'Secure payment and fast delivery straight to your doorstep.' },
]

const defaultFeatures: HomepageFeature[] = [
  { icon: 'heroicons:cube', title: 'Quality Products', description: 'Carefully curated selection of premium items.' },
  { icon: 'heroicons:currency-dollar', title: 'Best Prices', description: 'Competitive pricing on all our products.' },
  { icon: 'heroicons:bolt', title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep.' },
]

// Editorial "Statement" band — shown only when enabled and a quote is written.
const statement = computed(() => siteConfig.value?.homepage_statement)
const showStatement = computed(() => !!(statement.value?.enabled && statement.value?.quote?.trim()))

const defaultStats = [
  { value: '500+', label: 'Products' },
  { value: '1,200+', label: 'Happy Customers' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support' },
]

const stepsConfig = computed(() => siteConfig.value?.homepage_steps)
const stepsLabel = computed(() => stepsConfig.value?.label || 'Simple & Easy')
const stepsHeading = computed(() => stepsConfig.value?.heading || 'How It Works')
const stepsSubtitle = computed(() => stepsConfig.value?.subtitle || 'Start shopping in just three easy steps — no hassle, no confusion.')
const steps = computed(() => stepsConfig.value?.items?.length ? stepsConfig.value.items : defaultSteps)

const features = computed(() => siteConfig.value?.homepage_features?.items?.length ? siteConfig.value.homepage_features.items : defaultFeatures)

const stats = computed(() => siteConfig.value?.homepage_stats?.items?.length ? siteConfig.value.homepage_stats.items : defaultStats)

const newsletterConfig = computed(() => siteConfig.value?.homepage_newsletter)
const newsletterLabel = computed(() => newsletterConfig.value?.label || 'Stay in the loop')
const newsletterHeading = computed(() => newsletterConfig.value?.heading || "Don't miss a deal.")
const newsletterSubtitle = computed(() => newsletterConfig.value?.subtitle || 'Get the latest products, exclusive offers, and updates delivered straight to your inbox.')
const newsletterDisclaimer = computed(() => newsletterConfig.value?.disclaimer || 'No spam, ever. Unsubscribe anytime.')

const heroTitle = computed(() => siteConfig.value?.hero_title || 'Welcome to Our Store')
const heroSubtitle = computed(() => siteConfig.value?.hero_subtitle || 'Discover amazing products')

const newsletterEmail = ref('')
const newsletterSubmitting = ref(false)
const newsletterMsg = ref('')

async function subscribeNewsletter() {
  if (!newsletterEmail.value || newsletterSubmitting.value) return
  newsletterSubmitting.value = true
  newsletterMsg.value = ''
  try {
    const res = await $apiFetch<{ message: string }>('/subscribe', {
      method: 'POST',
      body: { email: newsletterEmail.value, source: 'newsletter' },
    })
    newsletterMsg.value = res.message || 'Subscribed successfully!'
    newsletterEmail.value = ''
  } catch (err: any) {
    newsletterMsg.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    newsletterSubmitting.value = false
  }
}

function scrollToFeatured() {
  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const imageLoading = ref(false)
const imageLoaded = ref(false)
const videoReady = ref(false)
const heroVideoRef = ref<HTMLVideoElement | null>(null)

const isHeroVideo = computed(() => siteConfig.value?.hero_media_mime?.startsWith('video/'))
const isFullBleed = computed(() => siteConfig.value?.hero_full_bleed ?? false)
const heroFocalPosition = computed(
  () => `${siteConfig.value?.hero_focal_x ?? 50}% ${siteConfig.value?.hero_focal_y ?? 50}%`
)
const mediaLoading = computed(() => isHeroVideo.value ? !videoReady.value && !!siteConfig.value?.hero_image_url : imageLoading.value)
const mediaReady = computed(() => isHeroVideo.value ? videoReady.value : imageLoaded.value)

const heroStyle = computed(() => {
  const imageUrl = siteConfig.value?.hero_image_url

  if (imageUrl && isHeroVideo.value) {
    return { backgroundColor: '#1e293b' }
  }

  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url("${imageUrl}")` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: heroFocalPosition.value,
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1e293b',
    }
  }

  // No media — the layered `.hero-gradient` element paints the background.
  return {}
})


const preloadImage = (url: string) => {
  imageLoading.value = true
  imageLoaded.value = false

  const img = new Image()
  img.onload = () => {
    imageLoaded.value = true
    imageLoading.value = false
  }
  img.onerror = () => {
    imageLoading.value = false
  }
  img.src = url
}

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const productsResponse = await $apiFetch<ProductsResponse>('/products', {
      method: 'GET',
      query: {
        is_active: 1,
        limit: 8,
        sort: 'created_at',
        order: 'desc'
      }
    })

    if (productsResponse?.data) {
      products.value = productsResponse.data
    }
  } catch (err: any) {
    console.error('Error fetching data:', err)
    error.value = err?.data?.message || 'Failed to load products. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Preload hero media when siteConfig becomes available
watch(() => siteConfig.value?.hero_image_url, (url) => {
  videoReady.value = false
  if (url && !isHeroVideo.value) preloadImage(url)
}, { immediate: true })

onMounted(() => {
  fetchData()
})

useStaticPageSeo('home')

const heroAltText = computed(() => siteConfig.value?.pages_seo?.home?.cover_alt_text ?? '')
</script>

<style scoped>
/* ── Hero: layered gradient fallback (theme-driven) ── */
.hero-gradient {
  background:
    radial-gradient(115% 85% at 78% 12%, color-mix(in srgb, var(--color-primary) 50%, transparent), transparent 58%),
    radial-gradient(90% 78% at 6% 94%, color-mix(in srgb, var(--color-primary-800) 55%, transparent), transparent 55%),
    linear-gradient(158deg, var(--color-secondary-950), var(--color-secondary-800) 55%, var(--color-secondary-900));
}

/* Fine grain to keep the flat gradient from looking synthetic */
.hero-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.14;
  mix-blend-mode: overlay;
}

/* ── Hero CTAs ── */
.hero-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.875rem 1.75rem;
  font-weight: 600;
  background: #fff;
  color: #111827;
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.55);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
}
.hero-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 42px -14px rgba(0, 0, 0, 0.6);
}

.hero-cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.hero-cta-ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.7);
}

/* ── Scroll cue ── */
.hero-scroll {
  position: absolute;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.hero-scroll-track {
  display: block;
  width: 1.55rem;
  height: 2.5rem;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 9999px;
  position: relative;
}
.hero-scroll-dot {
  position: absolute;
  top: 0.4rem;
  left: 50%;
  width: 0.3rem;
  height: 0.3rem;
  margin-left: -0.15rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  animation: scroll-bob 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes scroll-bob {
  0%, 100% { transform: translateY(0); opacity: 0.35; }
  50% { transform: translateY(0.85rem); opacity: 1; }
}

/* Newsletter input ring uses the theme's primary colour */
.newsletter-input:focus {
  --tw-ring-color: var(--color-primary-400);
}

/* ── Hero image slide progress bar ── */
.slide-bar {
  background: rgba(255, 255, 255, 0.85);
  width: 40%;
  border-radius: 9999px;
  animation: slide 1.4s ease-in-out infinite;
}

@keyframes slide {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(200%); }
  100% { transform: translateX(200%); }
}

/* ── Hero text staggered entrance ── */
.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Featured products — row 1 slides from right, row 2 from left ── */
.featured-card {
  opacity: 0;
}
.featured-card.from-right { transform: translateX(60px); }
.featured-card.from-left  { transform: translateX(-60px); }

.featured-card.reveal-visible.from-right {
  animation: card-slide-from-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.featured-card.reveal-visible.from-left {
  animation: card-slide-from-left 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes card-slide-from-right {
  from { opacity: 0; transform: translateX(60px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes card-slide-from-left {
  from { opacity: 0; transform: translateX(-60px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Shared fade transition ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Reduced motion: show everything, animate nothing ── */
@media (prefers-reduced-motion: reduce) {
  .hero-stagger,
  .featured-card,
  .featured-card.reveal-visible.from-right,
  .featured-card.reveal-visible.from-left {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .hero-scroll-dot { animation: none; }
}
</style>
