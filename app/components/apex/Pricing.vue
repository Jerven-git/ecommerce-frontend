<template>
  <section id="pricing" class="bg-white py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="pricing-title text-gray-900">Choose the plan that fits your store.</h2>
        <p class="mt-4 text-gray-600">Compare the plans currently available, then choose one after creating your store account.</p>
      </div>

      <div class="pricing-stage mx-auto mt-12 max-w-5xl rounded-2xl bg-[#f7f7f5] px-4 py-10 sm:px-8 sm:py-12 lg:px-14 lg:pb-12 lg:pt-16">
        <div v-if="loading" class="grid gap-6 sm:grid-cols-2" role="status" aria-live="polite" aria-busy="true">
          <p class="sr-only">Loading pricing plans…</p>
          <div v-for="index in 2" :key="index" class="h-[30rem] rounded-2xl bg-white/70 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] motion-safe:animate-pulse" />
        </div>

        <div v-else-if="error" class="mx-auto max-w-lg py-12 text-center" role="alert">
          <Icon name="heroicons:exclamation-circle" class="mx-auto h-8 w-8 text-red-600" aria-hidden="true" />
          <h3 class="mt-4 text-lg font-semibold text-gray-900">Pricing plans unavailable</h3>
          <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ error }}</p>
          <button
            type="button"
            class="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--apex-action)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--apex-action-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-light)]"
            @click="$emit('retry')"
          >
            Try again
          </button>
        </div>

        <div v-else-if="plans.length" class="grid items-stretch gap-6 sm:grid-cols-2">
          <article
            v-for="plan in plans"
            :key="plan.id"
            class="pricing-card flex min-w-0 flex-col rounded-2xl p-6 sm:p-8"
            :class="isFeatured(plan) ? 'is-featured bg-[#0B1020] text-white' : 'bg-white text-gray-900'"
          >
            <div class="flex min-h-8 items-start justify-between gap-4">
              <p class="text-sm font-semibold" :class="isFeatured(plan) ? 'text-white/75' : 'text-gray-500'">
                {{ intervalIntro(plan.interval) }}
              </p>
              <span
                v-if="annualSavingsCents(plan) > 0"
                class="shrink-0 rounded-md bg-[#D8F7A7] px-2.5 py-1 text-xs font-semibold text-gray-900"
              >
                Save {{ formatPrice(annualSavingsCents(plan)) }}
              </span>
            </div>

            <h3 class="mt-5 text-xl font-semibold tracking-[-0.02em]">{{ plan.name }}</h3>
            <div class="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
              <span class="break-words text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{{ formatPrice(plan.price_cents) }}</span>
              <span class="pb-1 text-sm" :class="isFeatured(plan) ? 'text-white/60' : 'text-gray-500'">
                / {{ intervalLabel(plan.interval) }}
              </span>
            </div>
            <p class="mt-4 text-sm leading-relaxed" :class="isFeatured(plan) ? 'text-white/70' : 'text-gray-600'">
              {{ intervalDescription(plan.interval) }}
            </p>
            <p v-if="plan.setup_fee_cents > 0" class="mt-2 text-xs font-medium" :class="isFeatured(plan) ? 'text-white/70' : 'text-gray-600'">
              Plus a {{ formatPrice(plan.setup_fee_cents) }} one-time setup fee.
            </p>

            <div class="my-7 h-px" :class="isFeatured(plan) ? 'bg-white/[0.12]' : 'bg-gray-100'" aria-hidden="true" />

            <p class="text-xs font-semibold uppercase tracking-wide" :class="isFeatured(plan) ? 'text-white/[0.55]' : 'text-gray-500'">
              Included in this plan
            </p>
            <ul v-if="plan.features.length" class="mt-4 flex-1 space-y-3">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex gap-3 text-sm leading-relaxed"
                :class="isFeatured(plan) ? 'text-white/80' : 'text-gray-600'"
              >
                <Icon
                  name="heroicons:check"
                  class="mt-0.5 h-4 w-4 shrink-0"
                  :class="isFeatured(plan) ? 'text-[#A9D6FF]' : 'text-emerald-600'"
                  aria-hidden="true"
                />
                <span>{{ feature }}</span>
              </li>
            </ul>
            <p v-else class="mt-4 flex-1 text-sm" :class="isFeatured(plan) ? 'text-white/70' : 'text-gray-600'">
              Feature details are available during signup.
            </p>

            <NuxtLink
              :to="isAuthenticated ? '/admin/subscription' : '/register'"
              class="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-[background-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              :class="isFeatured(plan)
                ? 'bg-white text-gray-950 hover:bg-blue-50 focus-visible:outline-[var(--apex-focus-on-dark)]'
                : 'bg-[var(--apex-action)] text-white hover:bg-[var(--apex-action-hover)] focus-visible:outline-[var(--apex-focus-on-light)]'"
            >
              {{ isAuthenticated ? 'Manage subscription' : 'Create your store' }}
              <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
            </NuxtLink>

            <p v-if="annualSavingsCents(plan) > 0" class="mt-3 text-center text-xs font-medium text-white/70">
              Save {{ formatPrice(annualSavingsCents(plan)) }} compared with 12 monthly payments.
            </p>
          </article>
        </div>

        <div v-else class="py-16 text-center text-sm text-gray-600">
          <p>No subscription plans are available right now.</p>
          <button type="button" class="mt-4 min-h-11 rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-light)]" @click="$emit('retry')">
            Try again
          </button>
        </div>
      </div>

      <p class="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-600">
        <Icon name="heroicons:lock-closed" class="h-3.5 w-3.5" aria-hidden="true" />
        Subscription prices are in USD. Checkout is handled by Stripe; your storefront payment settings are separate.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SubscriptionPlan } from '~/composables/useSubscription'

const props = defineProps<{
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  plans: SubscriptionPlan[]
}>()

defineEmits<{
  retry: []
}>()

const monthlyPlan = computed(() => props.plans.find(plan => plan.interval === 'monthly'))

function isFeatured(plan: SubscriptionPlan) {
  return plan.interval === 'yearly'
}

function annualSavingsCents(plan: SubscriptionPlan) {
  if (plan.interval !== 'yearly' || !monthlyPlan.value) return 0
  return Math.max(0, monthlyPlan.value.price_cents * 12 - plan.price_cents)
}

function formatPrice(cents?: number | null) {
  if (cents == null) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

function intervalIntro(interval: SubscriptionPlan['interval']) {
  return `${interval.charAt(0).toUpperCase()}${interval.slice(1)} billing`
}

function intervalDescription(interval: SubscriptionPlan['interval']) {
  switch (interval) {
    case 'weekly': return 'Billed once each week.'
    case 'quarterly': return 'Billed once every three months.'
    case 'yearly': return 'Billed once each year.'
    default: return 'Billed once each month.'
  }
}

function intervalLabel(interval: SubscriptionPlan['interval']) {
  switch (interval) {
    case 'weekly': return 'week'
    case 'quarterly': return '3 months'
    case 'yearly': return 'year'
    default: return 'month'
  }
}
</script>

<style scoped>
.pricing-title {
#pricing { scroll-margin-top: 5rem; }
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.5rem, 4.8vw, 4.5rem);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.pricing-card {
  box-shadow: 0 24px 55px -32px rgb(15 23 42 / 38%);
  transition:
    transform 350ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 350ms ease;
}

.pricing-card.is-featured {
  box-shadow: 0 32px 70px -30px rgb(11 16 32 / 58%);
}

.pricing-card:focus-within {
  transform: translateY(-0.375rem);
  box-shadow: 0 30px 65px -30px rgb(15 23 42 / 48%);
}

@media (hover: hover) and (pointer: fine) {
  .pricing-card:hover {
    transform: translateY(-0.375rem);
    box-shadow: 0 30px 65px -30px rgb(15 23 42 / 48%);
  }
}

@media (min-width: 1024px) {
  .pricing-card.is-featured {
    transform: translateY(-0.875rem);
  }

  .pricing-card.is-featured:focus-within {
    transform: translateY(-1.25rem);
  }
}

@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {
  .pricing-card.is-featured:hover {
    transform: translateY(-1.25rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pricing-card {
    transition-duration: 0.01ms;
  }

  .pricing-card:hover,
  .pricing-card:focus-within,
  .pricing-card.is-featured:hover,
  .pricing-card.is-featured:focus-within {
    transform: none;
  }
}
</style>
