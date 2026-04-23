<template>
  <button
    type="button"
    class="relative group w-full aspect-[5/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    :style="backgroundStyle"
    @click="$emit('select', category.slug)"
  >
    <!-- Optional image overlay -->
    <img
      v-if="category.image_url"
      :src="category.image_url"
      :alt="category.name"
      class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70 group-hover:opacity-90 transition-opacity"
      loading="lazy"
    />

    <!-- Content -->
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

const backgroundStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.category.gradient_from}, ${props.category.gradient_to})`,
}))
</script>
