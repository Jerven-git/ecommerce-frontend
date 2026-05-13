<template>
  <div class="space-y-5">
    <!-- ═══════════ Enable + Heading ═══════════ -->
    <section data-guide="settings-watchshop" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Watch &amp; Shop</h2>
            <p class="text-xs text-gray-400">Carousel of short product videos. Customers can see the product in action.</p>
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

      <div class="bg-white p-6 text-center space-y-1">
        <input
          :value="localValue.label"
          @input="updateField('label', ($event.target as HTMLInputElement).value)"
          type="text"
          maxlength="100"
          placeholder="Label (optional)"
          class="edit-inline text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center"
        />
        <input
          :value="localValue.heading"
          @input="updateField('heading', ($event.target as HTMLInputElement).value)"
          type="text"
          maxlength="150"
          placeholder="Heading (e.g. Watch and Shop)"
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

    <!-- ═══════════ Cards ═══════════ -->
    <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 10h16" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Cards</h2>
            <p class="text-xs text-gray-400">
              {{ cardCountLabel }} · MP4, WebM, MOV, GIF, JPG, PNG up to 25MB · auto-optimized.
              Compress to ~20MB before uploading for fastest results.
            </p>
          </div>
        </div>

        <button
          v-if="localValue.cards.length < HARD_CAP"
          type="button"
          class="btn-primary text-xs"
          :disabled="uploading"
          @click="triggerUpload"
        >
          <svg class="w-3.5 h-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          {{ uploading ? 'Uploading…' : 'Add card' }}
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept="video/mp4,video/webm,video/quicktime,image/gif,image/jpeg,image/png,image/webp"
        @change="onFileSelected"
      />

      <!-- Upload progress bar -->
      <div
        v-if="uploading"
        class="px-6 py-3 border-b border-gray-100 bg-primary-50/50"
      >
        <div class="flex items-center justify-between text-xs text-gray-700 mb-1.5">
          <span class="font-medium">{{ uploadingFileName || 'Uploading…' }}</span>
          <span class="tabular-nums text-gray-500">
            {{ formatBytes(uploadProgressBytes) }} / {{ formatBytes(uploadTotalBytes) }}
            <span v-if="uploadTotalBytes > 0" class="ml-2 text-primary-600 font-semibold">{{ uploadPercent }}%</span>
          </span>
        </div>
        <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary-500 transition-[width] duration-100 ease-linear"
            :style="{ width: uploadPercent + '%' }"
          />
        </div>
      </div>

      <!-- Soft warning over recommended count -->
      <div
        v-if="localValue.cards.length > SOFT_CAP"
        class="px-6 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center gap-2"
      >
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.736-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z" />
        </svg>
        You have more than {{ SOFT_CAP }} cards. The carousel is fastest with {{ SOFT_CAP }} or fewer.
      </div>

      <p v-if="lastError" class="px-6 py-2 text-xs text-red-700 bg-red-50 border-b border-red-100">{{ lastError }}</p>

      <!-- Empty state -->
      <div v-if="localValue.cards.length === 0" class="p-10 text-center">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 mb-1">No cards yet.</p>
        <p class="text-xs text-gray-400">Click "Add card" to upload a short product video.</p>
      </div>

      <!-- Cards grid -->
      <div v-else class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="(card, i) in localValue.cards"
          :key="card.id"
          class="rounded-xl border border-gray-200 overflow-hidden bg-white"
        >
          <!-- Preview -->
          <div class="relative w-full aspect-[3/4] bg-gray-100">
            <video
              v-if="card.media_kind === 'video' && card.media_url"
              :src="card.media_url"
              :poster="card.poster_url || undefined"
              class="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsinline
              @mouseenter="(e) => (e.target as HTMLVideoElement).play().catch(() => {})"
              @mouseleave="(e) => (e.target as HTMLVideoElement).pause()"
            />
            <img
              v-else-if="card.media_url"
              :src="card.media_url"
              :alt="card.product?.name || 'Card preview'"
              class="absolute inset-0 w-full h-full object-cover"
            />

            <!-- Per-card processing state -->
            <div
              v-if="card.media_status === 'processing'"
              class="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1"
            >
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Optimizing
            </div>
            <div
              v-else-if="card.media_status === 'failed'"
              class="absolute top-2 left-2 bg-red-100 text-red-800 text-[10px] font-medium px-2 py-1 rounded-full"
            >
              Optimization failed
            </div>

            <!-- Remove -->
            <button
              type="button"
              class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur text-red-500 hover:text-red-700 flex items-center justify-center shadow-sm"
              :title="`Remove card ${i + 1}`"
              @click="removeCard(card.id)"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Product picker -->
          <div class="p-3 space-y-2">
            <label class="block text-[10px] font-medium text-gray-500 uppercase tracking-wide">Linked Product</label>
            <select
              :value="card.product?.id ?? ''"
              @change="onProductChange(card.id, ($event.target as HTMLSelectElement).value)"
              class="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              :disabled="productsLoading"
            >
              <option value="">{{ productsLoading ? 'Loading…' : 'Select a product…' }}</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>

            <!-- Reorder controls -->
            <div class="flex justify-between text-[10px] text-gray-400 pt-1">
              <span>Card {{ i + 1 }}</span>
              <span class="space-x-2">
                <button
                  type="button"
                  class="hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="i === 0"
                  @click="moveCard(i, -1)"
                >← Move left</button>
                <button
                  type="button"
                  class="hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="i === localValue.cards.length - 1"
                  @click="moveCard(i, 1)"
                >Move right →</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type {
  HomepageWatchShop,
  HomepageWatchShopCard,
  WatchShopMediaKind,
} from '~/composables/useSiteConfig'
import type { Product } from '~/types/product'
import { uploadFileWithProgress } from '~/utils/uploadFileWithProgress'

interface UploadResponse {
  card_id: string
  media_id: number
  media_url: string
  media_kind: WatchShopMediaKind
  media_status: 'processing' | 'ready'
}

interface Props {
  modelValue: HomepageWatchShop
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:model-value': [value: HomepageWatchShop]
}>()

interface SiteConfigResponse {
  data: { homepage_watch_shop?: HomepageWatchShop | null }
}

const SOFT_CAP = 8
const HARD_CAP = 12

const { $apiFetch } = useNuxtApp()

const localValue = computed(() => props.modelValue)

const cardCountLabel = computed(() => {
  const n = localValue.value.cards.length
  if (n === 0) return 'No cards yet'
  return `${n} of ${HARD_CAP} cards`
})

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
    console.warn('Failed to load products for Watch & Shop picker:', err)
  } finally {
    productsLoading.value = false
  }
}

onMounted(loadProducts)

// --- Status polling ---
//
// While any card is in 'processing', re-fetch /site-config every 3s and merge
// the resulting media_status / poster_url / media_url back into local state.
// We stop polling the moment no card is processing — so this is idle in the
// common case and active for the seconds it takes ffmpeg to finish.
let pollTimer: ReturnType<typeof setInterval> | null = null
const POLL_INTERVAL_MS = 3000

function hasProcessing(value: HomepageWatchShop): boolean {
  return value.cards.some((c) => c.media_status === 'processing')
}

async function pollOnce() {
  try {
    const res = await $apiFetch<SiteConfigResponse>('/site-config', { method: 'GET' })
    const serverCards = res?.data?.homepage_watch_shop?.cards ?? []
    if (serverCards.length === 0) return

    // Merge server-resolved fields (status/poster/media URL) into our local
    // copy without losing in-flight admin edits like product picks.
    const byId = new Map(serverCards.map((c) => [c.id, c]))
    const mergedCards = localValue.value.cards.map((local) => {
      const fromServer = byId.get(local.id)
      if (!fromServer) return local
      return {
        ...local,
        media_status: fromServer.media_status,
        media_url: fromServer.media_url ?? local.media_url,
        media_kind: fromServer.media_kind ?? local.media_kind,
        poster_url: fromServer.poster_url ?? local.poster_url,
      }
    })
    emit('update:model-value', { ...localValue.value, cards: mergedCards })
  } catch {
    // Silent — the next tick will retry. Network blips shouldn't surface.
  }
}

watch(
  () => hasProcessing(props.modelValue),
  (active) => {
    if (active && !pollTimer) {
      pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS)
    } else if (!active && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

// --- Upload ---
//
// fetch() — and therefore $apiFetch — does not surface upload progress events,
// so a 30MB upload over a slow connection looks frozen until it finishes. We
// drop down to XMLHttpRequest just for this one POST so we can show a real
// percentage. The XSRF token + same-origin cookie behaviour is identical.
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const lastError = ref<string | null>(null)
const uploadingFileName = ref('')
const uploadProgressBytes = ref(0)
const uploadTotalBytes = ref(0)

const uploadPercent = computed(() => {
  if (uploadTotalBytes.value <= 0) return 0
  return Math.min(100, Math.round((uploadProgressBytes.value / uploadTotalBytes.value) * 100))
})

function triggerUpload() {
  fileInput.value?.click()
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB'
  const mb = bytes / 1024 / 1024
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

const runtimeConfig = useRuntimeConfig()
const apiBase = `${runtimeConfig.public.apiBase}${runtimeConfig.public.apiPath}`

function uploadCardWithProgress(file: File): Promise<UploadResponse> {
  return uploadFileWithProgress<UploadResponse>(
    `${apiBase}/site-config/watch-shop/cards`,
    file,
    {
      onProgress: (p) => {
        uploadProgressBytes.value = p.loaded
        uploadTotalBytes.value = p.total
      },
    },
  )
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  if (file.size > 25 * 1024 * 1024) {
    lastError.value = `File is ${(file.size / 1024 / 1024).toFixed(1)}MB — limit is 25MB. Try compressing before uploading.`
    return
  }

  lastError.value = null
  uploading.value = true
  uploadingFileName.value = file.name
  uploadProgressBytes.value = 0
  uploadTotalBytes.value = file.size

  try {
    const res = await uploadCardWithProgress(file)

    const newCard: HomepageWatchShopCard = {
      id: res.card_id,
      media_id: res.media_id,
      media_url: res.media_url,
      media_kind: res.media_kind,
      poster_url: null,
      media_status: res.media_status,
      product: null,
    }
    emit('update:model-value', { ...localValue.value, cards: [...localValue.value.cards, newCard] })
  } catch (err: any) {
    lastError.value = err?.message || 'Upload failed. Check the file type and size.'
  } finally {
    uploading.value = false
    uploadingFileName.value = ''
    uploadProgressBytes.value = 0
    uploadTotalBytes.value = 0
  }
}

// --- Card mutation ---
async function removeCard(cardId: string) {
  // Tell the server to clean up media first; then drop locally.
  try {
    await $apiFetch(`/site-config/watch-shop/cards/${cardId}`, { method: 'DELETE' })
  } catch (err) {
    console.warn('Server-side card delete failed (continuing locally):', err)
  }
  emit('update:model-value', {
    ...localValue.value,
    cards: localValue.value.cards.filter((c) => c.id !== cardId),
  })
}

function moveCard(index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localValue.value.cards.length) return
  const cards = [...localValue.value.cards]
  const [moved] = cards.splice(index, 1)
  cards.splice(newIndex, 0, moved!)
  emit('update:model-value', { ...localValue.value, cards })
}

function onProductChange(cardId: string, raw: string) {
  const productId = raw === '' ? null : Number(raw)
  const product = productId !== null ? products.value.find((p) => p.id === productId) : null

  const cards = localValue.value.cards.map((c) =>
    c.id === cardId
      ? {
          ...c,
          product: product
            ? { id: product.id, name: product.name, slug: product.slug, image_url: product.image_url ?? null }
            : null,
        }
      : c,
  )
  emit('update:model-value', { ...localValue.value, cards })
}

function updateField<K extends keyof HomepageWatchShop>(key: K, value: HomepageWatchShop[K]) {
  emit('update:model-value', { ...localValue.value, [key]: value })
}
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
