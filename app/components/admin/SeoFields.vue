<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
    <div>
      <p class="text-sm font-semibold text-gray-900">SEO</p>
      <p class="text-xs text-gray-400">Overrides the default title, description, and social image used by search engines and link previews.</p>
    </div>

    <!-- SEO title -->
    <div>
      <div class="flex items-baseline justify-between mb-1">
        <label class="block text-xs font-semibold text-gray-700">SEO title</label>
        <CharCount :value="seoTitle" :soft="60" :hard="70" />
      </div>
      <input
        v-model="seoTitle"
        type="text"
        :placeholder="titlePlaceholder ?? 'Defaults to entity title'"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
      />
    </div>

    <!-- SEO description -->
    <div>
      <div class="flex items-baseline justify-between mb-1">
        <label class="block text-xs font-semibold text-gray-700">SEO description</label>
        <CharCount :value="seoDescription" :soft="120" :hard="160" />
      </div>
      <textarea
        v-model="seoDescription"
        rows="2"
        :placeholder="descriptionPlaceholder ?? 'Defaults to excerpt or summary'"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
      ></textarea>
    </div>

    <!-- OG image URL -->
    <div>
      <label class="block text-xs font-semibold text-gray-700 mb-1">Social share image URL</label>
      <input
        v-model="ogImageUrl"
        type="url"
        placeholder="https://…"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
      />
      <p class="text-[11px] text-gray-400 mt-1">Used when a link is shared on social platforms. Falls back to the cover image, then site default.</p>
    </div>

    <!-- noindex -->
    <label v-if="!hideNoindex" class="flex items-start gap-2 cursor-pointer">
      <input
        v-model="noindex"
        type="checkbox"
        class="mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
      />
      <span>
        <span class="block text-xs font-semibold text-gray-700">Hide from search engines</span>
        <span class="block text-[11px] text-gray-400">Adds a noindex,nofollow meta tag so this page is excluded from search results.</span>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
const seoTitle = defineModel<string | null>('seoTitle', { default: '' })
const seoDescription = defineModel<string | null>('seoDescription', { default: '' })
const ogImageUrl = defineModel<string | null>('ogImageUrl', { default: '' })
const noindex = defineModel<boolean>('noindex', { default: false })

defineProps<{
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  hideNoindex?: boolean
}>()
</script>
