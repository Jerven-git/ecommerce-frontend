<template>
  <section class="section-accent py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div ref="headingRef" class="reveal max-w-2xl">
        <p v-if="label" class="mb-3 text-sm font-medium" :style="{ color: 'var(--color-primary-700)' }">{{ label }}</p>
        <h2 class="display-2 font-bold text-gray-900">{{ heading }}</h2>
        <p class="mt-4 text-lg text-gray-600">{{ subtitle }}</p>
      </div>

      <ol class="mt-10 grid gap-x-10 gap-y-10 md:mt-16 md:gap-y-12 md:grid-cols-3">
        <li
          v-for="(step, index) in steps"
          :key="index"
          :ref="addRevealRef"
          class="reveal"
          :style="{ transitionDelay: `${0.1 + index * 0.12}s` }"
        >
          <div class="flex items-center gap-4">
            <span class="text-3xl font-bold tabular-nums" :style="{ color: 'var(--color-primary-600)', fontFamily: 'var(--font-heading)' }">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="h-px flex-1 bg-gray-300" />
          </div>
          <h3 class="mt-5 text-lg font-semibold text-gray-900">{{ step.title }}</h3>
          <p class="mt-2 leading-relaxed text-gray-600">{{ step.description }}</p>
        </li>
      </ol>

      <div :ref="addRevealRef" class="reveal mt-14" style="transition-delay: 0.5s">
        <NuxtLink to="/shop" class="btn-primary inline-flex text-white items-center gap-2">
          Start Shopping
          <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageStep, HomepageSteps } from '~/composables/useSiteConfig'

const props = defineProps<{
  config: HomepageSteps | null
}>()

const defaultSteps: HomepageStep[] = [
  { icon: 'heroicons:magnifying-glass', title: 'Browse Products', description: 'Explore our wide selection of quality items across all categories.' },
  { icon: 'heroicons:shopping-cart', title: 'Add to Cart', description: 'Pick your favourites and add them to your cart with one click.' },
  { icon: 'heroicons:shield-check', title: 'Fast Checkout', description: 'Secure payment and fast delivery straight to your doorstep.' },
]

const label = computed(() => props.config?.label || 'Simple & Easy')
const heading = computed(() => props.config?.heading || 'How It Works')
const subtitle = computed(() => props.config?.subtitle || 'Start shopping in just three easy steps — no hassle, no confusion.')
const steps = computed(() => props.config?.items?.length ? props.config.items : defaultSteps)
const { revealRef: headingRef } = useScrollReveal()
const { addRevealRef } = useScrollRevealAll()
</script>
