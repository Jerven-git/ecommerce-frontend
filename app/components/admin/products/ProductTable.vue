<template>
  <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight / Dims</th>
            <th class="w-48 px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider sticky right-0 bg-white shadow-[-12px_0_16px_-12px_rgba(0,0,0,0.15)]">Actions</th>
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
                  <Icon name="heroicons:photo" class="w-4 h-4 text-gray-400" aria-hidden="true" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</p>
                  <p class="text-xs text-gray-500 truncate max-w-xs">{{ product.description }}</p>
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
            <td class="w-48 px-6 py-4">
              <span
                v-if="getProductCategoryNames(product).length"
                class="block max-w-48 cursor-help truncate whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                :title="getProductCategoryNames(product).join(', ')"
                :aria-label="`Categories: ${getProductCategoryNames(product).join(', ')}`"
              >
                {{ getProductCategoryNames(product).join(', ') }}
              </span>
              <span v-else class="text-xs font-medium text-amber-700">
                Uncategorised
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
            <td class="px-6 py-4 whitespace-nowrap text-right sticky right-0 bg-white shadow-[-12px_0_16px_-12px_rgba(0,0,0,0.15)]">
              <div class="inline-flex items-center gap-1">
                <button
                  @click="$emit('edit', product)"
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  @click="$emit('delete', product.id)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="$slots.footer" class="flex justify-end border-t border-gray-100 px-4 py-2">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useProducts'
import { getProductCategoryNames } from '~/utils/product'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  edit: [product: Product]
  delete: [id: number]
}>()

const { format } = useCurrency()
</script>
