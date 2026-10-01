<template>
  <section id="faq" class="apex-faq" aria-labelledby="apex-faq-title">
    <div class="apex-faq__inner">
      <div class="apex-faq__intro">
        <h2 id="apex-faq-title">Questions before you start?</h2>
        <p>The practical details of setting up and running a store on SSU.</p>
      </div>

      <div class="apex-faq__questions">
        <details v-for="item in questions" :key="item.question" class="apex-faq__item">
          <summary>
            <span>{{ item.question }}</span>
            <Icon name="heroicons:plus" aria-hidden="true" />
          </summary>
          <p>{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const questions = [
  {
    question: 'Can I use SSU for an existing business?',
    answer: 'Yes. Add your current products or services and configure your brand and store settings at your own pace. SSU does not automatically import data from another platform.',
  },
  {
    question: 'What happens after I create an account?',
    answer: 'Your store account is created first. You then choose an available subscription plan and complete checkout to activate selling.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Stores can use an SSU subdomain. A custom domain requires DNS setup and verification by an SSU platform administrator before it serves your store.',
  },
  {
    question: 'Can I sell products and services?',
    answer: 'SSU has tools for product catalogues and service listings. The sections shown on your storefront depend on how your store is configured.',
  },
  {
    question: 'How do payments work?',
    answer: 'SSU subscription checkout uses Stripe. Payment methods for your own storefront are configured separately in the admin and depend on the gateways you enable.',
  },
  {
    question: 'Where do I manage my subscription?',
    answer: 'After signing in, use the Subscription page in your admin to review plans and open the Stripe billing portal for invoices, payment methods or cancellation.',
  },
]
</script>

<style scoped>
.apex-faq { scroll-margin-top: 5rem; border-top: 1px solid #ececec; background: #fff; color: #1a1a1a; }
.apex-faq__inner { display: grid; width: min(100%, 82rem); grid-template-columns: minmax(17rem, 0.8fr) minmax(0, 1.2fr); gap: clamp(3rem, 7vw, 8rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-faq__intro h2 { max-width: 13ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-faq__intro p { max-width: 27rem; margin: 1.25rem 0 0; color: #525252; font-size: 1.05rem; line-height: 1.65; }
.apex-faq__questions { border-top: 1px solid #dedede; }
.apex-faq__item { border-bottom: 1px solid #dedede; }
.apex-faq__item summary { display: flex; min-height: 5rem; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.3rem 0; cursor: pointer; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1rem, 1.45vw, 1.2rem); font-weight: 600; line-height: 1.4; list-style: none; }
.apex-faq__item summary::-webkit-details-marker { display: none; }
.apex-faq__item summary:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }
.apex-faq__item summary :deep(svg) { flex: 0 0 auto; width: 1.15rem; height: 1.15rem; transition: transform 180ms ease; }
.apex-faq__item[open] summary :deep(svg) { transform: rotate(45deg); }
.apex-faq__item p { max-width: 62ch; margin: -0.2rem 0 1.6rem; color: #525252; font-size: 0.95rem; line-height: 1.7; }

@media (max-width: 900px) {
  .apex-faq__inner { grid-template-columns: 1fr; gap: 2.5rem; }
}

@media (max-width: 639px) {
  .apex-faq__inner { padding: 4.5rem 1.25rem; }
  .apex-faq__intro p { font-size: 0.95rem; }
  .apex-faq__item summary { min-height: 4.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-faq__item summary :deep(svg) { transition: none; }
}
</style>
