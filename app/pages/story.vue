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
        <span v-if="hero.eyebrow" class="hero-stagger inline-block bg-white/15 backdrop-blur-sm text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase" style="animation-delay: 0.15s">
          {{ hero.eyebrow }}
        </span>
        <h1 class="hero-stagger text-5xl font-bold mb-4 leading-tight drop-shadow-md" style="animation-delay: 0.35s">{{ hero.heading }}</h1>
        <p v-if="hero.subtitle" class="hero-stagger text-lg text-white/80 drop-shadow max-w-lg mx-auto" style="animation-delay: 0.55s">{{ hero.subtitle }}</p>
      </div>
    </section>

    <!-- Section A -->
    <section v-if="hasSectionA" class="py-16 sm:py-24 bg-white border-t border-gray-100">
      <!-- With an image: two-column editorial layout, image left or right per admin -->
      <div v-if="sectionAImage" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div :ref="addRevealRef" class="reveal" :class="sectionAImageRight ? 'md:order-2' : 'md:order-1'">
            <img :src="sectionAImage" :alt="story.section_a.heading || 'Our story'" class="w-full aspect-[4/5] object-cover rounded-2xl" />
          </div>
          <div :ref="addRevealRef" class="reveal" :class="sectionAImageRight ? 'md:order-1' : 'md:order-2'" style="transition-delay: 0.1s">
            <h2 class="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900 mb-4">{{ story.section_a.heading }}</h2>
            <p v-if="story.section_a.body" class="text-gray-600 font-light leading-relaxed whitespace-pre-line mb-8">{{ story.section_a.body }}</p>
            <NuxtLink
              v-if="story.section_a.cta_label && story.section_a.cta_link"
              :to="story.section_a.cta_link"
              class="btn-primary inline-flex items-center"
            >{{ story.section_a.cta_label }}</NuxtLink>
          </div>
        </div>
      </div>

      <!-- No image: centered layout -->
      <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900 mb-4">{{ story.section_a.heading }}</h2>
        <p v-if="story.section_a.body" class="text-gray-600 font-light leading-relaxed whitespace-pre-line mb-8">{{ story.section_a.body }}</p>
        <NuxtLink
          v-if="story.section_a.cta_label && story.section_a.cta_link"
          :to="story.section_a.cta_link"
          class="btn-primary inline-flex items-center"
        >{{ story.section_a.cta_label }}</NuxtLink>
      </div>
    </section>

    <!-- Section B -->
    <section v-if="hasSectionB" class="py-16 sm:py-24 section-accent border-t border-gray-100">
      <!-- With an image: two-column editorial layout, image left or right per admin -->
      <div v-if="sectionBImage" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div :ref="addRevealRef" class="reveal" :class="sectionBImageRight ? 'md:order-2' : 'md:order-1'">
            <img :src="sectionBImage" :alt="story.section_b.heading || 'Our story'" class="w-full aspect-[4/5] object-cover rounded-2xl" />
          </div>
          <div :ref="addRevealRef" class="reveal" :class="sectionBImageRight ? 'md:order-1' : 'md:order-2'" style="transition-delay: 0.1s">
            <h2 class="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900 mb-4">{{ story.section_b.heading }}</h2>
            <p v-if="story.section_b.body" class="text-gray-600 font-light leading-relaxed whitespace-pre-line mb-8">{{ story.section_b.body }}</p>
            <NuxtLink
              v-if="story.section_b.cta_label && story.section_b.cta_link"
              :to="story.section_b.cta_link"
              class="btn-primary inline-flex items-center"
            >{{ story.section_b.cta_label }}</NuxtLink>
          </div>
        </div>
      </div>

      <!-- No image: centered layout -->
      <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900 mb-4">{{ story.section_b.heading }}</h2>
        <p v-if="story.section_b.body" class="text-gray-600 font-light leading-relaxed whitespace-pre-line mb-8">{{ story.section_b.body }}</p>
        <NuxtLink
          v-if="story.section_b.cta_label && story.section_b.cta_link"
          :to="story.section_b.cta_link"
          class="btn-primary inline-flex items-center"
        >{{ story.section_b.cta_label }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { StoryPage } from '~/composables/useSiteConfig'

const { siteConfig, fetchSiteConfig } = useSiteConfig()

// Scroll reveal for the alternating sections
const { addRevealRef } = useScrollRevealAll()

// "Our Story" page content. The API always returns a resolved shape, but
// fall back to defaults while the config is still loading.
const DEFAULT_STORY_PAGE: StoryPage = {
  enabled: false,
  hero: { eyebrow: 'Our Story', heading: 'Our Story', subtitle: '' },
  section_a: { heading: '', body: '', cta_label: '', cta_link: '/shop', image_position: 'right', image_url: null },
  section_b: { heading: '', body: '', cta_label: '', cta_link: '/contact', image_position: 'left', image_url: null },
}

const story = computed<StoryPage>(() => siteConfig.value?.story_page ?? DEFAULT_STORY_PAGE)
const hero = computed(() => story.value.hero)

const hasSectionA = computed(() => !!(story.value.section_a.heading || story.value.section_a.body))
const hasSectionB = computed(() => !!(story.value.section_b.heading || story.value.section_b.body))
const sectionAImage = computed(() => story.value.section_a.image_url || '')
const sectionAImageRight = computed(() => story.value.section_a.image_position === 'right')
const sectionBImage = computed(() => story.value.section_b.image_url || '')
const sectionBImageRight = computed(() => story.value.section_b.image_position === 'right')

// Gate the page on the story_page.enabled flag. /story isn't owned by any
// module (it's not in MODULE_PREFIXES), so the global modules middleware
// doesn't gate it — the enabled flag is the mechanism. Mirror how disabled
// module pages behave: silently redirect to the homepage.
async function ensureGate() {
  if (!siteConfig.value) await fetchSiteConfig()
  if (siteConfig.value && siteConfig.value.story_page?.enabled !== true) {
    await navigateTo('/', { redirectCode: 302 })
  }
}
await ensureGate()

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
  if (!import.meta.client) return

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
