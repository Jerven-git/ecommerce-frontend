<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="group flex flex-col">
    <!-- Cover image -->
    <div class="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
      <SmoothImage
        v-if="post.cover_image_url"
        :src="post.cover_image_url"
        :alt="post.cover_alt_text || post.title"
        class="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Icon name="heroicons:photo" class="h-10 w-10 text-gray-300" />
      </div>

      <!-- Category badge -->
      <span
        v-if="post.category"
        class="absolute left-3 top-3 inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
        :style="{ background: `linear-gradient(135deg, ${post.category.gradient_from}, ${post.category.gradient_to})` }"
      >
        {{ post.category.name }}
      </span>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col pt-4">
      <p class="mb-2 text-xs text-gray-500">
        <span v-if="post.category">{{ post.category.name }}</span>
        <span v-if="post.category && post.published_at" class="mx-1.5 text-gray-300">·</span>
        <span v-if="post.published_at">{{ formatPostDate(post.published_at) }}</span>
      </p>
      <h3 class="text-lg font-semibold leading-snug tracking-tight text-gray-900 line-clamp-2 transition-colors group-hover:text-primary-600">
        {{ post.title }}
      </h3>
      <p v-if="post.excerpt" class="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">
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
