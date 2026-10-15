<template>
  <div
    class="storefront-preview"
    :data-preview-ready="receivedConfig ? 'true' : 'false'"
    @click.capture="blockInteractiveAction"
    @submit.capture.prevent
  >
    <template v-if="receivedConfig">
      <div :data-storefront-section="previewPage === 'global' ? 'brand-assets' : undefined" :data-editor-label="previewPage === 'global' ? 'Brand assets' : undefined">
        <div :data-storefront-section="previewPage === 'global' ? 'store-details' : undefined" :data-editor-label="previewPage === 'global' ? 'Store details' : undefined">
          <div :data-storefront-section="previewPage === 'global' ? 'header' : undefined" :data-editor-label="previewPage === 'global' ? 'Header call-to-action' : undefined">
            <Header />
          </div>
        </div>
      </div>

      <main>
        <StorefrontHomepage v-if="previewPage === 'home' || previewPage === 'global' || previewPage === 'popup'" :site-config-override="previewConfig" editor-preview />

        <section v-else-if="pageDisabled" :data-storefront-section="activeStaticSection.id" :data-editor-label="activeStaticSection.label" class="flex min-h-[34rem] items-center justify-center bg-white px-6 py-20">
          <div class="max-w-md text-center">
            <Icon name="heroicons:eye-slash" class="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
            <h1 class="mt-5 text-2xl font-semibold text-gray-900">{{ activePageOption.label }} is disabled</h1>
            <p class="mt-3 text-sm leading-6 text-gray-600">Enable this storefront page in Site Settings to render its full preview. Your private content can still be edited and saved.</p>
          </div>
        </section>

        <div v-else :data-storefront-section="activeStaticSection.id" :data-editor-label="activeStaticSection.label">
          <component :is="pageComponent" />
        </div>
      </main>

      <div :data-storefront-section="previewPage === 'global' ? 'footer-banner' : undefined" :data-editor-label="previewPage === 'global' ? 'Announcement banner' : undefined">
        <FooterBanner />
        <div v-if="previewPage === 'global' && (!previewConfig?.footer_banner?.enabled || !previewConfig.footer_banner.heading)" class="border-y border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
          Announcement banner is hidden. Add a heading and enable it to publish this surface.
        </div>
      </div>
      <div :data-storefront-section="previewPage === 'global' ? 'footer' : undefined" :data-editor-label="previewPage === 'global' ? 'Footer' : undefined">
        <Footer />
      </div>

      <WelcomePopup v-if="previewPage === 'popup'" editor-preview />
    </template>

    <div class="sr-only" role="status" aria-live="polite">Storefront editor preview</div>
  </div>
</template>

<script setup lang="ts">
import AboutStorefrontPage from '~/pages/about.vue'
import BlogStorefrontPage from '~/pages/blog/index.vue'
import ContactStorefrontPage from '~/pages/contact.vue'
import ServicesStorefrontPage from '~/pages/services/index.vue'
import ShopStorefrontPage from '~/pages/shop.vue'
import StoryStorefrontPage from '~/pages/story.vue'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { HOMEPAGE_SECTION_IDS } from '~/utils/homepageSections'
import { WEBSITE_EDITOR_PAGES, WEBSITE_EDITOR_STATIC_SECTIONS, websiteEditorPage, type WebsiteEditorPageId } from '~/utils/websiteEditorPages'

definePageMeta({ layout: false, middleware: 'auth' })
useSeoMeta({ robots: 'noindex,nofollow,noarchive' })

const { siteConfig } = useSiteConfig()
const activeSection = ref<string | null>(null)
const previewConfig = ref<SiteConfig | null>(null)
const previewPage = ref<WebsiteEditorPageId>('home')
const receivedConfig = ref(false)

const pageComponents = {
  about: AboutStorefrontPage,
  story: StoryStorefrontPage,
  contact: ContactStorefrontPage,
  shop: ShopStorefrontPage,
  blog: BlogStorefrontPage,
  services: ServicesStorefrontPage,
}

const activePageOption = computed(() => websiteEditorPage(previewPage.value))
const activeStaticSection = computed(() => previewPage.value === 'home'
  ? { id: 'hero', label: 'Hero' }
  : WEBSITE_EDITOR_STATIC_SECTIONS[previewPage.value][0] ?? { id: 'header', label: 'Header' })
const pageComponent = computed(() => pageComponents[previewPage.value as keyof typeof pageComponents] ?? AboutStorefrontPage)
const pageDisabled = computed(() => {
  if (previewPage.value === 'story') return previewConfig.value?.story_page?.enabled !== true
  const module = activePageOption.value.module
  return module ? previewConfig.value?.modules_enabled?.[module] === false : false
})

const sectionIds = new Set([
  ...HOMEPAGE_SECTION_IDS,
  ...Object.values(WEBSITE_EDITOR_STATIC_SECTIONS).flatMap(sections => sections.map(section => section.id)),
])

function blockInteractiveAction(event: Event) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('a, button, input, select, textarea, [role="button"]')) return
  event.preventDefault()
  event.stopPropagation()
}

function postPreviewMessage(type: 'ready' | 'rendered') {
  window.parent.postMessage({ source: 'ssu-storefront-preview', type }, window.location.origin)
}

async function selectSection(section: string) {
  if (!sectionIds.has(section)) return

  const previous = activeSection.value
    ? document.querySelector<HTMLElement>(`[data-storefront-section="${activeSection.value}"]`)
    : null
  previous?.removeAttribute('data-editor-selected')

  await nextTick()
  const target = document.querySelector<HTMLElement>(`[data-storefront-section="${section}"]`)
  if (!target) return

  activeSection.value = section
  target.setAttribute('data-editor-selected', 'true')
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  target.scrollIntoView({ behavior, block: 'start' })
}

async function setPreviewPage(page: unknown) {
  if (typeof page !== 'string' || !WEBSITE_EDITOR_PAGES.some(option => option.id === page)) return
  previewPage.value = page as WebsiteEditorPageId
  activeSection.value = null
  await nextTick()
}

async function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== window.parent) return
  if (event.data?.source !== 'ssu-website-editor') return

  if (event.data?.type === 'preview-config' && event.data.config && typeof event.data.config === 'object') {
    if (event.data.page) await setPreviewPage(event.data.page)
    const merged = { ...(siteConfig.value ?? {}), ...event.data.config } as SiteConfig
    previewConfig.value = merged
    siteConfig.value = merged
    receivedConfig.value = true
    await nextTick()
    postPreviewMessage('rendered')
  }
  if (event.data?.type === 'preview-ping') postPreviewMessage('ready')
  if (event.data?.type === 'select-page') await setPreviewPage(event.data.page)
  if (event.data?.type === 'select-section' && typeof event.data.section === 'string') {
    if (event.data.page) await setPreviewPage(event.data.page)
    await selectSection(event.data.section)
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage)
  postPreviewMessage('ready')
})

onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<style scoped>
.storefront-preview { min-height: 100vh; background: white; }
.storefront-preview :deep([data-storefront-section]) { position: relative; }
.storefront-preview :deep([data-editor-selected="true"]) { position: relative; outline: 3px solid #7c3aed; outline-offset: -3px; }
.storefront-preview :deep([data-editor-selected="true"]::before) {
  content: attr(data-editor-label);
  position: absolute;
  z-index: 50;
  top: .5rem;
  left: .5rem;
  border-radius: .5rem;
  background: #6d28d9;
  color: white;
  padding: .35rem .55rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: .6875rem;
  font-weight: 700;
  line-height: 1rem;
  box-shadow: 0 .25rem .75rem rgb(76 29 149 / .2);
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) { .storefront-preview { scroll-behavior: auto; } }
</style>
