<template>
  <div class="space-y-5">
    <!-- ═══════════ Video + enable toggle ═══════════ -->
    <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-fuchsia-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Featured Showcase</h2>
            <p class="text-xs text-gray-400">Promo block under Featured Products. Big video on the left, four category tiles on the right.</p>
          </div>
        </div>

        <label class="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <span class="text-xs font-medium text-gray-600">{{ localValue.enabled ? 'Visible' : 'Hidden' }}</span>
          <input
            type="checkbox"
            class="sr-only"
            :checked="localValue.enabled"
            @change="updateField('enabled', ($event.target as HTMLInputElement).checked)"
          />
          <div
            class="relative w-10 h-5.5 rounded-full transition-colors"
            :class="localValue.enabled ? 'bg-primary-500' : 'bg-gray-200'"
          >
            <div
              class="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform"
              :class="{ 'toggle-knob-on': localValue.enabled }"
            />
          </div>
        </label>
      </div>

      <div class="p-6">
        <p class="text-xs font-semibold text-gray-700 mb-2">Background Video</p>
        <p class="text-xs text-gray-400 mb-3">
          MP4 / WebM / MOV up to 25MB. Auto-optimized on upload (H.264 + faststart) so it plays without buffering on the homepage.
          Compress to ~20MB before uploading for fastest results.
        </p>

        <AdminMediaUploader
          :url="videoPreviewUrl"
          :uploading="mediaUploading.showcase_video"
          :progress="mediaProgress?.showcase_video"
          label="Video"
          hint="MP4, WebM, MOV — up to 25MB"
          input-id="showcase-video-upload"
          accept="video/mp4,video/webm,video/quicktime"
          overlay
          video
          dropzone-class="h-44"
          @select="(f) => emit('media-select', f, 'showcase_video')"
          @remove="emit('media-remove', 'showcase_video')"
        />

        <!-- Processing / status banner -->
        <div
          v-if="showcaseStatusMessage"
          class="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
          :class="statusBannerClass"
        >
          <svg
            v-if="localValue.video_status === 'processing'"
            class="w-3.5 h-3.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusIconPath" />
          </svg>
          {{ showcaseStatusMessage }}
        </div>
      </div>
    </section>

    <!-- ═══════════ Heading ═══════════ -->
    <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Section Heading</h2>
          <p class="text-xs text-gray-400">Shown above the showcase on the homepage. Click any field to edit.</p>
        </div>
      </div>

      <div class="bg-white p-6 text-center space-y-1">
        <input
          :value="localValue.label"
          @input="updateField('label', ($event.target as HTMLInputElement).value)"
          type="text"
          maxlength="100"
          placeholder="Label (e.g. Featured)"
          class="edit-inline text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center"
        />
        <input
          :value="localValue.heading"
          @input="updateField('heading', ($event.target as HTMLInputElement).value)"
          type="text"
          maxlength="150"
          placeholder="Heading (e.g. Find your product)"
          class="edit-inline text-2xl font-bold text-gray-900 text-center"
        />
        <input
          :value="localValue.subtitle"
          @input="updateField('subtitle', ($event.target as HTMLInputElement).value)"
          type="text"
          maxlength="255"
          placeholder="Subtitle (optional)"
          class="edit-inline text-sm text-gray-500 text-center max-w-md mx-auto"
        />
      </div>
    </section>

    <!-- ═══════════ Tiles (4) ═══════════ -->
    <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Category Tiles</h2>
          <p class="text-xs text-gray-400">Each tile shows a representative product image and links to its category.</p>
        </div>
      </div>

      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(tile, i) in localValue.tiles"
          :key="i"
          class="rounded-xl border border-gray-200 overflow-hidden"
        >
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
            <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
            <span class="ml-2 text-[10px] text-gray-400 font-medium">Tile {{ i + 1 }}</span>
          </div>

          <div class="bg-white p-4 space-y-3">
            <!-- Live preview thumbnail -->
            <div class="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                v-if="tilePreviewUrl(tile)"
                :src="tilePreviewUrl(tile)!"
                :alt="tile.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="text-[11px] text-gray-400 text-center px-4">
                Pick a product below to use its image
              </div>
              <div class="absolute bottom-2 left-2 bg-white/85 backdrop-blur-sm rounded-md px-2 py-0.5">
                <span class="text-[10px] font-bold text-gray-800">{{ tile.title || 'Tile title' }}</span>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Title</label>
              <input
                :value="tile.title"
                @input="updateTile(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="e.g. K-Beauty for Mature Skin"
                class="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                maxlength="100"
              />
            </div>

            <!-- CTA -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">CTA Label</label>
              <input
                :value="tile.cta_label"
                @input="updateTile(i, 'cta_label', ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="SHOP NOW"
                class="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                maxlength="30"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Category</label>
              <select
                :value="tile.category_id ?? ''"
                @change="onCategoryChange(i, ($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              >
                <option value="">Select a category…</option>
                <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <!-- Featured product (filtered to category) -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Representative Product</label>
              <select
                :value="tile.featured_product_id ?? ''"
                @change="updateTile(i, 'featured_product_id', toIntOrNull(($event.target as HTMLSelectElement).value))"
                :disabled="!tile.category_id || productsLoading"
                class="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{{ tile.category_id ? 'Select a product…' : 'Pick a category first' }}</option>
                <option
                  v-for="product in productsForCategory(tile.category_id)"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { HomepageShowcase, HomepageShowcaseTile } from '~/composables/useSiteConfig'
import type { Category } from '~/composables/useProductCategories'
import type { Product } from '~/types/product'
import type { MediaCollection } from '~/composables/useMediaUpload'

interface Props {
  modelValue: HomepageShowcase
  videoPreviewUrl: string
  mediaUploading: Record<string, boolean>
  mediaProgress?: Record<string, { loaded: number; total: number; percent: number }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:model-value': [value: HomepageShowcase]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const localValue = computed(() => props.modelValue)

const { $apiFetch } = useNuxtApp()
const { allCategories, fetchCategories } = useProductCategories()

interface FlatCategory { id: number; label: string }

const flatCategories = computed<FlatCategory[]>(() => flatten(allCategories.value, 0))

function flatten(cats: Category[], depth: number): FlatCategory[] {
  const out: FlatCategory[] = []
  for (const c of cats) {
    out.push({ id: c.id, label: `${'— '.repeat(depth)}${c.name}` })
    if (c.children?.length) {
      out.push(...flatten(c.children, depth + 1))
    }
  }
  return out
}

const products = ref<Product[]>([])
const productsLoading = ref(false)

async function loadProducts() {
  productsLoading.value = true
  try {
    const res = await $apiFetch<{ data: Product[] }>('/products', {
      method: 'GET',
      query: { is_active: 1, limit: 200, sort: 'name', order: 'asc' },
    })
    products.value = res.data ?? []
  } catch (err) {
    console.warn('Failed to load products for showcase picker:', err)
  } finally {
    productsLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  loadProducts()
})

function productsForCategory(categoryId: number | null): Product[] {
  if (!categoryId) return []
  return products.value.filter((p) => {
    if (p.categories?.some((c) => Number(c.id) === Number(categoryId))) return true
    return false
  })
}

function tilePreviewUrl(tile: HomepageShowcaseTile): string | null {
  if (!tile.featured_product_id) return null
  const product = products.value.find((p) => p.id === tile.featured_product_id)
  return product?.image_url || null
}

function toIntOrNull(value: string): number | null {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function updateField<K extends keyof HomepageShowcase>(key: K, value: HomepageShowcase[K]) {
  emit('update:model-value', { ...localValue.value, [key]: value })
}

function updateTile<K extends keyof HomepageShowcaseTile>(index: number, key: K, value: HomepageShowcaseTile[K]) {
  const tiles = localValue.value.tiles.map((t, i) => (i === index ? { ...t, [key]: value } : t))
  emit('update:model-value', { ...localValue.value, tiles })
}

// Changing the category invalidates the previously-chosen product (it may not
// belong to the new category), so we also clear featured_product_id in one go.
function onCategoryChange(index: number, raw: string) {
  const categoryId = toIntOrNull(raw)
  const tiles = localValue.value.tiles.map((t, i) =>
    i === index ? { ...t, category_id: categoryId, featured_product_id: null } : t
  )
  emit('update:model-value', { ...localValue.value, tiles })
}

const showcaseStatusMessage = computed(() => {
  switch (localValue.value.video_status) {
    case 'processing': return 'Optimizing video — this can take up to a minute. The page will use the original until it finishes.'
    case 'failed': return 'Video optimization failed. The original upload is still served. Re-upload to retry.'
    case 'ready': return localValue.value.video_url ? 'Video ready (faststart-encoded).' : ''
    default: return ''
  }
})

const statusBannerClass = computed(() => {
  switch (localValue.value.video_status) {
    case 'processing': return 'bg-amber-50 text-amber-700'
    case 'failed': return 'bg-red-50 text-red-700'
    case 'ready': return 'bg-emerald-50 text-emerald-700'
    default: return 'bg-gray-50 text-gray-600'
  }
})

const statusIconPath = computed(() => {
  switch (localValue.value.video_status) {
    case 'failed': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'ready': return 'M5 13l4 4L19 7'
    default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
})
</script>

<style scoped>
.h-5\.5 { height: 1.375rem; }
.w-5\.5 { width: 1.375rem; }
.h-4\.5 { height: 1.125rem; }
.w-4\.5 { width: 1.125rem; }
.toggle-knob-on { transform: translateX(1.125rem); }

.edit-inline {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.25rem 0.5rem; outline: none; transition: all 0.15s ease;
}
.edit-inline:hover { border-color: rgb(165,180,252); background: rgb(238,242,255); }
.edit-inline:focus { border-color: rgb(99,102,241); border-style: solid; background: white; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.edit-inline::placeholder { color: rgb(199,210,254); font-style: italic; }
</style>
