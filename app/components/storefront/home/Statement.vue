<template>
  <section v-if="showStatement" class="statement-section bg-white py-14 lg:py-20" aria-label="Statement">
    <div class="mx-auto max-w-6xl px-6 lg:px-8">
      <div data-builtin-layout-grid class="statement-layout" :class="{ 'has-media': statement?.image_url }">
        <figure v-if="statement?.image_url" class="statement-media">
          <img :src="statement.image_url" :alt="statement.attribution || statement.eyebrow || 'Statement'" loading="lazy" decoding="async" />
        </figure>
        <div class="statement-copy">
          <figure class="statement-quote">
            <blockquote class="statement-quote-text text-gray-900">{{ statement?.quote }}</blockquote>
            <figcaption v-if="statement?.attribution?.trim() || statement?.role?.trim() || statement?.eyebrow?.trim()" class="statement-source">
              <p v-if="statement?.attribution?.trim()" class="statement-attribution text-gray-900">{{ statement.attribution }}</p>
              <p v-if="statement?.role?.trim()" class="statement-role text-gray-600">{{ statement.role }}</p>
              <p v-if="statement?.eyebrow?.trim()" class="statement-label text-gray-600">{{ statement.eyebrow }}</p>
            </figcaption>
          </figure>
          <NuxtLink v-if="statement?.cta_label?.trim() && statement?.cta_link?.trim()" :to="statement.cta_link" class="statement-link link-arrow inline-flex min-h-11 items-center">
            {{ statement.cta_label }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageStatement } from '~/composables/useSiteConfig'

const props = defineProps<{ statement: HomepageStatement | null }>()
const showStatement = computed(() => !!(props.statement?.enabled && props.statement.quote?.trim()))
</script>

<style>
/* Keep the quote readable and the image intact in every built-in Statement layout. */
.statement-section { overflow-wrap: anywhere; }
.statement-section .statement-layout { display: grid; grid-template-columns: minmax(0,1fr); align-items: center; gap: clamp(2rem,5vw,4.5rem); }
.statement-section .statement-media { min-width: 0; margin: 0; overflow: hidden; border-radius: 1rem; }
.statement-section .statement-media img { display: block; width: 100%; height: auto; }
.statement-section .statement-copy { width: 100%; min-width: 0; max-width: 38rem; margin-inline: auto; }
.statement-section .statement-quote { margin: 0; }
.statement-section .statement-quote-text { max-width: 34ch; margin: 0; font-family: var(--font-heading); font-size: clamp(1.375rem,2.3vw,2rem); font-weight: 500; line-height: 1.45; letter-spacing: -.02em; white-space: pre-line; text-wrap: pretty; }
.statement-section .statement-source { width: fit-content; max-width: 100%; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid color-mix(in srgb,currentColor 16%,transparent); }
.statement-section .statement-attribution { margin: 0; font-size: .875rem; font-weight: 600; line-height: 1.5; }
.statement-section .statement-role { margin-top: .25rem; font-size: .8125rem; line-height: 1.6; }
.statement-section .statement-label { margin-top: .5rem; font-size: .8125rem; font-weight: 500; line-height: 1.6; }
.statement-section .statement-link { margin-top: 1rem; font-size: .875rem; }
.statement-section .statement-layout:not(.has-media) .statement-copy { max-width: 52rem; text-align: center; }
.statement-section .statement-layout:not(.has-media) :is(.statement-quote-text,.statement-source) { margin-inline: auto; }
.builtin-section[data-builtin-section="statement"][data-builtin-layout="stacked"] .statement-section .statement-copy { max-width: 46rem; text-align: center; }
.builtin-section[data-builtin-section="statement"][data-builtin-layout="stacked"] .statement-section :is(.statement-quote-text,.statement-source) { margin-inline: auto; }
@media (min-width:768px) {
  .statement-section .statement-layout.has-media { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
</style>
