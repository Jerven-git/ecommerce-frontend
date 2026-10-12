<template>
  <section v-if="features.length" class="border-t border-gray-100 bg-white py-12 lg:py-16">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid gap-y-10 md:grid-cols-3 md:gap-y-0">
        <div
          v-for="(feature, index) in features"
          :key="index"
          :ref="addRevealRef"
          class="reveal md:px-10 md:first:pl-0 md:last:pr-0"
          :class="index > 0 ? 'md:border-l md:border-gray-200' : ''"
          :style="{ transitionDelay: `${0.1 + index * 0.12}s` }"
        >
          <Icon :name="feature.icon ?? defaultFeatureIcons[index % defaultFeatureIcons.length]!" class="h-7 w-7" :style="{ color: 'var(--color-primary-600)' }" />
          <h3 v-if="feature.title" class="mt-5 text-lg font-semibold text-gray-900">{{ feature.title }}</h3>
          <p v-if="feature.description" class="mt-2 leading-relaxed text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
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
const { addRevealRef } = useScrollRevealAll()
</script>
