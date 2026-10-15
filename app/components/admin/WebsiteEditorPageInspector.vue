<template>
  <div class="border-t border-admin-border pt-4">
    <div class="mb-4 px-1">
      <h3 class="text-sm font-semibold text-admin-text">{{ detail.title }}</h3>
      <p class="mt-1 text-xs leading-5 text-admin-muted">{{ detail.description }}</p>
    </div>

    <div v-if="sectionErrors.length" class="mb-4 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 py-2.5 text-admin-danger" role="alert">
      <p class="text-xs font-semibold">Fix this section before saving</p>
      <ul class="mt-1 list-disc space-y-1 pl-4 text-xs leading-5">
        <li v-for="(message, index) in sectionErrors" :key="`${index}-${message}`">{{ message }}</li>
      </ul>
    </div>

    <div v-if="assetError" class="mb-4 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 py-2.5 text-xs leading-5 text-admin-danger" role="alert">
      {{ assetError }}
    </div>

    <div v-if="section === 'brand-assets'" class="space-y-5">
      <div class="space-y-2.5">
        <div>
          <p class="text-xs font-semibold text-admin-text">Header logo</p>
          <p class="mt-1 text-xs leading-5 text-admin-muted">The primary brand mark shown in the storefront header.</p>
        </div>
        <AdminMediaUploader :url="modelValue.logo_url || ''" :uploading="assetUploading.logo" label="Header logo" hint="PNG, JPG, WebP, SVG or GIF · max 2 MB" input-id="editorLogoInput" preview-class="h-14 w-auto object-contain" dropzone-class="h-28" compact @select="uploadAsset($event, 'logo')" @remove="removeAsset('logo')" />
      </div>

      <AdminEditorField label="Logo accessible name" :error="errorFor('logo_alt_text')">
        <input :value="modelValue.logo_alt_text" maxlength="255" :placeholder="`Defaults to ${modelValue.site_name || 'the store name'}`" class="editor-input" @input="setPath(['logo_alt_text'], inputValue($event))" />
      </AdminEditorField>

      <div class="space-y-2 rounded-xl border border-admin-border p-3">
        <div class="flex items-center justify-between gap-3">
          <label for="editorHeaderLogoSize" class="text-xs font-semibold text-admin-text">Header logo height</label>
          <span class="rounded-md bg-admin-soft px-2 py-1 text-xs font-semibold tabular-nums text-admin-muted">{{ modelValue.logo_size }} px</span>
        </div>
        <input id="editorHeaderLogoSize" :value="modelValue.logo_size" type="range" min="20" max="64" step="1" class="w-full cursor-pointer accent-admin-accent" @input="setPath(['logo_size'], numberValue($event))" />
      </div>

      <div class="space-y-4">
        <div class="min-w-0 space-y-2">
          <p class="text-xs font-semibold text-admin-text">Browser icon</p>
          <AdminMediaUploader :url="modelValue.favicon_url || ''" :uploading="assetUploading.favicon" label="Browser icon" hint="Square image · max 2 MB" input-id="editorFaviconInput" preview-class="h-12 w-12 object-contain" dropzone-class="h-28" compact @select="uploadAsset($event, 'favicon')" @remove="removeAsset('favicon')" />
        </div>
        <div class="min-w-0 space-y-2">
          <p class="text-xs font-semibold text-admin-text">Cart icon</p>
          <AdminMediaUploader :url="modelValue.cart_icon_url || ''" :uploading="assetUploading.cart_icon" label="Cart icon" hint="Square artwork · displayed at a fixed 20 × 20 px" input-id="editorCartIconInput" preview-class="h-12 w-12 object-contain" dropzone-class="h-28" compact @select="uploadAsset($event, 'cart_icon')" @remove="removeAsset('cart_icon')" />
        </div>
      </div>

      <div class="space-y-2.5 border-t border-admin-border pt-5">
        <div>
          <p class="text-xs font-semibold text-admin-text">Footer logo</p>
          <p class="mt-1 text-xs leading-5 text-admin-muted">Optional. Leave empty to reuse the header logo.</p>
        </div>
        <AdminMediaUploader :url="modelValue.footer_logo_url || ''" :uploading="assetUploading.footer_logo" label="Footer logo" hint="PNG, JPG, WebP, SVG or GIF · max 2 MB" input-id="editorFooterLogoInput" preview-class="h-14 w-auto object-contain" dropzone-class="h-28" compact @select="uploadAsset($event, 'footer_logo')" @remove="removeAsset('footer_logo')" />
      </div>

      <div class="space-y-2 rounded-xl border border-admin-border p-3">
        <div class="flex items-center justify-between gap-3">
          <label for="editorFooterLogoSize" class="text-xs font-semibold text-admin-text">Footer logo height</label>
          <span class="rounded-md bg-admin-soft px-2 py-1 text-xs font-semibold tabular-nums text-admin-muted">{{ modelValue.footer_logo_size }} px</span>
        </div>
        <input id="editorFooterLogoSize" :value="modelValue.footer_logo_size" type="range" min="40" max="240" step="2" class="w-full cursor-pointer accent-admin-accent" @input="setPath(['footer_logo_size'], numberValue($event))" />
      </div>

      <p class="rounded-xl bg-admin-info-soft px-3 py-2.5 text-xs leading-5 text-admin-muted">Uploads stay private in this draft. Customers see them only after you save and publish.</p>
    </div>

    <div v-else-if="section === 'store-details'" class="space-y-5">
      <AdminEditorField label="Store name" :error="errorFor('site_name')">
        <input :value="modelValue.site_name" maxlength="255" class="editor-input" autocomplete="organization" @input="setPath(['site_name'], inputValue($event))" />
      </AdminEditorField>

      <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
        <legend class="px-1 text-xs font-semibold text-admin-text">Primary contact</legend>
        <input :value="modelValue.contact_email" type="email" maxlength="255" placeholder="Email address" aria-label="Primary contact email" autocomplete="email" class="editor-input" @input="setPath(['contact_email'], inputValue($event))" />
        <input :value="modelValue.contact_phone" type="tel" maxlength="20" placeholder="Phone number" aria-label="Primary contact phone" autocomplete="tel" class="editor-input" @input="setPath(['contact_phone'], inputValue($event))" />
        <p class="text-xs leading-5 text-admin-muted">Used when no dedicated contact channel is listed below.</p>
      </fieldset>

      <AdminEditorRepeater title="Contact channels" add-label="Add contact" :can-add="modelValue.contact_entries.length < 20" @add="addItem(['contact_entries'], { label: '', email: '', phone: '' })">
        <AdminEditorRepeaterItem v-for="(entry, index) in modelValue.contact_entries" :key="index" :label="entry.label || `Contact ${index + 1}`" @remove="removeItem(['contact_entries'], index)">
          <input :value="entry.label" maxlength="100" placeholder="Label, such as Sales" aria-label="Contact label" class="editor-input" @input="setItem(['contact_entries'], index, 'label', inputValue($event))" />
          <input :value="entry.email" type="email" maxlength="255" placeholder="Email address" aria-label="Contact email" class="editor-input" @input="setItem(['contact_entries'], index, 'email', inputValue($event))" />
          <input :value="entry.phone" type="tel" maxlength="30" placeholder="Phone number" aria-label="Contact phone" class="editor-input" @input="setItem(['contact_entries'], index, 'phone', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>

      <AdminEditorRepeater title="Social links" add-label="Add social link" :can-add="modelValue.social_links.length < 20" @add="addItem(['social_links'], { platform: '', url: '', label: '' })">
        <AdminEditorRepeaterItem v-for="(link, index) in modelValue.social_links" :key="index" :label="link.label || socialPlatformLabel(link.platform) || `Social link ${index + 1}`" @remove="removeItem(['social_links'], index)">
          <select :value="link.platform" aria-label="Social platform" class="editor-input" @change="setItem(['social_links'], index, 'platform', inputValue($event))">
            <option value="" disabled>Choose a platform</option>
            <option v-for="option in SOCIAL_PLATFORMS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <input :value="link.url" type="url" maxlength="500" placeholder="https://..." aria-label="Social profile URL" class="editor-input" @input="setItem(['social_links'], index, 'url', inputValue($event))" />
          <input :value="link.label" maxlength="100" placeholder="Accessible label (optional)" aria-label="Social link label" class="editor-input" @input="setItem(['social_links'], index, 'label', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>

    </div>

    <div v-else-if="section === 'header'" class="space-y-4">
      <AdminEditorToggle :checked="modelValue.header_cta.enabled" label="Show header button" @change="setPath(['header_cta', 'enabled'], $event)" />
      <AdminEditorField label="Button label"><input :value="modelValue.header_cta.label" maxlength="30" class="editor-input" @input="setPath(['header_cta', 'label'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Button link"><input :value="modelValue.header_cta.link" maxlength="500" class="editor-input" @input="setPath(['header_cta', 'link'], inputValue($event))" /></AdminEditorField>
    </div>

    <div v-else-if="section === 'footer-banner'" class="space-y-4">
      <AdminEditorToggle :checked="modelValue.footer_banner.enabled" label="Show announcement banner" @change="setPath(['footer_banner', 'enabled'], $event)" />
      <AdminEditorField label="Heading"><input :value="modelValue.footer_banner.heading" maxlength="150" class="editor-input" @input="setPath(['footer_banner', 'heading'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Supporting text"><textarea :value="modelValue.footer_banner.subtitle" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setPath(['footer_banner', 'subtitle'], inputValue($event))" /></AdminEditorField>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <AdminEditorField label="Button label"><input :value="modelValue.footer_banner.button_label" maxlength="30" class="editor-input" @input="setPath(['footer_banner', 'button_label'], inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="Button link"><input :value="modelValue.footer_banner.button_link" maxlength="500" class="editor-input" @input="setPath(['footer_banner', 'button_link'], inputValue($event))" /></AdminEditorField>
      </div>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <AdminEditorField label="Background"><input :value="modelValue.footer_banner.background_color" type="color" class="editor-color" @input="setPath(['footer_banner', 'background_color'], inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="End colour"><input :value="modelValue.footer_banner.background_color_to || modelValue.footer_banner.background_color" type="color" class="editor-color" @input="setPath(['footer_banner', 'background_color_to'], inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="Text"><input :value="modelValue.footer_banner.text_color" type="color" class="editor-color" @input="setPath(['footer_banner', 'text_color'], inputValue($event))" /></AdminEditorField>
      </div>
    </div>

    <div v-else-if="section === 'footer'" class="space-y-4">
      <AdminEditorField label="Tagline"><textarea :value="modelValue.footer.tagline" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setPath(['footer', 'tagline'], inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Copyright"><input :value="modelValue.footer.copyright_text" maxlength="255" class="editor-input" @input="setPath(['footer', 'copyright_text'], inputValue($event))" /></AdminEditorField>
      <p class="text-xs leading-5 text-admin-muted">Use <code>{year}</code> and <code>{site_name}</code> as automatic placeholders.</p>
      <div class="space-y-2">
        <AdminEditorToggle :checked="modelValue.footer.show_tagline" label="Show tagline" @change="setPath(['footer', 'show_tagline'], $event)" />
        <AdminEditorToggle :checked="modelValue.footer.show_quick_links" label="Show quick links" @change="setPath(['footer', 'show_quick_links'], $event)" />
        <AdminEditorToggle :checked="modelValue.footer.show_contact_info" label="Show contact details" @change="setPath(['footer', 'show_contact_info'], $event)" />
        <AdminEditorToggle :checked="modelValue.footer.show_social_links" label="Show social links" @change="setPath(['footer', 'show_social_links'], $event)" />
      </div>
    </div>

    <div v-else-if="section === 'about-content'" class="space-y-4">
      <div class="space-y-2.5">
        <div>
          <p class="text-xs font-semibold text-admin-text">About cover image</p>
          <p class="mt-1 text-xs leading-5 text-admin-muted">The primary visual shown at the top of the About page.</p>
        </div>
        <AdminMediaUploader :url="modelValue.about_image_url || ''" :uploading="assetUploading.about" label="About cover image" hint="JPG, PNG or WebP · max 10 MB" input-id="editorAboutImageInput" overlay compact preview-class="h-36 w-full object-cover" @select="uploadAsset($event, 'about')" @remove="removeAsset('about')" />
      </div>
      <AdminEditorField label="Our story"><textarea :value="modelValue.about_content" maxlength="10000" rows="7" class="editor-input min-h-40 resize-y" @input="setPath(['about_content'], inputValue($event))" /></AdminEditorField>
      <AdminEditorRepeater title="Highlights" add-label="Add highlight" :can-add="modelValue.about_highlights.items.length < 12" @add="addItem(['about_highlights', 'items'], { icon: 'heroicons:check-circle', title: '', description: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.about_highlights.items" :key="index" :label="`Highlight ${index + 1}`" @remove="removeItem(['about_highlights', 'items'], index)">
          <input :value="item.title" maxlength="100" placeholder="Title" aria-label="Highlight title" class="editor-input" @input="setItem(['about_highlights', 'items'], index, 'title', inputValue($event))" />
          <textarea :value="item.description" maxlength="255" rows="2" placeholder="Description" aria-label="Highlight description" class="editor-input min-h-20 resize-y" @input="setItem(['about_highlights', 'items'], index, 'description', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorSettingsLink label="About image alt text and SEO remain in Site Settings." to="/admin/settings?tab=pages&sub=about" />
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
      <AdminMediaUploader :url="modelValue.story_image_a_url || ''" :uploading="assetUploading.story_image_a" label="Story section 1 image" hint="JPG, PNG or WebP · max 10 MB" input-id="editorStoryImageAInput" overlay compact preview-class="h-36 w-full object-cover" @select="uploadAsset($event, 'story_image_a')" @remove="removeAsset('story_image_a')" />
      <AdminEditorStorySection label="Story section 2" :section="modelValue.story_page.section_b" @update="setPath(['story_page', 'section_b'], $event)" />
      <AdminMediaUploader :url="modelValue.story_image_b_url || ''" :uploading="assetUploading.story_image_b" label="Story section 2 image" hint="JPG, PNG or WebP · max 10 MB" input-id="editorStoryImageBInput" overlay compact preview-class="h-36 w-full object-cover" @select="uploadAsset($event, 'story_image_b')" @remove="removeAsset('story_image_b')" />
      <p class="rounded-xl bg-admin-info-soft px-3 py-2.5 text-xs leading-5 text-admin-muted">Story images stay private in this draft until you save and publish.</p>
    </div>

    <div v-else-if="section === 'contact-content'" class="space-y-4">
      <div class="space-y-2.5">
        <p class="text-xs font-semibold text-admin-text">Contact cover image</p>
        <AdminMediaUploader :url="modelValue.contact_image_url || ''" :uploading="assetUploading.contact" label="Contact cover image" hint="JPG, PNG or WebP · max 10 MB" input-id="editorContactImageInput" overlay compact preview-class="h-36 w-full object-cover" @select="uploadAsset($event, 'contact')" @remove="removeAsset('contact')" />
      </div>
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
      <AdminEditorSettingsLink label="Contact image alt text and SEO remain in Site Settings." to="/admin/settings?tab=pages&sub=contact" />
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
      <div class="space-y-2.5">
        <p class="text-xs font-semibold text-admin-text">Blog cover image</p>
        <AdminMediaUploader :url="modelValue.blog_image_url || ''" :uploading="assetUploading.blog" label="Blog cover image" hint="JPG, PNG or WebP · max 10 MB" input-id="editorBlogImageInput" overlay compact preview-class="h-36 w-full object-cover" @select="uploadAsset($event, 'blog')" @remove="removeAsset('blog')" />
      </div>
      <AdminEditorPageHeader label="Blog heading" :header="modelValue.blog_page.header" @update="setPath(['blog_page', 'header'], $event)" />
      <AdminEditorToggle :checked="Boolean(modelValue.blog_page.cta)" label="Show closing call-to-action" @change="toggleObject(['blog_page', 'cta'], $event, emptyPageCta())" />
      <AdminEditorPageCta v-if="modelValue.blog_page.cta" label="Closing call-to-action" :cta="modelValue.blog_page.cta" @update="setPath(['blog_page', 'cta'], $event)" />
      <AdminEditorSettingsLink label="Posts and Blog SEO remain in their existing screens." to="/admin/posts" />
    </div>

    <div v-else-if="section === 'services-content'" class="space-y-4">
      <div class="space-y-2.5">
        <p class="text-xs font-semibold text-admin-text">Services cover image</p>
        <AdminMediaUploader :url="modelValue.services_image_url || ''" :uploading="assetUploading.services" label="Services cover image" hint="JPG, PNG or WebP · max 10 MB" input-id="editorServicesImageInput" overlay compact preview-class="h-36 w-full object-cover" @select="uploadAsset($event, 'services')" @remove="removeAsset('services')" />
      </div>
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
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input :value="item.value" maxlength="50" placeholder="Value" aria-label="Statistic value" class="editor-input" @input="setItem(['services_page', 'stats', 'items'], index, 'value', inputValue($event))" />
            <input :value="item.label" maxlength="150" placeholder="Label" aria-label="Statistic label" class="editor-input" @input="setItem(['services_page', 'stats', 'items'], index, 'label', inputValue($event))" />
          </div>
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
      <AdminEditorToggle :checked="Boolean(modelValue.services_page.cta)" label="Show closing call-to-action" @change="toggleObject(['services_page', 'cta'], $event, emptyPageCta())" />
      <AdminEditorPageCta v-if="modelValue.services_page.cta" label="Closing call-to-action" :cta="modelValue.services_page.cta" @update="setPath(['services_page', 'cta'], $event)" />
      <AdminEditorSettingsLink label="Service records and Services SEO remain in their existing screens." to="/admin/services" />
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
import type { WebsiteEditorAssetSlot, WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'

const props = defineProps<{
  modelValue: WebsiteEditorDraftPayload
  section: string
  errors?: Record<string, string[]>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()
const { uploadDraftAsset } = useWebsiteEditorDraft()
const assetUploading = reactive<Partial<Record<WebsiteEditorAssetSlot, boolean>>>({})
const assetError = ref('')

const details: Record<string, { title: string; description: string; prefixes: string[] }> = {
  'brand-assets': {
    title: 'Brand assets',
    description: 'Preview and publish the shared logos and icons used throughout the storefront.',
    prefixes: ['payload.logo_', 'payload.favicon_', 'payload.cart_icon_', 'payload.footer_logo_'],
  },
  'store-details': {
    title: 'Store details',
    description: 'Set the public store identity, contact channels, and social profiles used across the storefront.',
    prefixes: ['payload.site_name', 'payload.contact_email', 'payload.contact_phone', 'payload.contact_entries', 'payload.social_links'],
  },
  header: { title: 'Header call-to-action', description: 'Set the optional action shown in the storefront header.', prefixes: ['payload.header_cta'] },
  'footer-banner': { title: 'Announcement banner', description: 'Create a shared message immediately above the footer.', prefixes: ['payload.footer_banner'] },
  footer: { title: 'Footer', description: 'Control the shared footer message and visible information groups.', prefixes: ['payload.footer'] },
  'about-content': { title: 'About page', description: 'Tell the store story and add concise customer-facing highlights.', prefixes: ['payload.about_'] },
  'story-content': { title: 'Story page', description: 'Build a longer editorial story from two controlled sections.', prefixes: ['payload.story_page', 'payload.story_image_'] },
  'contact-content': { title: 'Contact page', description: 'Shape the support information, promises and frequently asked questions.', prefixes: ['payload.contact_page', 'payload.contact_image'] },
  'shop-content': { title: 'Shop page', description: 'Set the catalogue introduction and promotional close.', prefixes: ['payload.shop_'] },
  'blog-content': { title: 'Blog page', description: 'Set the journal introduction and optional closing action.', prefixes: ['payload.blog_page', 'payload.blog_image'] },
  'services-content': { title: 'Services page', description: 'Present the service catalogue with controlled summary, statistics and actions.', prefixes: ['payload.services_page', 'payload.services_image'] },
  'welcome-popup': { title: 'Welcome popup', description: 'Edit the offer message while the preview keeps signup actions inactive.', prefixes: ['payload.welcome_popup_'] },
}

const detail = computed(() => details[props.section] ?? { title: 'Page content', description: '', prefixes: [] })
const sectionErrors = computed(() => Object.entries(props.errors ?? {})
  .filter(([field]) => detail.value.prefixes.some(prefix => field.startsWith(prefix)))
  .flatMap(([, messages]) => messages))

const clone = () => JSON.parse(JSON.stringify(props.modelValue)) as WebsiteEditorDraftPayload
const inputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value
const numberValue = (event: Event) => Number((event.target as HTMLInputElement).value)

const assetFields: Record<WebsiteEditorAssetSlot, { id: string; url: string }> = {
  logo: { id: 'logo_media_id', url: 'logo_url' },
  favicon: { id: 'favicon_media_id', url: 'favicon_url' },
  cart_icon: { id: 'cart_icon_media_id', url: 'cart_icon_url' },
  footer_logo: { id: 'footer_logo_media_id', url: 'footer_logo_url' },
  hero: { id: 'hero_media_id', url: 'hero_image_url' },
  homepage_statement: { id: 'homepage_statement_media_id', url: 'homepage_statement_image_url' },
  about: { id: 'about_media_id', url: 'about_image_url' },
  story_image_a: { id: 'story_image_a_media_id', url: 'story_image_a_url' },
  story_image_b: { id: 'story_image_b_media_id', url: 'story_image_b_url' },
  contact: { id: 'contact_media_id', url: 'contact_image_url' },
  blog: { id: 'blog_media_id', url: 'blog_image_url' },
  services: { id: 'services_media_id', url: 'services_image_url' },
}

function syncStoryImage(next: Record<string, any>, slot: WebsiteEditorAssetSlot, url: string | null) {
  if (slot === 'story_image_a') next.story_page.section_a.image_url = url
  if (slot === 'story_image_b') next.story_page.section_b.image_url = url
}

async function uploadAsset(file: File, slot: WebsiteEditorAssetSlot) {
  if (assetUploading[slot]) return
  assetError.value = ''
  assetUploading[slot] = true
  try {
    const uploaded = await uploadDraftAsset(slot, file)
    const fields = assetFields[slot]!
    const next = clone() as unknown as Record<string, unknown>
    next[fields.id] = uploaded.id
    next[fields.url] = uploaded.url
    syncStoryImage(next, slot, uploaded.url)
    emit('update:modelValue', next as unknown as WebsiteEditorDraftPayload)
  } catch (error: any) {
    assetError.value = error?.data?.message || error?.message || 'The asset could not be uploaded. Try again.'
  } finally {
    assetUploading[slot] = false
  }
}

function removeAsset(slot: WebsiteEditorAssetSlot) {
  assetError.value = ''
  const fields = assetFields[slot]!
  const next = clone() as unknown as Record<string, unknown>
  next[fields.id] = null
  next[fields.url] = null
  syncStoryImage(next, slot, null)
  emit('update:modelValue', next as unknown as WebsiteEditorDraftPayload)
}

const SOCIAL_PLATFORMS = [
  ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['x', 'X (Twitter)'], ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'], ['linkedin', 'LinkedIn'], ['pinterest', 'Pinterest'], ['snapchat', 'Snapchat'],
  ['threads', 'Threads'], ['whatsapp', 'WhatsApp'], ['telegram', 'Telegram'], ['discord', 'Discord'],
  ['github', 'GitHub'], ['website', 'Website / Other'],
].map(([value, label]) => ({ value, label }))

function socialPlatformLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find(option => option.value === platform)?.label ?? platform
}

function errorFor(field: string) {
  return props.errors?.[`payload.${field}`]?.[0]
}

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
