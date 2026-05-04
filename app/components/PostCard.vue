<template>
  <NuxtLink
    :to="`/blog/${post.slug}`"
    class="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
    <!-- Cover image -->
    <div class="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <SmoothImage
        v-if="post.cover_image_url"
        :src="post.cover_image_url"
        :alt="post.cover_alt_text || post.title"
        class="w-full h-full object-cover group-hover:scale-105"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="heroicons:photo" class="w-10 h-10 text-gray-300" />
      </div>

      <!-- Category badge -->
      <span
        v-if="post.category"
        class="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm"
        :style="{
          background: `linear-gradient(135deg, ${post.category.gradient_from}, ${post.category.gradient_to})`,
        }"
      >
        {{ post.category.name }}
      </span>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col p-5">
      <p class="text-[11px] font-medium text-gray-400 mb-2">
        <span v-if="post.category" class="uppercase tracking-wider">{{ post.category.name }}</span>
        <span v-if="post.category && post.published_at" class="mx-1.5">&middot;</span>
        <span v-if="post.published_at">{{ formatPostDate(post.published_at) }}</span>
      </p>
      <h3 class="text-base font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {{ post.title }}
      </h3>
      <p v-if="post.excerpt" class="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {{ post.excerpt }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post'
import { formatPostDate } from '~/utils/formatPostDate'

defineProps<{ post: Post }>()
</script>
