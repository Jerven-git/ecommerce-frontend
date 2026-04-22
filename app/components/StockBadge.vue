<template>
  <!-- In Stock -->
  <span
    v-if="stock > 0"
    :class="[baseClass, variantClass]"
    :style="inStockStyle"
  >
    <span v-if="variant === 'dot'" class="w-2 h-2 rounded-full" :style="{ backgroundColor: inStockColor }" />
    In Stock<template v-if="showQuantity"> ({{ stock }})</template>
  </span>

  <!-- Backorder -->
  <span
    v-else-if="canBackorder"
    :class="[baseClass, variantClass, backorderClass]"
  >
    <span v-if="variant === 'dot'" class="w-2 h-2 rounded-full bg-amber-500" />
    {{ variant === 'dot' ? 'Out of Stock — Available on Backorder' : 'Backorder' }}
  </span>

  <!-- Out of Stock -->
  <span
    v-else
    :class="[baseClass, variantClass, outOfStockClass]"
  >
    <span v-if="variant === 'dot'" class="w-2 h-2 rounded-full bg-red-500" />
    Out of Stock
  </span>
</template>

<script setup lang="ts">
import { DEFAULT_IN_STOCK_COLOR } from '~/composables/useSiteConfig'

type Variant = 'text' | 'pill' | 'dot'

const props = withDefaults(defineProps<{
  stock: number
  canBackorder: boolean
  variant?: Variant
}>(), {
  variant: 'text',
})

const { siteConfig } = useSiteConfig()

const showQuantity = computed(() => !!siteConfig.value?.show_stock_quantity)
const inStockColor = computed(() => siteConfig.value?.badge_in_stock_color || DEFAULT_IN_STOCK_COLOR)

const baseClass = computed(() => {
  switch (props.variant) {
    case 'pill':
      return 'text-xs font-semibold px-2.5 py-1 rounded-full'
    case 'dot':
      return 'inline-flex items-center gap-1.5 text-sm font-medium'
    default:
      return 'text-sm font-medium'
  }
})

const variantClass = computed(() => '')

const inStockStyle = computed(() => {
  if (props.variant === 'pill') {
    return { color: inStockColor.value, backgroundColor: inStockColor.value + '15' }
  }
  return { color: inStockColor.value }
})

const backorderClass = computed(() => {
  if (props.variant === 'pill') return 'bg-amber-50 text-amber-600'
  return 'text-amber-600'
})

const outOfStockClass = computed(() => {
  if (props.variant === 'pill') return 'bg-red-50 text-red-600'
  return 'text-red-600'
})
</script>
