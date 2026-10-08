<template>
  <section
    class="hero relative isolate flex overflow-hidden"
    :class="isFullBleed ? 'min-h-[92svh] lg:min-h-screen' : 'min-h-[92svh] lg:min-h-[calc(100vh-4rem)]'"
    :style="heroStyle"
    :aria-label="heroAltText || undefined"
  >
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

    <template v-if="!siteConfig?.hero_image_url">
      <div class="hero-gradient absolute inset-0" aria-hidden="true" />
      <div class="hero-grain absolute inset-0" aria-hidden="true" />
    </template>

    <Transition name="fade">
      <div v-if="mediaLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
        <div class="slide-bar h-full" />
      </div>
    </Transition>

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

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" aria-hidden="true" />

    <div class="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-6 pb-16 pt-28 lg:px-8 lg:pb-28">
      <div class="max-w-2xl">
        <h1 class="hero-stagger display-1 font-bold text-white text-balance drop-shadow-sm" style="animation-delay: 0.15s">
          {{ heroTitle }}
        </h1>
        <p class="hero-stagger mt-4 max-w-xl text-base leading-relaxed text-white/85 md:mt-6 md:text-xl" style="animation-delay: 0.35s">
          {{ heroSubtitle }}
        </p>
        <div class="hero-stagger mt-8 flex flex-wrap items-center gap-3 md:mt-10 md:gap-4" style="animation-delay: 0.55s">
          <NuxtLink to="/shop" class="hero-cta-primary">
            Shop Now
            <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
          </NuxtLink>
          <button type="button" class="hero-cta-ghost" @click="scrollToFeatured">
            Discover more
            <Icon name="heroicons:arrow-down" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="hero-scroll hidden md:flex"
      aria-label="Scroll to products"
      @click="scrollToFeatured"
    >
      <span class="hero-scroll-track"><span class="hero-scroll-dot" /></span>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { SiteConfig } from '~/composables/useSiteConfig'

const props = defineProps<{
  siteConfig: SiteConfig | null
}>()

const imageLoading = ref(false)
const imageLoaded = ref(false)
const videoReady = ref(false)
const heroVideoRef = ref<HTMLVideoElement | null>(null)

const heroTitle = computed(() => props.siteConfig?.hero_title || 'Welcome to Our Store')
const heroSubtitle = computed(() => props.siteConfig?.hero_subtitle || 'Discover amazing products')
const heroAltText = computed(() => props.siteConfig?.pages_seo?.home?.cover_alt_text ?? '')
const isHeroVideo = computed(() => props.siteConfig?.hero_media_mime?.startsWith('video/'))
const isFullBleed = computed(() => props.siteConfig?.hero_full_bleed ?? false)
const heroFocalPosition = computed(
  () => `${props.siteConfig?.hero_focal_x ?? 50}% ${props.siteConfig?.hero_focal_y ?? 50}%`,
)
const mediaLoading = computed(() => isHeroVideo.value
  ? !videoReady.value && !!props.siteConfig?.hero_image_url
  : imageLoading.value)
const mediaReady = computed(() => isHeroVideo.value ? videoReady.value : imageLoaded.value)

const heroStyle = computed(() => {
  const imageUrl = props.siteConfig?.hero_image_url

  if (imageUrl && isHeroVideo.value) return { backgroundColor: '#1e293b' }

  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url("${imageUrl}")` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: heroFocalPosition.value,
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1e293b',
    }
  }

  return {}
})

function preloadImage(url: string) {
  if (!import.meta.client) return

  imageLoading.value = true
  imageLoaded.value = false

  const image = new Image()
  image.onload = () => {
    imageLoaded.value = true
    imageLoading.value = false
  }
  image.onerror = () => {
    imageLoading.value = false
  }
  image.src = url
}

function scrollToFeatured() {
  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(() => props.siteConfig?.hero_image_url, (url) => {
  videoReady.value = false
  if (url && !isHeroVideo.value) preloadImage(url)
}, { immediate: true })
</script>

<style scoped>
.hero-gradient {
  background:
    radial-gradient(115% 85% at 78% 12%, color-mix(in srgb, var(--color-primary) 50%, transparent), transparent 58%),
    radial-gradient(90% 78% at 6% 94%, color-mix(in srgb, var(--color-primary-800) 55%, transparent), transparent 55%),
    linear-gradient(158deg, var(--color-secondary-950), var(--color-secondary-800) 55%, var(--color-secondary-900));
}

.hero-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.14;
  mix-blend-mode: overlay;
}

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

.slide-bar {
  background: rgba(255, 255, 255, 0.85);
  width: 40%;
  border-radius: 9999px;
  animation: slide 1.4s ease-in-out infinite;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(200%); }
}

.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hero-stagger {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .hero-scroll-dot { animation: none; }
}
</style>
