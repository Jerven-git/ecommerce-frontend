<template>
  <section class="apex-hero relative isolate overflow-hidden bg-[#0B1020] text-white" aria-labelledby="ssu-hero-title">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#6898ED]/15 blur-[120px]" />
      <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-400/10 blur-[100px]" />
    </div>

    <div class="hero-grid mx-auto grid w-full max-w-[1440px] gap-10 px-6 pb-10 pt-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)] lg:gap-10 lg:px-8 lg:pb-10 lg:pt-24">
      <div class="flex max-w-2xl flex-col justify-center py-6 lg:py-10">
        <h1 id="ssu-hero-title" class="max-w-[10ch] text-[clamp(3.25rem,5.5vw,5.75rem)] font-bold leading-[0.94] tracking-[-0.04em] text-white">
          Your next shop, <span class="text-[#8BB3F7]">ready for what’s next.</span>
        </h1>

        <p class="mt-7 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Bring products, orders, payments, shipping and content into one clear workspace—from launch day to daily growth.
        </p>

        <div class="mt-9 flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="isAuthenticated ? '/admin' : '/register'"
            class="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--apex-action)] px-6 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--apex-action-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-dark)]"
          >
            {{ isAuthenticated ? 'Open dashboard' : 'Start with SSU' }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
          </NuxtLink>
          <a
            href="#pricing"
            class="inline-flex min-h-12 items-center rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-[background-color,border-color] duration-200 hover:border-white/70 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-dark)]"
          >
            See pricing
          </a>
          <NuxtLink
            v-if="!isAuthenticated"
            to="/admin/login"
            class="rounded-lg px-2 py-3 text-sm font-medium text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-dark)]"
          >
            Login
          </NuxtLink>
        </div>

        <div class="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-slate-300" aria-label="Included SSU capabilities">
          <span v-for="capability in capabilities" :key="capability.label" class="inline-flex items-center gap-2">
            <Icon :name="capability.icon" class="h-4 w-4 text-[#8BB3F7]" aria-hidden="true" />
            {{ capability.label }}
          </span>
        </div>
      </div>

      <div
        class="hero-slideshow relative min-h-[20rem] overflow-hidden rounded-2xl bg-slate-800 lg:min-h-0"
        role="region"
        aria-roledescription="carousel"
        aria-label="SSU storefront inspiration"
      >
        <p class="sr-only" aria-live="polite" aria-atomic="true">{{ slideAnnouncement }}</p>
        <img
          v-for="(slide, index) in slides"
          :key="slide.src"
          :src="slide.src"
          :srcset="slide.srcset"
          :sizes="HERO_IMAGE_SIZES"
          :width="slide.width"
          :height="slide.height"
          :alt="slide.alt"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          decoding="async"
          class="hero-slide absolute inset-0 h-full w-full object-cover"
          :class="index === activeSlide ? 'is-active' : ''"
          :aria-hidden="index !== activeSlide"
        >

        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" aria-hidden="true" />

        <div class="absolute left-5 top-5 rounded-lg bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:left-6 sm:top-6">
          Storefront inspiration
        </div>

        <div class="absolute inset-x-0 bottom-0 flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div class="min-w-0">
            <p class="text-xs font-medium uppercase tracking-wide text-white/70">{{ currentSlide.category }}</p>
            <p class="mt-1 truncate text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">{{ currentSlide.label }}</p>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <button type="button" class="hero-control" aria-label="Previous slide" @click="previousSlide">
              <Icon name="heroicons:arrow-left" class="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              v-if="!prefersReducedMotion"
              type="button"
              class="hero-control relative"
              :aria-label="isPlaying ? 'Pause slideshow' : 'Play slideshow'"
              @click="togglePlayback"
            >
              <svg class="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgb(255 255 255 / 0.2)" stroke-width="1.5" />
                <circle
                  v-if="isPlaying"
                  :key="`${activeSlide}-${progressVersion}`"
                  class="hero-progress"
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  pathLength="100"
                  stroke="white"
                  stroke-linecap="round"
                  stroke-width="1.5"
                />
              </svg>
              <Icon :name="isPlaying ? 'heroicons:pause' : 'heroicons:play'" class="relative h-4 w-4" aria-hidden="true" />
            </button>

            <button type="button" class="hero-control" aria-label="Next slide" @click="nextSlide">
              <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
            </button>

            <span class="ml-1 min-w-12 text-right text-xs font-semibold tabular-nums text-white/80">
              {{ String(activeSlide + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
            </span>
          </div>
        </div>

        <div class="absolute bottom-24 left-5 hidden gap-2 sm:left-6 sm:flex" aria-label="Choose a slide">
          <button
            v-for="(slide, index) in slides"
            :key="slide.label"
            type="button"
            class="h-11 w-11 rounded-lg p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apex-focus-on-dark)]"
            :aria-label="`Show ${slide.label}`"
            :aria-current="index === activeSlide ? 'true' : undefined"
            @click="selectSlide(index)"
          >
            <span class="block h-1 w-3 rounded-full transition-colors" :class="index === activeSlide ? 'bg-white' : 'bg-white/35'" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useReducedMotion } from 'motion-v'

defineProps<{
  isAuthenticated: boolean
}>()

const SLIDE_DURATION = 5000
const HERO_IMAGE_SIZES = '(min-width: 1536px) 42rem, (min-width: 1024px) 44vw, calc(100vw - 3rem)'
const activeSlide = ref(0)
const isPlaying = ref(true)
const progressVersion = ref(0)
const slideAnnouncement = ref('')
const prefersReducedMotion = useReducedMotion()
let slideTimer: ReturnType<typeof setInterval> | undefined

const slides = [
  {
    src: '/images/ArteGallery/mountain-art-960.webp',
    srcset: '/images/ArteGallery/mountain-art-640.webp 640w, /images/ArteGallery/mountain-art-960.webp 960w, /images/ArteGallery/mountain-art-1440.webp 1440w, /images/ArteGallery/mountain-art.webp 1920w',
    width: 1920,
    height: 1320,
    alt: 'Framed artwork displayed in a bright gallery-inspired interior.',
    category: 'Visual storefront',
    label: 'Arte Gallery',
  },
  {
    src: '/images/MinimalMono/laptop-960.webp',
    srcset: '/images/MinimalMono/laptop-640.webp 640w, /images/MinimalMono/laptop-960.webp 960w, /images/MinimalMono/laptop-1440.webp 1440w, /images/MinimalMono/laptop.webp 2560w',
    width: 2560,
    height: 1707,
    alt: 'Minimal workspace with a laptop and clean product styling.',
    category: 'Focused catalog',
    label: 'Minimal Mono',
  },
  {
    src: '/images/ForestGreen/food-960.webp',
    srcset: '/images/ForestGreen/food-640.webp 640w, /images/ForestGreen/food-960.webp 960w, /images/ForestGreen/food-1440.webp 1440w, /images/ForestGreen/food.webp 2560w',
    width: 2560,
    height: 1707,
    alt: 'Food presentation styled with rich natural colours.',
    category: 'Product storytelling',
    label: 'Forest Green',
  },
  {
    src: '/images/WarmSunset/wedding-960.webp',
    srcset: '/images/WarmSunset/wedding-640.webp 640w, /images/WarmSunset/wedding-960.webp 960w, /images/WarmSunset/wedding-1440.webp 1440w, /images/WarmSunset/wedding.webp 2560w',
    width: 2560,
    height: 1707,
    alt: 'Warm service-led scene prepared for a celebration.',
    category: 'Services and booking',
    label: 'Warm Sunset',
  },
]

const capabilities = [
  { label: 'Products', icon: 'heroicons:squares-2x2' },
  { label: 'Orders', icon: 'heroicons:clipboard-document-check' },
  { label: 'Content', icon: 'heroicons:pencil-square' },
]

const currentSlide = computed(() => slides[activeSlide.value]!)

function stopTimer() {
  if (slideTimer) clearInterval(slideTimer)
  slideTimer = undefined
}

function startTimer() {
  stopTimer()
  if (!import.meta.client || !isPlaying.value || prefersReducedMotion.value) return
  progressVersion.value += 1
  slideTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, SLIDE_DURATION)
}

async function announceSlide(index: number) {
  slideAnnouncement.value = ''
  await nextTick()
  const slide = slides[index]
  if (slide) slideAnnouncement.value = `${slide.label}, slide ${index + 1} of ${slides.length}`
}

function selectSlide(index: number) {
  activeSlide.value = index
  announceSlide(index)
  startTimer()
}

function previousSlide() {
  selectSlide((activeSlide.value - 1 + slides.length) % slides.length)
}

function nextSlide() {
  selectSlide((activeSlide.value + 1) % slides.length)
}

function togglePlayback() {
  isPlaying.value = !isPlaying.value
  startTimer()
}

function handleVisibilityChange() {
  if (document.hidden) stopTimer()
  else startTimer()
}

watch(prefersReducedMotion, startTimer)

onMounted(() => {
  startTimer()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  stopTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.apex-hero {
  min-height: 100vh;
  min-height: 100svh;
}

.hero-grid {
  min-height: inherit;
}

.hero-slideshow {
  height: max(20rem, 38svh);
}

.hero-slide {
  opacity: 0;
  transform: scale(1.025);
  transition:
    opacity 600ms ease,
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-slide.is-active {
  opacity: 1;
  transform: scale(1);
}

.hero-control {
  display: inline-flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(0 0 0 / 45%);
  color: white;
  backdrop-filter: blur(8px);
  transition: background-color 180ms ease;
}

.hero-control:hover {
  background: rgb(0 0 0 / 70%);
}

.hero-control:focus-visible {
  outline: 2px solid var(--apex-focus-on-dark);
  outline-offset: 2px;
}

.hero-progress {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: hero-progress 5s linear forwards;
}

@keyframes hero-progress {
  to {
    stroke-dashoffset: 0;
  }
}

@media (min-width: 1024px) {
  .hero-slideshow {
    align-self: center;
    height: clamp(30rem, calc(100svh - 10rem), 38rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide {
    transform: none;
    transition-duration: 0.01ms;
  }
}
</style>
