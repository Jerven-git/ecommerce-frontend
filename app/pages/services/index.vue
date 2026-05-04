<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0" :style="fallbackHeroStyle">
        <img
          v-if="heroImage"
          :src="heroImage"
          :alt="coverAltText || heroHeading"
          class="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div
          v-if="heroImage"
          class="absolute inset-0"
          :style="{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }"
        />
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div class="max-w-2xl">
          <p
            class="hero-stagger text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-white/80"
            style="animation-delay: 0.1s"
          >
            {{ heroLabel }}
          </p>
          <h1
            class="hero-stagger text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white"
            style="animation-delay: 0.25s"
          >
            {{ heroHeading }}
          </h1>
          <p
            v-if="heroSubtitle"
            class="hero-stagger text-sm sm:text-base mt-4 text-white/80 max-w-lg"
            style="animation-delay: 0.4s"
          >
            {{ heroSubtitle }}
          </p>

          <div v-if="primaryCta || secondaryCta" class="hero-stagger mt-7 flex flex-wrap gap-3" style="animation-delay: 0.55s">
            <NuxtLink
              v-if="primaryCta"
              :to="primaryCta.link || '#'"
              class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              {{ primaryCta.label }}
            </NuxtLink>
            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.link || '#'"
              class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 border border-white/20 transition-colors backdrop-blur-sm"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Summary strip -->
    <section v-if="summary.length" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          <div v-for="(item, i) in summary" :key="i" class="border-t border-gray-200 pt-4">
            <p class="text-sm font-semibold text-gray-900 mb-1">{{ item.title }}</p>
            <p class="text-sm text-gray-500 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading services -->
    <section v-if="loadingServices" class="bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div class="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    </section>

    <!-- Service groups (one section per category) -->
    <section
      v-for="(group, gi) in serviceGroups"
      v-else
      :key="group.category?.id ?? `uncat-${gi}`"
      class="border-b border-gray-100"
      :class="gi % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-12 max-w-xl">
          {{ group.category?.name || 'Services' }}
        </h2>

        <div class="space-y-14 sm:space-y-20">
          <NuxtLink
            v-for="(service, ii) in group.items"
            :key="service.id"
            :to="`/services/${service.slug}`"
            class="group grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
            :class="ii % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''"
          >
            <div
              :ref="addRevealRef"
              :class="ii % 2 === 1 ? 'reveal-from-right' : 'reveal-from-left'"
            >
              <p v-if="service.eyebrow" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                {{ service.eyebrow }}
              </p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary-600 transition-colors">
                {{ service.title }}
              </h3>
              <p v-if="service.description" class="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
                {{ service.description }}
              </p>
              <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 border-b border-primary-600/30 group-hover:border-primary-700 transition-colors pb-0.5">
                {{ service.cta_label || 'Learn more' }}
                <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            <div
              :ref="addRevealRef"
              class="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
              :class="ii % 2 === 1 ? 'reveal-from-left' : 'reveal-from-right'"
            >
              <img
                v-if="service.cover_image_url"
                :src="service.cover_image_url"
                :alt="service.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <section v-if="!loadingServices && !serviceGroups.length" class="bg-white border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p class="text-gray-500">Services are coming soon. Check back shortly.</p>
      </div>
    </section>

    <!-- Stats -->
    <section v-if="stats.length" class="bg-white border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          <div v-for="(stat, i) in stats" :key="i" class="border-t border-gray-200 pt-4">
            <p class="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{{ stat.value }}</p>
            <p class="text-sm text-gray-500 leading-relaxed">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section v-if="bottomCta" class="bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="rounded-3xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-10 sm:p-14 text-center">
          <h3 class="text-2xl sm:text-3xl font-bold mb-3">{{ bottomCta.heading }}</h3>
          <p v-if="bottomCta.subtitle" class="text-sm sm:text-base text-white/90 mb-6 max-w-lg mx-auto">{{ bottomCta.subtitle }}</p>
          <NuxtLink
            v-if="bottomCta.button_link"
            :to="bottomCta.button_link"
            class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            {{ bottomCta.button_label || 'Get started' }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Service, ServiceCategory } from '~/types/service'

const { siteConfig, fetchSiteConfig } = useSiteConfig()
const { addRevealRef } = useScrollRevealAll()
const { $apiFetch } = useNuxtApp()

await fetchSiteConfig()

// Fetch all published services + categories in parallel. Pull a high
// per_page so the page renders the full grouped layout in one shot;
// the service catalogue is small enough that pagination here would be
// noise. If it grows past ~100 we can revisit.
const { data: servicesRes } = await useAsyncData('services-public', async () => {
  const [servicesPage, categoriesRes] = await Promise.all([
    $apiFetch<{ data: Service[]; current_page?: number }>('/services', {
      query: { per_page: 100, sort: 'default' },
    }),
    $apiFetch<{ data: ServiceCategory[] }>('/service-categories'),
  ])
  return {
    services: servicesPage?.data ?? [],
    categories: categoriesRes?.data ?? [],
  }
})

const loadingServices = computed(() => !servicesRes.value)

const services = computed(() => servicesRes.value?.services ?? [])
const categories = computed(() => servicesRes.value?.categories ?? [])

// Group services by category, preserving category sort_order. Services
// without a category land in a trailing "Other" bucket so they're not
// silently dropped from the page.
const serviceGroups = computed<Array<{ category: ServiceCategory | null; items: Service[] }>>(() => {
  const byCategory = new Map<number, Service[]>()
  const uncategorized: Service[] = []

  for (const s of services.value) {
    if (s.category_id == null) {
      uncategorized.push(s)
    } else {
      const arr = byCategory.get(s.category_id) ?? []
      arr.push(s)
      byCategory.set(s.category_id, arr)
    }
  }

  const sortedCategories = [...categories.value].sort((a, b) => a.sort_order - b.sort_order)

  const groups: Array<{ category: ServiceCategory | null; items: Service[] }> = []
  for (const cat of sortedCategories) {
    const items = byCategory.get(cat.id)
    if (items?.length) groups.push({ category: cat, items })
  }
  if (uncategorized.length) groups.push({ category: null, items: uncategorized })
  return groups
})

// --- Page chrome from site config (unchanged) ---
const servicesCfg = computed(() => siteConfig.value?.services_page)

const heroLabel = computed(() => servicesCfg.value?.header?.label || 'OUR SERVICES')
const heroHeading = computed(() => servicesCfg.value?.header?.heading || 'Services built around you')
const heroSubtitle = computed(() => servicesCfg.value?.header?.subtitle || '')
const heroImage = computed(() => siteConfig.value?.services_image_url || null)
const overlayColor = computed(() => siteConfig.value?.services_overlay_color || '#000000')
const overlayOpacity = computed(() => siteConfig.value?.services_overlay_opacity ?? 40)

const fallbackHeroStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, ${siteConfig.value?.theme?.primary_color || '#6898ED'}, ${
    siteConfig.value?.theme?.secondary_color || '#4B5979'
  })`,
}))

const primaryCta = computed(() => servicesCfg.value?.header?.primary_cta || null)
const secondaryCta = computed(() => servicesCfg.value?.header?.secondary_cta || null)

const summary = computed(() => servicesCfg.value?.summary?.items ?? [])
const stats = computed(() => servicesCfg.value?.stats?.items ?? [])
const bottomCta = computed(() => servicesCfg.value?.cta || null)

useStaticPageSeo('services', {
  title: `${servicesCfg.value?.header?.label || 'Services'} – ${siteConfig.value?.site_name || ''}`,
  description: servicesCfg.value?.header?.subtitle || '',
})

const coverAltText = computed(() => siteConfig.value?.pages_seo?.services?.cover_alt_text ?? '')
</script>

<style scoped>
.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.7s ease forwards;
}

@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal-from-left,
.reveal-from-right {
  opacity: 0;
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
  will-change: opacity, transform;
}
.reveal-from-left  { transform: translateX(-48px); }
.reveal-from-right { transform: translateX(48px); }

.reveal-from-left.reveal-visible,
.reveal-from-right.reveal-visible {
  opacity: 1;
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-from-left,
  .reveal-from-right {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
