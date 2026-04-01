<template>
  <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Shop Page</h2>
        <p class="text-xs text-gray-400">Page header and promo banner content</p>
      </div>
    </div>

    <div class="p-6 space-y-8">
      <!-- Page Header -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Page Header</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Label</label>
            <input :value="header.label" @input="updateHeader('label', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Store" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Heading</label>
            <input :value="header.heading" @input="updateHeader('heading', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Shop All Products" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
            <input :value="header.subtitle" @input="updateHeader('subtitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Browse our full collection" />
          </div>
        </div>
      </div>

      <hr class="border-gray-100" />

      <!-- Promo Banner -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Promo Banner</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Badge</label>
            <input :value="promo.badge" @input="updatePromo('badge', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Members get more" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
            <input :value="promo.button_text" @input="updatePromo('button_text', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Shop New Arrivals" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Heading</label>
            <input :value="promo.heading" @input="updatePromo('heading', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="New arrivals every single week." />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
            <input :value="promo.subtitle" @input="updatePromo('subtitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Stay ahead of the trend..." />
          </div>
        </div>

        <!-- Perks -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-2">Perks</label>
          <div class="space-y-2">
            <div v-for="(perk, i) in promo.perks" :key="i" class="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <span class="text-xs font-bold text-gray-400 shrink-0 w-5 text-center">{{ i + 1 }}</span>
              <input :value="perk" @input="updatePerk(i, ($event.target as HTMLInputElement).value)" type="text" class="input-field flex-1" placeholder="Perk label" />
              <button v-if="promo.perks.length > 1" type="button" class="text-gray-300 hover:text-red-500 transition-colors" @click="removePerk(i)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <button v-if="promo.perks.length < 6" type="button" class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" @click="addPerk">+ Add perk</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ShopHeader, ShopPromo } from '~/composables/useSiteConfig'

const props = defineProps<{
  header: ShopHeader
  promo: ShopPromo
}>()

const emit = defineEmits<{
  'update:header': [value: ShopHeader]
  'update:promo': [value: ShopPromo]
}>()

function updateHeader(key: keyof ShopHeader, value: string) {
  emit('update:header', { ...props.header, [key]: value })
}

function updatePromo(key: keyof ShopPromo, value: string) {
  emit('update:promo', { ...props.promo, [key]: value })
}

function updatePerk(index: number, value: string) {
  const perks = [...props.promo.perks]
  perks[index] = value
  emit('update:promo', { ...props.promo, perks })
}

function removePerk(index: number) {
  const perks = props.promo.perks.filter((_, i) => i !== index)
  emit('update:promo', { ...props.promo, perks })
}

function addPerk() {
  emit('update:promo', { ...props.promo, perks: [...props.promo.perks, ''] })
}
</script>
