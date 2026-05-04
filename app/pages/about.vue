<template>
  <div>
    <!-- Hero Section -->
    <section class="relative text-white py-28 overflow-hidden" :style="heroStyle" :aria-label="coverAltText || undefined">
      <!-- Slide progress bar while background image is loading -->
      <Transition name="fade">
        <div v-if="imageLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <!-- Dark scrim for image readability -->
      <Transition name="fade">
        <div
          v-if="imageLoaded"
          class="absolute inset-0"
          :style="{
            backgroundColor: siteConfig?.about_overlay_color || '#000000',
            opacity: (siteConfig?.about_overlay_opacity ?? 45) / 100,
          }"
        />
      </Transition>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="hero-stagger inline-block bg-white/15 backdrop-blur-sm text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase" style="animation-delay: 0.15s">
          Our Company
        </span>
        <h1 class="hero-stagger text-5xl font-bold mb-4 leading-tight drop-shadow-md" style="animation-delay: 0.35s">About Us</h1>
        <p class="hero-stagger text-lg text-white/80 drop-shadow max-w-lg mx-auto" style="animation-delay: 0.55s">Learn more about our story and mission</p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="section-accent py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Skeleton -->
        <div v-if="loading" class="space-y-6">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-pulse">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-gray-100 rounded-xl"></div>
              <div class="h-5 bg-gray-100 rounded-lg w-32"></div>
            </div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-100 rounded-lg w-full"></div>
              <div class="h-4 bg-gray-100 rounded-lg w-5/6"></div>
              <div class="h-4 bg-gray-100 rounded-lg w-3/4"></div>
              <div class="h-4 bg-gray-100 rounded-lg w-4/5"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
              <div class="w-12 h-12 bg-gray-100 rounded-2xl mb-4"></div>
              <div class="h-4 bg-gray-100 rounded-lg w-2/3 mb-3"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-4/5"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
          <button @click="fetchSiteConfig()" class="btn-primary">Retry</button>
        </div>

        <!-- Content -->
        <div v-else class="space-y-6">

          <!-- Our Story card -->
          <div ref="storyCardRef" class="reveal bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: (siteConfig?.theme?.primary_color || '#6898ED') + '18' }">
                <svg class="w-4 h-4" :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Our Story</p>
                <p class="text-xs text-gray-400">Who we are and what we stand for</p>
              </div>
            </div>
            <div class="px-6 py-6">
              <p class="text-gray-600 text-base leading-relaxed whitespace-pre-line break-words">
                {{ siteConfig?.about_content || 'Welcome to our store. We are committed to providing quality products and excellent customer service.' }}
              </p>
            </div>
          </div>

          <!-- Highlight Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              v-for="(item, i) in highlights"
              :key="i"
              :ref="addRevealRef"
              class="reveal group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-secondary-100 transition-all duration-300"
              :style="{ transitionDelay: `${0.1 + i * 0.15}s` }"
            >
              <div class="w-12 h-12 mb-4 rounded-2xl flex items-center justify-center transition-colors duration-300 bg-secondary-50 text-secondary-600 group-hover:bg-secondary-100">
                <Icon :name="item.icon || DEFAULT_ICON" class="w-6 h-6" />
              </div>
              <h3 class="text-base font-semibold text-secondary-800 mb-1">{{ item.title }}</h3>
              <p class="text-sm text-gray-500">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { siteConfig, pending: loading, fetchSiteConfig } = useSiteConfig()

// Scroll reveal
const { revealRef: storyCardRef } = useScrollReveal()
const { addRevealRef } = useScrollRevealAll()

import type { AboutHighlightItem } from '~/composables/useSiteConfig'
import { DEFAULT_ICON } from '~/composables/useHighlightIcons'

const defaultHighlights: AboutHighlightItem[] = [
  { icon: 'heroicons:check-circle', title: 'Quality Assured', description: 'Every product is carefully selected and tested.' },
  { icon: 'heroicons:clock', title: 'Fast Shipping', description: 'Quick delivery straight to your doorstep.' },
  { icon: 'heroicons:face-smile', title: 'Happy Customers', description: 'Dedicated to your satisfaction, always.' },
]

const highlights = computed(() => siteConfig.value?.about_highlights?.items?.length ? siteConfig.value.about_highlights.items : defaultHighlights)

const error = ref<string | null>(null)
const imageLoading = ref(false)
const imageLoaded = ref(false)

const heroStyle = computed(() => {
  const imageUrl = siteConfig.value?.about_image_url

  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url(${imageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
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

watch(() => siteConfig.value?.about_image_url, (url) => {
  if (url) preloadImage(url)
}, { immediate: true })

useStaticPageSeo('about')

const coverAltText = computed(() => siteConfig.value?.pages_seo?.about?.cover_alt_text ?? '')
</script>

<style scoped>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
