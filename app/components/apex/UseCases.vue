<template>
  <section id="use-cases" class="apex-use-cases" aria-labelledby="apex-use-cases-title">
    <div class="apex-use-cases__inner">
      <div class="apex-use-cases__intro">
        <h2 id="apex-use-cases-title">Built for the business you have in mind.</h2>
        <p>Start with a new idea or set up the business you already run. Your storefront and your day-to-day tools stay connected.</p>
      </div>

      <div class="apex-use-cases__grid">
        <article class="apex-use-cases__case">
          <div class="apex-use-cases__image">
            <img src="/images/ForestGreen/food-960.webp" srcset="/images/ForestGreen/food-640.webp 640w, /images/ForestGreen/food-960.webp 960w, /images/ForestGreen/food-1440.webp 1440w" sizes="(min-width: 901px) 40rem, 100vw" width="960" height="640" alt="Food photography used in an SSU demonstration storefront theme" loading="lazy" decoding="async">
            <span>Demonstration theme visual</span>
          </div>
          <div class="apex-use-cases__copy">
            <h3>Start something new.</h3>
            <p>Choose a look, add your products or services, and set up the store settings you need before you begin selling.</p>
            <div class="apex-use-cases__path"><span>Choose your look</span><Icon name="heroicons:arrow-right" aria-hidden="true" /><span>Add what you sell</span><Icon name="heroicons:arrow-right" aria-hidden="true" /><span>Run your store</span></div>
          </div>
        </article>

        <article class="apex-use-cases__case">
          <div class="apex-use-cases__image">
            <img src="/images/MinimalMono/laptop-960.webp" srcset="/images/MinimalMono/laptop-640.webp 640w, /images/MinimalMono/laptop-960.webp 960w, /images/MinimalMono/laptop-1440.webp 1440w" sizes="(min-width: 901px) 40rem, 100vw" width="960" height="640" alt="Desk photography used in an SSU demonstration storefront theme" loading="lazy" decoding="async">
            <span>Demonstration theme visual</span>
          </div>
          <div class="apex-use-cases__copy">
            <h3>Set up your existing business.</h3>
            <p>Add your current catalogue and configure your brand, checkout and fulfilment settings on SSU at your own pace.</p>
            <div class="apex-use-cases__path"><span>Add your catalogue</span><Icon name="heroicons:arrow-right" aria-hidden="true" /><span>Set your preferences</span><Icon name="heroicons:arrow-right" aria-hidden="true" /><span>Manage from SSU</span></div>
          </div>
        </article>
      </div>

      <NuxtLink :to="isAuthenticated ? '/admin' : '/register'" class="apex-use-cases__action">
        {{ isAuthenticated ? 'Open dashboard' : 'Create your store' }}
        <Icon name="heroicons:arrow-up-right" aria-hidden="true" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ isAuthenticated: boolean }>()
</script>

<style scoped>
.apex-use-cases { scroll-margin-top: 5rem; background: #f7f7f5; color: #1a1a1a; }
.apex-use-cases__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-use-cases__intro { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 0.7fr); align-items: end; gap: 2rem; margin-bottom: 2.6rem; }
.apex-use-cases__intro h2 { max-width: 15ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-use-cases__intro p { max-width: 29rem; margin: 0 0 0.35rem; color: #525252; font-size: 1.05rem; line-height: 1.65; }
.apex-use-cases__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
.apex-use-cases__case { min-width: 0; overflow: hidden; border: 1px solid #deded9; border-radius: 1rem; background: #fff; }
.apex-use-cases__image { position: relative; height: clamp(15rem, 26vw, 22rem); overflow: hidden; background: #e6e3df; }
.apex-use-cases__image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.apex-use-cases__image span { position: absolute; right: 1rem; bottom: 1rem; border-radius: 0.4rem; background: #fff; padding: 0.45rem 0.65rem; color: #242424; font-size: 0.7rem; font-weight: 700; }
.apex-use-cases__copy { padding: clamp(1.4rem, 3vw, 2.25rem); }
.apex-use-cases__copy h3 { margin: 0; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1.55rem, 2.5vw, 2.2rem); font-weight: 600; line-height: 1.2; letter-spacing: -0.03em; }
.apex-use-cases__copy p { max-width: 40ch; min-height: 4.8rem; margin: 0.85rem 0 1.7rem; color: #525252; line-height: 1.6; }
.apex-use-cases__path { display: flex; flex-wrap: wrap; align-items: center; gap: 0.45rem; border-top: 1px solid #e8e8e8; padding-top: 1.2rem; color: #353535; font-size: 0.72rem; font-weight: 700; }
.apex-use-cases__path :deep(svg) { flex: 0 0 auto; width: 0.8rem; height: 0.8rem; color: #737373; }
.apex-use-cases__action { display: inline-flex; min-height: 3.25rem; align-items: center; gap: 0.75rem; margin-top: 2rem; border-radius: 0.75rem; background: #1a1a1a; padding: 0.75rem 1.1rem; color: #fff; font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: background-color 180ms ease, transform 180ms ease; }
.apex-use-cases__action:hover { background: #353535; transform: translateY(-2px); }
.apex-use-cases__action:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }
.apex-use-cases__action :deep(svg) { width: 1.1rem; height: 1.1rem; }

@media (max-width: 900px) {
  .apex-use-cases__intro { grid-template-columns: 1fr; gap: 1rem; }
  .apex-use-cases__grid { grid-template-columns: 1fr; }
  .apex-use-cases__image { height: clamp(15rem, 45vw, 25rem); }
  .apex-use-cases__copy p { min-height: 0; }
}

@media (max-width: 639px) {
  .apex-use-cases__inner { padding: 4.5rem 1.25rem; }
  .apex-use-cases__intro p { font-size: 0.95rem; }
  .apex-use-cases__image { height: 16rem; }
  .apex-use-cases__action { width: 100%; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-use-cases__action { transition: none; }
  .apex-use-cases__action:hover { transform: none; }
}
</style>
