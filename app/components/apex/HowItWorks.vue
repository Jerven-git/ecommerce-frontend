<template>
  <section id="how-it-works" class="apex-steps" aria-labelledby="apex-steps-title">
    <div class="apex-steps__inner">
      <div class="apex-steps__intro">
        <h2 id="apex-steps-title">From account to a store you can run.</h2>
        <p>Create your store, choose a plan, then shape the storefront and the work behind it. An existing business can add its current catalogue at its own pace.</p>
      </div>

      <ol class="apex-steps__list">
        <li v-for="(step, index) in steps" :key="step.title" class="apex-steps__step">
          <span class="apex-steps__number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <NuxtLink :to="step.link" class="apex-steps__link">
            {{ step.action }} <Icon name="heroicons:arrow-up-right" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ isAuthenticated: boolean }>()

const steps = computed(() => [
  {
    title: 'Create your account',
    description: 'Name your store and create the account you will use to manage it.',
    action: props.isAuthenticated ? 'Open dashboard' : 'Create your store',
    link: props.isAuthenticated ? '/admin' : '/register',
  },
  {
    title: 'Choose a plan',
    description: 'Review the current plans, then complete subscription checkout to activate selling.',
    action: 'See current plans',
    link: '#pricing',
  },
  {
    title: 'Set up your store',
    description: 'Add products or services and configure your appearance, payment and delivery settings.',
    action: 'Explore the tools',
    link: '#features',
  },
  {
    title: 'Manage the day to day',
    description: 'Keep your catalogue and content current, and manage orders as they come in.',
    action: 'See the workspace',
    link: '#product',
  },
])
</script>

<style scoped>
.apex-steps { scroll-margin-top: 5rem; background: #f7f7f5; color: #1a1a1a; }
.apex-steps__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-steps__intro { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 0.7fr); align-items: end; gap: 2rem; margin-bottom: 3rem; }
.apex-steps__intro h2 { max-width: 15ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-steps__intro p { max-width: 31rem; margin: 0 0 0.35rem; color: #525252; font-size: 1.05rem; line-height: 1.65; }
.apex-steps__list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0; border-top: 1px solid #cfcfca; padding: 0; list-style: none; }
.apex-steps__step { display: flex; min-width: 0; flex-direction: column; padding: 2rem clamp(1rem, 2vw, 2rem) 0; }
.apex-steps__step:first-child { padding-left: 0; }
.apex-steps__step + .apex-steps__step { border-left: 1px solid #d9d9d5; }
.apex-steps__number { color: #626262; font-family: 'Space Grotesk', var(--font-heading); font-size: 0.85rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.apex-steps__step h3 { margin: 2rem 0 0; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1.4rem, 2vw, 1.9rem); font-weight: 600; line-height: 1.2; letter-spacing: -0.025em; }
.apex-steps__step p { margin: 0.8rem 0 1.75rem; color: #525252; font-size: 0.92rem; line-height: 1.6; }
.apex-steps__link { display: inline-flex; width: fit-content; min-height: 2.75rem; align-items: center; gap: 0.35rem; margin-top: auto; color: #252525; font-size: 0.84rem; font-weight: 700; text-decoration-line: underline; text-decoration-color: #8d8d8d; text-underline-offset: 0.3rem; }
.apex-steps__link:hover { text-decoration-color: currentColor; }
.apex-steps__link:focus-visible { border-radius: 0.25rem; outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }
.apex-steps__link :deep(svg) { width: 1rem; height: 1rem; }

@media (max-width: 900px) {
  .apex-steps__intro { grid-template-columns: 1fr; gap: 1rem; }
  .apex-steps__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .apex-steps__step { border-bottom: 1px solid #d9d9d5; padding: 2rem; }
  .apex-steps__step:nth-child(odd) { border-left: 0; padding-left: 0; }
}

@media (max-width: 639px) {
  .apex-steps__inner { padding: 4.5rem 1.25rem; }
  .apex-steps__intro p { font-size: 0.95rem; }
  .apex-steps__list { grid-template-columns: 1fr; }
  .apex-steps__step, .apex-steps__step:nth-child(odd) { border-left: 0; padding: 1.6rem 0; }
  .apex-steps__step h3 { margin-top: 0.9rem; }
}
  .apex-steps__step + .apex-steps__step { border-left: 0; }
</style>
