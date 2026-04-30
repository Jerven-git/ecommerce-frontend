<template>
  <section v-if="visible" class="py-16 sm:py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Heading -->
      <div v-if="hasHeading" class="text-center mb-10 sm:mb-12">
        <p
          v-if="watchShop!.label"
          class="text-xs font-semibold uppercase tracking-widest mb-2"
          :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }"
        >{{ watchShop!.label }}</p>
        <h2 v-if="watchShop!.heading" class="text-3xl font-bold text-gray-900">{{ watchShop!.heading }}</h2>
        <div
          v-if="watchShop!.heading"
          class="mt-3 mx-auto w-12 h-1 rounded-full"
          :style="{ backgroundColor: siteConfig?.theme?.primary_color || '#6898ED' }"
        />
        <p v-if="watchShop!.subtitle" class="text-gray-500 text-sm mt-3 max-w-md mx-auto">{{ watchShop!.subtitle }}</p>
      </div>

      <!-- Carousel + nav arrows -->
      <div class="relative">
        <!-- Prev -->
        <button
          v-if="canScrollLeft"
          type="button"
          class="hidden sm:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow-md hover:scale-105 transition-transform"
          :aria-label="'Scroll left'"
          @click="scrollByPage(-1)"
        >
          <svg class="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Track -->
        <div
          ref="trackEl"
          class="ws-track flex gap-4 sm:gap-5 overflow-x-auto pb-4 -mx-4 sm:-mx-0 px-4 sm:px-0 snap-x snap-mandatory"
          @scroll.passive="updateScrollState"
        >
          <article
            v-for="card in renderableCards"
            :key="card.id"
            ref="cardEls"
            :data-card-id="card.id"
            class="ws-card snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[31%] xl:w-[23%]"
          >
            <!-- Media tile -->
            <div class="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
              <!-- Poster always renders so the slot has something even before video mounts -->
              <img
                v-if="card.poster_url || card.media_kind === 'image'"
                :src="card.poster_url || card.media_url || ''"
                :alt="card.product?.name ?? ''"
                class="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />

              <!-- Video only mounts once the card has been near-visible — keeps
                   off-screen cards from issuing metadata fetches. Only one or
                   two cards play at a time (controlled by mountedCardIds +
                   playingCardIds). -->
              <video
                v-if="card.media_kind === 'video' && mountedCardIds.has(card.id) && card.media_url"
                :ref="(el) => bindVideoRef(card.id, el as HTMLVideoElement | null)"
                :src="card.media_url"
                :poster="card.poster_url || undefined"
                class="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsinline
                preload="metadata"
              />
            </div>

            <!-- Product chip -->
            <NuxtLink
              v-if="card.product"
              :to="`/product/${card.product.slug}`"
              class="mt-3 flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-sm transition group/chip"
            >
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img
                  v-if="card.product.image_url"
                  :src="card.product.image_url"
                  :alt="card.product.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ card.product.name }}</p>
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mt-0.5"
                  :style="{ color: siteConfig?.theme?.primary_color || '#d946ef' }"
                >
                  SHOP NOW
                  <svg class="w-3 h-3 transition-transform group-hover/chip:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Next -->
        <button
          v-if="canScrollRight"
          type="button"
          class="hidden sm:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow-md hover:scale-105 transition-transform"
          :aria-label="'Scroll right'"
          @click="scrollByPage(1)"
        >
          <svg class="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageWatchShop, HomepageWatchShopCard } from '~/composables/useSiteConfig'

const { siteConfig } = useSiteConfig()

const watchShop = computed<HomepageWatchShop | null>(() => siteConfig.value?.homepage_watch_shop ?? null)

// Hide cards that aren't fully configured (no product OR media still failed).
// "processing" stays — the poster is still useful.
const renderableCards = computed<HomepageWatchShopCard[]>(() => {
  if (!watchShop.value?.enabled) return []
  return watchShop.value.cards.filter(
    (c) => c.product != null && c.media_url && c.media_status !== 'failed',
  )
})

const visible = computed(() => !!watchShop.value?.enabled && renderableCards.value.length > 0)
const hasHeading = computed(
  () => !!(watchShop.value?.label || watchShop.value?.heading || watchShop.value?.subtitle),
)

// --- Carousel scroll state (for arrow visibility) ---
const trackEl = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = trackEl.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollByPage(direction: -1 | 1) {
  const el = trackEl.value
  if (!el) return
  // Approximate one card width so the arrows feel like "next item" not "next page"
  const firstCard = el.querySelector<HTMLElement>('.ws-card')
  const stride = firstCard ? firstCard.getBoundingClientRect().width + 20 : el.clientWidth * 0.8
  el.scrollBy({ left: direction * stride, behavior: 'smooth' })
}

// --- Lazy-mount + visibility-driven autoplay ---
//
// Two IntersectionObservers do all the heavy lifting:
//   1. mountObserver: cards that come within 200px of viewport get their
//      <video> element mounted. Off-screen cards stay as poster-only — no
//      metadata fetch, no <video> element in the DOM.
//   2. playObserver: among mounted videos, only those >50% visible play, and
//      we cap concurrent playback at 2 (the most-visible two). Avoids 4+
//      videos hammering the decoder on tablets/desktops.
const mountedCardIds = ref<Set<string>>(new Set())
const playingCardIds = ref<Set<string>>(new Set())
const videoRefs = new Map<string, HTMLVideoElement>()
const visibilityRatios = new Map<string, number>()
const cardEls = ref<HTMLElement[]>([])

// Any card with at least a quarter of its area visible plays. Cap is a safety
// net on tiny phones where 6 concurrent decoders get janky — well above the
// number of cards that actually fit in a normal viewport.
const PLAY_VISIBILITY_THRESHOLD = 0.25
const MAX_CONCURRENT_PLAYING = 6

function bindVideoRef(cardId: string, el: HTMLVideoElement | null) {
  if (el) {
    videoRefs.set(cardId, el)
    if (playingCardIds.value.has(cardId)) {
      el.play().catch(() => {})
    }
  } else {
    videoRefs.delete(cardId)
  }
}

let mountObserver: IntersectionObserver | null = null
let playObserver: IntersectionObserver | null = null

function recomputePlaybackSet() {
  // Pick the cards with the highest visibility ratios above the threshold.
  const eligible = [...visibilityRatios.entries()]
    .filter(([, ratio]) => ratio >= PLAY_VISIBILITY_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CONCURRENT_PLAYING)
    .map(([id]) => id)

  const next = new Set(eligible)

  // Pause anything that's no longer eligible.
  for (const id of playingCardIds.value) {
    if (!next.has(id)) {
      videoRefs.get(id)?.pause()
    }
  }
  // Play anything newly eligible.
  for (const id of next) {
    if (!playingCardIds.value.has(id)) {
      videoRefs.get(id)?.play().catch(() => {})
    }
  }
  playingCardIds.value = next
}

function setupObservers() {
  if (typeof IntersectionObserver === 'undefined') return

  mountObserver = new IntersectionObserver(
    (entries) => {
      const next = new Set(mountedCardIds.value)
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.cardId
        if (!id) continue
        if (entry.isIntersecting) next.add(id)
      }
      mountedCardIds.value = next
    },
    { rootMargin: '200px 200px 200px 200px', threshold: 0.01 },
  )

  playObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.cardId
        if (!id) continue
        visibilityRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
      }
      recomputePlaybackSet()
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  )

  for (const el of cardEls.value) {
    mountObserver.observe(el)
    playObserver.observe(el)
  }
}

function teardownObservers() {
  mountObserver?.disconnect()
  playObserver?.disconnect()
  mountObserver = null
  playObserver = null
  for (const v of videoRefs.values()) {
    v.pause()
  }
  playingCardIds.value = new Set()
  visibilityRatios.clear()
}

onMounted(async () => {
  await nextTick()
  setupObservers()
  updateScrollState()
})

// Re-observe when the card list changes (admin saves, content changes).
watch(
  () => renderableCards.value.map((c) => c.id).join(','),
  async () => {
    await nextTick()
    teardownObservers()
    setupObservers()
    updateScrollState()
  },
)

onBeforeUnmount(teardownObservers)
</script>

<style scoped>
.ws-track {
  scrollbar-width: none;
}
.ws-track::-webkit-scrollbar {
  display: none;
}
</style>
