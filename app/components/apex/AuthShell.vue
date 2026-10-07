<template>
  <main class="apex-auth">
    <header class="apex-auth__header">
      <a :href="platformHomeUrl" class="apex-auth__brand" aria-label="DATABASY home">DATABASY</a>
      <a :href="platformHomeUrl" class="apex-auth__home-link">
        Back to home <Icon name="heroicons:arrow-up-right" aria-hidden="true" />
      </a>
    </header>

    <div class="apex-auth__layout">
      <aside class="apex-auth__story">
        <div class="apex-auth__story-copy">
          <h1>A storefront that looks like you.<span>One place to run it.</span></h1>
          <p>Build a branded storefront and manage the work behind it from one DATABASY workspace.</p>
        </div>

        <div class="apex-auth__preview" aria-label="Arte Gallery demonstration storefront preview">
          <div class="apex-auth__preview-bar">
            <span>Storefront + workspace</span>
            <span>Illustrative preview</span>
          </div>
          <div class="apex-auth__preview-body">
            <div class="apex-auth__preview-image">
              <img
                src="/images/ArteGallery/mountain-art-960.webp"
                width="960"
                height="660"
                alt="Landscape artwork in the Arte Gallery demonstration storefront"
                loading="eager"
                decoding="async"
              >
              <span>Arte Gallery <small>Demonstration storefront</small></span>
            </div>
            <div class="apex-auth__preview-workspace" aria-hidden="true">
              <strong>DATABASY workspace</strong>
              <span><Icon name="heroicons:tag" /> Catalogue</span>
              <span><Icon name="heroicons:clipboard-document-list" /> Orders</span>
              <span><Icon name="heroicons:paint-brush" /> Appearance</span>
            </div>
          </div>
        </div>
        <p class="apex-auth__preview-note">Visual preview only. Storefront shown uses a DATABASY demonstration theme.</p>
      </aside>

      <section class="apex-auth__form-side" aria-label="Account access">
        <div class="apex-auth__form-wrap"><slot /></div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()

const platformHomeUrl = computed(() => {
  const configuredBaseUrl = String(runtimeConfig.public.baseURL || '').trim()
  if (configuredBaseUrl) {
    try {
      return new URL('/', configuredBaseUrl).toString()
    } catch {
      // Fall back to the configured platform domain.
    }
  }

  const baseDomain = String(runtimeConfig.public.storefrontBaseDomain || '').trim()
  if (!baseDomain) return '/'

  const port = requestUrl.port ? `:${requestUrl.port}` : ''
  return `${requestUrl.protocol}//${baseDomain}${port}/`
})
</script>

<style>
.apex-auth { min-height: 100svh; background: #fcfcfc; color: #1a1a1a; font-family: 'Space Grotesk', var(--font-body); }
.apex-auth ::selection { background: #dbe8ff; color: #1a1a1a; }
.apex-auth__header { display: flex; align-items: center; justify-content: space-between; min-height: 5rem; padding: 0.75rem clamp(1.25rem, 4vw, 4.5rem); border-bottom: 1px solid #e9e9e7; }
.apex-auth__brand { color: #1a1a1a; font-size: 1.6rem; font-weight: 700; letter-spacing: -0.04em; text-decoration: none; }
.apex-auth__brand-dot { color: #6d28d9; }
.apex-auth__home-link { display: inline-flex; min-height: 2.75rem; align-items: center; gap: 0.45rem; color: #444; font-size: 0.86rem; font-weight: 600; text-decoration: none; text-underline-offset: 0.25em; }
.apex-auth__home-link:hover { text-decoration: underline; }
.apex-auth__home-link svg { width: 1rem; height: 1rem; }
.apex-auth__layout { display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr); min-height: calc(100svh - 5rem); }
.apex-auth__story { display: flex; flex-direction: column; justify-content: center; min-width: 0; padding: clamp(2.5rem, 5vw, 5rem) clamp(1.5rem, 5.4vw, 6rem); border-right: 1px solid #e9e9e7; }
.apex-auth__story-copy { max-width: 40rem; }
.apex-auth__story h1 { max-width: 13ch; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.75rem, 4.15vw, 4.8rem); font-weight: 600; line-height: 1.08; letter-spacing: -0.035em; text-wrap: balance; }
.apex-auth__story h1 span { display: block; color: #676767; font-family: 'Space Grotesk', var(--font-heading); font-size: 0.82em; letter-spacing: -0.035em; }
.apex-auth__story-copy > p { max-width: 38rem; margin-top: 1.25rem; color: #4d4d4d; font-size: 1rem; line-height: 1.65; }
.apex-auth__preview { max-width: 39rem; margin-top: clamp(2.5rem, 5vw, 4rem); overflow: hidden; border: 1px solid #dedede; border-radius: 0.9rem; background: #fff; box-shadow: 0 20px 45px -30px #1a1a1a45; }
.apex-auth__preview-bar { display: flex; justify-content: space-between; gap: 0.75rem; padding: 0.65rem 0.85rem; border-bottom: 1px solid #e5e5e5; color: #555; font-size: 0.67rem; font-weight: 600; }
.apex-auth__preview-body { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); min-height: 13rem; }
.apex-auth__preview-image { position: relative; min-height: 13rem; overflow: hidden; background: #d5ccc2; }
.apex-auth__preview-image img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.apex-auth__preview-image > span { position: absolute; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column; gap: 0.12rem; padding: 2.25rem 0.8rem 0.7rem; background: linear-gradient(transparent, #111b); color: #fff; font-family: 'Playfair Display', Georgia, serif; font-size: 1.15rem; }
.apex-auth__preview-image small { font-family: 'Space Grotesk', var(--font-body); font-size: 0.62rem; font-weight: 600; }
.apex-auth__preview-workspace { display: flex; flex-direction: column; gap: 0.7rem; padding: 1rem; background: #f7f8fa; color: #3c3c3c; font-size: 0.72rem; }
.apex-auth__preview-workspace strong { margin-bottom: 0.35rem; color: #202020; font-size: 0.8rem; }
.apex-auth__preview-workspace span { display: flex; align-items: center; gap: 0.4rem; }
.apex-auth__preview-workspace svg { width: 0.9rem; height: 0.9rem; }
.apex-auth__preview-note { max-width: 39rem; margin-top: 0.7rem; color: #626262; font-size: 0.7rem; }
.apex-auth__form-side { display: flex; align-items: center; justify-content: center; min-width: 0; padding: clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 5vw, 5rem); background: #fff; }
.apex-auth__form-wrap { width: min(100%, 31rem); }
.apex-auth__form-heading { margin-bottom: 2rem; }
.apex-auth__form-heading h2 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.2rem, 3vw, 3.1rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.03em; }
.apex-auth__form-heading p { margin-top: 0.75rem; color: #565656; font-size: 0.95rem; line-height: 1.55; }
.apex-auth__form { display: grid; gap: 1.2rem; }
.apex-auth__form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.2rem; }
.apex-auth__field { min-width: 0; }
.apex-auth__field-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 0.45rem; }
.apex-auth__label { display: block; margin-bottom: 0.45rem; color: #242424; font-size: 0.84rem; font-weight: 700; }
.apex-auth__field-head .apex-auth__label { margin-bottom: 0; }
.apex-auth__hint { margin-top: 0.4rem; color: #5d5d5d; font-size: 0.73rem; line-height: 1.5; }
.apex-auth__input-wrap { position: relative; }
.apex-auth__input { display: block; width: 100%; min-height: 3.15rem; padding: 0.75rem 0.9rem; border: 1px solid #bcbcbc; border-radius: 0.7rem; outline: none; background: #fff; color: #1a1a1a; font: inherit; font-size: 0.94rem; transition: border-color 160ms, box-shadow 160ms; }
.apex-auth__input::placeholder { color: #656565; opacity: 1; }
.apex-auth__input:hover { border-color: #777; }
.apex-auth__input:focus-visible { border-color: #285095; box-shadow: 0 0 0 3px #dce9ff; }
.apex-auth__input[readonly], .apex-auth__input:disabled { border-color: #d6d6d6; background: #f4f4f4; color: #565656; cursor: wait; }
.apex-auth__input--password { padding-right: 3.4rem; }
.apex-auth__toggle { position: absolute; top: 0; right: 0.35rem; display: grid; width: 2.75rem; height: 100%; place-items: center; border: 0; background: none; color: #4c4c4c; cursor: pointer; }
.apex-auth__toggle:disabled { opacity: 0.45; cursor: wait; }
.apex-auth__toggle svg { width: 1.15rem; height: 1.15rem; }
.apex-auth__link { color: #242424; font-size: 0.82rem; font-weight: 700; text-decoration: underline; text-decoration-color: #bbb; text-underline-offset: 0.22em; }
.apex-auth__link:hover { text-decoration-color: currentColor; }
.apex-auth__button { position: relative; display: inline-flex; width: 100%; min-height: 3.2rem; align-items: center; justify-content: center; gap: 0.6rem; overflow: hidden; padding: 0.65rem 1rem; border: 1px solid #1a1a1a; border-radius: 0.7rem; background: #1a1a1a; color: #fff; font: inherit; font-size: 0.94rem; font-weight: 700; text-decoration: none; cursor: pointer; transition: background 160ms, transform 160ms; }
.apex-auth__button:hover { background: #353535; }
.apex-auth__button:active { transform: translateY(1px); }
.apex-auth__button:disabled { opacity: 1; cursor: wait; }
.apex-auth__button svg { width: 1rem; height: 1rem; }
.apex-auth__button .animate-spin { width: 1.2rem; height: 1.2rem; }
.apex-auth__button-spinner { animation: apex-auth-spin 800ms linear infinite; }
.apex-auth__button-progress { position: absolute; right: 0; bottom: 0; left: 0; height: 2px; background: #b9d3ff; transform: scaleX(0); transform-origin: left; animation: apex-auth-progress 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
.apex-auth__secondary { margin-top: 1.35rem; color: #525252; font-size: 0.85rem; text-align: center; }
.apex-auth__secondary .apex-auth__link { margin-left: 0.25rem; }
.apex-auth__alert { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.85rem 1rem; border: 1px solid #e9aaaa; border-radius: 0.7rem; background: #fff6f6; color: #8a2020; font-size: 0.84rem; line-height: 1.5; }
.apex-auth__alert--success { border-color: #a5d4bc; background: #f1faf5; color: #1f6542; }
.apex-auth__alert svg { flex: 0 0 auto; width: 1.1rem; height: 1.1rem; margin-top: 0.1rem; }
.apex-auth__divider { height: 1px; margin: 1.5rem 0; background: #e7e7e7; }
.apex-auth__success-icon { display: grid; width: 3rem; height: 3rem; margin-bottom: 1.3rem; place-items: center; border-radius: 50%; background: #e8f5ed; color: #237046; }
.apex-auth__success-icon svg { width: 1.5rem; height: 1.5rem; }
.apex-auth__success h2 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.2rem, 3vw, 3.1rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.03em; }
.apex-auth__success > p:not(.apex-auth__secondary) { margin: 0.8rem 0 1.8rem; color: #515151; font-size: 0.95rem; line-height: 1.6; }
.apex-auth__success h2:focus { outline: none; }
.apex-auth :is(a, button):focus-visible { outline: 3px solid #285095; outline-offset: 3px; }
@keyframes apex-auth-spin { to { transform: rotate(360deg); } }
@keyframes apex-auth-progress {
  0% { transform: scaleX(0); transform-origin: left; }
  48% { transform: scaleX(1); transform-origin: left; }
  52% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}
@media (max-width: 900px) {
  .apex-auth__layout { grid-template-columns: 1fr; }
  .apex-auth__story { padding: 2.5rem 1.5rem; border-right: 0; border-bottom: 1px solid #e9e9e7; }
  .apex-auth__story h1 { max-width: 19ch; font-size: clamp(2.2rem, 6vw, 3.7rem); }
  .apex-auth__story-copy > p { margin-top: 0.8rem; }
  .apex-auth__preview, .apex-auth__preview-note { display: none; }
  .apex-auth__form-side { padding: 2.5rem 1.5rem 4rem; }
}
@media (max-width: 420px) {
  .apex-auth__header { min-height: 4.5rem; }
  .apex-auth__home-link { font-size: 0.78rem; }
  .apex-auth__story { padding: 2rem 1.25rem; }
  .apex-auth__form-side { padding-inline: 1.25rem; }
  .apex-auth__form-heading { margin-bottom: 1.5rem; }
  .apex-auth__form-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .apex-auth *, .apex-auth *::before, .apex-auth *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
</style>
