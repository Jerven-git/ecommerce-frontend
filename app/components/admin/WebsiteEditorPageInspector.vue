<template>
  <div class="border-t border-admin-border pt-4">
    <div class="mb-4 px-1">
      <h3 class="text-sm font-semibold text-admin-text">{{ detail.title }}</h3>
      <p class="mt-1 text-xs leading-5 text-admin-muted">{{ detail.description }}</p>
    </div>

    <div v-if="sectionErrors.length" class="mb-4 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 py-2.5 text-admin-danger" role="alert">
      <p class="text-xs font-semibold">Fix this section before saving</p>
      <ul class="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-5">
        <li v-for="(message, index) in sectionErrors" :key="`${index}-${message}`">{{ message }}</li>
      </ul>
    </div>

    <div v-if="section === 'header'" class="space-y-4">
      <AdminEditorToggle :checked="modelValue.header_cta.enabled" label="Show header button" @change="setPath(['header_cta', 'enabled'], $event)" />
      <AdminEditorField label="Button label"><input :value="modelValue.header_cta.label" maxlength="30" class="editor-input" @input="setPath(['header_cta', 'label'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Button link"><input :value="modelValue.header_cta.link" maxlength="500" class="editor-input" @input="setPath(['header_cta', 'link'], inputValue($event))" /></AdminEditorField>
      <AdminEditorSettingsLink label="Logo, navigation and store name remain in General settings." to="/admin/settings?tab=general" />
    </div>

    <div v-else-if="section === 'footer-banner'" class="space-y-4">
      <AdminEditorToggle :checked="modelValue.footer_banner.enabled" label="Show announcement banner" @change="setPath(['footer_banner', 'enabled'], $event)" />
      <AdminEditorField label="Heading"><input :value="modelValue.footer_banner.heading" maxlength="150" class="editor-input" @input="setPath(['footer_banner', 'heading'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Supporting text"><textarea :value="modelValue.footer_banner.subtitle" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setPath(['footer_banner', 'subtitle'], inputValue($event))" /></AdminEditorField>
      <div class="grid grid-cols-2 gap-2">
        <AdminEditorField label="Button label"><input :value="modelValue.footer_banner.button_label" maxlength="30" class="editor-input" @input="setPath(['footer_banner', 'button_label'], inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="Button link"><input :value="modelValue.footer_banner.button_link" maxlength="500" class="editor-input" @input="setPath(['footer_banner', 'button_link'], inputValue($event))" /></AdminEditorField>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <AdminEditorField label="Background"><input :value="modelValue.footer_banner.background_color" type="color" class="editor-color" @input="setPath(['footer_banner', 'background_color'], inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="End colour"><input :value="modelValue.footer_banner.background_color_to || modelValue.footer_banner.background_color" type="color" class="editor-color" @input="setPath(['footer_banner', 'background_color_to'], inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="Text"><input :value="modelValue.footer_banner.text_color" type="color" class="editor-color" @input="setPath(['footer_banner', 'text_color'], inputValue($event))" /></AdminEditorField>
      </div>
    </div>

    <div v-else-if="section === 'footer'" class="space-y-4">
      <AdminEditorField label="Tagline"><textarea :value="modelValue.footer.tagline" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setPath(['footer', 'tagline'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Copyright"><input :value="modelValue.footer.copyright_text" maxlength="255" class="editor-input" @input="setPath(['footer', 'copyright_text'], inputValue($event))" /></AdminEditorField>
      <p class="text-[11px] leading-5 text-admin-muted">Use <code>{year}</code> and <code>{site_name}</code> as automatic placeholders.</p>
      <div class="space-y-2">
        <AdminEditorToggle :checked="modelValue.footer.show_tagline" label="Show tagline" @change="setPath(['footer', 'show_tagline'], $event)" />
        <AdminEditorToggle :checked="modelValue.footer.show_quick_links" label="Show quick links" @change="setPath(['footer', 'show_quick_links'], $event)" />
        <AdminEditorToggle :checked="modelValue.footer.show_contact_info" label="Show contact details" @change="setPath(['footer', 'show_contact_info'], $event)" />
        <AdminEditorToggle :checked="modelValue.footer.show_social_links" label="Show social links" @change="setPath(['footer', 'show_social_links'], $event)" />
      </div>
      <AdminEditorSettingsLink label="Footer logo, contact details and social links remain in Site Settings." to="/admin/settings?tab=general" />
    </div>

    <div v-else-if="section === 'about-content'" class="space-y-4">
      <AdminEditorField label="Our story"><textarea :value="modelValue.about_content" maxlength="10000" rows="7" class="editor-input min-h-40 resize-y" @input="setPath(['about_content'], inputValue($event))" /></AdminEditorField>
      <AdminEditorRepeater title="Highlights" add-label="Add highlight" :can-add="modelValue.about_highlights.items.length < 12" @add="addItem(['about_highlights', 'items'], { icon: 'heroicons:check-circle', title: '', description: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.about_highlights.items" :key="index" :label="`Highlight ${index + 1}`" @remove="removeItem(['about_highlights', 'items'], index)">
          <input :value="item.title" maxlength="100" placeholder="Title" aria-label="Highlight title" class="editor-input" @input="setItem(['about_highlights', 'items'], index, 'title', inputValue($event))" />
          <textarea :value="item.description" maxlength="255" rows="2" placeholder="Description" aria-label="Highlight description" class="editor-input min-h-20 resize-y" @input="setItem(['about_highlights', 'items'], index, 'description', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorSettingsLink label="About cover image and SEO remain in Site Settings." to="/admin/settings?tab=pages&sub=about" />
    </div>

    <div v-else-if="section === 'story-content'" class="space-y-4">
      <AdminEditorToggle :checked="modelValue.story_page.enabled" label="Enable Story page" @change="setPath(['story_page', 'enabled'], $event)" />
      <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
        <legend class="px-1 text-xs font-semibold text-admin-text">Page heading</legend>
        <input :value="modelValue.story_page.hero.eyebrow" maxlength="100" placeholder="Label" aria-label="Story label" class="editor-input" @input="setPath(['story_page', 'hero', 'eyebrow'], inputValue($event))" />
        <input :value="modelValue.story_page.hero.heading" maxlength="150" placeholder="Heading" aria-label="Story heading" class="editor-input" @input="setPath(['story_page', 'hero', 'heading'], inputValue($event))" />
        <textarea :value="modelValue.story_page.hero.subtitle" maxlength="255" rows="2" placeholder="Supporting text" aria-label="Story supporting text" class="editor-input min-h-20 resize-y" @input="setPath(['story_page', 'hero', 'subtitle'], inputValue($event))" />
      </fieldset>
      <AdminEditorStorySection label="Story section 1" :section="modelValue.story_page.section_a" @update="setPath(['story_page', 'section_a'], $event)" />
      <AdminEditorStorySection label="Story section 2" :section="modelValue.story_page.section_b" @update="setPath(['story_page', 'section_b'], $event)" />
      <AdminEditorSettingsLink label="Story images remain in Site Settings." to="/admin/settings?tab=pages&sub=story" />
    </div>

    <div v-else-if="section === 'contact-content'" class="space-y-4">
      <AdminEditorField label="Information heading"><input :value="modelValue.contact_page.info_title" maxlength="100" class="editor-input" @input="setPath(['contact_page', 'info_title'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Information subtitle"><input :value="modelValue.contact_page.info_subtitle" maxlength="255" class="editor-input" @input="setPath(['contact_page', 'info_subtitle'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Information description"><textarea :value="modelValue.contact_page.info_description" maxlength="500" rows="3" class="editor-input min-h-24 resize-y" @input="setPath(['contact_page', 'info_description'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Response badge"><input :value="modelValue.contact_page.info_badge" maxlength="100" class="editor-input" @input="setPath(['contact_page', 'info_badge'], inputValue($event))" /></AdminEditorField>
      <AdminEditorRepeater title="Customer promises" add-label="Add promise" :can-add="modelValue.contact_page.promises.length < 12" @add="addItem(['contact_page', 'promises'], { icon: 'heroicons:check-circle', title: '', description: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.contact_page.promises" :key="index" :label="`Promise ${index + 1}`" @remove="removeItem(['contact_page', 'promises'], index)">
          <input :value="item.title" maxlength="100" placeholder="Title" aria-label="Promise title" class="editor-input" @input="setItem(['contact_page', 'promises'], index, 'title', inputValue($event))" />
          <textarea :value="item.description" maxlength="255" rows="2" placeholder="Description" aria-label="Promise description" class="editor-input min-h-20 resize-y" @input="setItem(['contact_page', 'promises'], index, 'description', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
        <legend class="px-1 text-xs font-semibold text-admin-text">FAQ heading</legend>
        <input :value="modelValue.contact_page.faq_label" maxlength="50" placeholder="Label" aria-label="FAQ label" class="editor-input" @input="setPath(['contact_page', 'faq_label'], inputValue($event))" />
        <input :value="modelValue.contact_page.faq_heading" maxlength="100" placeholder="Heading" aria-label="FAQ heading" class="editor-input" @input="setPath(['contact_page', 'faq_heading'], inputValue($event))" />
        <textarea :value="modelValue.contact_page.faq_subtitle" maxlength="255" rows="2" placeholder="Supporting text" aria-label="FAQ supporting text" class="editor-input min-h-20 resize-y" @input="setPath(['contact_page', 'faq_subtitle'], inputValue($event))" />
      </fieldset>
      <AdminEditorRepeater title="Questions" add-label="Add question" :can-add="(modelValue.contact_page.faqs?.length ?? 0) < 30" @add="addItem(['contact_page', 'faqs'], { question: '', answer: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.contact_page.faqs ?? []" :key="index" :label="`Question ${index + 1}`" @remove="removeItem(['contact_page', 'faqs'], index)">
          <input :value="item.question" maxlength="255" placeholder="Question" aria-label="FAQ question" class="editor-input" @input="setItem(['contact_page', 'faqs'], index, 'question', inputValue($event))" />
          <textarea :value="item.answer" maxlength="1000" rows="3" placeholder="Answer" aria-label="FAQ answer" class="editor-input min-h-24 resize-y" @input="setItem(['contact_page', 'faqs'], index, 'answer', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorSettingsLink label="Contact addresses, cover image and SEO remain in Site Settings." to="/admin/settings?tab=pages&sub=contact" />
    </div>

    <div v-else-if="section === 'shop-content'" class="space-y-4">
      <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
        <legend class="px-1 text-xs font-semibold text-admin-text">Page heading</legend>
        <input :value="modelValue.shop_header.label" maxlength="100" placeholder="Label" aria-label="Shop label" class="editor-input" @input="setPath(['shop_header', 'label'], inputValue($event))" />
        <input :value="modelValue.shop_header.heading" maxlength="255" placeholder="Heading" aria-label="Shop heading" class="editor-input" @input="setPath(['shop_header', 'heading'], inputValue($event))" />
        <textarea :value="modelValue.shop_header.subtitle" maxlength="255" rows="2" placeholder="Supporting text" aria-label="Shop supporting text" class="editor-input min-h-20 resize-y" @input="setPath(['shop_header', 'subtitle'], inputValue($event))" />
      </fieldset>
      <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
        <legend class="px-1 text-xs font-semibold text-admin-text">Promotional banner</legend>
        <input :value="modelValue.shop_promo.badge" maxlength="100" placeholder="Badge" aria-label="Promotion badge" class="editor-input" @input="setPath(['shop_promo', 'badge'], inputValue($event))" />
        <input :value="modelValue.shop_promo.heading" maxlength="255" placeholder="Heading" aria-label="Promotion heading" class="editor-input" @input="setPath(['shop_promo', 'heading'], inputValue($event))" />
        <textarea :value="modelValue.shop_promo.subtitle" maxlength="500" rows="3" placeholder="Supporting text" aria-label="Promotion supporting text" class="editor-input min-h-24 resize-y" @input="setPath(['shop_promo', 'subtitle'], inputValue($event))" />
        <input :value="modelValue.shop_promo.button_text" maxlength="100" placeholder="Button label" aria-label="Promotion button label" class="editor-input" @input="setPath(['shop_promo', 'button_text'], inputValue($event))" />
      </fieldset>
      <AdminEditorRepeater title="Promotion perks" add-label="Add perk" :can-add="modelValue.shop_promo.perks.length < 6" @add="addItem(['shop_promo', 'perks'], '')">
        <AdminEditorRepeaterItem v-for="(perk, index) in modelValue.shop_promo.perks" :key="index" :label="`Perk ${index + 1}`" @remove="removeItem(['shop_promo', 'perks'], index)">
          <input :value="perk" maxlength="100" placeholder="Perk" :aria-label="`Promotion perk ${index + 1}`" class="editor-input" @input="setArrayValue(['shop_promo', 'perks'], index, inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorSettingsLink label="Product assignments and Shop SEO remain in their existing screens." to="/admin/products" />
    </div>

    <div v-else-if="section === 'blog-content'" class="space-y-4">
      <AdminEditorPageHeader label="Blog heading" :header="modelValue.blog_page.header" @update="setPath(['blog_page', 'header'], $event)" />
      <AdminEditorToggle :checked="Boolean(modelValue.blog_page.cta)" label="Show closing call-to-action" @change="toggleObject(['blog_page', 'cta'], $event, emptyPageCta())" />
      <AdminEditorPageCta v-if="modelValue.blog_page.cta" label="Closing call-to-action" :cta="modelValue.blog_page.cta" @update="setPath(['blog_page', 'cta'], $event)" />
      <AdminEditorSettingsLink label="Posts, cover image and Blog SEO remain in their existing screens." to="/admin/posts" />
    </div>

    <div v-else-if="section === 'services-content'" class="space-y-4">
      <AdminEditorPageHeader label="Services heading" :header="modelValue.services_page.header" @update="setPath(['services_page', 'header'], { ...modelValue.services_page.header, ...$event })" />
      <AdminEditorToggle :checked="Boolean(modelValue.services_page.header.primary_cta)" label="Show primary button" @change="toggleObject(['services_page', 'header', 'primary_cta'], $event, { label: '', link: '' })" />
      <AdminEditorCtaLink v-if="modelValue.services_page.header.primary_cta" label="Primary button" :cta="modelValue.services_page.header.primary_cta" @update="setPath(['services_page', 'header', 'primary_cta'], $event)" />
      <AdminEditorToggle :checked="Boolean(modelValue.services_page.header.secondary_cta)" label="Show secondary button" @change="toggleObject(['services_page', 'header', 'secondary_cta'], $event, { label: '', link: '' })" />
      <AdminEditorCtaLink v-if="modelValue.services_page.header.secondary_cta" label="Secondary button" :cta="modelValue.services_page.header.secondary_cta" @update="setPath(['services_page', 'header', 'secondary_cta'], $event)" />
      <AdminEditorToggle :checked="Boolean(modelValue.services_page.summary)" label="Show service summary" @change="toggleObject(['services_page', 'summary'], $event, { items: [] })" />
      <AdminEditorRepeater v-if="modelValue.services_page.summary" title="Summary items" add-label="Add item" :can-add="modelValue.services_page.summary.items.length < 6" @add="addItem(['services_page', 'summary', 'items'], { title: '', description: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.services_page.summary.items" :key="index" :label="`Item ${index + 1}`" @remove="removeItem(['services_page', 'summary', 'items'], index)">
          <input :value="item.title" maxlength="100" placeholder="Title" aria-label="Summary title" class="editor-input" @input="setItem(['services_page', 'summary', 'items'], index, 'title', inputValue($event))" />
          <textarea :value="item.description" maxlength="255" rows="2" placeholder="Description" aria-label="Summary description" class="editor-input min-h-20 resize-y" @input="setItem(['services_page', 'summary', 'items'], index, 'description', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorToggle :checked="Boolean(modelValue.services_page.stats)" label="Show service statistics" @change="toggleObject(['services_page', 'stats'], $event, { items: [] })" />
      <AdminEditorRepeater v-if="modelValue.services_page.stats" title="Statistics" add-label="Add statistic" :can-add="modelValue.services_page.stats.items.length < 6" @add="addItem(['services_page', 'stats', 'items'], { value: '', label: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.services_page.stats.items" :key="index" :label="`Statistic ${index + 1}`" @remove="removeItem(['services_page', 'stats', 'items'], index)">
          <div class="grid grid-cols-2 gap-2">
            <input :value="item.value" maxlength="50" placeholder="Value" aria-label="Statistic value" class="editor-input" @input="setItem(['services_page', 'stats', 'items'], index, 'value', inputValue($event))" />
            <input :value="item.label" maxlength="150" placeholder="Label" aria-label="Statistic label" class="editor-input" @input="setItem(['services_page', 'stats', 'items'], index, 'label', inputValue($event))" />
          </div>
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorToggle :checked="Boolean(modelValue.services_page.cta)" label="Show closing call-to-action" @change="toggleObject(['services_page', 'cta'], $event, emptyPageCta())" />
      <AdminEditorPageCta v-if="modelValue.services_page.cta" label="Closing call-to-action" :cta="modelValue.services_page.cta" @update="setPath(['services_page', 'cta'], $event)" />
      <AdminEditorSettingsLink label="Services, cover image and Services SEO remain in their existing screens." to="/admin/services" />
    </div>

    <div v-else-if="section === 'welcome-popup'" class="space-y-4">
      <AdminEditorToggle :checked="modelValue.welcome_popup_enabled" label="Enable welcome popup" @change="setPath(['welcome_popup_enabled'], $event)" />
      <AdminEditorField label="Heading"><input :value="modelValue.welcome_popup_heading" maxlength="255" class="editor-input" @input="setPath(['welcome_popup_heading'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Message"><textarea :value="modelValue.welcome_popup_body" maxlength="1000" rows="5" class="editor-input min-h-32 resize-y" @input="setPath(['welcome_popup_body'], inputValue($event))" /></AdminEditorField>
      <AdminEditorSettingsLink label="Choose the discount connected to this popup in Popup settings." to="/admin/settings?tab=popup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogPageCta, ServicesPageCta } from '~/composables/useSiteConfig'
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'

const props = defineProps<{
  modelValue: WebsiteEditorDraftPayload
  section: string
  errors?: Record<string, string[]>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()

const details: Record<string, { title: string; description: string; prefixes: string[] }> = {
  header: { title: 'Header call-to-action', description: 'Set the optional action shown in the storefront header.', prefixes: ['payload.header_cta'] },
  'footer-banner': { title: 'Announcement banner', description: 'Create a shared message immediately above the footer.', prefixes: ['payload.footer_banner'] },
  footer: { title: 'Footer', description: 'Control the shared footer message and visible information groups.', prefixes: ['payload.footer'] },
  'about-content': { title: 'About page', description: 'Tell the store story and add concise customer-facing highlights.', prefixes: ['payload.about_'] },
  'story-content': { title: 'Story page', description: 'Build a longer editorial story from two controlled sections.', prefixes: ['payload.story_page'] },
  'contact-content': { title: 'Contact page', description: 'Shape the support information, promises and frequently asked questions.', prefixes: ['payload.contact_page'] },
  'shop-content': { title: 'Shop page', description: 'Set the catalogue introduction and promotional close.', prefixes: ['payload.shop_'] },
  'blog-content': { title: 'Blog page', description: 'Set the journal introduction and optional closing action.', prefixes: ['payload.blog_page'] },
  'services-content': { title: 'Services page', description: 'Present the service catalogue with controlled summary, statistics and actions.', prefixes: ['payload.services_page'] },
  'welcome-popup': { title: 'Welcome popup', description: 'Edit the offer message while the preview keeps signup actions inactive.', prefixes: ['payload.welcome_popup_'] },
}

const detail = computed(() => details[props.section] ?? { title: 'Page content', description: '', prefixes: [] })
const sectionErrors = computed(() => Object.entries(props.errors ?? {})
  .filter(([field]) => detail.value.prefixes.some(prefix => field.startsWith(prefix)))
  .flatMap(([, messages]) => messages))

const clone = () => JSON.parse(JSON.stringify(props.modelValue)) as WebsiteEditorDraftPayload
const inputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value

function setPath(path: string[], value: unknown) {
  const next = clone()
  let target = next as unknown as Record<string, any>
  for (const key of path.slice(0, -1)) target = target[key]
  target[path[path.length - 1]!] = value
  emit('update:modelValue', next)
}

function getArray(target: WebsiteEditorDraftPayload, path: string[]): any[] {
  let value = target as unknown as Record<string, any>
  for (const key of path) value = value[key]
  return value as unknown as any[]
}

function addItem(path: string[], item: unknown) {
  const next = clone()
  getArray(next, path).push(item)
  emit('update:modelValue', next)
}

function removeItem(path: string[], index: number) {
  const next = clone()
  getArray(next, path).splice(index, 1)
  emit('update:modelValue', next)
}

function setItem(path: string[], index: number, field: string, value: unknown) {
  const next = clone()
  getArray(next, path)[index][field] = value
  emit('update:modelValue', next)
}

function setArrayValue(path: string[], index: number, value: unknown) {
  const next = clone()
  getArray(next, path)[index] = value
  emit('update:modelValue', next)
}

function toggleObject(path: string[], enabled: boolean, fallback: unknown) {
  setPath(path, enabled ? fallback : null)
}

const emptyPageCta = (): BlogPageCta & ServicesPageCta => ({ heading: '', subtitle: '', button_label: '', button_link: '' })
</script>

<style scoped>
.editor-input {
  min-height: 44px;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  padding: 0.625rem 0.75rem;
  color: var(--admin-text);
  font-size: 0.75rem;
  line-height: 1.25rem;
}
.editor-input:focus-visible,
.editor-color:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
.editor-color {
  min-height: 44px;
  width: 100%;
  cursor: pointer;
  border-radius: 0.75rem;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  padding: 0.25rem;
}
</style>
