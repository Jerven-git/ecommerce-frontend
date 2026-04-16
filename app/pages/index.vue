<template>
  <div>
    <!-- Hero Section -->
    <section
      class="relative flex items-center justify-center text-white overflow-hidden"
      :class="isFullBleed ? 'h-screen' : 'min-h-[calc(100vh-4rem)]'"
      :style="heroStyle"
    >
      <!-- Video background (autoplay, muted, loop for performance) -->
      <video
        v-if="isHeroVideo && siteConfig?.hero_image_url"
        ref="heroVideoRef"
        class="absolute inset-0 w-full h-full object-cover"
        :style="{ objectPosition: heroFocalPosition }"
        autoplay
        loop
        muted
        playsinline
        preload="metadata"
        @canplay="videoReady = true"
      >
        <source :src="siteConfig.hero_image_url" />
      </video>

      <!-- Slide progress bar while hero media loads -->
      <Transition name="fade">
        <div v-if="mediaLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <!-- Overlay scrim fades in once media is ready -->
      <Transition name="fade">
        <div
          v-if="mediaReady || !siteConfig?.hero_image_url"
          class="absolute inset-0"
          :style="{
            backgroundColor: siteConfig?.hero_overlay_color || '#000000',
            opacity: (siteConfig?.hero_overlay_opacity ?? 45) / 100,
          }"
        />
      </Transition>

      <!-- Hero text staggers in on mount -->
      <div class="relative z-10 text-center px-6 max-w-3xl">
        <h1 class="hero-stagger text-5xl md:text-6xl font-bold mb-5 leading-tight drop-shadow-lg" style="animation-delay: 0.2s">
          {{ siteConfig?.hero_title || 'Welcome to Our Store' }}
        </h1>
        <p class="hero-stagger text-lg md:text-xl mb-10 text-white/85 drop-shadow max-w-xl mx-auto" style="animation-delay: 0.5s">
          {{ siteConfig?.hero_subtitle || 'Discover amazing products' }}
        </p>
        <div class="hero-stagger flex items-center justify-center gap-3 flex-wrap" style="animation-delay: 0.8s">
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:scale-105 transition-all duration-200"
          >
            Shop Now
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section-accent py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref="featuredHeadingRef" class="text-center mb-12 reveal">
          <p
            class="text-xs font-semibold uppercase tracking-widest mb-2"
            :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }"
          >New Arrivals</p>
          <h2 class="text-3xl font-bold text-gray-900">Featured Products</h2>
          <div class="mt-3 mx-auto w-12 h-1 rounded-full" :style="{ backgroundColor: siteConfig?.theme?.primary_color || '#6898ED' }"></div>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-100"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-100 rounded-lg w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-full"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-2/3"></div>
              <div class="h-8 bg-gray-100 rounded-lg mt-2"></div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-600">{{ error }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">No products available at the moment.</p>
        </div>

        <!-- Products with stagger fade-up -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="card-stagger"
            :style="{ animationDelay: `${index * 60}ms` }"
          >
            <ProductCard :product="product" />
          </div>
        </div>

        <div :ref="addRevealRef" class="reveal text-center mt-12">
          <NuxtLink to="/shop" class="btn-secondary inline-flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            View All Products
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref="howItWorksHeadingRef" class="reveal">
          <p class="text-xs font-semibold uppercase tracking-widest mb-2" :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }">{{ stepsLabel }}</p>
          <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ stepsHeading }}</h2>
          <p class="text-gray-500 text-sm mb-14 max-w-md mx-auto">{{ stepsSubtitle }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <!-- Connector line desktop -->
          <div class="hidden md:block absolute top-10 left-[calc(16.66%+3rem)] right-[calc(16.66%+3rem)] h-px bg-gray-200 z-0"></div>

          <div
            v-for="(step, i) in steps"
            :key="i"
            :ref="addRevealRef"
            class="reveal relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center"
            :style="{ transitionDelay: `${0.1 + i * 0.15}s` }"
          >
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-white shadow-sm bg-secondary-50">
              <Icon :name="step.icon ?? defaultStepIcons[i % defaultStepIcons.length]!" class="w-6 h-6 text-secondary-600" />
            </div>
            <span class="text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Step {{ i + 1 }}</span>
            <h3 class="text-base font-semibold text-secondary-800 mb-1.5">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ step.description }}</p>
          </div>
        </div>

        <div :ref="addRevealRef" class="reveal mt-10" style="transition-delay: 0.5s">
          <NuxtLink to="/shop" class="btn-primary inline-flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            Start Shopping
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Feature Strip -->
    <section class="section-accent border-t border-gray-100 py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="(feature, i) in features"
            :key="i"
            :ref="addRevealRef"
            class="reveal group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-secondary-100 transition-all duration-300"
            :style="{ transitionDelay: `${0.1 + i * 0.15}s` }"
          >
            <div class="w-12 h-12 mb-4 rounded-2xl flex items-center justify-center transition-colors duration-300 bg-secondary-50 group-hover:bg-secondary-100">
              <Icon :name="feature.icon ?? defaultFeatureIcons[i % defaultFeatureIcons.length]!" class="w-6 h-6 text-secondary-600" />
            </div>
            <h3 class="text-base font-semibold text-secondary-800 mb-1">{{ feature.title }}</h3>
            <p class="text-gray-500 text-sm">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="py-16 text-white" :style="{ background: `linear-gradient(135deg, ${siteConfig?.theme?.primary_color || '#6898ED'}, ${siteConfig?.theme?.secondary_color || '#4B5979'})` }">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="(stat, i) in stats" :key="stat.label" :ref="addRevealRef" class="reveal group" :style="{ transitionDelay: `${i * 0.15}s` }">
            <div class="text-4xl font-extrabold mb-1 drop-shadow group-hover:scale-110 transition-transform duration-300">{{ stat.value }}</div>
            <div class="text-white/70 text-xs font-semibold uppercase tracking-widest">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter CTA -->
    <section class="py-20 text-white relative overflow-hidden" :style="{ backgroundColor: 'var(--color-secondary)' }">
      <div class="absolute inset-0 opacity-5 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white blur-3xl"></div>
      </div>
      <div ref="newsletterRef" class="reveal relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-white mb-3">{{ newsletterLabel }}</p>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ newsletterHeading }}</h2>
        <p class="text-white text-sm mb-8 max-w-sm mx-auto">{{ newsletterSubtitle }}</p>
        <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" @submit.prevent="subscribeNewsletter">
          <input
            v-model="newsletterEmail"
            type="email"
            placeholder="Enter your email"
            class="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-primary-400 transition text-sm"
            :disabled="newsletterSubmitting"
          />
          <button
            type="submit"
            class="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-400 hover:scale-105 transition-all duration-200 shadow-lg shrink-0 disabled:opacity-50"
            :disabled="newsletterSubmitting || !newsletterEmail"
          >
            {{ newsletterSubmitting ? 'Subscribing...' : 'Subscribe' }}
          </button>
        </form>
        <p v-if="newsletterMsg" class="text-white text-sm mt-4 font-medium">{{ newsletterMsg }}</p>
        <p v-else class="text-white text-xs mt-4">{{ newsletterDisclaimer }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { HomepageStep, HomepageFeature } from '~/composables/useSiteConfig'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

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

const defaultStepIcons = [
  'heroicons:magnifying-glass',
  'heroicons:shopping-cart',
  'heroicons:shield-check',
]

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

  return {
    backgroundImage: `linear-gradient(135deg, ${siteConfig.value?.theme?.primary_color || '#6898ED'}, ${
      siteConfig.value?.theme?.secondary_color || '#4B5979'
    })`,
  }
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
</script>

<style scoped>
/* Hero image slide progress bar */
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

/* Hero text staggered entrance */
.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.7s ease forwards;
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Product cards stagger fade-up */
.card-stagger {
  opacity: 0;
  animation: card-fade-up 0.5s ease forwards;
}

@keyframes card-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Shared fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
