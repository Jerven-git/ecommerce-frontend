<template>
  <BaseModal :open="open" size="lg" hide-close body-class="p-0" @close="$emit('close')">
    <!-- Close button (floating over image) -->
    <button
      type="button"
      @click="$emit('close')"
      class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white transition-colors shadow-sm"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Image (clickable to expand) -->
    <div class="w-full bg-gray-100 relative group/img cursor-pointer" @click="product.image_url && (showLightbox = true)">
      <SmoothImage
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-72 object-cover object-center"
      />
      <div v-else class="w-full h-72">
        <ProductImagePlaceholder size="md" />
      </div>
      <div
        v-if="product.image_url"
        class="absolute inset-0 bg-transparent flex items-center justify-center"
      >
        <span class="opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg">
          View Image
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-1">{{ product.name }}</h2>

      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl font-bold text-primary-600">${{ product.price }}</span>
        <StockBadge :stock="product.stock" :can-backorder="product.can_backorder" variant="pill" />
      </div>

      <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ product.description || 'No description available.' }}</p>

      <NuxtLink
        v-if="hasVariants"
        :to="`/product/${product.slug}`"
        @click="emit('close')"
        class="w-full btn-primary text-center block"
      >
        Select Options
      </NuxtLink>
      <button
        v-else
        @click="addToCart"
        :disabled="!orderable"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ orderable ? 'Add to Cart' : 'Out of Stock' }}
      </button>
    </div>
  </BaseModal>

  <!-- Full-screen Image Lightbox -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showLightbox"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
        @click="showLightbox = false"
      >
        <div class="absolute inset-0 bg-black/80"></div>

        <button
          type="button"
          @click="showLightbox = false"
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
          appear
        >
          <img
            :src="product.image_url"
            :alt="product.name"
            class="relative max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            decoding="async"
            @click.stop
          />
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  open: boolean
  product: Product
}>()

const emit = defineEmits<{
  close: []
}>()

const cartStore = useCartStore()
const showLightbox = ref(false)

const hasVariants = computed(() => (props.product.variants_count ?? 0) > 0)
const orderable = computed(() => isOrderable(props.product))

const addToCart = () => {
  cartStore.addItem(props.product)
  emit('close')
}

watch(() => props.open, (val) => {
  if (!val) showLightbox.value = false
})
</script>
