<template>
  <section v-if="features.length" class="feature-strip bg-white py-12 lg:py-16" aria-label="Features">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <ul data-builtin-layout-grid class="features-grid" :style="{ '--feature-columns': features.length === 4 ? 2 : Math.min(features.length, 3), '--feature-tablet-columns': Math.min(features.length, 2) }">
        <li v-for="(feature, index) in features" :key="index" class="feature-item">
          <span class="feature-icon" aria-hidden="true">
            <Icon :name="feature.icon?.trim() || defaultFeatureIcons[index % defaultFeatureIcons.length]!" class="h-5 w-5" />
          </span>
          <div class="feature-copy">
            <h3 v-if="feature.title" class="feature-title font-semibold text-gray-900">{{ feature.title }}</h3>
            <p v-if="feature.description" class="feature-description text-gray-600">{{ feature.description }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageFeature, HomepageFeatures } from '~/composables/useSiteConfig'

const props = defineProps<{
  config: HomepageFeatures | null
}>()

const defaultFeatureIcons = [
  'heroicons:cube',
  'heroicons:currency-dollar',
  'heroicons:bolt',
]

const defaultFeatures: HomepageFeature[] = [
  { icon: 'heroicons:cube', title: 'Quality Products', description: 'Carefully curated selection of premium items.' },
  { icon: 'heroicons:currency-dollar', title: 'Best Prices', description: 'Competitive pricing on all our products.' },
  { icon: 'heroicons:bolt', title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep.' },
]

const features = computed(() => props.config
  ? (props.config.items ?? []).filter(feature => feature.title || feature.description)
  : defaultFeatures,
)
</script>

<style>
/* These rules are limited to the built-in feature strip, including its saved variants. */
.feature-strip { overflow-wrap: anywhere; }
.feature-strip .features-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 1.5rem 2rem; padding: 0; margin: 0; list-style: none; }
.feature-strip .feature-item { display: grid; grid-template-columns: 2rem minmax(0,1fr); align-items: start; gap: .875rem; min-width: 0; padding-block: 1.25rem; border-top: 1px solid color-mix(in srgb,currentColor 14%,transparent); }
.feature-strip .feature-icon { display: grid; width: 2rem; height: 2rem; place-items: center; color: var(--color-primary-800); }
.feature-strip .feature-copy { min-width: 0; }
.feature-strip .feature-title { margin: .125rem 0 0; font-size: 1rem; line-height: 1.4; letter-spacing: -.015em; text-wrap: balance; }
.feature-strip .feature-description { max-width: 65ch; margin: .5rem 0 0; font-size: .875rem; line-height: 1.75; }
.builtin-section[data-builtin-section="features"][data-builtin-layout="cards"] .feature-strip .feature-item { display: flex; flex-direction: column; align-items: start; gap: 1rem; }
.builtin-section[data-builtin-section="features"][data-builtin-layout="cards"] .feature-strip .feature-icon { width: 2.5rem; height: 2.5rem; border-radius: .5rem; background: var(--color-primary-50); }
.builtin-section[data-builtin-section="features"][data-builtin-layout="list"] .feature-strip .feature-item { border-top: 0; padding-inline: 0; }
@media (min-width:640px) {
  .feature-strip .features-grid { grid-template-columns: repeat(var(--feature-tablet-columns,2),minmax(0,1fr)); }
}
@media (min-width:1024px) {
  .feature-strip .features-grid { grid-template-columns: repeat(var(--feature-columns,3),minmax(0,1fr)); }
}
</style>
