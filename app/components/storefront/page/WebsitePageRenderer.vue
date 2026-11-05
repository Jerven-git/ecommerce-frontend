<template>
  <article class="custom-page bg-white text-gray-900">
    <template v-for="block in visibleBlocks" :key="block.id">
      <section
        v-if="block.type === 'hero' && (block.variant ?? 'centered') === 'centered'"
        class="website-page-section relative isolate flex min-h-[34rem] items-center overflow-hidden px-4 py-24 text-center text-white sm:px-6 sm:py-32"
        :class="mediaFor(block) ? '' : 'bg-secondary-950'"
        :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant"
        :data-section="block.type"
      >
        <img v-if="mediaFor(block)" :src="mediaFor(block)?.url" :alt="mediaFor(block)?.alt || ''" class="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div v-if="mediaFor(block)" class="absolute inset-0 -z-10" :style="heroOverlayStyle(block)" aria-hidden="true" />
        <div class="mx-auto flex max-w-3xl flex-col items-center justify-center">
          <p v-if="block.content.eyebrow" class="text-sm font-semibold text-current/75">{{ block.content.eyebrow }}</p>
          <h1 v-if="block.content.heading" class="mt-3 text-balance text-4xl font-bold tracking-[-0.03em] sm:text-6xl">{{ block.content.heading }}</h1>
          <p v-if="block.content.body" class="mt-6 max-w-2xl whitespace-pre-line text-lg leading-8 text-current/80">{{ block.content.body }}</p>
          <div v-if="actions(block).length" class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink v-for="(action, index) in actions(block)" :key="`${block.id}-${index}`" :to="action.link!" class="inline-flex min-h-11 items-center rounded-xl px-5 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" :class="index === 0 ? 'bg-white text-gray-950 hover:bg-gray-100' : 'border border-white/60 text-white hover:bg-white/10'">{{ action.label }}</NuxtLink>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'hero'" class="website-page-section bg-secondary-950 px-4 py-12 text-white sm:px-6 sm:py-16" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto grid max-w-7xl items-stretch overflow-hidden" :class="block.variant === 'split' ? 'lg:grid-cols-2' : 'gap-10 lg:grid-cols-2 lg:items-center lg:gap-16'">
          <div class="flex flex-col justify-center" :class="heroCopyClass(block)">
            <p v-if="block.content.eyebrow" class="text-sm font-semibold text-current/70">{{ block.content.eyebrow }}</p>
            <h1 v-if="block.content.heading" class="mt-3 text-balance text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{{ block.content.heading }}</h1>
            <p v-if="block.content.body" class="mt-6 max-w-2xl whitespace-pre-line text-lg leading-8 text-current/75">{{ block.content.body }}</p>
            <div v-if="actions(block).length" class="mt-8 flex flex-wrap gap-3">
              <NuxtLink v-for="(action, index) in actions(block)" :key="`${block.id}-${index}`" :to="action.link!" class="inline-flex min-h-11 items-center rounded-xl px-5 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" :class="index === 0 ? 'bg-white text-gray-950 hover:bg-gray-100' : 'border border-white/60 text-white hover:bg-white/10'">{{ action.label }}</NuxtLink>
            </div>
          </div>
          <div v-if="mediaFor(block) || preview" class="min-h-72 overflow-hidden" :class="block.variant === 'split' ? 'lg:min-h-[32rem]' : 'rounded-2xl lg:min-h-[28rem]'">
            <img v-if="mediaFor(block)" :src="mediaFor(block)?.url" :alt="mediaFor(block)?.alt || ''" class="h-full w-full object-cover" />
            <div v-else class="flex h-full min-h-72 items-center justify-center bg-gray-100 text-sm font-medium text-gray-500"><Icon name="heroicons:photo" class="mr-2 h-5 w-5" aria-hidden="true" />Add your image</div>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'rich-text'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto whitespace-pre-line text-base leading-8 text-gray-700" :class="richTextClass(block)">{{ block.content.body }}</div>
      </section>

      <section v-else-if="block.type === 'image-text'" class="website-page-section px-4 py-16 sm:px-6 sm:py-24" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto grid items-center gap-10 lg:gap-16" :class="block.variant === 'stacked' ? 'max-w-4xl' : 'max-w-6xl lg:grid-cols-2'">
          <div v-if="mediaFor(block) || preview" :class="block.variant === 'image-right' ? 'lg:order-2' : ''">
            <img v-if="mediaFor(block)" :src="mediaFor(block)?.url" :alt="block.settings.image_alt || mediaFor(block)?.alt || ''" class="aspect-[4/3] w-full rounded-2xl object-cover" />
            <div v-else class="flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-gray-500"><Icon name="heroicons:photo" class="mr-2 h-5 w-5" aria-hidden="true" />Add your image</div>
          </div>
          <div :class="!mediaFor(block) && !preview ? 'lg:col-span-2 lg:mx-auto lg:max-w-3xl' : ''">
            <p v-if="block.content.eyebrow" class="text-sm font-semibold text-primary-700">{{ block.content.eyebrow }}</p>
            <h2 v-if="block.content.heading" class="mt-3 text-balance text-3xl font-bold tracking-[-0.025em] sm:text-4xl">{{ block.content.heading }}</h2>
            <p v-if="block.content.body" class="mt-5 whitespace-pre-line text-base leading-8 text-gray-600">{{ block.content.body }}</p>
            <NuxtLink v-if="validAction(block.content.action)" :to="block.content.action.link" class="mt-7 inline-flex min-h-11 items-center rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">{{ block.content.action.label }}</NuxtLink>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'features'" class="website-page-section bg-gray-50 px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.subtitle" class="mt-4 max-w-2xl text-gray-600">{{ block.content.subtitle }}</p>
          <div class="mt-10 grid" :class="featureGridClass(block)">
            <component :is="item.link ? NuxtLink : 'div'" v-for="(item, index) in block.content.items || []" :key="index" :to="item.link || undefined" :class="featureItemClass(block)" :style="{ backgroundColor: block.settings.design?.background }">
              <h3 v-if="item.title" class="text-lg font-semibold">{{ item.title }}</h3>
              <p v-if="item.description" class="mt-2 leading-7 text-gray-600">{{ item.description }}</p>
            </component>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'stats'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :class="block.variant === 'band' ? 'bg-secondary-950 text-white' : 'bg-gray-50'" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <div class="mt-10 grid gap-px overflow-hidden rounded-2xl" :class="columnClass(block, 6)" :style="block.variant === 'band' ? { backgroundColor: 'rgb(255 255 255 / 0.18)' } : { backgroundColor: 'rgb(209 213 219)' }">
            <div v-for="(item, index) in block.content.items || []" :key="index" class="px-5 py-7" :class="block.variant === 'band' ? 'bg-secondary-950' : 'bg-white'" :style="{ backgroundColor: block.settings.design?.background }">
              <p v-if="item.value || preview" class="text-4xl font-bold tabular-nums tracking-[-0.03em]">{{ item.value || 'Your value' }}</p>
              <p v-if="item.label" class="mt-2 leading-7" :class="block.variant === 'band' ? 'text-white/70' : 'text-gray-600'">{{ item.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'gallery'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="mb-10 text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <div :class="galleryClass(block)">
            <figure v-for="(item, index) in block.content.items || []" :key="index" :class="block.variant === 'carousel' ? 'w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]' : block.variant === 'masonry' ? 'mb-5 break-inside-avoid' : ''">
              <img v-if="galleryMedia(item.media_id)" :src="galleryMedia(item.media_id)?.url" :alt="item.alt || galleryMedia(item.media_id)?.alt || ''" class="w-full rounded-xl object-cover" :class="block.variant === 'masonry' ? 'h-auto' : 'aspect-[4/3]'" loading="lazy" />
              <div v-if="!galleryMedia(item.media_id) && preview" class="flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-gray-500"><Icon name="heroicons:photo" class="mr-2 h-5 w-5" aria-hidden="true" />Add an image</div>
              <figcaption v-if="item.caption" class="mt-2 text-sm text-gray-600">{{ item.caption }}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'faq'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-3xl">
          <h2 v-if="block.content.heading" class="text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.subtitle" class="mt-4 text-gray-600">{{ block.content.subtitle }}</p>
          <div v-if="block.variant === 'list'" class="mt-8 space-y-8">
            <div v-for="(item, index) in block.content.items || []" :key="index">
              <h3 class="font-semibold">{{ item.question }}</h3>
              <p class="mt-3 whitespace-pre-line leading-7 text-gray-600">{{ item.answer }}</p>
            </div>
          </div>
          <div v-else class="mt-8 divide-y divide-gray-200 border-y border-gray-200">
            <details v-for="(item, index) in block.content.items || []" :key="index" class="group py-5">
              <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600">
                {{ item.question }}
                <Icon name="heroicons:plus" class="h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p class="mt-3 whitespace-pre-line pr-10 leading-7 text-gray-600">{{ item.answer }}</p>
            </details>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'cta'" class="website-page-section px-4 py-12 sm:px-6 sm:py-16" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto px-6 py-14 sm:px-12" :class="ctaClass(block)" :style="ctaStyle(block)">
          <div :class="block.variant === 'split' ? 'max-w-2xl' : ''">
            <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em] sm:text-4xl">{{ block.content.heading }}</h2>
            <p v-if="block.content.body" class="mt-4 max-w-2xl whitespace-pre-line leading-7 opacity-80" :class="block.variant === 'split' ? '' : 'mx-auto'">{{ block.content.body }}</p>
          </div>
          <NuxtLink v-if="validAction(block.content.action)" :to="block.content.action.link" class="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" :class="block.variant === 'split' ? 'mt-7 lg:mt-0' : 'mt-7'">{{ block.content.action.label }}</NuxtLink>
        </div>
      </section>

      <section v-else-if="block.type === 'contact-form'" class="website-page-section bg-gray-50 px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto" :class="block.variant === 'split' ? 'grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16' : 'max-w-3xl'">
          <div>
            <h2 v-if="block.content.heading" class="text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
            <p v-if="block.content.body" class="mt-4 whitespace-pre-line leading-7 text-gray-600">{{ block.content.body }}</p>
          </div>
          <form v-if="!contactSuccess[block.id]" class="grid gap-5 sm:grid-cols-2" :class="block.variant === 'compact' ? 'mt-8' : ''" @submit.prevent="submitContact(block)">
            <label v-if="fields(block).includes('name')" class="text-sm font-medium">Name<input v-model="formFor(block).name" required autocomplete="name" class="mt-2 min-h-11 w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></label>
            <label v-if="fields(block).includes('email')" class="text-sm font-medium">Email<input v-model="formFor(block).email" required type="email" autocomplete="email" class="mt-2 min-h-11 w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></label>
            <label v-if="fields(block).includes('phone')" class="text-sm font-medium">Phone<input v-model="formFor(block).phone" type="tel" autocomplete="tel" class="mt-2 min-h-11 w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></label>
            <label v-if="fields(block).includes('message')" class="text-sm font-medium sm:col-span-2">Message<textarea v-model="formFor(block).message" required rows="5" class="mt-2 w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-3 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></label>
            <p v-if="contactErrors[block.id]" class="text-sm text-red-700 sm:col-span-2" role="alert">{{ contactErrors[block.id] }}</p>
            <button type="submit" :disabled="contactSubmitting[block.id]" class="min-h-11 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{{ contactSubmitting[block.id] ? 'Sending…' : 'Send message' }}</button>
          </form>
          <p v-else class="rounded-xl bg-green-50 px-5 py-4 text-sm font-medium text-green-800" :class="block.variant === 'compact' ? 'mt-8' : ''" role="status">{{ block.content.success_message || 'Your message has been sent.' }}</p>
        </div>
      </section>

      <section v-else-if="isDynamic(block)" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.body" class="mt-4 max-w-2xl leading-7 text-gray-600">{{ block.content.body }}</p>
          <div v-if="collections[block.id]?.length" class="mt-10" :class="dynamicCollectionClass(block)">
            <NuxtLink v-for="item in collections[block.id]" :key="item.id" :to="item.url" class="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600" :class="dynamicItemClass(block)">
              <div class="overflow-hidden bg-gray-100" :class="dynamicImageClass(block)">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" />
              </div>
              <div :class="block.variant === 'list' || block.variant === 'feature' ? 'min-w-0 flex-1 py-2' : 'mt-4 flex items-start justify-between gap-4'">
                <div><h3 class="font-semibold text-gray-950 group-hover:underline group-hover:underline-offset-4">{{ item.title }}</h3><p v-if="item.summary" class="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">{{ item.summary }}</p></div>
                <span v-if="item.price != null" class="mt-2 block shrink-0 text-sm font-semibold tabular-nums">{{ formatPrice(item.price) }}</span>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="mt-8 text-sm text-gray-500">No published items are available for this section yet.</p>
        </div>
      </section>
    </template>

    <section v-if="!visibleBlocks.length" class="mx-auto flex min-h-[24rem] max-w-2xl items-center justify-center px-4 py-20 text-center">
      <div><h1 class="text-3xl font-bold tracking-[-0.025em]">{{ title }}</h1><p class="mt-3 text-gray-600">This page does not have any visible sections yet.</p></div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { websitePageSectionStyle } from '~/utils/websitePageDesign'
import type { WebsitePageAction, WebsitePageBlock, WebsitePageCollectionItem, WebsitePageDocument, WebsitePageMedia } from '~/types/websitePage'

const props = defineProps<{
  title: string
  document: WebsitePageDocument
  media?: Record<number, WebsitePageMedia>
  collections?: Record<string, WebsitePageCollectionItem[]>
  preview?: boolean
}>()

const NuxtLink = resolveComponent('NuxtLink')
const { $apiFetch } = useNuxtApp()
const { execute: executeRecaptcha } = useRecaptcha()
const { siteConfig } = useSiteConfig()
const visibleBlocks = computed(() => props.document.blocks.filter(block => block.visible))
const media = computed(() => props.media ?? {})
const collections = computed(() => props.collections ?? {})
const contactForms = reactive<Record<string, { name: string, email: string, phone: string, message: string }>>({})
const contactSubmitting = reactive<Record<string, boolean>>({})
const contactSuccess = reactive<Record<string, boolean>>({})
const contactErrors = reactive<Record<string, string>>({})

watchEffect(() => {
  for (const block of visibleBlocks.value.filter(block => block.type === 'contact-form')) {
    contactForms[block.id] ??= { name: '', email: '', phone: '', message: '' }
  }
})

function mediaFor(block: WebsitePageBlock) {
  return media.value[Number(block.settings.media_id)]
}
function galleryMedia(mediaId: unknown) {
  return media.value[Number(mediaId)]
}
function validAction(action: WebsitePageAction | null | undefined) {
  return Boolean(action?.label && action?.link)
}
function actions(block: WebsitePageBlock) {
  return [block.content.primary_action, block.content.secondary_action].filter(validAction) as WebsitePageAction[]
}
function fields(block: WebsitePageBlock): string[] {
  return [...new Set(['name', 'email', 'message', ...(Array.isArray(block.settings.fields) ? block.settings.fields : [])])]
}
function formFor(block: WebsitePageBlock) {
  return contactForms[block.id] ??= { name: '', email: '', phone: '', message: '' }
}
function isDynamic(block: WebsitePageBlock) {
  return ['product-list', 'collection-list', 'service-list', 'blog-post-list'].includes(block.type)
}
function heroCopyClass(block: WebsitePageBlock) {
  if (block.variant === 'split') return 'px-0 py-10 lg:px-12 lg:py-16'
  return block.variant === 'media-left' ? 'lg:order-2' : ''
}
function heroOverlayStyle(block: WebsitePageBlock) {
  const color = String(block.settings.overlay_color || 'var(--color-secondary-950)')
  const opacity = Math.min(100, Math.max(0, Number(block.settings.overlay_opacity ?? 55)))
  return { backgroundColor: `color-mix(in srgb, ${color} ${opacity}%, transparent)` }
}
function richTextClass(block: WebsitePageBlock) {
  const variant = block.variant || block.settings.width || 'prose'
  const width = variant === 'wide' ? 'max-w-6xl' : variant === 'narrow' ? 'max-w-2xl' : 'max-w-4xl'
  return `${width} ${block.settings.alignment === 'center' ? 'text-center' : ''}`
}
function columnClass(block: WebsitePageBlock, max: number) {
  const columns = Math.min(max, Math.max(1, Number(block.settings.columns || 3)))
  return {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[columns]
}
function featureGridClass(block: WebsitePageBlock) {
  if (block.variant === 'list') return 'grid-cols-1 gap-0 divide-y divide-gray-300 border-y border-gray-300'
  return `${columnClass(block, 4)} ${block.variant === 'cards' ? 'gap-5' : 'gap-x-8 gap-y-10'}`
}
function featureItemClass(block: WebsitePageBlock) {
  if (block.variant === 'cards') return 'rounded-xl border border-gray-200 bg-white p-6'
  if (block.variant === 'list') return 'py-6'
  return 'border-t border-gray-300 pt-5'
}
function galleryClass(block: WebsitePageBlock) {
  if (block.variant === 'carousel') return 'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4'
  if (block.variant === 'masonry') return Number(block.settings.columns || 3) === 2 ? 'columns-1 gap-5 sm:columns-2' : Number(block.settings.columns || 3) === 4 ? 'columns-1 gap-5 sm:columns-2 lg:columns-4' : 'columns-1 gap-5 sm:columns-2 lg:columns-3'
  return `grid gap-4 ${columnClass(block, 4)}`
}
function ctaClass(block: WebsitePageBlock) {
  if (block.variant === 'band') return 'max-w-7xl text-center'
  if (block.variant === 'split') return 'max-w-6xl rounded-2xl text-left lg:flex lg:items-center lg:justify-between lg:gap-10'
  return 'max-w-5xl rounded-2xl text-center'
}
function ctaStyle(block: WebsitePageBlock) {
  return { backgroundColor: block.settings.design?.background || block.settings.background_color || 'var(--color-secondary-950)', color: block.settings.design?.text_color || block.settings.text_color || 'var(--on-secondary)' }
}
function dynamicCollectionClass(block: WebsitePageBlock) {
  if (block.variant === 'carousel') return 'flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4'
  if (block.variant === 'list') return 'grid gap-8'
  if (block.variant === 'feature') return 'grid gap-8'
  return 'grid gap-7 sm:grid-cols-2 lg:grid-cols-3'
}
function dynamicItemClass(block: WebsitePageBlock) {
  if (block.variant === 'carousel') return 'w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]'
  if (block.variant === 'list') return 'grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-5 sm:grid-cols-[12rem_minmax(0,1fr)]'
  if (block.variant === 'feature') return 'grid grid-cols-1 gap-5 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)] sm:items-center'
  return block.variant === 'cards' ? 'rounded-xl border border-gray-200 bg-white p-3' : ''
}
function dynamicImageClass(block: WebsitePageBlock) {
  if (block.variant === 'list') return 'aspect-square rounded-xl sm:aspect-[4/3]'
  if (block.variant === 'feature') return 'aspect-[4/3] rounded-xl'
  return 'aspect-[4/3] rounded-xl'
}
function formatPrice(value: string | number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: siteConfig.value?.currency_code || 'USD' }).format(Number(value))
}
async function submitContact(block: WebsitePageBlock) {
  if (props.preview) {
    contactErrors[block.id] = 'Forms are disabled in preview.'
    return
  }
  contactSubmitting[block.id] = true
  contactErrors[block.id] = ''
  try {
    const recaptchaToken = await executeRecaptcha('contact_form')
    const form = formFor(block)
    await $apiFetch('/contact', {
      method: 'POST',
      body: { name: form.name, email: form.email, phone: form.phone || null, subject: 'Website page enquiry', message: form.message, recaptcha_token: recaptchaToken },
    })
    contactSuccess[block.id] = true
  } catch (error: any) {
    contactErrors[block.id] = error?.status === 429 ? 'Too many messages were sent. Please wait and try again.' : 'Your message could not be sent. Check the fields and try again.'
  } finally {
    contactSubmitting[block.id] = false
  }
}
</script>

<style scoped>
.website-page-section[data-custom-text="true"] :is(h1, h2, h3, p, summary, label, figcaption),
.website-page-section[data-custom-text="true"][data-section="rich-text"] > div { color: var(--section-text); }
.website-page-section[data-custom-width="true"] > div { max-width: var(--section-width); }
.website-page-section[data-custom-alignment="true"] > div { text-align: var(--section-align); align-items: var(--section-items); }
.website-page-section[data-custom-alignment="true"] :is(h1, h2, p) { text-align: var(--section-align); }
</style>
