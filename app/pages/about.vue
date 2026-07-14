<template>
  <div>
    <!-- ─────────────────────────  HERO  ───────────────────────── -->
    <section
      class="relative isolate flex min-h-[56vh] overflow-hidden text-white"
      :style="heroStyle"
      :aria-label="coverAltText || undefined"
    >
      <!-- Rich theme gradient when no cover image -->
      <template v-if="!siteConfig?.about_image_url">
        <div class="hero-media-gradient absolute inset-0" aria-hidden="true" />
        <div class="hero-media-grain absolute inset-0" aria-hidden="true" />
      </template>

      <!-- Slide progress bar while background image is loading -->
      <Transition name="fade">
        <div v-if="imageLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <!-- Admin scrim over the image -->
      <Transition name="fade">
        <div
          v-if="imageLoaded && siteConfig?.about_image_url"
          class="absolute inset-0"
          :style="{
            backgroundColor: siteConfig?.about_overlay_color || '#000000',
            opacity: (siteConfig?.about_overlay_opacity ?? 45) / 100,
          }"
        />
      </Transition>

      <!-- Legibility gradient -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

      <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <p class="hero-stagger mb-3 text-sm font-medium text-white/70" style="animation-delay: 0.15s">Get to know us</p>
          <h1 class="hero-stagger display-1 font-bold leading-tight text-balance drop-shadow-sm" style="animation-delay: 0.3s">About {{ siteName }}</h1>
          <p class="hero-stagger mt-5 max-w-lg text-lg text-white/85" style="animation-delay: 0.45s">
            The story, the people, and the promises behind everything we sell.
          </p>
        </div>
      </div>
    </section>

    <!-- ────────────────────────  OUR STORY  ──────────────────────── -->
    <section class="bg-white py-24 lg:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-10 lg:gap-16" :class="storyImage ? 'md:grid-cols-2' : 'md:grid-cols-1'">
          <!-- Image -->
          <div v-if="storyImage" ref="storyImageRef" class="reveal">
            <img :src="storyImage" :alt="coverAltText || `Inside ${siteName}`" class="aspect-[4/5] w-full rounded-2xl object-cover" />
          </div>

          <!-- Narrative -->
          <div ref="storyCardRef" class="reveal" :class="storyImage ? '' : 'mx-auto max-w-3xl'" style="transition-delay: 0.1s">
            <p class="mb-3 text-sm font-medium" :style="{ color: 'var(--color-primary-700)' }">Our story</p>
            <h2 class="display-2 font-bold text-gray-900">Built for people who care what they buy.</h2>
            <p class="mt-6 whitespace-pre-line break-words text-lg leading-relaxed text-gray-600">
              {{ siteConfig?.about_content || 'Welcome to our store. We are committed to providing quality products and excellent customer service.' }}
            </p>
            <p v-if="siteConfig?.site_name" class="mt-8 text-sm font-semibold text-gray-900">— The {{ siteConfig.site_name }} team</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  WHY CHOOSE US  ────────────────────── -->
    <section class="section-accent py-20 lg:py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div ref="valuesHeadingRef" class="reveal max-w-2xl">
          <h2 class="display-2 font-bold text-gray-900">Why customers choose us</h2>
          <p class="mt-4 text-lg text-gray-600">The promises we keep on every single order.</p>
        </div>

        <div class="mt-14 grid gap-y-10 md:grid-cols-3 md:gap-y-0">
          <div
            v-for="(item, i) in highlights"
            :key="i"
            :ref="addRevealRef"
            class="reveal md:px-10 md:first:pl-0 md:last:pr-0"
            :class="i > 0 ? 'md:border-l md:border-gray-200' : ''"
            :style="{ transitionDelay: `${0.1 + i * 0.12}s` }"
          >
            <Icon :name="item.icon || DEFAULT_ICON" class="h-7 w-7" :style="{ color: 'var(--color-primary-600)' }" />
            <h3 class="mt-5 text-lg font-semibold text-gray-900">{{ item.title }}</h3>
            <p class="mt-2 leading-relaxed text-gray-600">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  BY THE NUMBERS  ────────────────────── -->
    <section v-if="stats.length" class="bg-white py-20 border-t border-gray-100">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            :ref="addRevealRef"
            class="reveal text-center md:px-8 md:text-left md:first:pl-0"
            :class="i > 0 ? 'md:border-l md:border-gray-200' : ''"
            :style="{ transitionDelay: `${i * 0.1}s` }"
          >
            <div class="text-4xl font-bold tabular-nums text-gray-900 md:text-5xl" :style="{ fontFamily: 'var(--font-heading)' }">{{ stat.value }}</div>
            <div class="mt-2 text-sm text-gray-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  CLOSING CTA  ────────────────────── -->
    <section class="relative overflow-hidden bg-secondary-900 py-24 text-white">
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
        :style="{ background: 'radial-gradient(65% 130% at 50% -10%, color-mix(in srgb, var(--color-primary) 42%, transparent), transparent 62%)' }"
      />
      <div ref="ctaRef" class="reveal relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="display-2 font-bold">Ready to find something you'll love?</h2>
        <p class="mx-auto mt-4 max-w-md text-white/70">Browse the collection or get in touch — we're always happy to help.</p>
        <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink v-if="isEnabled('shop')" to="/shop" class="about-cta-primary">
            Browse the shop
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
          <NuxtLink v-if="isEnabled('contact')" to="/contact" class="about-cta-ghost">Get in touch</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AboutHighlightItem } from '~/composables/useSiteConfig'
import { DEFAULT_ICON } from '~/composables/useHighlightIcons'

const { siteConfig } = useSiteConfig()
const { isEnabled } = useModules()

// Scroll reveal
const { revealRef: storyCardRef } = useScrollReveal()
const { revealRef: storyImageRef } = useScrollReveal()
const { revealRef: valuesHeadingRef } = useScrollReveal()
const { revealRef: ctaRef } = useScrollReveal()
const { addRevealRef } = useScrollRevealAll()

const siteName = computed(() => siteConfig.value?.site_name || 'Us')
const storyImage = computed(() => siteConfig.value?.about_image_url || null)

const defaultHighlights: AboutHighlightItem[] = [
  { icon: 'heroicons:check-circle', title: 'Quality Assured', description: 'Every product is carefully selected and tested before it reaches you.' },
  { icon: 'heroicons:clock', title: 'Fast Shipping', description: 'Quick, reliable delivery straight to your doorstep.' },
  { icon: 'heroicons:face-smile', title: 'Happy Customers', description: 'Dedicated to your satisfaction on every order, always.' },
]

const highlights = computed(() => siteConfig.value?.about_highlights?.items?.length ? siteConfig.value.about_highlights.items : defaultHighlights)

// Social proof — reuse the store's headline numbers as a trust band.
const defaultStats = [
  { value: '500+', label: 'Products' },
  { value: '1,200+', label: 'Happy Customers' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support' },
]
const stats = computed(() => siteConfig.value?.homepage_stats?.items?.length ? siteConfig.value.homepage_stats.items : defaultStats)

const imageLoading = ref(false)
const imageLoaded = ref(false)

const heroStyle = computed(() => {
  const imageUrl = siteConfig.value?.about_image_url
  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url("${imageUrl}")` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1e293b',
    }
  }
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

watch(() => siteConfig.value?.about_image_url, (url) => {
  if (url) preloadImage(url)
}, { immediate: true })

useStaticPageSeo('about')

const coverAltText = computed(() => siteConfig.value?.pages_seo?.about?.cover_alt_text ?? '')
</script>

<style scoped>
.about-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.875rem 1.75rem;
  font-weight: 600;
  background: #fff;
  color: #111827;
  box-shadow: 0 12px 34px -14px rgba(0, 0, 0, 0.7);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
}
.about-cta-primary svg { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.about-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 44px -16px rgba(0, 0, 0, 0.75); }
.about-cta-primary:hover svg { transform: translateX(3px); }

.about-cta-ghost {
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
.about-cta-ghost:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.7); }

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
  animation: hero-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.6s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .hero-stagger { animation: none; opacity: 1; transform: none; }
  .about-cta-primary:hover { transform: none; }
}
</style>
