<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!post" class="flex-1 flex items-center justify-center py-20 px-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md">
        <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:document-magnifying-glass" class="w-7 h-7 text-gray-300" />
        </div>
        <h1 class="text-lg font-semibold text-gray-900 mb-1">Post not found</h1>
        <p class="text-sm text-gray-500 mb-5">This post may have been unpublished or the link is broken.</p>
        <NuxtLink to="/blog" class="btn-primary">Back to blog</NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- Hero -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0" :style="fallbackGradient">
          <SmoothImage
            v-if="post.cover_image_url"
            :src="post.cover_image_url"
            :alt="post.cover_alt_text || post.title"
            class="w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
          />
          <div
            v-if="post.cover_image_url"
            class="absolute inset-0 bg-black/45"
          />
        </div>

        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center text-white">
          <NuxtLink
            to="/blog"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white mb-4 transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="w-3.5 h-3.5" />
            All posts
          </NuxtLink>

          <p v-if="post.category" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 mb-3">
            {{ post.category.name }}
          </p>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl mx-auto">
            {{ post.title }}
          </h1>

          <div class="flex items-center justify-center gap-3 mt-5 text-sm text-white/80">
            <span v-if="post.author_name">By {{ post.author_name }}</span>
            <span v-if="post.author_name && post.published_at" class="w-1 h-1 rounded-full bg-white/50" />
            <span v-if="post.published_at">{{ formatPostDate(post.published_at) }}</span>
          </div>
        </div>
      </section>

      <!-- Body -->
      <section class="bg-white">
        <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p v-if="post.excerpt" class="text-lg text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100">
            {{ post.excerpt }}
          </p>
          <div class="post-prose" v-html="renderedBody"></div>
        </article>
      </section>

      <!-- Related posts -->
      <section v-if="related.length" class="bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Related posts</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PostCard v-for="r in related" :key="r.id" :post="r" />
          </div>
        </div>
      </section>
    </template>

  </div>
</template>

<script setup lang="ts">
import type { Post, PostDetail } from '~/types/post'
import { renderMarkdown } from '~/utils/markdown'
import { formatPostDate } from '~/utils/formatPostDate'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const post = ref<PostDetail | null>(null)
const related = ref<Post[]>([])
const loading = ref(true)

const renderedBody = computed(() => renderMarkdown(post.value?.body))

const fallbackGradient = computed(() => {
  const from = post.value?.category?.gradient_from || '#6898ED'
  const to = post.value?.category?.gradient_to || '#4B5979'
  return { background: `linear-gradient(135deg, ${from}, ${to})` }
})

async function load() {
  loading.value = true
  const res = await fetchPostBySlug(slug.value)
  post.value = res?.data ?? null
  related.value = res?.related ?? []
  loading.value = false
}

onMounted(load)
watch(slug, load)

useEntitySeo(() => post.value)
</script>

<style scoped>
.post-prose {
  color: rgb(55, 65, 81);
  font-size: 1rem;
  line-height: 1.75;
}
.post-prose :deep(h1) { font-size: 2rem; font-weight: 700; color: rgb(17, 24, 39); margin: 2rem 0 1rem; line-height: 1.2; }
.post-prose :deep(h2) { font-size: 1.5rem; font-weight: 700; color: rgb(17, 24, 39); margin: 2rem 0 1rem; line-height: 1.3; }
.post-prose :deep(h3) { font-size: 1.25rem; font-weight: 600; color: rgb(17, 24, 39); margin: 1.75rem 0 0.75rem; line-height: 1.4; }
.post-prose :deep(h4) { font-size: 1.125rem; font-weight: 600; color: rgb(17, 24, 39); margin: 1.5rem 0 0.5rem; }
.post-prose :deep(p)  { margin: 1rem 0; }
.post-prose :deep(a)  { color: var(--color-primary, rgb(104, 152, 237)); text-decoration: underline; text-underline-offset: 2px; }
.post-prose :deep(a:hover) { opacity: 0.8; }
.post-prose :deep(ul), .post-prose :deep(ol) { margin: 1rem 0; padding-left: 1.5rem; }
.post-prose :deep(ul) { list-style-type: disc; }
.post-prose :deep(ol) { list-style-type: decimal; }
.post-prose :deep(li) { margin: 0.375rem 0; }
.post-prose :deep(blockquote) { border-left: 4px solid var(--color-primary, rgb(104, 152, 237)); padding-left: 1rem; margin: 1.25rem 0; color: rgb(75, 85, 99); font-style: italic; }
.post-prose :deep(code) { background: rgb(243, 244, 246); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; font-family: ui-monospace, SFMono-Regular, monospace; }
.post-prose :deep(pre) { background: rgb(17, 24, 39); color: rgb(229, 231, 235); padding: 1rem 1.25rem; border-radius: 0.75rem; overflow-x: auto; margin: 1.25rem 0; }
.post-prose :deep(pre code) { background: transparent; color: inherit; padding: 0; }
.post-prose :deep(img) { border-radius: 0.75rem; margin: 1.5rem 0; max-width: 100%; }
.post-prose :deep(hr) { border: 0; border-top: 1px solid rgb(229, 231, 235); margin: 2rem 0; }
.post-prose :deep(table) { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.9375em; }
.post-prose :deep(th), .post-prose :deep(td) { border: 1px solid rgb(229, 231, 235); padding: 0.5rem 0.75rem; text-align: left; }
.post-prose :deep(th) { background: rgb(249, 250, 251); font-weight: 600; }
</style>
