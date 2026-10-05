<template>
  <section class="apex-hero" aria-labelledby="ssu-hero-title">
    <div class="apex-hero__inner">
      <div class="apex-hero__copy">
        <h1 id="ssu-hero-title" aria-label="A storefront that looks like you. One place to run it.">
          <span class="apex-hero__lead" aria-hidden="true">
            A storefront that <ApexScrambleText :words="['looks', 'feels', 'works']" /> like you.
          </span>
          <span class="apex-hero__line" aria-hidden="true">One place to run it.</span>
        </h1>

        <p class="apex-hero__description">
          Build a branded storefront, sell products or services, and manage orders and store settings from one dashboard.
        </p>

        <div class="apex-hero__actions">
          <NuxtLink :to="isAuthenticated ? '/admin' : '/register'" class="apex-hero__primary">
            {{ isAuthenticated ? 'Open dashboard' : 'Create your store' }}
            <Icon name="heroicons:arrow-up-right" class="h-5 w-5" aria-hidden="true" />
          </NuxtLink>
          <a href="#product" class="apex-hero__secondary">
            Explore SSU
            <Icon name="heroicons:arrow-down" class="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <p class="apex-hero__audience">
          Start a new store or set up your existing business on SSU.
        </p>
      </div>

      <div class="apex-hero__product" role="group" aria-label="Illustrative SSU workspace and demonstration storefront preview">
        <div class="apex-hero__product-heading">
          <span>Storefront + workspace</span>
          <span class="apex-hero__preview-label">Illustrative preview</span>
        </div>

        <div class="apex-hero__composition">
          <div class="apex-hero__workspace" aria-hidden="true">
            <div class="workspace-rail">
              <div class="workspace-mark">SSU</div>
              <div class="workspace-rail__item is-selected"><Icon name="heroicons:squares-2x2" class="h-4 w-4" /> <span>Overview</span></div>
              <div class="workspace-rail__item"><Icon name="heroicons:shopping-bag" class="h-4 w-4" /> <span>Products</span></div>
              <div class="workspace-rail__item"><Icon name="heroicons:clipboard-document-list" class="h-4 w-4" /> <span>Orders</span></div>
              <div class="workspace-rail__item"><Icon name="heroicons:paint-brush" class="h-4 w-4" /> <span>Appearance</span></div>
            </div>
            <div class="workspace-main">
              <div class="workspace-topbar">
                <span>Store overview</span>
                <span class="workspace-topbar__avatar">AG</span>
              </div>
              <div class="workspace-content">
                <h2>Run your store</h2>
                <p>Everything you need in one workspace.</p>
                <div class="workspace-feature-grid">
                  <div class="workspace-feature"><Icon name="heroicons:tag" class="h-5 w-5" /><span>Catalogue</span></div>
                  <div class="workspace-feature"><Icon name="heroicons:archive-box" class="h-5 w-5" /><span>Orders</span></div>
                  <div class="workspace-feature"><Icon name="heroicons:globe-alt" class="h-5 w-5" /><span>Storefront</span></div>
                </div>
                <div class="workspace-activity">
                  <span>Store setup</span>
                  <span class="workspace-activity__status">Your brand, your storefront</span>
                </div>
                <div class="workspace-activity__lines" aria-hidden="true"><span /><span /><span /></div>
              </div>
            </div>
          </div>

          <div class="apex-hero__storefront" aria-hidden="true">
            <div class="storefront-browser"><span /><span /><span /><p>Demonstration storefront</p></div>
            <div class="storefront-body">
              <div class="storefront-nav"><strong>Arte Gallery</strong><span>Shop &nbsp; Story &nbsp; Contact</span></div>
              <img
                src="/images/ArteGallery/mountain-art-960.webp"
                srcset="/images/ArteGallery/mountain-art-640.webp 640w, /images/ArteGallery/mountain-art-960.webp 960w"
                sizes="(min-width: 1024px) 25rem, (min-width: 640px) 34rem, calc(100vw - 3rem)"
                width="1920"
                height="1320"
                alt=""
                loading="eager"
                fetchpriority="high"
                decoding="async"
              >
              <div class="storefront-caption"><span>Make the store yours</span><Icon name="heroicons:arrow-up-right" class="h-4 w-4" /></div>
            </div>
          </div>
        </div>

        <p class="apex-hero__product-note">A visual preview of the SSU workspace alongside an Arte Gallery demonstration store.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isAuthenticated: boolean
}>()
</script>

<style scoped>
.apex-hero {
  min-height: calc(100svh - 4rem);
  background: var(--apex-canvas);
  color: var(--apex-text);
}

.apex-hero__inner {
  display: flex;
  width: min(100%, 90rem);
  min-height: calc(100svh - 4rem);
  flex-direction: column;
  margin-inline: auto;
  align-items: center;
  gap: clamp(2.25rem, 5vh, 3.5rem);
  padding: clamp(3.5rem, 7vh, 5.5rem) 1.5rem 5rem;
}

.apex-hero__copy { width: min(100%, 56rem); text-align: center; }

.apex-hero h1 {
  max-width: 18ch;
  margin-inline: auto;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(3.1rem, 5.7vw, 5.5rem);
  font-weight: 600;
  line-height: 1.03;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.apex-hero__lead,
.apex-hero__line {
  display: block;
}

.apex-hero__line {
  color: var(--apex-text-display-muted);
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: 0.95em;
  font-weight: 600;
  letter-spacing: -0.04em;
}

.apex-hero__description {
  max-width: 38rem;
  margin: 1.35rem auto 0;
  color: var(--apex-text-muted);
  font-size: clamp(1rem, 1.2vw, 1.125rem);
  line-height: 1.6;
}

.apex-hero__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 1.75rem; }

.apex-hero__primary,
.apex-hero__secondary {
  display: inline-flex;
  min-height: 3.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  border-radius: 0.75rem;
  padding: 0.8rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.apex-hero__primary { background: var(--apex-action); color: var(--apex-on-action); }
.apex-hero__primary:hover { background: var(--apex-action-hover); transform: translateY(-2px); }
.apex-hero__secondary { border: 1px solid #cecece; background: var(--apex-surface); color: var(--apex-text); }
.apex-hero__secondary:hover { border-color: #777; background: var(--apex-surface-hover); }
.apex-hero__primary:focus-visible,
.apex-hero__secondary:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }

.apex-hero__audience {
  max-width: 31rem;
  margin: 1.5rem auto 0;
  color: var(--apex-text-caption);
  font-size: 0.875rem;
  line-height: 1.5;
}

.apex-hero__product { width: min(100%, 64rem); min-width: 0; scroll-margin-top: 5rem; }
.apex-hero__product-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.7rem; margin-bottom: 1rem; color: var(--apex-text-emphasis); font-size: 0.8rem; font-weight: 600; }
.apex-hero__preview-label { color: var(--apex-text-caption); font-size: 0.75rem; font-weight: 500; }
.apex-hero__composition { position: relative; min-height: 34rem; }

.apex-hero__workspace {
  display: grid;
  width: 76%;
  min-height: 28rem;
  grid-template-columns: 8.2rem minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #dbe2ea;
  border-radius: 1rem;
  background: var(--apex-preview-canvas);
  box-shadow: 0 2rem 4rem -2rem #0008;
}

.workspace-rail { background: var(--apex-preview-rail); padding: 1.1rem 0.65rem; }
.workspace-mark { margin: 0 0.5rem 1.7rem; color: var(--apex-on-action); font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; }
.workspace-rail__item { display: flex; align-items: center; gap: 0.5rem; border-radius: 0.45rem; padding: 0.65rem 0.5rem; color: #d4d9e2; font-size: 0.7rem; }
.workspace-rail__item.is-selected { background: var(--apex-preview-rail-active); color: var(--apex-on-action); }
.workspace-main { min-width: 0; color: var(--apex-preview-text); }
.workspace-topbar { display: flex; height: 3.2rem; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--apex-preview-border); background: var(--apex-preview-surface); padding: 0 1.1rem; font-size: 0.7rem; font-weight: 700; }
.workspace-topbar__avatar { display: grid; width: 1.6rem; height: 1.6rem; place-items: center; border-radius: 50%; background: var(--apex-preview-accent-soft); color: var(--apex-preview-accent); font-size: 0.55rem; }
.workspace-content { padding: 1.4rem 1.2rem; }
.workspace-content h2 { margin: 0; color: var(--apex-preview-text); font-family: var(--font-body); font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
.workspace-content p { margin: 0.4rem 0 0; color: var(--apex-preview-text-muted); font-size: 0.7rem; }
.workspace-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; margin-top: 1.5rem; }
.workspace-feature { display: flex; min-height: 5.2rem; flex-direction: column; justify-content: space-between; border: 1px solid var(--apex-preview-border); border-radius: 0.6rem; background: var(--apex-preview-surface); padding: 0.7rem; color: var(--apex-preview-accent); }
.workspace-feature span { color: #334155; font-size: 0.67rem; font-weight: 700; }
.workspace-activity { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.7rem; color: #334155; font-size: 0.7rem; font-weight: 700; }
.workspace-activity__status { color: var(--apex-preview-text-muted); font-size: 0.62rem; font-weight: 500; }
.workspace-activity__lines { display: grid; gap: 0.55rem; margin-top: 0.9rem; }
.workspace-activity__lines span { height: 0.5rem; border-radius: 1rem; background: #e9eef5; }
.workspace-activity__lines span:nth-child(2) { width: 75%; }
.workspace-activity__lines span:nth-child(3) { width: 55%; }

.apex-hero__storefront {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 46%;
  overflow: hidden;
  border: 1px solid #dce3ed;
  border-radius: 0.8rem;
  background: var(--apex-preview-surface);
  box-shadow: 0 2rem 4rem -1.5rem #0009;
}

.storefront-browser { display: flex; height: 1.9rem; align-items: center; gap: 0.22rem; border-bottom: 1px solid #e5e7eb; padding: 0 0.7rem; }
.storefront-browser > span { width: 0.3rem; height: 0.3rem; border-radius: 50%; background: #d1d5db; }
.storefront-browser p { margin-left: auto; color: var(--apex-preview-text-muted); font-size: 0.55rem; }
.storefront-body { padding: 0.55rem; }
.storefront-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.3rem 0.25rem 0.7rem; color: var(--apex-preview-text); }
.storefront-nav strong { font-family: 'Space Grotesk', var(--font-heading); font-size: 0.78rem; }
.storefront-nav span { color: #374151; font-size: 0.53rem; }
.storefront-body img { display: block; width: 100%; aspect-ratio: 1.52; border-radius: 0.25rem; object-fit: cover; }
.storefront-caption { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0.2rem 0.3rem; color: var(--apex-preview-text); font-size: 0.67rem; font-weight: 700; }
.apex-hero__product-note { max-width: 40rem; margin: 1rem auto 0; color: var(--apex-text-caption); font-size: 0.75rem; line-height: 1.5; text-align: center; }

@media (max-width: 639px) {
  .apex-hero__inner { gap: 2rem; padding: 3rem 1.25rem 3.5rem; }
  .apex-hero h1 { font-size: clamp(2.55rem, 10vw, 3rem); }
  .apex-hero__description { margin-top: 1.25rem; }
  .apex-hero__actions { margin-top: 1.25rem; }
  .apex-hero__primary,
  .apex-hero__secondary { min-height: 3rem; padding: 0.7rem 0.9rem; font-size: 0.8rem; }
  .apex-hero__audience { margin-top: 1.15rem; font-size: 0.8rem; }
  .apex-hero__composition { min-height: 26rem; }
  .apex-hero__workspace { width: 100%; min-height: 22rem; grid-template-columns: 4rem minmax(0, 1fr); }
  .workspace-rail__item { justify-content: center; }
  .workspace-rail__item span { display: none; }
  .workspace-mark { margin-inline: 0; text-align: center; font-size: 0.8rem; }
  .workspace-content { padding: 1rem 0.8rem; }
  .workspace-feature-grid { gap: 0.3rem; }
  .workspace-feature { min-height: 4.5rem; padding: 0.45rem; }
  .workspace-feature span { font-size: 0.55rem; }
  .apex-hero__storefront { width: 68%; }
  .storefront-nav span { display: none; }
}

@media (hover: none) {
  .apex-hero__primary:hover { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-hero__primary,
  .apex-hero__secondary { transition: none; }
  .apex-hero__primary:hover { transform: none; }
}
</style>
