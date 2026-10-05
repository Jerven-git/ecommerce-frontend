<template>
  <section id="pricing" class="apex-pricing">
    <div class="apex-pricing__inner">
      <div class="apex-pricing__intro">
        <h2 class="pricing-title">Choose the plan that fits your store.</h2>
        <p>Compare the plans currently available, then choose one after creating your store account.</p>
      </div>

      <div class="pricing-stage">
        <div v-if="loading" class="pricing-loading" role="status" aria-live="polite" aria-busy="true">
          <p class="sr-only">Loading pricing plans…</p>
          <div class="pricing-loading__switcher motion-safe:animate-pulse" />
          <div class="pricing-loading__card motion-safe:animate-pulse" />
        </div>

        <div v-else-if="error" class="pricing-error" role="alert">
          <Icon name="heroicons:exclamation-circle" aria-hidden="true" />
          <h3>Pricing plans unavailable</h3>
          <p>{{ error }}</p>
          <button type="button" @click="$emit('retry')">Try again</button>
        </div>

        <MotionConfig v-else-if="activePlan" reduced-motion="user">
          <div class="pricing-switcher" role="group" aria-label="Choose a billing period">
            <button
              v-for="plan in availablePlans"
              :key="plan.id"
              type="button"
              class="pricing-switcher__option"
              :class="{ 'is-active': plan.id === activePlan.id }"
              :aria-pressed="plan.id === activePlan.id"
              @click="selectPlan(plan)"
            >
              <motion.span
                v-if="plan.id === activePlan.id"
                layout-id="apex-pricing-active-plan"
                class="pricing-switcher__selection"
                :transition="selectorTransition"
                aria-hidden="true"
              />
              <span class="pricing-switcher__label">{{ intervalOptionLabel(plan) }}</span>
              <span v-if="annualSavingsPercent(plan) > 0" class="pricing-switcher__saving">
                Save {{ annualSavingsPercent(plan) }}%
              </span>
            </button>
          </div>

          <article class="pricing-card">
            <div class="pricing-card__summary">
              <div>
                <p class="pricing-card__billing">{{ intervalIntro(activePlan.interval) }}</p>
                <h3>{{ activePlan.name }}</h3>

                <div class="pricing-card__price-row">
                  <span class="pricing-card__price" aria-hidden="true">{{ animatedPriceLabel }}</span>
                  <span class="sr-only" aria-live="polite">
                    {{ formatPrice(activePlan.price_cents) }} per {{ intervalLabel(activePlan.interval) }}
                  </span>
                  <span class="pricing-card__interval">/ {{ intervalLabel(activePlan.interval) }}</span>
                </div>

                <p class="pricing-card__description">{{ intervalDescription(activePlan.interval) }}</p>
                <p v-if="activePlan.setup_fee_cents > 0" class="pricing-card__setup">
                  Plus a {{ formatPrice(activePlan.setup_fee_cents) }} one-time setup fee.
                </p>
                <p v-if="annualSavingsCents(activePlan) > 0" class="pricing-card__saving">
                  Save {{ formatPrice(annualSavingsCents(activePlan)) }} compared with 12 monthly payments.
                </p>
              </div>

              <NuxtLink
                :to="isAuthenticated ? '/admin/subscription' : '/register'"
                class="pricing-card__action"
              >
                {{ isAuthenticated ? 'Manage subscription' : 'Create your store' }}
                <Icon name="heroicons:arrow-right" aria-hidden="true" />
              </NuxtLink>
            </div>

            <div class="pricing-card__features">
              <p class="pricing-card__features-title">Included in this plan</p>
              <ul v-if="activePlan.features.length">
                <li v-for="feature in activePlan.features" :key="feature">
                  <Icon name="heroicons:check" aria-hidden="true" />
                  <span>{{ feature }}</span>
                </li>
              </ul>
              <p v-else class="pricing-card__fallback">Feature details are available during signup.</p>
            </div>
          </article>
        </MotionConfig>

        <div v-else class="pricing-empty">
          <p>No subscription plans are available right now.</p>
          <button type="button" @click="$emit('retry')">Try again</button>
        </div>
      </div>

      <p class="pricing-footnote">
        <Icon name="heroicons:lock-closed" aria-hidden="true" />
        Subscription prices are in USD. Checkout is handled by Stripe; your storefront payment settings are separate.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { MotionConfig, animate, motion, useReducedMotion } from 'motion-v'
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

const intervalOrder: Record<SubscriptionPlan['interval'], number> = {
  weekly: 0,
  monthly: 1,
  quarterly: 2,
  yearly: 3,
}

const prefersReducedMotion = useReducedMotion()
const selectedPlanId = ref<number | null>(null)
const animatedPriceCents = ref(0)
let priceAnimation: ReturnType<typeof animate> | null = null

const availablePlans = computed(() => [...props.plans]
  .sort((a, b) => intervalOrder[a.interval] - intervalOrder[b.interval]))

const activePlan = computed(() => availablePlans.value.find(plan => plan.id === selectedPlanId.value)
  ?? preferredPlan(availablePlans.value))

const monthlyPlan = computed(() => availablePlans.value.find(plan => plan.interval === 'monthly'))
const animatedPriceLabel = computed(() => formatAnimatedPrice(animatedPriceCents.value))

const selectorTransition = computed(() => prefersReducedMotion.value
  ? { duration: 0 }
  : { type: 'spring', stiffness: 460, damping: 38, mass: 0.7 })

watch(availablePlans, (plans) => {
  if (!plans.some(plan => plan.id === selectedPlanId.value)) {
    selectedPlanId.value = preferredPlan(plans)?.id ?? null
  }
}, { immediate: true })

watch(activePlan, (plan, previousPlan) => {
  priceAnimation?.stop()
  priceAnimation = null
  if (!plan) return

  if (!import.meta.client || !previousPlan || prefersReducedMotion.value) {
    animatedPriceCents.value = plan.price_cents
    return
  }

  priceAnimation = animate(animatedPriceCents.value, plan.price_cents, {
    duration: 0.42,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: value => {
      animatedPriceCents.value = value
    },
    onComplete: () => {
      animatedPriceCents.value = plan.price_cents
      priceAnimation = null
    },
  })
}, { immediate: true })

watch(prefersReducedMotion, (reduceMotion) => {
  if (!reduceMotion || !activePlan.value) return
  priceAnimation?.stop()
  priceAnimation = null
  animatedPriceCents.value = activePlan.value.price_cents
})

onBeforeUnmount(() => priceAnimation?.stop())

function preferredPlan(plans: SubscriptionPlan[]) {
  return plans.find(plan => plan.interval === 'yearly')
    ?? plans.find(plan => plan.interval === 'monthly')
    ?? plans[0]
    ?? null
}

function selectPlan(plan: SubscriptionPlan) {
  if (plan.id !== selectedPlanId.value) selectedPlanId.value = plan.id
}

function annualSavingsCents(plan: SubscriptionPlan) {
  if (plan.interval !== 'yearly' || !monthlyPlan.value) return 0
  return Math.max(0, monthlyPlan.value.price_cents * 12 - plan.price_cents)
}

function annualSavingsPercent(plan: SubscriptionPlan) {
  if (!monthlyPlan.value) return 0
  const monthlyAnnualCost = monthlyPlan.value.price_cents * 12
  if (monthlyAnnualCost <= 0) return 0
  return Math.round((annualSavingsCents(plan) / monthlyAnnualCost) * 100)
}

function formatPrice(cents?: number | null) {
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

function formatAnimatedPrice(cents: number) {
  const targetHasCents = (activePlan.value?.price_cents ?? 0) % 100 !== 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: targetHasCents ? 2 : 0,
    maximumFractionDigits: targetHasCents ? 2 : 0,
  }).format(cents / 100)
}

function intervalOptionLabel(plan: SubscriptionPlan) {
  return `${plan.interval.charAt(0).toUpperCase()}${plan.interval.slice(1)}`
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
.apex-pricing { scroll-margin-top: 5rem; background: #fff; padding: clamp(4rem, 8vw, 6rem) 0; color: #1a1a1a; }
.apex-pricing__inner { width: min(100%, 80rem); margin: 0 auto; padding: 0 1.5rem; }
.apex-pricing__intro { max-width: 42rem; margin: 0 auto; text-align: center; }
.pricing-title { margin: 0; color: #111827; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-pricing__intro > p { margin: 1rem 0 0; color: #4b5563; line-height: 1.65; }
.pricing-stage { width: min(100%, 62rem); margin: 3rem auto 0; padding: clamp(1.5rem, 4vw, 3.5rem); border-radius: 1rem; background: #f7f7f5; }
.pricing-loading__switcher { width: 18rem; max-width: 100%; height: 3.25rem; margin: 0 auto 1.5rem; border-radius: 9999px; background: #e5e7eb; }
.pricing-loading__card { min-height: 28rem; border-radius: 1rem; background: rgb(255 255 255 / 72%); box-shadow: 0 24px 55px -32px rgb(15 23 42 / 38%); }
.pricing-switcher { display: flex; width: max-content; max-width: 100%; gap: 0.25rem; margin: 0 auto 1.5rem; padding: 0.3rem; overflow-x: auto; border-radius: 9999px; background: #e7e7e3; }
.pricing-switcher__option { position: relative; display: flex; min-height: 2.75rem; align-items: center; justify-content: center; gap: 0.45rem; padding: 0.6rem 1rem; border: 0; border-radius: 9999px; background: transparent; color: #4b5563; cursor: pointer; font-size: 0.875rem; font-weight: 650; white-space: nowrap; }
.pricing-switcher__option.is-active { color: #111827; }
.pricing-switcher__option:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 3px; }
.pricing-switcher__selection { position: absolute; inset: 0; border-radius: inherit; background: #fff; box-shadow: 0 5px 16px -8px rgb(15 23 42 / 45%); }
.pricing-switcher__label, .pricing-switcher__saving { position: relative; z-index: 1; }
.pricing-switcher__saving { border-radius: 9999px; background: #d8f7a7; padding: 0.15rem 0.45rem; color: #26331b; font-size: 0.6875rem; font-weight: 750; }
.pricing-card { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); overflow: hidden; border-radius: 1rem; background: #0b1020; color: #fff; box-shadow: 0 32px 70px -30px rgb(11 16 32 / 58%); }
.pricing-card__summary, .pricing-card__features { min-width: 0; padding: clamp(1.75rem, 4vw, 3rem); }
.pricing-card__summary { display: flex; flex-direction: column; }
.pricing-card__billing { margin: 0; color: rgb(255 255 255 / 62%); font-size: 0.8125rem; font-weight: 650; letter-spacing: 0.04em; text-transform: uppercase; }
.pricing-card h3 { margin: 0.9rem 0 0; font-size: clamp(1.25rem, 2vw, 1.6rem); font-weight: 650; letter-spacing: -0.02em; }
.pricing-card__price-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.35rem 0.65rem; margin-top: 1.1rem; }
.pricing-card__price { min-width: 3ch; font-size: clamp(3.5rem, 8vw, 6rem); font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.04em; line-height: 0.95; }
.pricing-card__interval { color: rgb(255 255 255 / 58%); font-size: 0.875rem; }
.pricing-card__description { margin: 1.25rem 0 0; color: rgb(255 255 255 / 72%); font-size: 0.925rem; line-height: 1.6; }
.pricing-card__setup { margin: 0.45rem 0 0; color: rgb(255 255 255 / 65%); font-size: 0.75rem; line-height: 1.5; }
.pricing-card__saving { margin: 1rem 0 0; color: #d8f7a7; font-size: 0.8125rem; font-weight: 650; line-height: 1.5; }
.pricing-card__action { display: inline-flex; min-height: 3rem; align-items: center; justify-content: center; gap: 0.5rem; margin-top: auto; padding: 0.75rem 1.25rem; border-radius: 0.75rem; background: #fff; color: #111827; font-size: 0.875rem; font-weight: 700; transition: background-color 180ms ease, color 180ms ease; }
.pricing-card__action:hover { background: #d8f7a7; }
.pricing-card__action:focus-visible { outline: 2px solid var(--apex-focus-on-dark); outline-offset: 4px; }
.pricing-card__action :deep(svg) { width: 1rem; height: 1rem; }
.pricing-card__features { border-left: 1px solid rgb(255 255 255 / 12%); background: rgb(255 255 255 / 3%); }
.pricing-card__features-title { margin: 0; color: rgb(255 255 255 / 58%); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.pricing-card__features ul { display: grid; gap: 0.9rem; margin: 1.5rem 0 0; padding: 0; list-style: none; }
.pricing-card__features li { display: flex; gap: 0.75rem; color: rgb(255 255 255 / 82%); font-size: 0.875rem; line-height: 1.55; }
.pricing-card__features li :deep(svg) { width: 1rem; height: 1rem; flex: 0 0 auto; margin-top: 0.2rem; color: #a9d6ff; }
.pricing-card__fallback { margin: 1.5rem 0 0; color: rgb(255 255 255 / 72%); font-size: 0.875rem; line-height: 1.6; }
.pricing-footnote { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1.5rem 0 0; color: #4b5563; font-size: 0.75rem; line-height: 1.5; text-align: center; }
.pricing-footnote :deep(svg) { width: 0.875rem; height: 0.875rem; flex: 0 0 auto; }
.pricing-error, .pricing-empty { max-width: 32rem; margin: 0 auto; padding: 3rem 0; text-align: center; }
.pricing-error > :deep(svg) { width: 2rem; height: 2rem; margin: 0 auto; color: #dc2626; }
.pricing-error h3 { margin: 1rem 0 0; color: #111827; font-size: 1.125rem; font-weight: 650; }
.pricing-error p, .pricing-empty p { margin: 0.5rem 0 0; color: #4b5563; font-size: 0.875rem; line-height: 1.6; }
.pricing-error button, .pricing-empty button { min-height: 2.75rem; margin-top: 1.25rem; padding: 0.625rem 1.25rem; border: 0; border-radius: 0.75rem; background: var(--apex-action); color: #fff; cursor: pointer; font-weight: 650; }
.pricing-error button:hover, .pricing-empty button:hover { background: var(--apex-action-hover); }
.pricing-error button:focus-visible, .pricing-empty button:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }

@media (max-width: 767px) {
  .apex-pricing__inner { padding: 0 1.25rem; }
  .pricing-stage { padding: 1.25rem; }
  .pricing-switcher { justify-content: flex-start; }
  .pricing-switcher__option { padding-inline: 0.8rem; }
  .pricing-card { grid-template-columns: 1fr; }
  .pricing-card__summary, .pricing-card__features { padding: 1.75rem; }
  .pricing-card__action { margin-top: 2rem; }
  .pricing-card__features { border-top: 1px solid rgb(255 255 255 / 12%); border-left: 0; }
  .pricing-footnote { align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .pricing-card__action { transition-duration: 0.01ms; }
}
</style>
