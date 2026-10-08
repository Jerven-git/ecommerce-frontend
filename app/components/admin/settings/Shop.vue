<template>
  <section data-guide="settings-shop" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Icon name="heroicons:shopping-bag" class="w-4 h-4 text-blue-600" aria-hidden="true" />
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Shop Page</h2>
        <p class="text-xs text-gray-400">Click directly on text to edit &middot; Hover items for options</p>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- ═══════════ Page Header Display ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Page Header</span>
        </div>
        <div class="bg-white">
          <div class="px-6 py-6 space-y-1.5">
            <!-- Label -->
            <input
              :value="header.label"
              @input="updateHeader('label', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline text-[10px] font-semibold uppercase tracking-widest text-gray-400"
              placeholder="Label (e.g. Store)"
            />
            <!-- Heading -->
            <input
              :value="header.heading"
              @input="updateHeader('heading', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline text-xl font-bold text-gray-900"
              placeholder="Heading"
            />
            <!-- Subtitle -->
            <input
              :value="header.subtitle"
              @input="updateHeader('subtitle', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline text-xs text-gray-500"
              placeholder="Subtitle"
            />
          </div>
        </div>
      </div>

      <!-- ═══════════ Promo Banner Display ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Promo Banner</span>
        </div>
        <div
          class="relative overflow-hidden text-white py-10 px-6 text-center"
          :style="{ background: `linear-gradient(135deg, ${themeColors.secondary}, ${themeColors.primary})` }"
        >
          <!-- Floating orbs (decorative) -->
          <div class="absolute rounded-full opacity-10 bg-white w-36 h-36 -top-10 -left-6"></div>
          <div class="absolute rounded-full opacity-10 bg-white w-24 h-24 -bottom-8 right-[10%]"></div>

          <div class="relative z-10 max-w-md mx-auto">
            <!-- Badge -->
            <input
              :value="promo.badge"
              @input="updatePromo('badge', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light inline-flex mb-4 text-[10px] font-semibold uppercase tracking-widest text-white bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-center"
              placeholder="Badge text"
            />

            <!-- Heading -->
            <input
              :value="promo.heading"
              @input="updatePromo('heading', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-2xl font-bold text-white text-center leading-tight mb-2"
              placeholder="Heading"
            />

            <!-- Subtitle -->
            <input
              :value="promo.subtitle"
              @input="updatePromo('subtitle', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xs text-white/75 text-center max-w-sm mx-auto mb-5"
              placeholder="Subtitle"
            />

            <!-- Perks -->
            <div class="flex flex-wrap justify-center gap-2 mb-5">
              <div
                v-for="(perk, i) in promo.perks"
                :key="i"
                class="group/perk relative flex items-center gap-1.5 bg-white/15 backdrop-blur-sm pl-3 pr-1.5 py-1.5 rounded-full"
              >
                <Icon :name="PERK_ICONS[i % PERK_ICONS.length]" class="h-3 w-3 shrink-0 text-white/70" aria-hidden="true" />
                <input
                  :value="perk"
                  @input="updatePerk(i, ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="bg-transparent border-none outline-none text-white text-[10px] font-medium placeholder-white/30 w-24"
                  placeholder="Perk label"
                />
                <!-- Remove perk -->
                <button
                  v-if="promo.perks.length > 1"
                  type="button"
                  class="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover/perk:opacity-100 transition-opacity hover:bg-red-500"
                  @click="removePerk(i)"
                >
                  <Icon name="heroicons:x-mark" class="w-2.5 h-2.5" aria-hidden="true" />
                </button>
              </div>

              <!-- Add perk -->
              <button
                v-if="promo.perks.length < 6"
                type="button"
                class="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-white/30 hover:text-white/70 hover:bg-white/20 transition-all"
                @click="addPerk"
              >
                <Icon name="heroicons:plus" class="w-3 h-3" aria-hidden="true" />
                <span class="text-[9px] font-medium">Add</span>
              </button>
            </div>

            <!-- Button -->
            <div class="relative inline-flex items-center gap-2 bg-white font-bold px-5 py-2 rounded-lg shadow-lg hover:ring-2 hover:ring-white/40 transition-all" :style="{ color: themeColors.primary }">
              <input
                :value="promo.button_text"
                @input="updatePromo('button_text', ($event.target as HTMLInputElement).value)"
                type="text"
                class="bg-transparent border-none outline-none text-xs font-bold placeholder-gray-300 text-center w-32"
                :style="{ color: themeColors.primary }"
                placeholder="Button text"
              />
              <Icon name="heroicons:arrow-right" class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ShopHeader, ShopPromo } from '~/composables/useSiteConfig'
import { DEFAULT_THEME } from '~/composables/useSiteConfig'

const PERK_ICONS = [
  'heroicons:check',
  'heroicons:arrow-path',
  'heroicons:lock-closed',
]

const props = defineProps<{
  header: ShopHeader
  promo: ShopPromo
}>()

const emit = defineEmits<{
  'update:header': [value: ShopHeader]
  'update:promo': [value: ShopPromo]
}>()

const { siteConfig } = useSiteConfig()
const themeColors = computed(() => ({
  primary: siteConfig.value?.theme?.primary_color || DEFAULT_THEME.primary_color,
  secondary: siteConfig.value?.theme?.secondary_color || DEFAULT_THEME.secondary_color,
}))

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

<style scoped>
/* Inline edit fields on light backgrounds */
.edit-inline {
  display: block;
  width: 100%;
  background: transparent;
  border: 1px dashed transparent;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  outline: none;
  transition: all 0.15s ease;
}
.edit-inline:hover {
  border-color: rgb(165, 180, 252);
  background: rgb(238, 242, 255);
}
.edit-inline:focus {
  border-color: rgb(99, 102, 241);
  border-style: solid;
  background: white;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}
.edit-inline::placeholder {
  color: rgb(199, 210, 254);
  font-style: italic;
}

/* Inline edit fields on dark / colored backgrounds */
.edit-inline-light {
  display: block;
  width: 100%;
  background: transparent;
  border: 1px dashed transparent;
  border-radius: 0.375rem;
  padding: 0.125rem 0.375rem;
  outline: none;
  transition: all 0.15s ease;
}
.edit-inline-light:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}
.edit-inline-light:focus {
  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.12);
}
.edit-inline-light::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}
</style>
