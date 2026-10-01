<template>
  <section id="product" class="apex-product" aria-labelledby="apex-product-title">
    <div class="apex-product__inner">
      <div class="apex-product__intro">
        <h2 id="apex-product-title">A store your customers see. <span>A workspace your team can run.</span></h2>
        <p>
          Give customers a storefront shaped by your brand, while your team manages the catalogue,
          orders and appearance behind it from SSU.
        </p>
      </div>

      <div class="apex-product__stage" role="group" aria-label="Illustrative connection between an SSU demonstration storefront and its workspace">
        <div class="apex-product__store">
          <div class="apex-product__browser">
            <span class="apex-product__browser-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>Demonstration storefront</span>
          </div>
          <div class="apex-product__store-body">
            <div class="apex-product__store-nav"><strong>Arte Gallery</strong><span>Shop&nbsp;&nbsp; Story&nbsp;&nbsp; Contact</span></div>
            <div class="apex-product__store-image">
              <img
                src="/images/ArteGallery/mountain-art-960.webp"
                srcset="/images/ArteGallery/mountain-art-640.webp 640w, /images/ArteGallery/mountain-art-960.webp 960w, /images/ArteGallery/mountain-art-1440.webp 1440w"
                sizes="(min-width: 1024px) 42rem, 100vw"
                width="960"
                height="660"
                alt="Landscape artwork in the Arte Gallery demonstration storefront"
                loading="lazy"
                decoding="async"
              >
              <div class="apex-product__store-overlay">
                <span>Curated for your space</span>
                <span class="apex-product__store-button">Explore the collection <Icon name="heroicons:arrow-up-right" aria-hidden="true" /></span>
              </div>
            </div>
            <p class="apex-product__store-caption">Your branding, products and content live here.</p>
          </div>
        </div>

        <div class="apex-product__workspace">
          <div class="apex-product__workspace-top">
            <span class="apex-product__workspace-mark">SSU</span>
            <span>Illustrative workspace preview</span>
          </div>
          <div class="apex-product__workspace-body">
            <div class="apex-product__workspace-heading">
              <span>Store management</span>
              <h3>One place for the work behind your store.</h3>
            </div>
            <div class="apex-product__workspace-list">
              <div v-for="item in workspaceItems" :key="item.title" class="apex-product__workspace-item">
                <Icon :name="item.icon" class="apex-product__workspace-icon" aria-hidden="true" />
                <div><strong>{{ item.title }}</strong><span>{{ item.description }}</span></div>
                <Icon name="heroicons:arrow-up-right" class="apex-product__workspace-arrow" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="apex-product__note">Visual preview only. The storefront shown uses an SSU demonstration theme; the workspace view is illustrative.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const workspaceItems = [
  { title: 'Catalogue', description: 'Products, categories and services', icon: 'heroicons:squares-2x2' },
  { title: 'Orders', description: 'Purchases and fulfilment', icon: 'heroicons:clipboard-document-list' },
  { title: 'Appearance', description: 'Theme, pages and content', icon: 'heroicons:paint-brush' },
]
</script>

<style scoped>
.apex-product {
  scroll-margin-top: 5rem;
  border-top: 1px solid #e8e8e8;
  background: #fff;
  color: #1a1a1a;
}

.apex-product__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-product__intro { max-width: 53rem; margin: 0 auto 3.5rem; text-align: center; }
.apex-product__intro h2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-product__intro h2 span { color: #747474; }
.apex-product__intro p { max-width: 39rem; margin: 1.35rem auto 0; color: #525252; font-size: 1.05rem; line-height: 1.65; }

.apex-product__stage { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 0.85fr); align-items: stretch; gap: 1.25rem; }
.apex-product__store, .apex-product__workspace { min-width: 0; overflow: hidden; border: 1px solid #dedede; border-radius: 1rem; background: #fff; }
.apex-product__browser { display: flex; min-height: 2.6rem; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #e5e5e5; padding: 0.55rem 1rem; color: #626262; font-size: 0.7rem; }
.apex-product__browser-dots { display: flex; gap: 0.3rem; }
.apex-product__browser-dots i { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: #bdbdbd; }
.apex-product__store-body { padding: 1rem; }
.apex-product__store-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.2rem 0.1rem 1rem; }
.apex-product__store-nav strong { font-family: 'Space Grotesk', var(--font-heading); font-size: 1rem; }
.apex-product__store-nav span { color: #525252; font-size: 0.72rem; }
.apex-product__store-image { position: relative; min-height: 25rem; overflow: hidden; background: #d5ccc2; }
.apex-product__store-image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.apex-product__store-overlay { position: absolute; inset: auto 0 0; display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; padding: 3.5rem 1.5rem 1.5rem; background: linear-gradient(to top, #141414c9, transparent); color: #fff; }
.apex-product__store-overlay > span:first-child { max-width: 14ch; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.7rem, 3vw, 2.8rem); line-height: 1.08; }
.apex-product__store-button { display: inline-flex; align-items: center; gap: 0.3rem; border: 1px solid #ffffffa8; padding: 0.65rem 0.8rem; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.apex-product__store-caption { margin: 1rem 0 0.2rem; color: #525252; font-size: 0.78rem; }

.apex-product__workspace { display: flex; flex-direction: column; background: #f7f8fa; }
.apex-product__workspace-top { display: flex; min-height: 2.6rem; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #e2e5e9; padding: 0.55rem 1rem; color: #626262; font-size: 0.7rem; }
.apex-product__workspace-mark { color: #222; font-size: 0.85rem; font-weight: 800; letter-spacing: -0.03em; }
.apex-product__workspace-body { display: flex; flex: 1; flex-direction: column; justify-content: space-between; gap: 2rem; padding: clamp(1.25rem, 3vw, 2rem); }
.apex-product__workspace-heading > span { color: #626262; font-size: 0.75rem; }
.apex-product__workspace-heading h3 { max-width: 20ch; margin: 0.65rem 0 0; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1.65rem, 2.5vw, 2.4rem); font-weight: 600; line-height: 1.16; letter-spacing: -0.03em; }
.apex-product__workspace-list { overflow: hidden; border: 1px solid #e0e3e8; border-radius: 0.75rem; background: #fff; }
.apex-product__workspace-item { display: flex; align-items: center; gap: 0.85rem; padding: 1.1rem; }
.apex-product__workspace-item + .apex-product__workspace-item { border-top: 1px solid #e7e9ed; }
.apex-product__workspace-icon { flex: 0 0 auto; width: 1.3rem; height: 1.3rem; color: #6d28d9; }
.apex-product__workspace-item div { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 0.15rem; }
.apex-product__workspace-item strong { font-size: 0.84rem; }
.apex-product__workspace-item div span { color: #5b6470; font-size: 0.72rem; }
.apex-product__workspace-arrow { width: 0.9rem; height: 0.9rem; color: #7b8491; }
.apex-product__note { margin: 1rem 0 0; color: #626262; font-size: 0.75rem; text-align: center; }

@media (max-width: 900px) {
  .apex-product__stage { grid-template-columns: 1fr; }
  .apex-product__workspace-body { gap: 1.5rem; }
}

@media (max-width: 639px) {
  .apex-product__inner { padding: 4.5rem 1.25rem; }
  .apex-product__intro { margin-bottom: 2.25rem; text-align: left; }
  .apex-product__intro p { font-size: 0.95rem; }
  .apex-product__store-image { min-height: 19rem; }
  .apex-product__store-overlay { padding: 3rem 1rem 1rem; }
  .apex-product__store-button { display: none; }
  .apex-product__store-nav span { font-size: 0.64rem; }
  .apex-product__note { text-align: left; }
}
</style>
