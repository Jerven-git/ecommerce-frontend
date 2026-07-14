<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Hero -->
    <section class="relative isolate flex min-h-[60vh] overflow-hidden">
      <!-- Media / rich theme gradient fallback -->
      <img
        v-if="heroImage"
        :src="heroImage"
        :alt="coverAltText || heroHeading"
        class="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <template v-else>
        <div class="svc-hero-gradient absolute inset-0" aria-hidden="true" />
        <div class="svc-hero-grain absolute inset-0" aria-hidden="true" />
      </template>

      <!-- Admin overlay (over image only) -->
      <div
        v-if="heroImage"
        class="absolute inset-0"
        :style="{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }"
      />
      <!-- Legibility gradient for the lower-left copy -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

      <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <p
            v-if="heroLabel"
            class="hero-stagger mb-3 text-sm font-medium text-white/70"
            style="animation-delay: 0.1s"
          >
            {{ heroLabel }}
          </p>
          <h1
            class="hero-stagger display-1 font-bold leading-tight text-white text-balance drop-shadow-sm"
            style="animation-delay: 0.25s"
          >
            {{ heroHeading }}
          </h1>
          <p
            v-if="heroSubtitle"
            class="hero-stagger mt-5 max-w-lg text-lg text-white/85"
            style="animation-delay: 0.4s"
          >
            {{ heroSubtitle }}
          </p>

          <div v-if="primaryCta || secondaryCta" class="hero-stagger mt-8 flex flex-wrap gap-4" style="animation-delay: 0.55s">
            <NuxtLink v-if="primaryCta" :to="primaryCta.link || '#'" class="svc-cta-primary">
              {{ primaryCta.label }}
            </NuxtLink>
            <NuxtLink v-if="secondaryCta" :to="secondaryCta.link || '#'" class="svc-cta-ghost">
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
            <p class="text-sm text-gray-600 leading-relaxed">{{ item.description }}</p>
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
        <h2 class="display-2 font-bold text-gray-900 mb-12 max-w-xl">
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
              <p v-if="service.eyebrow" class="mb-2 text-sm font-medium" :style="{ color: 'var(--color-primary-700)' }">
                {{ service.eyebrow }}
              </p>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight tracking-tight group-hover:text-primary-600 transition-colors">
                {{ service.title }}
              </h3>
              <p v-if="service.description" class="text-base text-gray-600 leading-relaxed mb-5">
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
                :alt="service.cover_alt_text || service.title"
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
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
        <svg class="h-11 w-11 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
        <p class="mt-4 text-lg font-semibold text-gray-900">Services are on the way</p>
        <p class="mt-1 max-w-sm text-gray-500">We're putting the finishing touches on our services. Check back shortly.</p>
      </div>
    </section>

    <!-- Stats -->
    <section v-if="stats.length" class="bg-white border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          <div v-for="(stat, i) in stats" :key="i" class="border-t border-gray-200 pt-4">
            <p class="text-4xl sm:text-5xl font-bold tabular-nums text-gray-900 mb-1" :style="{ fontFamily: 'var(--font-heading)' }">{{ stat.value }}</p>
            <p class="text-sm text-gray-600 leading-relaxed">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section v-if="bottomCta" class="bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="relative overflow-hidden rounded-3xl bg-secondary-900 text-white p-10 sm:p-14 text-center">
          <div
            class="pointer-events-none absolute inset-0"
            aria-hidden="true"
            :style="{ background: 'radial-gradient(70% 130% at 50% -10%, color-mix(in srgb, var(--color-primary) 42%, transparent), transparent 62%)' }"
          />
          <div class="relative">
            <h3 class="display-2 font-bold mb-3">{{ bottomCta.heading }}</h3>
            <p v-if="bottomCta.subtitle" class="text-white/70 mb-7 max-w-lg mx-auto">{{ bottomCta.subtitle }}</p>
            <NuxtLink
              v-if="bottomCta.button_link"
              :to="bottomCta.button_link"
              class="svc-cta-primary"
            >
              {{ bottomCta.button_label || 'Get started' }}
            </NuxtLink>
          </div>
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

const heroLabel = computed(() => servicesCfg.value?.header?.label || 'Our services')
const heroHeading = computed(() => servicesCfg.value?.header?.heading || 'Services built around you')
const heroSubtitle = computed(() => servicesCfg.value?.header?.subtitle || '')
const heroImage = computed(() => siteConfig.value?.services_image_url || null)
const overlayColor = computed(() => siteConfig.value?.services_overlay_color || '#000000')
const overlayOpacity = computed(() => siteConfig.value?.services_overlay_opacity ?? 40)

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
/* Hero: layered, theme-driven gradient fallback (matches the home hero) */
.svc-hero-gradient {
  background:
    radial-gradient(115% 85% at 78% 12%, color-mix(in srgb, var(--color-primary) 50%, transparent), transparent 58%),
    radial-gradient(90% 78% at 6% 94%, color-mix(in srgb, var(--color-primary-800) 55%, transparent), transparent 55%),
    linear-gradient(158deg, var(--color-secondary-950), var(--color-secondary-800) 55%, var(--color-secondary-900));
}
.svc-hero-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.13;
  mix-blend-mode: overlay;
}

/* Hero CTAs (on dark media) */
.svc-cta-primary {
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
.svc-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 42px -14px rgba(0, 0, 0, 0.6);
}
.svc-cta-ghost {
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
.svc-cta-ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.7);
}

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
  .reveal-from-right,
  .hero-stagger {
    opacity: 1;
    transform: none;
    transition: none;
    animation: none;
  }
  .svc-cta-primary:hover {
    transform: none;
  }
}
</style>
