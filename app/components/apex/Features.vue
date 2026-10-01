<template>
  <section id="features" class="apex-features" aria-labelledby="apex-features-title">
    <div class="apex-features__inner">
      <div class="apex-features__intro">
        <h2 id="apex-features-title">The work behind every sale, <span>in one place.</span></h2>
        <p>From what you offer to how you fulfil it, SSU brings the day-to-day parts of your store into one workspace.</p>
      </div>

      <div class="apex-features__groups">
        <article v-for="group in groups" :key="group.title" class="apex-features__group">
          <div class="apex-features__group-intro">
            <h3>{{ group.title }}</h3>
            <p>{{ group.description }}</p>
          </div>
          <div class="apex-features__items">
            <div v-for="item in group.items" :key="item.title" class="apex-features__item">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <span>{{ item.detail }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const groups = [
  {
    title: 'Show what you sell',
    description: 'Build a storefront around your products, services and own visual identity.',
    items: [
      {
        title: 'Products and categories',
        description: 'Organise products, options, stock and collections so customers can browse what matters.',
        detail: 'Catalogue · Variants · Collections',
      },
      {
        title: 'Services and content',
        description: 'Present services alongside store pages, blog posts and a theme you can adjust from the admin.',
        detail: 'Services · Pages · Appearance',
      },
    ],
  },
  {
    title: 'Run the sale',
    description: 'Keep the operational decisions behind each order close to the customer-facing store.',
    items: [
      {
        title: 'Orders and promotions',
        description: 'Manage purchases and backorders, with discounts and gift cards in the same workspace.',
        detail: 'Orders · Backorders · Discounts',
      },
      {
        title: 'Checkout settings',
        description: 'Configure the payment, shipping and tax options that apply to your business.',
        detail: 'Payments · Shipping · Tax',
      },
    ],
  },
  {
    title: 'Make it yours',
    description: 'Keep your brand recognizable while controlling how your team works in SSU.',
    items: [
      {
        title: 'Storefront appearance',
        description: 'Adjust theme colours, fonts and homepage content without editing code.',
        detail: 'Theme · Homepage · Content',
      },
      {
        title: 'Domain and team access',
        description: 'A verified custom domain can be configured for your store, while admin roles and permissions control team access.',
        detail: 'Domain · Users · Roles',
      },
    ],
  },
]
</script>

<style scoped>
.apex-features { scroll-margin-top: 5rem; border-top: 1px solid #ececec; background: #fff; color: #1a1a1a; }
.apex-features__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-features__intro { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 0.7fr); align-items: end; gap: 2rem; margin-bottom: 3rem; }
.apex-features__intro h2 { max-width: 15ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-features__intro h2 span { color: #747474; }
.apex-features__intro p { max-width: 29rem; margin: 0 0 0.35rem; color: #525252; font-size: 1.05rem; line-height: 1.65; }
.apex-features__groups { border-top: 1px solid #dedede; }
.apex-features__group { display: grid; grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 1.3fr); gap: clamp(2rem, 6vw, 6rem); border-bottom: 1px solid #dedede; padding: clamp(2rem, 4vw, 3.5rem) 0; }
.apex-features__group-intro h3 { max-width: 15ch; margin: 0; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1.75rem, 2.7vw, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.03em; }
.apex-features__group-intro p { max-width: 33ch; margin: 1rem 0 0; color: #525252; line-height: 1.6; }
.apex-features__items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(1.5rem, 3vw, 3rem); }
.apex-features__item { display: flex; min-width: 0; flex-direction: column; }
.apex-features__item h4 { margin: 0; font-family: 'Space Grotesk', var(--font-heading); font-size: 1.12rem; font-weight: 600; letter-spacing: -0.02em; }
.apex-features__item p { margin: 0.75rem 0 1.6rem; color: #525252; font-size: 0.93rem; line-height: 1.65; }
.apex-features__item span { margin-top: auto; border-top: 1px solid #e5e5e5; padding-top: 0.75rem; color: #626262; font-size: 0.72rem; font-weight: 700; }

@media (max-width: 900px) {
  .apex-features__intro, .apex-features__group { grid-template-columns: 1fr; }
  .apex-features__intro { gap: 1rem; }
  .apex-features__group { gap: 2rem; }
}

@media (max-width: 639px) {
  .apex-features__inner { padding: 4.5rem 1.25rem; }
  .apex-features__intro p { font-size: 0.95rem; }
  .apex-features__items { grid-template-columns: 1fr; gap: 1.7rem; }
  .apex-features__item p { margin-bottom: 1rem; }
}
</style>
