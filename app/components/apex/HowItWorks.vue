<template>
  <section id="how-it-works" class="border-y border-gray-100 bg-gray-50 py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">How it works</h2>
        <p class="mt-3 text-gray-600">Four steps from zero to live store.</p>
      </div>

      <ol class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li v-for="(step, index) in steps" :key="step.title">
          <NuxtLink
            :to="step.link"
            class="process-card group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-light)]"
            :style="{ '--step-accent': step.accent }"
          >
            <div class="process-media relative flex h-36 items-center justify-center overflow-hidden">
              <Icon :name="step.icon" class="process-icon h-12 w-12 text-gray-900" aria-hidden="true" />
              <span class="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-semibold tabular-nums text-gray-900">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
            </div>

            <div class="flex flex-1 flex-col p-6">
              <div class="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-gray-500">
                <span class="h-2 w-2 rounded-full bg-[var(--step-accent)]" aria-hidden="true" />
                {{ step.category }}
              </div>

              <h3 class="mt-4 text-2xl font-semibold tracking-[-0.03em] text-gray-900">{{ step.title }}</h3>
              <p class="mt-3 text-sm leading-relaxed text-gray-600">{{ step.description }}</p>

              <div class="mt-5 flex flex-wrap gap-1.5">
                <span
                  v-for="tag in step.tags"
                  :key="tag"
                  class="rounded-md bg-gray-100 px-2 py-1 text-[0.6875rem] font-medium text-gray-600"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="mt-auto pt-7">
                <p class="mb-3 text-xs font-medium text-gray-500">{{ step.detail }}</p>
                <span class="process-cta relative isolate flex min-h-11 items-center justify-between gap-3 overflow-hidden rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                  <span>{{ step.cta }}</span>
                  <svg class="process-arrow h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SubscriptionPlan } from '~/composables/useSubscription'

const props = defineProps<{
  plans: SubscriptionPlan[]
}>()

const monthlyPlan = computed(() => props.plans.find(plan => plan.interval === 'monthly'))
const yearlyPlan = computed(() => props.plans.find(plan => plan.interval === 'yearly'))

const planTags = computed(() => {
  const tags = [...new Set(props.plans.map(plan => intervalTag(plan.interval)))]
  return tags.length ? tags : ['Billing']
})

const planDescription = computed(() => {
  const monthly = monthlyPlan.value
  const yearly = yearlyPlan.value
  if (monthly && yearly) {
    const saving = Math.max(0, monthly.price_cents * 12 - yearly.price_cents)
    const savingCopy = saving > 0 ? ` Save ${formatPrice(saving)} with annual billing.` : ''
    return `Monthly ${formatPrice(monthly.price_cents)} or yearly ${formatPrice(yearly.price_cents)}.${savingCopy} Unlocks the admin.`
  }

  const plan = props.plans[0]
  if (plan) return `${plan.name} is ${formatPrice(plan.price_cents)} per ${intervalLabel(plan.interval)}. Unlocks the admin.`
  return 'Choose the billing interval that works for you. Current prices appear below.'
})

const steps = computed(() => [
  {
    title: 'Create account',
    category: 'Get started',
    description: 'Pick your store name and slug — you get an instant subdomain.',
    tags: ['Account', 'Store slug'],
    detail: 'Your storefront starts here',
    cta: 'Create account',
    link: '/register',
    icon: 'heroicons:user-plus',
    accent: '#D8F7A7',
  },
  {
    title: 'Choose a plan',
    category: 'Pick your plan',
    description: planDescription.value,
    tags: planTags.value,
    detail: 'Review the current plan details',
    cta: 'View pricing',
    link: '#pricing',
    icon: 'heroicons:credit-card',
    accent: '#C9D9FF',
  },
  {
    title: 'Set up your store',
    category: 'Make it yours',
    description: 'Add products, theme, domain and shipping in the dashboard.',
    tags: ['Products', 'Theme', 'Shipping'],
    detail: 'Everything in one dashboard',
    cta: 'See what is included',
    link: '#features',
    icon: 'heroicons:paint-brush',
    accent: '#E2D8FF',
  },
  {
    title: 'Sell & manage',
    category: 'Go live',
    description: 'Orders, discounts, blog and analytics — all in SSU.',
    tags: ['Orders', 'Content', 'Analytics'],
    detail: 'Built for daily operations',
    cta: 'Start selling',
    link: '/register',
    icon: 'heroicons:chart-bar-square',
    accent: '#FFD8C2',
  },
])

function formatPrice(cents: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

function intervalTag(interval: SubscriptionPlan['interval']) {
  return interval.charAt(0).toUpperCase() + interval.slice(1)
}

function intervalLabel(interval: SubscriptionPlan['interval']) {
  if (interval === 'quarterly') return 'three months'
  return interval.replace(/ly$/, '')
}
</script>

<style scoped>
.process-card {
  transition:
    transform 350ms cubic-bezier(0.2, 0.75, 0.25, 1),
    box-shadow 350ms ease;
}

.process-media {
  background: var(--step-accent);
}

.process-icon {
  transition: transform 560ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.process-cta::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: var(--step-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 350ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.process-arrow {
  transition: transform 350ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

@media (hover: hover) and (pointer: fine) {
  .process-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 32px rgb(15 23 42 / 10%), 0 3px 8px rgb(15 23 42 / 4%);
  }

  .process-card:hover .process-icon {
    transform: scale(1.08);
  }
}

.process-card:hover .process-cta::before,
.process-card:focus-visible .process-cta::before {
  transform: scaleX(1);
}

.process-card:hover .process-arrow,
.process-card:focus-visible .process-arrow {
  transform: rotate(-35deg);
}

.process-card:focus-visible {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgb(15 23 42 / 10%), 0 3px 8px rgb(15 23 42 / 4%);
}

@media (prefers-reduced-motion: reduce) {
  .process-card,
  .process-icon,
  .process-cta::before,
  .process-arrow {
    transition-duration: 0.01ms;
  }

  .process-card:hover,
  .process-card:focus-visible,
  .process-card:hover .process-icon,
  .process-card:hover .process-arrow,
  .process-card:focus-visible .process-arrow {
    transform: none;
  }
}
</style>
