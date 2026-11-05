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
.layout-options button { min-height: 5.5rem; padding: .5rem; border: 1px solid var(--admin-border); border-radius: .5rem; color: var(--admin-muted); font-size: .75rem; text-align: left; }
.layout-options button:hover { background: var(--admin-soft); }
.layout-options button[aria-pressed="true"] { border-color: var(--admin-accent); background: var(--admin-accent-soft); color: var(--admin-accent-strong); }
.layout-options button:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
.layout-sketch { display: flex; align-items: center; justify-content: center; gap: .5rem; height: 3rem; margin-bottom: .375rem; padding: .5rem; border-radius: .25rem; background: var(--admin-soft); }
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
