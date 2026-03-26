<template>
  <section data-guide="settings-features" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Features</h2>
        <p class="text-xs text-gray-400">Toggle store features on or off</p>
      </div>
    </div>

    <div class="p-6 space-y-4">
      <label class="flex items-center justify-between cursor-pointer">
        <div>
          <p class="text-sm font-medium text-gray-700">Favorites</p>
          <p class="text-xs text-gray-400">Allow customers to favorite products with a heart icon</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="favoritesEnabled"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="favoritesEnabled ? 'bg-primary-600' : 'bg-gray-200'"
          @click="emit('update:favoritesEnabled', !favoritesEnabled)"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="favoritesEnabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </label>

      <label class="flex items-center justify-between cursor-pointer">
        <div>
          <p class="text-sm font-medium text-gray-700">Show Stock Quantity</p>
          <p class="text-xs text-gray-400">Display the exact number of remaining stocks to customers</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="showStockQuantity"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="showStockQuantity ? 'bg-primary-600' : 'bg-gray-200'"
          @click="emit('update:showStockQuantity', !showStockQuantity)"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="showStockQuantity ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  favoritesEnabled: boolean
  showStockQuantity: boolean
}>()

const emit = defineEmits<{
  'update:favoritesEnabled': [value: boolean]
  'update:showStockQuantity': [value: boolean]
}>()
</script>
