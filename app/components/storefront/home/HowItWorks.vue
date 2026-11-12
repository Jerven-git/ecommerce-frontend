<template>
  <section v-if="visible" class="how-it-works section-accent py-14 lg:py-20" :style="typographyStyle">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div ref="headingRef" class="home-section-heading reveal">
        <h2 v-if="heading" class="steps-heading font-semibold text-gray-900">{{ heading }}</h2>
        <p v-if="label" class="steps-label text-sm font-medium text-primary-700">{{ label }}</p>
        <p v-if="subtitle" class="steps-subtitle text-gray-600">{{ subtitle }}</p>
      </div>
      <ol v-if="steps.length" data-builtin-layout-grid class="steps-grid grid gap-6 md:grid-cols-3">
        <li v-for="(step, index) in steps" :key="index" class="steps-item">
          <span class="steps-marker" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="min-w-0">
            <h3 v-if="step.title" class="steps-title font-semibold text-gray-900">{{ step.title }}</h3>
            <p v-if="step.description" class="steps-description text-gray-600">{{ step.description }}</p>
          </div>
        </li>
      </ol>
      <div v-if="primaryAction" class="steps-action">
        <NuxtLink :to="primaryAction.to" class="btn-primary inline-flex min-h-11 items-center gap-2 text-sm">
          {{ primaryAction.label }}
          <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { howItWorksAction, howItWorksDefaultAction, howItWorksTextSizes } from '~/utils/howItWorks'
import type { HomepageStep, HomepageSteps } from '~/composables/useSiteConfig'

const props = defineProps<{
  config: HomepageSteps | null
}>()

const { siteConfig } = useSiteConfig()
const isInformationalEditorial = computed(() => siteConfig.value?.theme_layout?.id === 'informational-editorial')

const defaultSteps: HomepageStep[] = [
  { icon: 'heroicons:magnifying-glass', title: 'Browse Products', description: 'Explore our wide selection of quality items across all categories.' },
  { icon: 'heroicons:shopping-cart', title: 'Add to Cart', description: 'Pick your favourites and add them to your cart with one click.' },
  { icon: 'heroicons:shield-check', title: 'Fast Checkout', description: 'Secure payment and fast delivery straight to your doorstep.' },
]

const label = computed(() => props.config ? (props.config.label ?? '') : isInformationalEditorial.value ? '' : 'Simple & Easy')
const heading = computed(() => props.config ? (props.config.heading ?? '') : isInformationalEditorial.value ? '' : 'How It Works')
const subtitle = computed(() => props.config ? (props.config.subtitle ?? '') : isInformationalEditorial.value ? '' : 'Start shopping in just three easy steps — no hassle, no confusion.')
const steps = computed(() => props.config
  ? (props.config.items ?? []).filter(step => step.title || step.description)
  : isInformationalEditorial.value ? [] : defaultSteps,
)
const visible = computed(() => !!(label.value || heading.value || subtitle.value || steps.value.length))
const primaryAction = computed(() => howItWorksAction(props.config?.button, howItWorksDefaultAction(siteConfig.value)))
const typographyStyle = computed(() => Object.fromEntries(Object.entries(howItWorksTextSizes(props.config?.typography)).map(([key, value]) => [`--steps-${key.replace('_', '-')}-size`, `${value}px`])))
const { revealRef: headingRef } = useScrollReveal()
</script>

<style scoped>
.how-it-works { overflow-wrap: anywhere; }
.how-it-works .home-section-heading { border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }
.steps-heading { max-width: 28ch; line-height: 1.2; letter-spacing: -.025em; text-wrap: balance; }
.steps-label { margin-top: .75rem; }
.steps-subtitle { max-width: 65ch; margin-top: .75rem; line-height: 1.7; }
.steps-grid { list-style: none; padding: 0; margin-top: 1.75rem; }
.steps-item { display: grid; grid-template-columns: 2rem minmax(0, 1fr); align-items: start; gap: 1rem; min-width: 0; padding-block: 1.25rem; border-top: 1px solid color-mix(in srgb,currentColor 16%,transparent); }
.steps-marker { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: .5rem; background: var(--color-primary-50); color: var(--color-primary-800); font-size: .75rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.steps-title { margin: 0; line-height: 1.4; letter-spacing: -.015em; }
.steps-description { margin-top: .5rem; line-height: 1.75; }
.steps-action { margin-top: 1.75rem; }
/* Saved sizes take precedence over the typography of the selected theme. */
@layer builtin-section-overrides {
  .how-it-works .steps-heading { font-size: var(--steps-heading-size,28px) !important; }
  .how-it-works .steps-subtitle { font-size: var(--steps-subtitle-size,15px) !important; }
  .how-it-works .steps-title { font-size: var(--steps-step-title-size,17px) !important; }
  .how-it-works .steps-description { font-size: var(--steps-description-size,14px) !important; }
}
</style>
