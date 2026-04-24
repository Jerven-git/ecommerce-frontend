<template>
  <button
    type="button"
    class="relative group w-full aspect-[5/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    :style="baseStyle"
    @click="$emit('select', category.slug)"
  >
    <!-- Image layer (clean, no blend) -->
    <SmoothImage
      v-if="category.image_url"
      :src="category.image_url"
      :alt="category.name"
      class="absolute inset-0 w-full h-full object-cover"
    />

    <!-- Gradient overlay — intensity driven by overlay_opacity -->
    <span
      v-if="category.image_url"
      aria-hidden="true"
      class="absolute inset-0 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-90"
      :style="overlayStyle"
    />

    <!-- Label -->
    <div class="absolute inset-0 flex items-end p-4">
      <span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm text-[12px] font-semibold text-gray-900 shadow-sm">
        {{ category.name }}
      </span>
    </div>

    <!-- Selected ring -->
    <span
      v-if="active"
      class="absolute inset-0 rounded-2xl ring-2 ring-white ring-offset-2 ring-offset-gray-900/20"
    />
  </button>
</template>

<script setup lang="ts">
import type { PostCategory } from '~/types/post'

const props = defineProps<{
  category: PostCategory
  active?: boolean
}>()

defineEmits<{ select: [slug: string] }>()

const gradient = computed(
  () => `linear-gradient(135deg, ${props.category.gradient_from}, ${props.category.gradient_to})`,
)

const baseStyle = computed(() => ({
  background: gradient.value,
}))

const overlayStyle = computed(() => {
  const pct = Math.min(100, Math.max(0, props.category.overlay_opacity ?? 60))
  return {
    background: gradient.value,
    opacity: pct / 100,
  }
})
</script>
