<template>
  <NuxtLink :to="`/product/${product.slug}`" class="group block">
    <!-- Image -->
    <div class="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
      <SmoothImage
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        :class="hasHoverImage ? 'group-hover:opacity-0' : ''"
      />
      <div v-else class="absolute inset-0 bg-gray-200">
        <ProductImagePlaceholder size="md" />
      </div>

      <!-- Secondary image crossfades in on hover -->
      <SmoothImage
        v-if="hasHoverImage"
        :src="product.hover_image_url as string"
        :alt="product.name"
        class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[1200ms] ease-out group-hover:opacity-100"
      />

      <FavoriteButton :product-id="product.id" size="sm" />

      <!-- Hover reveal: material · dimensions + view -->
      <div class="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div class="translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
          <p v-if="meta" class="text-[11px] font-medium uppercase tracking-[0.15em] text-white/75">{{ meta }}</p>
          <span class="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
            View
            <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Caption: title + muted material + de-emphasized price -->
    <div class="mt-3.5 text-center">
      <h3 class="text-sm font-medium tracking-tight text-gray-900 line-clamp-1">{{ product.name }}</h3>
      <p v-if="product.material" class="mt-0.5 text-xs text-gray-400 line-clamp-1">{{ product.material }}</p>
      <p class="mt-1.5 text-xs tracking-wide text-gray-400">
        <span v-if="hasVariants">from </span>{{ format(Number(product.price)) }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
}>()

const { format } = useCurrency()

const hasVariants = computed(() => (props.product.variants_count ?? 0) > 0)
const hasHoverImage = computed(() => !!props.product.hover_image_url)

// Spec metadata shown on hover, e.g. "Solid oak · 180 × 90 × 75 cm".
const meta = computed(() =>
  [props.product.material, props.product.dimensions].filter(Boolean).join(' · '),
)
</script>
