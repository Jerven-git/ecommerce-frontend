<template>
  <Teleport to="body">
    <!-- Product Detail Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
          appear
        >
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <!-- Close button -->
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
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-72 object-cover object-center"
              />
              <div v-else class="w-full h-72 flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <!-- Expand hint -->
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
                <span class="text-2xl font-bold text-blue-600">${{ product.price }}</span>
                <span
                  v-if="product.stock > 0"
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700"
                >
                  In Stock ({{ product.stock }})
                </span>
                <span
                  v-else
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600"
                >
                  Out of Stock
                </span>
              </div>

              <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ product.description || 'No description available.' }}</p>

              <button
                @click="addToCart"
                :disabled="product.stock === 0"
                class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Full-screen Image Lightbox -->
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

        <!-- Close -->
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
            @click.stop
          />
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  product: any
}>()

const emit = defineEmits<{
  close: []
}>()

const cartStore = useCartStore()
const showLightbox = ref(false)

const addToCart = () => {
  cartStore.addItem(props.product)
  emit('close')
}

// Close lightbox when modal closes
watch(() => props.open, (val) => {
  if (!val) showLightbox.value = false
})
</script>
