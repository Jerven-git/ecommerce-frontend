<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight / Dims</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/60 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <SmoothImage
                  v-if="product.image_url"
                  :src="product.image_url"
                  :alt="product.name"
                  class="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-100"
                />
                <div v-else class="h-10 w-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</p>
                  <p class="text-xs text-gray-400 truncate max-w-xs">{{ product.description }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
              {{ format(parseFloat(String(product.price))) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <template v-if="product.variants_count > 0">
                  <span
                    class="text-sm font-medium"
                    :class="(product.active_variants_sum_stock ?? 0) === 0 ? 'text-red-500' : (product.active_variants_sum_stock ?? 0) <= 5 ? 'text-amber-600' : 'text-gray-800'"
                  >
                    {{ product.active_variants_sum_stock ?? 0 }}
                  </span>
                  <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500" title="Stock is tracked per variant">
                    {{ product.variants_count }}v
                  </span>
                </template>
                <template v-else>
                  <span
                    class="text-sm font-medium"
                    :class="product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-600' : 'text-gray-800'"
                  >
                    {{ product.stock }}
                  </span>
                </template>
                <span
                  v-if="product.allow_backorder"
                  class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-50 text-primary-600"
                  title="Backorder enabled"
                >BO</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              <template v-if="product.shipping_calc_type === 'dimensions'">
                <span class="text-xs">{{ product.volume_cbm?.toFixed(4) }} m³</span>
              </template>
              <template v-else>
                {{ parseFloat(String(product.weight || 0)).toFixed(2) }} kg
              </template>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {{ product.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="product.is_active ? 'bg-green-500' : 'bg-gray-400'" />
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="inline-flex items-center gap-1">
                <button
                  @click="$emit('edit', product)"
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete', product.id)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useProducts'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  edit: [product: Product]
  delete: [id: number]
}>()

const { format } = useCurrency()
</script>
