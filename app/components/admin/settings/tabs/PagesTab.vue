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
        :model-value="{ hero_title: form.hero_title, hero_subtitle: form.hero_subtitle, hero_overlay_color: form.hero_overlay_color, hero_overlay_opacity: form.hero_overlay_opacity, hero_full_bleed: form.hero_full_bleed, hero_focal_x: form.hero_focal_x, hero_focal_y: form.hero_focal_y, hero_image_url: form.hero_image_url, hero_media_mime: form.hero_media_mime }"
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
        :model-value="{ about_image_url: form.about_image_url, about_content: form.about_content, about_overlay_color: form.about_overlay_color, about_overlay_opacity: form.about_overlay_opacity }"
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
        :overlay-color="form.contact_overlay_color"
        :overlay-opacity="form.contact_overlay_opacity"
        @add-entry="emit('add-contact-entry')"
        @remove-entry="(i: number) => emit('remove-contact-entry', i)"
        @update:contact-page="form.contact_page = $event"
        @update:overlay-color="form.contact_overlay_color = $event"
        @update:overlay-opacity="form.contact_overlay_opacity = $event"
        @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
        @media-remove="(c: MediaCollection) => emit('media-remove', c)"
      />
    </div>

    <!-- Blog sub-tab -->
    <div v-show="activeSubTab === 'blog'" class="space-y-5">
      <AdminSettingsBlog
        :image-url="form.blog_image_url"
        :blog-page="form.blog_page"
        :media-uploading="mediaUploading"
        :overlay-color="form.blog_overlay_color"
        :overlay-opacity="form.blog_overlay_opacity"
        @update:blog-page="form.blog_page = $event"
        @update:overlay-color="form.blog_overlay_color = $event"
        @update:overlay-opacity="form.blog_overlay_opacity = $event"
        @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
        @media-remove="(c: MediaCollection) => emit('media-remove', c)"
      />
    </div>

    <!-- Services sub-tab -->
    <div v-show="activeSubTab === 'services'" class="space-y-5">
      <AdminSettingsServices
        :image-url="form.services_image_url"
        :services-page="form.services_page"
        :media-uploading="mediaUploading"
        :overlay-color="form.services_overlay_color"
        :overlay-opacity="form.services_overlay_opacity"
        @update:services-page="form.services_page = $event"
        @update:overlay-color="form.services_overlay_color = $event"
        @update:overlay-opacity="form.services_overlay_opacity = $event"
        @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
        @media-remove="(c: MediaCollection) => emit('media-remove', c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

const subTabs = [
  { id: 'homepage', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6' },
  { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'shop', label: 'Shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { id: 'blog', label: 'Blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { id: 'services', label: 'Services', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
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
