<template>
  <div>
    <nav data-guide="settings-pages-nav" class="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-1">
      <button
        v-for="sub in subTabs"
        :key="sub.id"
        type="button"
        class="flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        :class="activeSubTab === sub.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-700'"
        @click="activeSubTab = sub.id"
      >
        <Icon :name="sub.icon" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {{ sub.label }}
      </button>
    </nav>

    <div v-show="activeSubTab === 'homepage'" class="space-y-5">
      <AdminSettingsWebsiteEditorNotice
        description="Homepage copy, presentation, and visual media are managed in Website Editor. SEO and advanced merchandising remain here."
        :editor-to="editorLink('home', 'hero')"
      />
      <AdminSettingsShowcase
        :model-value="form.homepage_showcase"
        :video-preview-url="form.showcase_video_url"
        :media-uploading="mediaUploading"
        :media-progress="mediaProgress"
        @update:model-value="form.homepage_showcase = $event"
        @media-select="forwardSelect"
        @media-remove="forwardRemove"
      />
      <AdminSettingsWatchShop :model-value="form.homepage_watch_shop" @update:model-value="form.homepage_watch_shop = $event" />
      <AdminSettingsBestSellers :model-value="form.homepage_best_sellers" @update:model-value="form.homepage_best_sellers = $event" />
      <AdminSettingsCoverAltField v-model="form.pages_seo.home.cover_alt_text" label="Hero image accessibility" placeholder="Describe the important content in the hero image" />
      <AdminSeoFields
        data-guide="seo-fields"
        v-model:seo-title="form.pages_seo.home.seo_title"
        v-model:seo-description="form.pages_seo.home.seo_description"
        v-model:og-image-url="form.pages_seo.home.og_image_url"
        v-model:noindex="form.pages_seo.home.noindex"
        title-placeholder="Defaults to site name"
        description-placeholder="Defaults to site description"
      />
    </div>

    <div v-show="activeSubTab === 'about'" class="space-y-5">
      <AdminSettingsWebsiteEditorNotice
        description="About and Story page copy, layout, visibility, and images are managed in Website Editor. Image accessibility text and SEO remain here."
        :editor-to="editorLink('about', 'about-content')"
      />
      <AdminSettingsCoverAltField v-model="form.pages_seo.about.cover_alt_text" label="About cover image accessibility" placeholder="Describe the About cover image" />
      <AdminSeoFields v-model:seo-title="form.pages_seo.about.seo_title" v-model:seo-description="form.pages_seo.about.seo_description" v-model:og-image-url="form.pages_seo.about.og_image_url" v-model:noindex="form.pages_seo.about.noindex" title-placeholder="Defaults to site title" description-placeholder="Defaults to site description" />
    </div>

    <div v-show="activeSubTab === 'shop'" class="space-y-5">
      <AdminSettingsWebsiteEditorNotice description="Shop page headings, promotional copy, buttons, and perks are managed in Website Editor. Search metadata remains here." :editor-to="editorLink('shop', 'shop-content')" />
      <AdminSeoFields v-model:seo-title="form.pages_seo.shop.seo_title" v-model:seo-description="form.pages_seo.shop.seo_description" v-model:og-image-url="form.pages_seo.shop.og_image_url" v-model:noindex="form.pages_seo.shop.noindex" title-placeholder="Defaults to site title" description-placeholder="Defaults to site description" />
    </div>

    <div v-show="activeSubTab === 'contact'" class="space-y-5">
      <AdminSettingsWebsiteEditorNotice description="Contact page copy, public contact channels, and cover image are managed in Website Editor. Image accessibility text and SEO remain here." :editor-to="editorLink('contact', 'contact-content')" />
      <AdminSettingsCoverAltField v-model="form.pages_seo.contact.cover_alt_text" label="Contact cover image accessibility" placeholder="Describe the Contact cover image" />
      <AdminSeoFields v-model:seo-title="form.pages_seo.contact.seo_title" v-model:seo-description="form.pages_seo.contact.seo_description" v-model:og-image-url="form.pages_seo.contact.og_image_url" v-model:noindex="form.pages_seo.contact.noindex" title-placeholder="Defaults to site title" description-placeholder="Defaults to site description" />
    </div>

    <div v-show="activeSubTab === 'blog'" class="space-y-5">
      <AdminSettingsWebsiteEditorNotice description="Blog landing-page text, calls to action, and cover image are managed in Website Editor. Image accessibility text and SEO remain here." :editor-to="editorLink('blog', 'blog-content')" />
      <AdminSettingsCoverAltField v-model="form.pages_seo.blog.cover_alt_text" label="Blog cover image accessibility" placeholder="Describe the Blog cover image" />
      <AdminSeoFields v-model:seo-title="form.pages_seo.blog.seo_title" v-model:seo-description="form.pages_seo.blog.seo_description" v-model:og-image-url="form.pages_seo.blog.og_image_url" v-model:noindex="form.pages_seo.blog.noindex" title-placeholder="Defaults to site title" description-placeholder="Defaults to site description" />
    </div>

    <div v-show="activeSubTab === 'services'" class="space-y-5">
      <AdminSettingsWebsiteEditorNotice description="Services landing-page content and cover image are managed in Website Editor. Image accessibility text and SEO remain here." :editor-to="editorLink('services', 'services-content')" />
      <AdminSettingsCoverAltField v-model="form.pages_seo.services.cover_alt_text" label="Services cover image accessibility" placeholder="Describe the Services cover image" />
      <AdminSeoFields v-model:seo-title="form.pages_seo.services.seo_title" v-model:seo-description="form.pages_seo.services.seo_description" v-model:og-image-url="form.pages_seo.services.og_image_url" v-model:noindex="form.pages_seo.services.noindex" title-placeholder="Defaults to site title" description-placeholder="Defaults to site description" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection, UploadProgressState } from '~/composables/useMediaUpload'

const subTabs = [
  { id: 'homepage', label: 'Home', icon: 'heroicons:home' },
  { id: 'about', label: 'About', icon: 'heroicons:information-circle' },
  { id: 'shop', label: 'Shop', icon: 'heroicons:shopping-bag' },
  { id: 'blog', label: 'Blog', icon: 'heroicons:newspaper' },
  { id: 'services', label: 'Services', icon: 'heroicons:wrench-screwdriver' },
  { id: 'contact', label: 'Contact', icon: 'heroicons:envelope' },
] as const

type SubTabId = typeof subTabs[number]['id']

defineProps<{
  form: Record<string, any>
  mediaUploading: Record<string, boolean>
  mediaProgress: Record<string, UploadProgressState>
}>()

const emit = defineEmits<{
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const route = useRoute()
const router = useRouter()

function isSubTabId(value: unknown): value is SubTabId {
  return typeof value === 'string' && subTabs.some(item => item.id === value)
}

const requestedSubTab = route.query.sub
const activeSubTab = ref<SubTabId>(isSubTabId(requestedSubTab) ? requestedSubTab : 'homepage')

watch(() => route.query.sub, sub => {
  if (isSubTabId(sub) && sub !== activeSubTab.value) activeSubTab.value = sub
})

watch(activeSubTab, sub => {
  router.replace({ query: { ...route.query, sub } })
})

function editorLink(page: string, section: string) {
  return { path: '/admin/website-editor', query: { page, section } }
}

function forwardSelect(file: File, collection: MediaCollection) {
  emit('media-select', file, collection)
}

function forwardRemove(collection: MediaCollection) {
  emit('media-remove', collection)
}
</script>
