<template>
  <fieldset>
    <legend class="mb-2 text-xs font-semibold text-admin-text">Layout</legend>
    <div class="layout-options" :class="{ 'is-compact': compact }">
      <button v-for="variant in variants" :key="variant" type="button" :aria-pressed="modelValue === variant" @click="$emit('update:modelValue', variant)">
        <span class="layout-sketch" :data-layout="variant" :data-type="type" aria-hidden="true">
          <span class="sketch-media"><Icon name="heroicons:photo" class="h-4 w-4" /></span>
          <span class="sketch-copy"><i /><i /><i /></span>
        </span>
        <span class="layout-label">{{ label(variant) }}</span>
        <Icon v-if="compact && modelValue === variant" name="heroicons:check-circle-solid" class="layout-selected h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue: string | null, variants: string[], type: string, compact?: boolean }>(), { compact: false })
defineEmits<{ 'update:modelValue': [value: string] }>()
const label = (value: string) => ({ prose: 'Standard', 'media-left': 'Media left', 'media-right': 'Media right', 'image-left': 'Image left', 'image-right': 'Image right' }[value] ?? value.replace(/^./, character => character.toUpperCase()))
</script>

<style scoped>
.layout-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.layout-options button { min-height: 5.5rem; padding: .5rem; border: 1px solid var(--admin-border); border-radius: .5rem; color: var(--admin-text-muted); font-size: .75rem; text-align: left; }
.layout-options button:hover { background: var(--admin-surface-soft); }
.layout-options button[aria-pressed="true"] { border-color: var(--admin-accent); background: var(--admin-accent-soft); color: var(--admin-accent-strong); }
.layout-options button:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
.layout-sketch { display: flex; align-items: center; justify-content: center; gap: .5rem; height: 3rem; margin-bottom: .375rem; padding: .5rem; border-radius: .25rem; background: var(--admin-surface-soft); }
.sketch-media { display: flex; align-items: center; justify-content: center; width: 45%; height: 100%; background: var(--admin-border); border-radius: .125rem; }
.sketch-copy { display: flex; flex-direction: column; gap: .25rem; width: 45%; }
.sketch-copy i { display: block; height: 3px; background: currentColor; opacity: .5; }
.sketch-copy i:first-child { height: 5px; width: 80%; }
.sketch-copy i:last-child { width: 65%; }
[data-layout="centered"], [data-layout="band"], [data-layout="stacked"] { flex-direction: column; }
[data-layout="centered"] .sketch-media, [data-layout="band"] .sketch-media { display: none; }
[data-layout="stacked"] .sketch-media { width: 80%; }
[data-layout="image-right"] .sketch-media, [data-layout="media-right"] .sketch-media { order: 2; }
[data-type="rich-text"] .sketch-media, [data-type="faq"] .sketch-media { display: none; }
[data-type="rich-text"] .sketch-copy { width: 80%; }
[data-layout="narrow"] .sketch-copy { width: 45%; }
[data-layout="wide"] .sketch-copy { width: 100%; }
[data-layout="list"] .sketch-copy { gap: .5rem; }
[data-layout="cards"] .sketch-copy, [data-layout="grid"] .sketch-copy, [data-layout="masonry"] .sketch-copy, [data-layout="carousel"] .sketch-copy { flex-direction: row; width: 100%; height: 100%; }
[data-layout="cards"] .sketch-media, [data-layout="grid"] .sketch-media, [data-layout="masonry"] .sketch-media, [data-layout="carousel"] .sketch-media { display: none; }
[data-layout="cards"] .sketch-copy i, [data-layout="grid"] .sketch-copy i, [data-layout="masonry"] .sketch-copy i, [data-layout="carousel"] .sketch-copy i { width: 33%; height: 100%; border-radius: .125rem; }
[data-layout="masonry"] .sketch-copy i:nth-child(2) { height: 65%; }
[data-layout="carousel"] .sketch-copy i:last-child { width: 15%; }
/* Rich text previews distinguish reading measures and a wide editorial layout. */
[data-type="rich-text"][data-layout="prose"] .sketch-copy { width: 75%; }
[data-type="rich-text"][data-layout="narrow"] .sketch-copy { width: 45%; }
[data-type="rich-text"][data-layout="wide"] .sketch-copy { display: grid; grid-template-columns: 1fr 1fr; width: 100%; height: 100%; gap: .375rem; }
[data-type="rich-text"][data-layout="wide"] .sketch-copy i { width: 100%; height: 100%; border-top: 2px solid currentColor; border-radius: 0; background: transparent; }
[data-type="rich-text"][data-layout="wide"] .sketch-copy i::before, [data-type="rich-text"][data-layout="wide"] .sketch-copy i::after { content: ""; display: block; height: 2px; margin-top: .25rem; background: currentColor; }
[data-type="rich-text"][data-layout="wide"] .sketch-copy i:last-child { display: none; }
/* Hero split joins the image and copy; side media layouts retain a gutter. */
[data-type="hero"][data-layout="split"] { gap: 0; padding: .25rem; }
[data-type="hero"][data-layout="split"] .sketch-media { order: 2; width: 50%; height: 100%; border-radius: 0; }
[data-type="hero"][data-layout="split"] .sketch-copy { width: 50%; padding: .375rem; border: 1px solid var(--admin-border); }
/* Image-and-text sketches reflect the larger image and wide stacked layout. */
[data-type="image-text"] .sketch-media { width: 55%; }
[data-type="image-text"] .sketch-copy { width: 40%; }
[data-type="image-text"][data-layout="stacked"] .sketch-media { width: 85%; height: 65%; flex-shrink: 0; }
[data-type="image-text"][data-layout="stacked"] .sketch-copy { width: 85%; }
/* FAQ thumbnails distinguish expandable panels from visible Q&A columns. */
[data-type="faq"][data-layout="accordion"] .sketch-copy { width: 90%; height: 100%; justify-content: space-around; gap: .25rem; }
[data-type="faq"][data-layout="accordion"] .sketch-copy i { width: 100%; height: 20%; border: 1px solid currentColor; border-radius: .125rem; background: transparent; }
[data-type="faq"][data-layout="list"] .sketch-copy { display: grid; grid-template-columns: 1fr 2fr; width: 100%; height: 100%; gap: .25rem; }
[data-type="faq"][data-layout="list"] .sketch-copy i { width: 100%; height: 3px; }
[data-type="faq"][data-layout="list"] .sketch-copy i:last-child { grid-column: 1 / -1; }
/* Contact form sketches show a centered form or introduction beside fields. */
[data-type="contact-form"] .sketch-media { display: none; }
[data-type="contact-form"][data-layout="compact"] .sketch-copy { width: 70%; height: 100%; justify-content: space-around; }
[data-type="contact-form"][data-layout="compact"] .sketch-copy i { width: 100%; height: 20%; border: 1px solid currentColor; border-radius: .125rem; background: transparent; }
[data-type="contact-form"][data-layout="split"] .sketch-media { display: block; width: 55%; height: 100%; order: 2; border: 1px solid currentColor; border-radius: .25rem; background: transparent; }
[data-type="contact-form"][data-layout="split"] .sketch-copy { width: 40%; }
/* Blog layouts show equal tiles, article rows, or a lead story with follow-ups. */
[data-type="blog-post-list"][data-layout="grid"] .sketch-copy i { height: 80%; border-radius: .25rem; }
[data-type="blog-post-list"][data-layout="list"] .sketch-media { width: 25%; }
[data-type="blog-post-list"][data-layout="list"] .sketch-copy { width: 65%; gap: .25rem; }
[data-type="blog-post-list"][data-layout="feature"] .sketch-media { width: 55%; }
[data-type="blog-post-list"][data-layout="feature"] .sketch-copy { width: 40%; height: 100%; justify-content: space-around; }
[data-type="blog-post-list"][data-layout="feature"] .sketch-copy i { width: 100%; height: 20%; }
/* Services distinguish image cards, compact rows, and a larger feature panel. */
[data-type="service-list"][data-layout="grid"] .sketch-copy i { border: 1px solid currentColor; border-radius: .25rem; background: var(--admin-border); }
[data-type="service-list"][data-layout="list"] .sketch-media { width: 20%; }
[data-type="service-list"][data-layout="list"] .sketch-copy { width: 70%; gap: .25rem; }
[data-type="service-list"][data-layout="feature"] .sketch-media { width: 55%; }
[data-type="service-list"][data-layout="feature"] .sketch-copy { width: 40%; }
/* Collections use open image tiles or full-image portrait cards. */
[data-type="collection-list"][data-layout="grid"] .sketch-copy i { height: 75%; border-radius: .25rem; }
[data-type="collection-list"][data-layout="cards"] .sketch-copy i { border-radius: .25rem; background: linear-gradient(to bottom, var(--admin-border), currentColor); }
[data-type="product-list"][data-layout="grid"] .sketch-copy i { height: 80%; border-radius: .25rem; }
[data-type="product-list"][data-layout="carousel"] .sketch-copy i { border-radius: .25rem; }
/* Product feature combines a large image with supporting copy. */
[data-type="product-list"][data-layout="feature"] .sketch-media { width: 55%; }
[data-type="product-list"][data-layout="feature"] .sketch-copy { width: 40%; }
/* CTA layouts show a full band, an inset card, or copy beside a button. */
[data-type="cta"] .sketch-media { display: none; }
[data-type="cta"] .sketch-copy { width: 75%; }
[data-type="cta"][data-layout="band"] { border-radius: 0; background: var(--admin-border); }
[data-type="cta"][data-layout="card"] .sketch-copy { height: 100%; justify-content: center; padding: .375rem; border: 1px solid currentColor; border-radius: .25rem; background: var(--admin-border); }
[data-type="cta"][data-layout="split"] .sketch-media { display: block; order: 2; width: 25%; height: 50%; border: 1px solid currentColor; border-radius: .25rem; }
[data-type="cta"][data-layout="split"] .sketch-copy { width: 60%; }
/* Features sketches reflect open columns, enclosed cards, and divided rows. */
[data-type="features"] .sketch-media { display: none; }
[data-type="features"] .sketch-copy { width: 100%; }
[data-type="features"][data-layout="grid"] .sketch-copy i { border-top: 2px solid currentColor; border-radius: 0; background: transparent; }
[data-type="features"][data-layout="cards"] .sketch-copy i { border: 1px solid currentColor; border-radius: .25rem; background: var(--admin-border); }
[data-type="features"][data-layout="list"] .sketch-copy { height: 100%; gap: .25rem; }
[data-type="features"][data-layout="list"] .sketch-copy i { flex: 1; width: 100%; height: auto; border-top: 1px solid currentColor; background: transparent; }
[data-type="stats"][data-layout="grid"] .sketch-copy i { border: 1px solid currentColor; border-radius: .25rem; background: var(--admin-border); }
/* A statistics band is a row of values, rather than centered copy. */
[data-type="stats"][data-layout="band"] { flex-direction: row; }
[data-type="stats"][data-layout="band"] .sketch-copy { flex-direction: row; align-items: center; width: 100%; height: 100%; gap: .5rem; }
[data-type="stats"][data-layout="band"] .sketch-copy i { flex: 1; width: auto; height: 65%; border-radius: 0; border-top: 2px solid currentColor; background: transparent; }
.layout-options.is-compact { grid-template-columns: minmax(0, 1fr); gap: .5rem; }
.is-compact button { display: flex; align-items: center; gap: .75rem; min-height: 3.5rem; padding: .5rem .75rem; }
.is-compact .layout-sketch { flex-shrink: 0; width: 3.25rem; height: 2rem; margin: 0; padding: .25rem; gap: .25rem; }
.is-compact .sketch-copy { gap: .125rem; }
.is-compact .sketch-copy i { height: 2px; }
.is-compact .sketch-copy i:first-child { height: 3px; }
.is-compact .layout-label { flex: 1; min-width: 0; }
.is-compact button[aria-pressed="true"] .layout-label { color: var(--admin-text); font-weight: 600; }
.layout-selected { flex-shrink: 0; }
</style>
