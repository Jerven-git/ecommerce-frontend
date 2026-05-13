<template>
  <div data-guide="settings-bestsellers" class="bg-white rounded-2xl border border-gray-100 shadow-sm">
    <!-- Header / toggle -->
    <div class="flex items-center justify-between p-5 border-b border-gray-100">
      <div>
        <h3 class="text-base font-semibold text-gray-900">Best Sellers</h3>
        <p class="text-xs text-gray-400 mt-0.5">
          Auto-detected from real orders. The fallback list shows when there
          aren't enough sales yet (e.g. a brand new store).
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="localValue.enabled"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        :class="localValue.enabled ? 'bg-primary-600' : 'bg-gray-200'"
        @click="emit('update:modelValue', { ...localValue, enabled: !localValue.enabled })"
      >
        <span
          class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
          :class="localValue.enabled ? 'translate-x-5' : 'translate-x-0.5'"
        />
      </button>
    </div>

    <!-- Body -->
    <div class="p-5 space-y-5">
      <!-- Label / Heading / Subtitle -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">Label</label>
          <input
            type="text"
            :value="localValue.label"
            @input="emit('update:modelValue', { ...localValue, label: ($event.target as HTMLInputElement).value })"
            placeholder="e.g. Trending Now"
            maxlength="100"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Heading <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            :value="localValue.heading"
            @input="emit('update:modelValue', { ...localValue, heading: ($event.target as HTMLInputElement).value })"
            placeholder="e.g. Best Sellers"
            maxlength="150"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1.5">Subtitle</label>
        <input
          type="text"
          :value="localValue.subtitle"
          @input="emit('update:modelValue', { ...localValue, subtitle: ($event.target as HTMLInputElement).value })"
          placeholder="Optional supporting copy"
          maxlength="255"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <!-- Fallback list -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-semibold text-gray-700">
            Fallback products <span class="text-gray-400 font-normal">({{ fallbackIds.length }} / {{ MAX_FALLBACK }})</span>
          </label>
          <p class="text-[11px] text-gray-400">
            Used until purchase data builds up. Order matters.
          </p>
        </div>

        <!-- Selected list -->
        <div v-if="fallbackIds.length === 0" class="text-xs text-gray-400 italic px-3 py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          No fallback products picked yet. Pick up to {{ MAX_FALLBACK }} below.
        </div>

        <ul v-else class="space-y-2 mb-3">
          <li
            v-for="(id, index) in fallbackIds"
            :key="id"
            class="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
          >
            <span class="text-xs font-bold text-gray-400 w-5 text-center">{{ index + 1 }}</span>
            <img
              v-if="productById(id)?.image_url"
              :src="productById(id)!.image_url!"
              alt=""
              class="w-10 h-10 rounded-md object-cover bg-white"
            />
            <div v-else class="w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4V6z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ productById(id)?.name ?? `Unknown product (#${id})` }}</p>
              <p class="text-xs text-gray-400 truncate">${{ productById(id)?.price ?? '—' }}</p>
            </div>
            <div class="flex items-center gap-0.5">
              <button
                type="button"
                @click="moveUp(index)"
                :disabled="index === 0"
                class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                @click="moveDown(index)"
                :disabled="index === fallbackIds.length - 1"
                class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                @click="remove(index)"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                aria-label="Remove from fallback"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </li>
        </ul>

        <!-- Picker -->
        <div class="border border-gray-200 rounded-lg p-3 bg-white">
          <input
            v-model="search"
            type="text"
            placeholder="Search products to add…"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2"
          />
          <div class="max-h-56 overflow-y-auto space-y-1">
            <button
              v-for="p in filteredProducts"
              :key="p.id"
              type="button"
              @click="add(p.id)"
              :disabled="atCap"
              class="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <img v-if="p.image_url" :src="p.image_url" alt="" class="w-8 h-8 rounded object-cover bg-gray-100" />
              <div v-else class="w-8 h-8 rounded bg-gray-100" />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 truncate">{{ p.name }}</p>
                <p class="text-[11px] text-gray-400">${{ p.price }}</p>
              </div>
              <span class="text-[11px] text-primary-600 font-medium">+ Add</span>
            </button>
            <div v-if="!productsLoading && filteredProducts.length === 0" class="text-center text-xs text-gray-400 py-3">
              {{ search ? 'No products match.' : 'All available products are already in the list.' }}
            </div>
          </div>
        </div>
        <p v-if="atCap" class="text-[11px] text-amber-600 mt-2">
          Maximum {{ MAX_FALLBACK }} fallback products. Remove one to add another.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomepageBestSellers } from '~/composables/useSiteConfig'
import type { Product } from '~/types/product'

const props = defineProps<{
  modelValue: HomepageBestSellers
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HomepageBestSellers]
}>()

const { $apiFetch } = useNuxtApp()

const MAX_FALLBACK = 8

const localValue = computed(() => props.modelValue)
const fallbackIds = computed(() => localValue.value.fallback_product_ids ?? [])
const atCap = computed(() => fallbackIds.value.length >= MAX_FALLBACK)

const products = ref<Product[]>([])
const productsLoading = ref(false)
const search = ref('')

async function loadProducts() {
  productsLoading.value = true
  try {
    const res = await $apiFetch<{ data: Product[] }>('/products', {
      method: 'GET',
      query: { is_active: 1, limit: 200, sort: 'name', order: 'asc' },
    })
    products.value = res.data ?? []
  } catch (err) {
    console.warn('Failed to load products for best-sellers picker:', err)
  } finally {
    productsLoading.value = false
  }
}

onMounted(loadProducts)

function productById(id: number): Product | undefined {
  return products.value.find((p) => p.id === id)
}

const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()
  const picked = new Set(fallbackIds.value)
  return products.value
    .filter((p) => !picked.has(p.id))
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .slice(0, 50)
})

function emitFallback(ids: number[]) {
  emit('update:modelValue', { ...localValue.value, fallback_product_ids: ids })
}

function add(id: number) {
  if (atCap.value) return
  if (fallbackIds.value.includes(id)) return
  emitFallback([...fallbackIds.value, id])
}

function remove(index: number) {
  const next = [...fallbackIds.value]
  next.splice(index, 1)
  emitFallback(next)
}

function moveUp(index: number) {
  if (index === 0) return
  const next = [...fallbackIds.value]
  ;[next[index - 1], next[index]] = [next[index]!, next[index - 1]!]
  emitFallback(next)
}

function moveDown(index: number) {
  if (index >= fallbackIds.value.length - 1) return
  const next = [...fallbackIds.value]
  ;[next[index], next[index + 1]] = [next[index + 1]!, next[index]!]
  emitFallback(next)
}
</script>
