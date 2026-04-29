<template>
  <section v-if="visible" class="section-accent py-16 sm:py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Heading (matches the visual rhythm of Featured Products / How It Works) -->
      <div v-if="hasHeading" class="text-center mb-10 sm:mb-12">
        <p
          v-if="showcase!.label"
          class="text-xs font-semibold uppercase tracking-widest mb-2"
          :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }"
        >{{ showcase!.label }}</p>
        <h2 v-if="showcase!.heading" class="text-3xl font-bold text-gray-900">{{ showcase!.heading }}</h2>
        <div
          v-if="showcase!.heading"
          class="mt-3 mx-auto w-12 h-1 rounded-full"
          :style="{ backgroundColor: siteConfig?.theme?.primary_color || '#6898ED' }"
        />
        <p v-if="showcase!.subtitle" class="text-gray-500 text-sm mt-3 max-w-md mx-auto">{{ showcase!.subtitle }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <!-- Big video tile (decorative — does not link) -->
        <div class="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[520px]">
          <img
            v-if="showcase!.video_poster_url && !videoReady"
            :src="showcase!.video_poster_url"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
          />
          <video
            v-if="showcase!.video_url"
            :src="showcase!.video_url"
            :poster="showcase!.video_poster_url || undefined"
            class="absolute inset-0 w-full h-full object-cover"
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
            @canplay="videoReady = true"
          />
        </div>

        <!-- 2x2 tile grid -->
        <div class="grid grid-cols-2 gap-4 sm:gap-5">
          <NuxtLink
            v-for="(tile, i) in renderableTiles"
            :key="i"
            :to="`/shop?category_id=${tile.category_id}`"
            class="group relative rounded-2xl overflow-hidden bg-gray-200 aspect-[4/5] sm:aspect-square block"
          >
            <SmoothImage
              v-if="tile.image_url"
              :src="tile.image_url"
              :alt="tile.title"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />

            <div class="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-2 drop-shadow-sm line-clamp-2">{{ tile.title }}</h3>
              <span
                class="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest"
                :style="{ color: siteConfig?.theme?.primary_color || '#d946ef' }"
              >
                {{ tile.cta_label || 'SHOP NOW' }}
                <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <span class="block mt-1 h-0.5 w-10 rounded-full" :style="{ backgroundColor: siteConfig?.theme?.primary_color || '#d946ef' }" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageShowcase, HomepageShowcaseTile } from '~/composables/useSiteConfig'

// The public-facing tile shape includes the resolved image URL the server adds
// when serving /site-config — the admin form shape doesn't carry it.
interface ResolvedTile extends HomepageShowcaseTile {
  image_url: string | null
}

const { siteConfig } = useSiteConfig()

const showcase = computed<HomepageShowcase | null>(() => siteConfig.value?.homepage_showcase ?? null)

// Hide tiles that aren't fully configured (missing category or product) so the
// page never shows a half-broken cell.
const renderableTiles = computed<ResolvedTile[]>(() => {
  if (!showcase.value?.enabled) return []
  return (showcase.value.tiles as ResolvedTile[]).filter(
    (t) => t.category_id != null && t.featured_product_id != null,
  )
})

const visible = computed(() =>
  !!showcase.value?.enabled && (renderableTiles.value.length > 0 || !!showcase.value?.video_url),
)

const hasHeading = computed(
  () => !!(showcase.value?.label || showcase.value?.heading || showcase.value?.subtitle),
)

const videoReady = ref(false)
</script>
