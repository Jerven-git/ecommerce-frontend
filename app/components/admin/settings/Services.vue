<template>
  <section data-guide="settings-services" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-sm font-semibold text-gray-900">Services Page</h2>
        <p class="text-xs text-gray-400">Hero, service groups, stats, and call-to-action banner</p>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- Cover image -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Services Cover Image</label>
        <AdminMediaUploader
          :url="imageUrl"
          :uploading="mediaUploading.services ?? false"
          label="Image"
          hint="JPG, PNG, GIF — max 10 MB · 1600×900 px recommended"
          input-id="servicesImageInput"
          preview-class="w-full h-40 object-cover"
          dropzone-class="h-40"
          overlay
          @select="(f: File) => emit('media-select', f, 'services')"
          @remove="emit('media-remove', 'services')"
        />
      </div>

      <!-- Overlay controls -->
      <AdminSettingsOverlayControls
        heading="Services Hero Overlay"
        description="Darken or tint the services cover image for better text readability."
        input-id-prefix="services"
        :color="overlayColor"
        :opacity="overlayOpacity"
        show-preview
        :preview-image-url="imageUrl"
        :preview-title="servicesPage.header.heading || 'Services built around you'"
        :preview-subtitle="servicesPage.header.subtitle || 'Expert help, done your way'"
        preview-empty-text="Upload a services cover image to preview"
        @update:color="emit('update:overlay-color', $event)"
        @update:opacity="emit('update:overlay-opacity', $event)"
      />

      <!-- Header card -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Hero Header</span>
        </div>
        <div class="bg-white p-5 space-y-3">
          <input
            :value="servicesPage.header.label"
            @input="updateHeader('label', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]"
            placeholder="Eyebrow label (e.g. TRUSTED BY 3M+ CUSTOMERS)"
          />
          <input
            :value="servicesPage.header.heading"
            @input="updateHeader('heading', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-lg font-bold text-gray-900 leading-tight"
            placeholder="Main heading (e.g. Services, done your way)"
          />
          <textarea
            :value="servicesPage.header.subtitle"
            @input="updateHeader('subtitle', ($event.target as HTMLTextAreaElement).value)"
            rows="2"
            class="edit-inline text-xs text-gray-500 leading-relaxed resize-none w-full"
            placeholder="Short description shown below the heading"
          ></textarea>

          <!-- Hero CTAs -->
          <div class="pt-2 border-t border-gray-100 space-y-3">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Hero buttons</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="rounded-lg border border-gray-200 p-3 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Primary</span>
                  <label class="inline-flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer">
                    <input type="checkbox" :checked="!!servicesPage.header.primary_cta" @change="togglePrimaryCta(($event.target as HTMLInputElement).checked)" class="rounded" />
                    Enable
                  </label>
                </div>
                <template v-if="servicesPage.header.primary_cta">
                  <input
                    :value="servicesPage.header.primary_cta.label"
                    @input="updatePrimaryCta('label', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="edit-inline text-xs"
                    placeholder="Button label (e.g. Get started)"
                  />
                  <input
                    :value="servicesPage.header.primary_cta.link"
                    @input="updatePrimaryCta('link', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="edit-inline text-xs font-mono"
                    placeholder="/contact or https://..."
                  />
                </template>
              </div>

              <div class="rounded-lg border border-gray-200 p-3 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Secondary</span>
                  <label class="inline-flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer">
                    <input type="checkbox" :checked="!!servicesPage.header.secondary_cta" @change="toggleSecondaryCta(($event.target as HTMLInputElement).checked)" class="rounded" />
                    Enable
                  </label>
                </div>
                <template v-if="servicesPage.header.secondary_cta">
                  <input
                    :value="servicesPage.header.secondary_cta.label"
                    @input="updateSecondaryCta('label', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="edit-inline text-xs"
                    placeholder="Button label (e.g. Learn more)"
                  />
                  <input
                    :value="servicesPage.header.secondary_cta.link"
                    @input="updateSecondaryCta('link', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="edit-inline text-xs font-mono"
                    placeholder="/about or https://..."
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary strip (3-col) -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
            <span class="ml-2 text-[10px] text-gray-400 font-medium">Summary Strip (optional)</span>
          </div>
          <label class="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 cursor-pointer">
            <input type="checkbox" :checked="!!servicesPage.summary" @change="toggleSummary(($event.target as HTMLInputElement).checked)" class="rounded" />
            Enable
          </label>
        </div>
        <div v-if="servicesPage.summary" class="bg-gray-50/80 p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="(item, i) in servicesPage.summary.items"
              :key="i"
              class="group/summary relative rounded-xl border border-gray-100 shadow-sm p-4 bg-white hover:border-primary-200"
            >
              <button
                v-if="servicesPage.summary.items.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/summary:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removeSummaryItem(i)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <input
                :value="item.title"
                @input="updateSummaryItem(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-sm font-semibold text-gray-900 mb-1"
                placeholder="Title"
              />
              <input
                :value="item.description"
                @input="updateSummaryItem(i, 'description', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-xs text-gray-500"
                placeholder="Short description"
              />
            </div>
            <button
              v-if="servicesPage.summary.items.length < 6"
              type="button"
              class="rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all min-h-[80px]"
              @click="addSummaryItem"
            >
              <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span class="text-[10px] font-medium">Add Summary</span>
            </button>
          </div>
        </div>
        <div v-else class="bg-gray-50 p-5 text-center text-xs text-gray-400">
          Enable to show a 3-column summary strip under the hero.
        </div>
      </div>

      <!-- Stats row -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
            <span class="ml-2 text-[10px] text-gray-400 font-medium">Stats Row (optional)</span>
          </div>
          <label class="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 cursor-pointer">
            <input type="checkbox" :checked="!!servicesPage.stats" @change="toggleStats(($event.target as HTMLInputElement).checked)" class="rounded" />
            Enable
          </label>
        </div>
        <div v-if="servicesPage.stats" class="bg-gray-50/80 p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="(stat, i) in servicesPage.stats.items"
              :key="i"
              class="group/stat relative rounded-xl border border-gray-100 shadow-sm p-4 bg-white hover:border-primary-200"
            >
              <button
                v-if="servicesPage.stats.items.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/stat:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removeStatItem(i)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <input
                :value="stat.value"
                @input="updateStatItem(i, 'value', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-lg font-bold text-gray-900 mb-1"
                placeholder="3 million+"
              />
              <input
                :value="stat.label"
                @input="updateStatItem(i, 'label', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-xs text-gray-500"
                placeholder="Customers trust us"
              />
            </div>
            <button
              v-if="servicesPage.stats.items.length < 6"
              type="button"
              class="rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all min-h-[80px]"
              @click="addStatItem"
            >
              <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span class="text-[10px] font-medium">Add Stat</span>
            </button>
          </div>
        </div>
        <div v-else class="bg-gray-50 p-5 text-center text-xs text-gray-400">
          Enable to show a stats row (e.g. "3M+ customers", "$100B+ assets").
        </div>
      </div>

      <!-- Pointer to Services admin -->
      <NuxtLink
        to="/admin/services"
        class="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-colors group"
      >
        <div class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-primary-300">
          <svg class="w-4 h-4 text-gray-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900">Manage services in Admin → Services</p>
          <p class="text-xs text-gray-500 mt-0.5">Each service has its own detail page, full content, and SEO. Categories live under Service Categories.</p>
        </div>
        <svg class="w-4 h-4 text-gray-400 group-hover:text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>

      <!-- CTA banner -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
            <span class="ml-2 text-[10px] text-gray-400 font-medium">Bottom CTA Banner (optional)</span>
          </div>
          <label class="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 cursor-pointer">
            <input type="checkbox" :checked="!!servicesPage.cta" @change="toggleCta(($event.target as HTMLInputElement).checked)" class="rounded" />
            Enable
          </label>
        </div>

        <div v-if="servicesPage.cta" class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-5 space-y-3">
          <input
            :value="servicesPage.cta.heading"
            @input="updateCta('heading', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline-light text-base font-bold"
            placeholder="CTA heading"
          />
          <input
            :value="servicesPage.cta.subtitle"
            @input="updateCta('subtitle', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline-light text-xs"
            placeholder="CTA subtitle"
          />
          <div class="grid grid-cols-2 gap-2">
            <input
              :value="servicesPage.cta.button_label"
              @input="updateCta('button_label', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xs"
              placeholder="Button label"
            />
            <input
              :value="servicesPage.cta.button_link"
              @input="updateCta('button_link', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xs font-mono"
              placeholder="/contact or https://..."
            />
          </div>
        </div>
        <div v-else class="bg-gray-50 p-5 text-center text-xs text-gray-400">
          Enable to show a CTA banner at the bottom of the services page.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type {
  ServicesPage,
  ServicesPageCta,
  ServicesPageCtaLink,
  ServicesSummaryItem,
  ServicesStatItem,
} from '~/composables/useSiteConfig'

const props = defineProps<{
  imageUrl: string
  servicesPage: ServicesPage
  mediaUploading: Record<string, boolean>
  overlayColor: string
  overlayOpacity: number
}>()

const emit = defineEmits<{
  'update:services-page': [value: ServicesPage]
  'update:overlay-color': [value: string]
  'update:overlay-opacity': [value: number]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

function emitUpdate(next: ServicesPage) {
  emit('update:services-page', next)
}

// --- Header ---
function updateHeader(key: 'label' | 'heading' | 'subtitle', value: string) {
  emitUpdate({
    ...props.servicesPage,
    header: { ...props.servicesPage.header, [key]: value },
  })
}

function togglePrimaryCta(enabled: boolean) {
  emitUpdate({
    ...props.servicesPage,
    header: {
      ...props.servicesPage.header,
      primary_cta: enabled ? (props.servicesPage.header.primary_cta || emptyCtaLink()) : null,
    },
  })
}
function updatePrimaryCta(key: keyof ServicesPageCtaLink, value: string) {
  emitUpdate({
    ...props.servicesPage,
    header: {
      ...props.servicesPage.header,
      primary_cta: { ...(props.servicesPage.header.primary_cta || emptyCtaLink()), [key]: value },
    },
  })
}
function toggleSecondaryCta(enabled: boolean) {
  emitUpdate({
    ...props.servicesPage,
    header: {
      ...props.servicesPage.header,
      secondary_cta: enabled ? (props.servicesPage.header.secondary_cta || emptyCtaLink()) : null,
    },
  })
}
function updateSecondaryCta(key: keyof ServicesPageCtaLink, value: string) {
  emitUpdate({
    ...props.servicesPage,
    header: {
      ...props.servicesPage.header,
      secondary_cta: { ...(props.servicesPage.header.secondary_cta || emptyCtaLink()), [key]: value },
    },
  })
}

// --- Summary ---
function toggleSummary(enabled: boolean) {
  emitUpdate({
    ...props.servicesPage,
    summary: enabled
      ? (props.servicesPage.summary || { items: [emptySummaryItem(), emptySummaryItem(), emptySummaryItem()] })
      : null,
  })
}
function updateSummaryItem(i: number, key: keyof ServicesSummaryItem, value: string) {
  if (!props.servicesPage.summary) return
  const items = props.servicesPage.summary.items.map((it, idx) => idx === i ? { ...it, [key]: value } : it)
  emitUpdate({ ...props.servicesPage, summary: { items } })
}
function addSummaryItem() {
  if (!props.servicesPage.summary) return
  emitUpdate({ ...props.servicesPage, summary: { items: [...props.servicesPage.summary.items, emptySummaryItem()] } })
}
function removeSummaryItem(i: number) {
  if (!props.servicesPage.summary) return
  emitUpdate({ ...props.servicesPage, summary: { items: props.servicesPage.summary.items.filter((_, idx) => idx !== i) } })
}

// --- Stats ---
function toggleStats(enabled: boolean) {
  emitUpdate({
    ...props.servicesPage,
    stats: enabled
      ? (props.servicesPage.stats || { items: [emptyStatItem(), emptyStatItem(), emptyStatItem()] })
      : null,
  })
}
function updateStatItem(i: number, key: keyof ServicesStatItem, value: string) {
  if (!props.servicesPage.stats) return
  const items = props.servicesPage.stats.items.map((it, idx) => idx === i ? { ...it, [key]: value } : it)
  emitUpdate({ ...props.servicesPage, stats: { items } })
}
function addStatItem() {
  if (!props.servicesPage.stats) return
  emitUpdate({ ...props.servicesPage, stats: { items: [...props.servicesPage.stats.items, emptyStatItem()] } })
}
function removeStatItem(i: number) {
  if (!props.servicesPage.stats) return
  emitUpdate({ ...props.servicesPage, stats: { items: props.servicesPage.stats.items.filter((_, idx) => idx !== i) } })
}

// --- CTA banner ---
function toggleCta(enabled: boolean) {
  emitUpdate({
    ...props.servicesPage,
    cta: enabled ? (props.servicesPage.cta || emptyCta()) : null,
  })
}
function updateCta(key: keyof ServicesPageCta, value: string) {
  emitUpdate({
    ...props.servicesPage,
    cta: { ...(props.servicesPage.cta || emptyCta()), [key]: value },
  })
}

// --- Empties ---
function emptyCtaLink(): ServicesPageCtaLink {
  return { label: '', link: '' }
}
function emptyCta(): ServicesPageCta {
  return { heading: '', subtitle: '', button_label: '', button_link: '' }
}
function emptySummaryItem(): ServicesSummaryItem {
  return { title: '', description: '' }
}
function emptyStatItem(): ServicesStatItem {
  return { value: '', label: '' }
}
</script>

<style scoped>
.edit-inline {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.25rem 0.5rem; outline: none; transition: all 0.15s ease;
}
.edit-inline:hover { border-color: rgb(165,180,252); background: rgb(238,242,255); }
.edit-inline:focus { border-color: rgb(99,102,241); border-style: solid; background: white; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.edit-inline::placeholder { color: rgb(199,210,254); font-style: italic; }

.edit-inline-light {
  display: block; width: 100%; background: rgba(255,255,255,0.12);
  color: white;
  border: 1px dashed rgba(255,255,255,0.25); border-radius: 0.375rem;
  padding: 0.375rem 0.625rem; outline: none; transition: all 0.15s ease;
}
.edit-inline-light:focus { border-color: rgba(255,255,255,0.6); border-style: solid; background: rgba(255,255,255,0.18); box-shadow: 0 0 0 2px rgba(255,255,255,0.18); }
.edit-inline-light::placeholder { color: rgba(255,255,255,0.55); }
</style>
