<template>
  <div>
    <!-- Sub-tab pills -->
    <nav data-guide="settings-pages-nav" class="flex gap-1 mb-5 bg-gray-50 rounded-lg p-1 overflow-x-auto border border-gray-100">
      <button
        v-for="sub in subTabs"
        :key="sub.id"
        type="button"
        class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200"
        :class="activeSubTab === sub.id
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'"
        @click="activeSubTab = sub.id"
      >
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sub.icon" />
        </svg>
        {{ sub.label }}
      </button>
    </nav>

    <!-- Homepage sub-tab -->
    <div v-show="activeSubTab === 'homepage'" class="space-y-5">
      <AdminSettingsHomepage
        :model-value="{ hero_title: form.hero_title, hero_subtitle: form.hero_subtitle, hero_image_url: form.hero_image_url, hero_media_mime: form.hero_media_mime }"
        :media-uploading="mediaUploading"
        @update:model-value="Object.assign(form, $event)"
        @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
        @media-remove="(c: MediaCollection) => emit('media-remove', c)"
      />

      <AdminSettingsHomepageSections
        :steps="form.homepage_steps"
        :features="form.homepage_features"
        :stats="form.homepage_stats"
        :newsletter="form.homepage_newsletter"
        @update:steps="form.homepage_steps = $event"
        @update:features="form.homepage_features = $event"
        @update:stats="form.homepage_stats = $event"
        @update:newsletter="form.homepage_newsletter = $event"
      />
    </div>

    <!-- About sub-tab -->
    <div v-show="activeSubTab === 'about'" class="space-y-5">
      <AdminSettingsAbout
        :model-value="{ about_image_url: form.about_image_url, about_content: form.about_content }"
        :highlights="form.about_highlights"
        :media-uploading="mediaUploading"
        @update:model-value="Object.assign(form, $event)"
        @update:highlights="form.about_highlights = $event"
        @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
        @media-remove="(c: MediaCollection) => emit('media-remove', c)"
      />
    </div>

    <!-- Shop sub-tab -->
    <div v-show="activeSubTab === 'shop'" class="space-y-5">
      <AdminSettingsShop
        :header="form.shop_header"
        :promo="form.shop_promo"
        @update:header="form.shop_header = $event"
        @update:promo="form.shop_promo = $event"
      />
    </div>

    <!-- Contact sub-tab -->
    <div v-show="activeSubTab === 'contact'" class="space-y-5">
      <AdminSettingsContact
        :image-url="form.contact_image_url"
        :entries="form.contact_entries"
        :contact-page="form.contact_page"
        :media-uploading="mediaUploading"
        @add-entry="emit('add-contact-entry')"
        @remove-entry="(i: number) => emit('remove-contact-entry', i)"
        @update:contact-page="form.contact_page = $event"
        @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
        @media-remove="(c: MediaCollection) => emit('media-remove', c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

const subTabs = [
  { id: 'homepage', label: 'Homepage', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6' },
  { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'shop', label: 'Shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
] as const

type SubTabId = typeof subTabs[number]['id']

const route = useRoute()
const router = useRouter()

const activeSubTab = ref<SubTabId>((route.query.sub as SubTabId) || 'homepage')

// Sync when route query changes (e.g. from admin guide navigation)
watch(() => route.query.sub, (sub) => {
  if (sub && sub !== activeSubTab.value) {
    activeSubTab.value = sub as SubTabId
  }
})

watch(activeSubTab, (sub) => {
  router.replace({ query: { ...route.query, sub } })
})

defineProps<{
  form: Record<string, any>
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
  'add-contact-entry': []
  'remove-contact-entry': [index: number]
}>()
</script>
