<template>
  <article class="custom-page min-w-0 bg-white text-gray-900">
    <template v-for="block in visibleBlocks" :key="block.id">
      <section
        v-if="block.type === 'hero' && (block.variant ?? 'centered') === 'centered'"
        class="hero-section hero-centered website-page-section relative isolate flex items-center overflow-hidden bg-secondary-950 px-4 py-20 text-center text-white sm:px-6 sm:py-24"
        :style="heroStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="hero"
      >
        <img v-if="mediaFor(block)" :src="mediaFor(block)?.url" :alt="mediaFor(block)?.alt || ''" class="absolute inset-0 -z-20 h-full w-full object-cover" />
        <span v-if="mediaFor(block)" class="absolute inset-0 -z-10" :style="heroOverlayStyle(block)" aria-hidden="true" />
        <div class="hero-copy mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center justify-center">
          <p v-if="block.content.eyebrow" class="hero-short-label mb-4 text-sm font-semibold">{{ block.content.eyebrow }}</p>
          <h1 v-if="block.content.heading" class="hero-heading text-balance">{{ block.content.heading }}</h1>
          <p v-if="block.content.body" class="hero-body mt-5 max-w-2xl whitespace-pre-line text-base leading-7">{{ block.content.body }}</p>
          <div v-if="actions(block).length" class="hero-actions mt-7 flex max-w-full flex-wrap justify-center gap-3">
            <NuxtLink v-for="(action, index) in actions(block)" :key="`${block.id}-${index}`" :to="action.link!" class="hero-button" :class="index === 0 ? 'hero-button--primary' : 'hero-button--secondary'"><span class="min-w-0">{{ action.label }}</span><Icon v-if="index === 0" name="heroicons:arrow-up-right" class="h-4 w-4 shrink-0" aria-hidden="true" /></NuxtLink>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'hero'" class="hero-section website-page-section bg-secondary-950 px-4 py-12 text-white sm:px-6 sm:py-16" :style="heroStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="hero">
        <div class="hero-layout mx-auto grid min-w-0 max-w-7xl" :class="block.variant === 'split' ? 'hero-split-frame lg:grid-cols-2' : 'items-center gap-8 lg:grid-cols-2 lg:gap-14'">
          <div class="hero-copy flex min-w-0 flex-col justify-center" :class="[heroCopyClass(block), !mediaFor(block) && !preview ? 'lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-3xl' : '']">
            <p v-if="block.content.eyebrow" class="hero-short-label mb-4 text-sm font-semibold">{{ block.content.eyebrow }}</p>
            <h1 v-if="block.content.heading" class="hero-heading text-balance">{{ block.content.heading }}</h1>
            <p v-if="block.content.body" class="hero-body mt-5 max-w-xl whitespace-pre-line text-base leading-7">{{ block.content.body }}</p>
            <div v-if="actions(block).length" class="hero-actions mt-7 flex max-w-full flex-wrap gap-3">
              <NuxtLink v-for="(action, index) in actions(block)" :key="`${block.id}-${index}`" :to="action.link!" class="hero-button" :class="index === 0 ? 'hero-button--primary' : 'hero-button--secondary'"><span class="min-w-0">{{ action.label }}</span><Icon v-if="index === 0" name="heroicons:arrow-up-right" class="h-4 w-4 shrink-0" aria-hidden="true" /></NuxtLink>
            </div>
          </div>
          <div v-if="mediaFor(block) || preview" class="hero-media relative aspect-[4/3] w-full min-w-0 overflow-hidden" :class="block.variant === 'split' ? 'lg:aspect-auto lg:min-h-[30rem]' : 'rounded-2xl'">
            <img v-if="mediaFor(block)" :src="mediaFor(block)?.url" :alt="mediaFor(block)?.alt || ''" class="absolute inset-0 h-full w-full object-contain" />
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm"><span class="hero-placeholder-icon flex h-12 w-12 items-center justify-center rounded-xl"><Icon name="heroicons:photo" class="h-6 w-6" aria-hidden="true" /></span>Add your image</div>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'rich-text'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="rich-text-reading mx-auto min-w-0 text-gray-700" :class="richTextClass(block)" :data-reading-layout="block.variant || block.settings.width || 'prose'" :data-reading-columns="richTextHasColumns(block)">
          <p v-for="(paragraph, index) in richTextParagraphs(block)" :key="index" class="rich-text-paragraph whitespace-pre-line">{{ paragraph }}</p>
        </div>
      </section>

      <section v-else-if="block.type === 'image-text'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="image-text">
        <div class="image-text-layout mx-auto grid min-w-0 items-center gap-8 lg:gap-12" :class="block.variant === 'stacked' ? 'max-w-4xl' : block.variant === 'image-right' ? 'max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'max-w-6xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]'">
          <div v-if="mediaFor(block) || preview" class="image-text-media relative min-w-0 overflow-hidden rounded-2xl" :class="[block.variant === 'image-right' ? 'lg:order-2' : '', block.variant === 'stacked' ? 'aspect-[16/9]' : 'aspect-[4/3]']">
            <img v-if="mediaFor(block)" :src="mediaFor(block)?.url" :alt="block.settings.image_alt || mediaFor(block)?.alt || ''" class="absolute inset-0 h-full w-full object-contain" loading="lazy" />
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-gray-500"><span class="image-text-placeholder-icon flex h-12 w-12 items-center justify-center rounded-xl"><Icon name="heroicons:photo" class="h-6 w-6" aria-hidden="true" /></span>Add your image</div>
          </div>
          <div class="image-text-copy min-w-0" :class="!mediaFor(block) && !preview && block.variant !== 'stacked' ? 'lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-3xl' : ''">
            <div class="min-w-0">
              <p v-if="block.content.eyebrow" class="mb-3 text-sm font-semibold text-primary-700">{{ block.content.eyebrow }}</p>
              <h2 v-if="block.content.heading" class="image-text-heading text-balance font-semibold">{{ block.content.heading }}</h2>
            </div>
            <div class="image-text-body min-w-0">
              <p v-if="block.content.body" class="whitespace-pre-line text-sm leading-7 text-gray-600">{{ block.content.body }}</p>
              <NuxtLink v-if="validAction(block.content.action)" :to="block.content.action.link" class="image-text-action mt-6 inline-flex min-h-11 max-w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-center text-sm font-semibold"><span class="min-w-0">{{ block.content.action.label }}</span><Icon name="heroicons:arrow-up-right" class="h-4 w-4 shrink-0" aria-hidden="true" /></NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'features'" class="website-page-section bg-white px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.subtitle" class="mt-4 max-w-2xl text-gray-600">{{ block.content.subtitle }}</p>
          <div class="feature-items mt-10 grid" :class="featureGridClass(block)">
            <component :is="item.link ? NuxtLink : 'div'" v-for="(item, index) in block.content.items || []" :key="index" :to="item.link || undefined" class="feature-item min-w-0" :class="[featureItemClass(block), item.link ? 'feature-link group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600' : '']">
              <div class="feature-content min-w-0">
                <div class="feature-heading min-w-0">
                  <span v-if="item.icon" class="feature-icon" aria-hidden="true"><Icon :name="item.icon" class="h-5 w-5" /></span>
                  <h3 v-if="item.title" class="feature-title min-w-0 text-lg font-semibold" :class="item.link ? 'group-hover:underline group-hover:underline-offset-4' : ''">{{ item.title }}</h3>
                </div>
                <p v-if="item.description" class="feature-description mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{{ item.description }}</p>
              </div>
              <span v-if="item.link" class="feature-arrow" aria-hidden="true"><Icon name="heroicons:arrow-up-right" class="h-4 w-4" /></span>
            </component>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'stats'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :class="block.variant === 'band' ? 'bg-secondary-950 text-white' : 'bg-white'" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl" :class="block.variant === 'band' ? 'stats-band-layout' : ''">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <dl class="stats-items grid" :class="[columnClass(block, 6, block.content.items?.length), block.variant === 'band' ? 'stats-band-items' : 'stats-grid-items mt-8 gap-4']">
            <div v-for="(item, index) in block.content.items || []" :key="index" class="stats-item min-w-0" :class="block.variant === 'band' ? 'stats-band-item' : 'stats-grid-item rounded-xl'">
              <dt v-if="item.label" class="stats-label text-sm leading-6">{{ item.label }}</dt>
              <dd v-if="hasStatisticValue(item.value) || preview" class="stats-value tabular-nums" :class="{ 'stats-value--placeholder': !hasStatisticValue(item.value) }" :aria-label="!hasStatisticValue(item.value) ? 'Add your value' : undefined">{{ hasStatisticValue(item.value) ? item.value : '—' }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section v-else-if="block.type === 'gallery'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="mb-10 text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.variant === 'carousel' && galleryItems(block).length > 1" class="mb-3 flex items-center gap-2 text-xs text-gray-600"><Icon name="heroicons:arrows-right-left" class="h-4 w-4" aria-hidden="true" />Scroll to view images</p>
          <div class="gallery-track min-w-0" :class="galleryClass(block)" :tabindex="block.variant === 'carousel' ? 0 : undefined" :role="block.variant === 'carousel' ? 'region' : undefined" :aria-label="block.variant === 'carousel' ? (block.content.heading || 'Image gallery') : undefined">
            <figure v-for="(item, index) in galleryItems(block)" :key="index" class="gallery-item min-w-0" :class="block.variant === 'carousel' ? 'w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[42%]' : block.variant === 'masonry' ? 'mb-5 break-inside-avoid' : ''">
              <img v-if="galleryMedia(item.media_id)" :src="galleryMedia(item.media_id)?.url" :alt="item.alt || galleryMedia(item.media_id)?.alt || ''" class="w-full rounded-xl object-cover" :class="block.variant === 'masonry' ? 'h-auto' : 'aspect-[4/3]'" loading="lazy" />
              <div v-if="!galleryMedia(item.media_id) && preview" class="gallery-placeholder flex flex-col items-center justify-center gap-3 rounded-xl bg-gray-100 text-sm font-medium text-gray-500" :style="{ aspectRatio: block.variant === 'masonry' ? ['4 / 3', '3 / 4', '1 / 1'][index % 3] : '4 / 3' }"><Icon name="heroicons:photo" class="h-7 w-7 opacity-60" aria-hidden="true" />Add an image</div>
              <figcaption v-if="item.caption" class="mt-2 text-sm text-gray-600">{{ item.caption }}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'faq'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="faq">
        <div class="faq-layout mx-auto" :class="block.variant === 'list' ? 'max-w-5xl' : 'faq-split max-w-6xl'">
          <div class="faq-intro min-w-0">
            <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em] sm:text-4xl">{{ block.content.heading }}</h2>
            <p v-if="block.content.subtitle" class="mt-4 max-w-xl whitespace-pre-line text-sm leading-7 text-gray-600">{{ block.content.subtitle }}</p>
          </div>
          <dl v-if="block.variant === 'list'" class="faq-list mt-8">
            <div v-for="(item, index) in block.content.items || []" :key="index" class="faq-list-row">
              <dt class="min-w-0 text-base font-semibold leading-7">{{ item.question }}</dt>
              <dd class="faq-answer min-w-0 whitespace-pre-line text-sm leading-7 text-gray-600">{{ item.answer }}</dd>
            </div>
          </dl>
          <div v-else class="faq-accordion min-w-0 space-y-3">
            <details v-for="(item, index) in block.content.items || []" :key="index" class="faq-item group" :open="preview && index === 0">
              <summary class="faq-question flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold leading-6">
                <span class="min-w-0">{{ item.question }}</span>
                <span class="faq-toggle flex h-7 w-7 shrink-0 items-center justify-center rounded-full" aria-hidden="true"><Icon name="heroicons:plus" class="h-4 w-4 transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none" /></span>
              </summary>
              <div class="faq-answer px-4 pb-4 sm:px-5 sm:pb-5"><p class="max-w-2xl whitespace-pre-line text-sm leading-7 text-gray-600">{{ item.answer }}</p></div>
            </details>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'cta'" class="website-page-section px-4 py-12 sm:px-6 sm:py-16" :style="[block.variant === 'band' ? ctaStyle(block) : {}, websitePageSectionStyle(block)]" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="cta-surface mx-auto" :class="ctaClass(block)" :style="block.variant === 'band' ? {} : ctaStyle(block)">
          <div class="min-w-0" :class="block.variant === 'split' ? 'max-w-2xl flex-1' : ''">
            <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em] sm:text-4xl">{{ block.content.heading }}</h2>
            <p v-if="block.content.body" class="mt-4 max-w-2xl whitespace-pre-line leading-7 opacity-80" :class="block.variant === 'split' ? '' : 'mx-auto'">{{ block.content.body }}</p>
          </div>
          <NuxtLink v-if="validAction(block.content.action)" :to="block.content.action.link" class="cta-action inline-flex min-h-11 max-w-full items-center justify-center rounded-xl px-5 py-2.5 text-center text-sm font-semibold" :class="block.variant === 'split' ? 'mt-7 lg:mt-0' : 'mt-7'">{{ block.content.action.label }}</NuxtLink>
        </div>
      </section>

      <section v-else-if="block.type === 'contact-form'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="contact-form">
        <div class="contact-layout mx-auto" :class="block.variant === 'split' ? 'contact-split grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16' : 'contact-compact max-w-2xl'">
          <div class="contact-intro min-w-0">
            <span class="contact-mark mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl" aria-hidden="true"><Icon name="heroicons:chat-bubble-left-right" class="h-5 w-5" /></span>
            <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em] sm:text-4xl">{{ block.content.heading }}</h2>
            <p v-if="block.content.body" class="mt-4 max-w-xl whitespace-pre-line text-sm leading-7 text-gray-600">{{ block.content.body }}</p>
          </div>
          <form v-if="!contactSuccess[block.id]" class="contact-panel grid min-w-0 gap-5 sm:grid-cols-2" :class="block.variant !== 'split' ? 'mt-8' : ''" aria-label="Contact form" :aria-busy="contactSubmitting[block.id] || false" :aria-describedby="contactErrors[block.id] ? `contact-error-${block.id}` : undefined" @submit.prevent="submitContact(block)">
            <label v-if="fields(block).includes('name')" class="contact-label">Name<input v-model="formFor(block).name" required autocomplete="name" class="contact-field" placeholder="Your name" /></label>
            <label v-if="fields(block).includes('email')" class="contact-label">Email<input v-model="formFor(block).email" required type="email" autocomplete="email" class="contact-field" placeholder="you@example.com" /></label>
            <label v-if="fields(block).includes('phone')" class="contact-label sm:col-span-2"><span class="flex items-center justify-between gap-2">Phone<span class="text-xs font-normal opacity-70">Optional</span></span><input v-model="formFor(block).phone" type="tel" autocomplete="tel" class="contact-field" placeholder="Your phone number" /></label>
            <label v-if="fields(block).includes('message')" class="contact-label sm:col-span-2">Message<textarea v-model="formFor(block).message" required rows="5" class="contact-field contact-message" placeholder="How can we help?" /></label>
            <p v-if="contactErrors[block.id]" :id="`contact-error-${block.id}`" class="contact-error text-sm sm:col-span-2" role="alert">{{ contactErrors[block.id] }}</p>
            <div class="contact-footer sm:col-span-2">
              <span class="text-xs leading-5 opacity-75">Name, email and message are required.</span>
              <button type="submit" :disabled="contactSubmitting[block.id]" class="contact-submit"><span>{{ contactSubmitting[block.id] ? 'Sending…' : 'Send message' }}</span><Icon v-if="!contactSubmitting[block.id]" name="heroicons:arrow-right" class="h-4 w-4 shrink-0" aria-hidden="true" /></button>
            </div>
          </form>
          <div v-else class="contact-panel contact-success" :class="block.variant !== 'split' ? 'mt-8' : ''" role="status">
            <Icon name="heroicons:check-circle" class="mb-4 h-8 w-8 text-green-700" aria-hidden="true" />
            <h3 class="text-lg font-semibold">Message sent</h3>
            <p class="mt-2 text-sm leading-6">{{ block.content.success_message || 'Your message has been sent.' }}</p>
          </div>
        </div>
      </section>

      <section v-else-if="block.type === 'collection-list'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="collection-list">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.body" class="mt-4 max-w-2xl leading-7 text-gray-600">{{ block.content.body }}</p>
          <div v-if="collections[block.id]?.length" class="collection-items mt-10 grid gap-x-6 gap-y-8" :class="columnClass(block, 3, collections[block.id]?.length)">
            <NuxtLink v-for="item in collections[block.id]" :key="item.id" :to="item.url" class="collection-link group min-w-0" :class="block.variant === 'cards' ? 'collection-card' : 'collection-grid-item'" :title="item.title">
              <div class="collection-image overflow-hidden" :class="block.variant === 'cards' ? 'absolute inset-0 bg-secondary-950' : 'relative aspect-[4/3] rounded-2xl bg-gray-100'">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" />
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs" :class="block.variant === 'cards' ? 'text-white/60' : 'text-gray-500'"><Icon name="heroicons:photo" class="h-8 w-8 opacity-60" aria-hidden="true" />{{ preview ? 'Collection image' : 'No image' }}</div>
                <div v-if="block.variant === 'cards'" class="collection-scrim absolute inset-0" aria-hidden="true" />
              </div>
              <div class="collection-details flex min-w-0 items-start justify-between gap-4" :class="block.variant === 'cards' ? 'absolute inset-x-0 bottom-0 p-5 sm:p-6' : 'pt-4'">
                <div class="min-w-0">
                  <h3 class="collection-title text-lg font-semibold leading-snug tracking-tight" :class="block.variant === 'cards' ? 'line-clamp-2' : 'group-hover:underline group-hover:underline-offset-4'">{{ item.title }}</h3>
                  <p v-if="item.summary" class="collection-summary mt-1.5 line-clamp-2 text-sm leading-6" :class="block.variant === 'cards' ? '' : 'text-gray-600'">{{ item.summary }}</p>
                </div>
                <span class="collection-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full border" :class="block.variant === 'cards' ? 'border-white/40 text-white' : 'border-gray-200 text-gray-800'" aria-hidden="true"><Icon name="heroicons:arrow-up-right" class="h-4 w-4" /></span>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="mt-8 text-sm text-gray-500">No published collections are available for this section yet.</p>
        </div>
      </section>

      <section v-else-if="block.type === 'service-list'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="service-list">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.body" class="mt-4 max-w-2xl leading-7 text-gray-600">{{ block.content.body }}</p>
          <div v-if="collections[block.id]?.length" class="service-items mt-10 grid" :class="block.variant === 'list' ? 'gap-0' : block.variant === 'feature' ? 'gap-8' : `gap-6 ${columnClass(block, 3, collections[block.id]?.length)}`">
            <NuxtLink v-for="item in collections[block.id]" :key="item.id" :to="item.url" class="service-link group min-w-0" :class="block.variant === 'list' ? 'service-row' : block.variant === 'feature' ? 'service-feature' : 'service-card'">
              <div class="service-image relative min-w-0 overflow-hidden bg-gray-100" :class="block.variant === 'list' ? 'aspect-square rounded-lg' : block.variant === 'feature' ? 'aspect-[4/3] rounded-xl' : 'aspect-[3/2] rounded-lg'">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" />
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-gray-500"><Icon name="heroicons:wrench-screwdriver" class="h-7 w-7 opacity-60" aria-hidden="true" /><span v-if="block.variant !== 'list'">{{ preview ? 'Service image' : 'No image' }}</span><span v-else class="sr-only">No image</span></div>
              </div>
              <div class="service-details min-w-0">
                <h3 class="service-title text-lg font-semibold leading-snug tracking-tight group-hover:underline group-hover:underline-offset-4">{{ item.title }}</h3>
                <p v-if="item.summary" class="service-summary mt-2 text-sm leading-6 text-gray-600" :class="block.variant === 'feature' ? 'line-clamp-4' : 'line-clamp-2'">{{ item.summary }}</p>
                <span v-if="item.price != null" class="service-price mt-3 block text-sm font-semibold tabular-nums">{{ formatPrice(item.price) }}</span>
              </div>
              <span class="service-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full" aria-hidden="true"><Icon name="heroicons:arrow-up-right" class="h-4 w-4" /></span>
            </NuxtLink>
          </div>
          <p v-else class="mt-8 text-sm text-gray-500">No published services are available for this section yet.</p>
        </div>
      </section>

      <section v-else-if="block.type === 'blog-post-list'" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" data-section="blog-post-list">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.body" class="mt-4 max-w-2xl leading-7 text-gray-600">{{ block.content.body }}</p>
          <div v-if="collections[block.id]?.length" class="blog-items mt-10 grid" :class="block.variant === 'list' ? 'blog-list' : block.variant === 'feature' ? 'blog-feature' : `blog-grid gap-x-7 gap-y-10 ${columnClass(block, 3, collections[block.id]?.length)}`" :style="{ '--blog-followups': Math.max(1, (collections[block.id]?.length || 0) - 1) }" :data-single="collections[block.id]?.length === 1">
            <NuxtLink v-for="item in collections[block.id]" :key="item.id" :to="item.url" class="blog-link group min-w-0">
              <div class="blog-image relative min-w-0 overflow-hidden rounded-xl bg-gray-100">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" />
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-gray-500"><Icon name="heroicons:newspaper" class="h-7 w-7 opacity-60" aria-hidden="true" /><span>{{ preview ? 'Article image' : 'No image' }}</span></div>
              </div>
              <div class="blog-details min-w-0">
                <h3 class="blog-title text-lg font-semibold leading-snug tracking-tight group-hover:underline group-hover:underline-offset-4">{{ item.title }}</h3>
                <p v-if="item.summary" class="blog-summary mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{{ item.summary }}</p>
                <span class="blog-read mt-4 inline-flex items-center gap-2 text-xs font-semibold">Read article<Icon name="heroicons:arrow-right" class="blog-arrow h-4 w-4" aria-hidden="true" /></span>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="mt-8 text-sm text-gray-500">No published blog posts are available for this section yet.</p>
        </div>
      </section>

      <section v-else-if="isDynamic(block)" class="website-page-section px-4 py-16 sm:px-6 sm:py-20" :style="websitePageSectionStyle(block)" :data-page-block="block.id" :data-custom-text="Boolean(block.settings.design?.text_color)" :data-custom-width="Boolean(block.settings.design?.width)" :data-custom-alignment="Boolean(block.settings.design?.alignment)" :data-layout="block.variant" :data-section="block.type">
        <div class="mx-auto max-w-6xl">
          <h2 v-if="block.content.heading" class="text-balance text-3xl font-bold tracking-[-0.025em]">{{ block.content.heading }}</h2>
          <p v-if="block.content.body" class="mt-4 max-w-2xl leading-7 text-gray-600">{{ block.content.body }}</p>
          <p v-if="block.type === 'product-list' && block.variant === 'carousel' && (collections[block.id]?.length || 0) > 1" class="mt-8 flex items-center gap-2 text-xs text-gray-600"><Icon name="heroicons:arrows-right-left" class="h-4 w-4" aria-hidden="true" />Scroll to view products</p>
          <div v-if="collections[block.id]?.length" class="connected-items mt-10 min-w-0" :class="dynamicCollectionClass(block)" :tabindex="block.type === 'product-list' && block.variant === 'carousel' ? 0 : undefined" :role="block.type === 'product-list' && block.variant === 'carousel' ? 'region' : undefined" :aria-label="block.type === 'product-list' && block.variant === 'carousel' ? (block.content.heading || 'Products') : undefined">
            <NuxtLink v-for="item in collections[block.id]" :key="item.id" :to="item.url" class="connected-item group block min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600" :class="[dynamicItemClass(block), block.type === 'product-list' ? 'product-link' : '']">
              <div class="connected-image relative min-w-0 overflow-hidden bg-gray-100" :class="[dynamicImageClass(block), block.type === 'product-list' ? 'product-stage' : '']">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="absolute inset-0 h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" :class="block.type === 'product-list' ? 'object-contain p-4' : 'object-cover'" loading="lazy" />
                <div v-else-if="block.type === 'product-list'" class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-gray-500"><Icon name="heroicons:photo" class="h-7 w-7 opacity-60" aria-hidden="true" />{{ preview ? 'Product image' : 'No image' }}</div>
              </div>
              <div class="connected-details min-w-0" :class="block.variant === 'list' || block.variant === 'feature' ? 'flex-1 py-2' : block.type === 'product-list' ? 'mt-4' : 'mt-4 flex items-start justify-between gap-4'">
                <div class="min-w-0"><h3 class="font-semibold text-gray-950 group-hover:underline group-hover:underline-offset-4">{{ item.title }}</h3><p v-if="item.summary" class="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">{{ item.summary }}</p></div>
                <span v-if="item.price != null" class="connected-price mt-2 block text-sm font-semibold tabular-nums" :class="block.type === 'product-list' ? 'text-base' : 'shrink-0'">{{ formatPrice(item.price) }}</span>
                <span v-if="block.type === 'product-list'" class="product-nav" aria-hidden="true"><span v-if="block.variant === 'feature'" class="text-sm font-semibold">View product</span><span class="product-nav-icon"><Icon name="heroicons:arrow-up-right" class="h-4 w-4" /></span></span>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="mt-8 text-sm text-gray-500">{{ block.type === 'product-list' ? 'No published products are available for this section yet.' : 'No published items are available for this section yet.' }}</p>
        </div>
      </section>
    </template>

    <section v-if="!visibleBlocks.length" class="mx-auto flex min-h-[24rem] max-w-2xl items-center justify-center px-4 py-20 text-center">
      <div><h1 class="text-3xl font-bold tracking-[-0.025em]">{{ title }}</h1><p class="mt-3 text-gray-600">This page does not have any visible sections yet.</p></div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { websitePageSectionStyle } from '~/utils/websitePageDesign'
import type { WebsitePageAction, WebsitePageBlock, WebsitePageCollectionItem, WebsitePageDocument, WebsitePageMedia } from '~/types/websitePage'

const props = defineProps<{
  title: string
  document: WebsitePageDocument
  media?: Record<number, WebsitePageMedia>
  collections?: Record<string, WebsitePageCollectionItem[]>
  preview?: boolean
}>()

const NuxtLink = resolveComponent('NuxtLink')
const { $apiFetch } = useNuxtApp()
const { execute: executeRecaptcha } = useRecaptcha()
const { siteConfig } = useSiteConfig()
const visibleBlocks = computed(() => props.document.blocks.filter(block => block.visible))
const media = computed(() => props.media ?? {})
const collections = computed(() => props.collections ?? {})
const contactForms = reactive<Record<string, { name: string, email: string, phone: string, message: string }>>({})
const contactSubmitting = reactive<Record<string, boolean>>({})
const contactSuccess = reactive<Record<string, boolean>>({})
const contactErrors = reactive<Record<string, string>>({})

watchEffect(() => {
  for (const block of visibleBlocks.value.filter(block => block.type === 'contact-form')) {
    contactForms[block.id] ??= { name: '', email: '', phone: '', message: '' }
  }
})

function mediaFor(block: WebsitePageBlock) {
  return media.value[Number(block.settings.media_id)]
}
function galleryMedia(mediaId: unknown) {
  return media.value[Number(mediaId)]
}
function validAction(action: WebsitePageAction | null | undefined) {
  return Boolean(action?.label && action?.link)
}
function actions(block: WebsitePageBlock) {
  return [block.content.primary_action, block.content.secondary_action].filter(validAction) as WebsitePageAction[]
}
function fields(block: WebsitePageBlock): string[] {
  return [...new Set(['name', 'email', 'message', ...(Array.isArray(block.settings.fields) ? block.settings.fields : [])])]
}
function formFor(block: WebsitePageBlock) {
  return contactForms[block.id] ??= { name: '', email: '', phone: '', message: '' }
}
function isDynamic(block: WebsitePageBlock) {
  return ['product-list', 'collection-list', 'service-list', 'blog-post-list'].includes(block.type)
}
function heroCopyClass(block: WebsitePageBlock) {
  if (block.variant === 'split') return 'hero-split-copy px-6 py-10 sm:px-10 lg:py-14'
  return block.variant === 'media-left' ? 'lg:order-2' : ''
}
function heroStyle(block: WebsitePageBlock) {
  const style = websitePageSectionStyle(block)
  return { ...style, '--hero-background': style['background-color'] || 'var(--color-secondary-950)' }
}
function heroOverlayStyle(block: WebsitePageBlock) {
  const color = String(block.settings.overlay_color || 'var(--color-secondary-950)')
  const opacity = Math.min(100, Math.max(0, Number(block.settings.overlay_opacity ?? 55)))
  return { backgroundColor: `color-mix(in srgb, ${color} ${opacity}%, transparent)` }
}
function richTextParagraphs(block: WebsitePageBlock): string[] {
  return String(block.content.body ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n(?:[ \t]*\n)*/).filter(paragraph => paragraph.trim().length > 0)
}
function richTextHasColumns(block: WebsitePageBlock) {
  return (block.variant || block.settings.width) === 'wide'
    && block.settings.alignment !== 'center'
    && block.settings.design?.alignment !== 'center'
    && richTextParagraphs(block).length > 1
}
function richTextClass(block: WebsitePageBlock) {
  const variant = block.variant || block.settings.width || 'prose'
  const width = variant === 'wide' ? 'max-w-6xl' : variant === 'narrow' ? 'max-w-2xl' : 'max-w-4xl'
  return `${width} ${block.settings.alignment === 'center' ? 'text-center' : ''}`
}
function hasStatisticValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}
function columnClass(block: WebsitePageBlock, max: number, itemCount = max) {
  const columns = Math.min(max, Math.max(1, itemCount), Math.max(1, Number(block.settings.columns || 3)))
  return {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[columns]
}
function featureGridClass(block: WebsitePageBlock) {
  if (block.variant === 'list') return 'grid-cols-1 gap-0'
  return `${columnClass(block, 4, block.content.items?.length)} ${block.variant === 'cards' ? 'gap-5' : 'gap-x-8 gap-y-10'}`
}
function featureItemClass(block: WebsitePageBlock) {
  if (block.variant === 'cards') return 'feature-card rounded-xl'
  if (block.variant === 'list') return 'feature-row'
  return 'feature-open'
}
function galleryItems(block: WebsitePageBlock): { media_id?: unknown, alt?: string, caption?: string }[] {
  const items = Array.isArray(block.content.items) ? block.content.items : []
  return items.filter((item: { media_id?: unknown }) => props.preview || galleryMedia(item.media_id))
}
function galleryClass(block: WebsitePageBlock) {
  if (block.variant === 'carousel') return 'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4'
  if (block.variant === 'masonry') {
    const columns = Math.min(4, Math.max(1, galleryItems(block).length), Math.max(1, Number(block.settings.columns || 3)))
    return { 1: 'columns-1 gap-5', 2: 'columns-1 gap-5 sm:columns-2', 3: 'columns-1 gap-5 sm:columns-2 lg:columns-3', 4: 'columns-1 gap-5 sm:columns-2 lg:columns-4' }[columns]
  }
  return `grid gap-4 ${columnClass(block, 4, galleryItems(block).length)}`
}
function ctaClass(block: WebsitePageBlock) {
  if (block.variant === 'band') return 'max-w-7xl text-center'
  if (block.variant === 'split') return 'max-w-6xl rounded-2xl px-6 py-10 text-left sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10'
  return 'max-w-4xl rounded-2xl px-6 py-12 text-center sm:px-12'
}
function ctaStyle(block: WebsitePageBlock) {
  const background = block.settings.design?.background || block.settings.background_color || 'var(--color-secondary-950)'
  const text = block.settings.design?.text_color || block.settings.text_color || 'var(--on-secondary)'
  return { backgroundColor: background, color: text, '--cta-background': background, '--cta-text': text }
}
function dynamicCollectionClass(block: WebsitePageBlock) {
  if (block.type === 'product-list') {
    if (block.variant === 'carousel') return 'flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4'
    if (block.variant === 'feature') return 'grid gap-10'
    return `grid gap-x-6 gap-y-10 ${columnClass(block, 3, collections.value[block.id]?.length)}`
  }
  if (block.variant === 'carousel') return 'flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4'
  if (block.variant === 'list') return 'grid gap-8'
  if (block.variant === 'feature') return 'grid gap-8'
  return 'grid gap-7 sm:grid-cols-2 lg:grid-cols-3'
}
function dynamicItemClass(block: WebsitePageBlock) {
  if (block.type === 'product-list' && block.variant !== 'list') {
    if (block.variant === 'carousel') return 'w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[42%]'
    if (block.variant === 'feature') return 'product-feature grid grid-cols-1 items-center gap-6 rounded-2xl border p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:gap-10 sm:p-6'
    return ''
  }
  if (block.variant === 'carousel') return 'w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]'
  if (block.variant === 'list') return 'grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-5 sm:grid-cols-[12rem_minmax(0,1fr)]'
  if (block.variant === 'feature') return 'grid grid-cols-1 gap-5 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)] sm:items-center'
  return block.variant === 'cards' ? 'rounded-xl border border-gray-200 bg-white p-3' : ''
}
function dynamicImageClass(block: WebsitePageBlock) {
  if (block.type === 'product-list') return block.variant === 'feature' ? 'aspect-[4/3] rounded-xl' : block.variant === 'carousel' ? 'aspect-[4/5] rounded-2xl' : 'aspect-square rounded-2xl'
  if (block.variant === 'list') return 'aspect-square rounded-xl sm:aspect-[4/3]'
  if (block.variant === 'feature') return 'aspect-[4/3] rounded-xl'
  return 'aspect-[4/3] rounded-xl'
}
function formatPrice(value: string | number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: siteConfig.value?.currency_code || 'USD' }).format(Number(value))
}
async function submitContact(block: WebsitePageBlock) {
  if (props.preview) {
    contactErrors[block.id] = 'Forms are disabled in preview.'
    return
  }
  if (contactSubmitting[block.id]) return
  contactSubmitting[block.id] = true
  contactErrors[block.id] = ''
  try {
    const recaptchaToken = await executeRecaptcha('contact_form')
    const form = formFor(block)
    await $apiFetch('/contact', {
      method: 'POST',
      body: { name: form.name, email: form.email, phone: form.phone || null, subject: 'Website page enquiry', message: form.message, recaptcha_token: recaptchaToken },
    })
    contactSuccess[block.id] = true
  } catch (error: any) {
    contactErrors[block.id] = error?.status === 429 ? 'Too many messages were sent. Please wait and try again.' : 'Your message could not be sent. Check the fields and try again.'
  } finally {
    contactSubmitting[block.id] = false
  }
}
</script>

<style scoped>
.custom-page { overflow-wrap: anywhere; }
.rich-text-reading { font-size: 1rem; line-height: 1.9; letter-spacing: -.005em; }
.rich-text-reading[data-reading-layout="prose"], .rich-text-reading[data-reading-layout="standard"] { max-width: 70ch; }
.rich-text-reading[data-reading-layout="narrow"] { max-width: 52ch; }
.rich-text-paragraph { margin: 0; orphans: 3; widows: 3; }
.rich-text-paragraph + .rich-text-paragraph { margin-top: 1.25em; }
.rich-text-reading:not([data-reading-layout="wide"]) .rich-text-paragraph:first-child { font-size: 1.125rem; line-height: 1.8; }
@media (min-width: 1024px) {
  .rich-text-reading[data-reading-columns="true"] { column-count: 2; column-width: 24rem; column-gap: 3rem; }
}

.hero-centered { min-height: 30rem; }
.hero-heading { max-width: 16ch; font-size: clamp(2.25rem, 4.6vw, 4.25rem); font-weight: 600; line-height: 1.06; letter-spacing: -.04em; }
.hero-centered .hero-heading { max-width: 19ch; }
.hero-body, .hero-short-label { opacity: .8; }
.hero-split-frame { overflow: hidden; border: 1px solid color-mix(in srgb, currentColor 20%, transparent); border-radius: 1.5rem; }
.hero-split-copy { background: color-mix(in srgb, currentColor 4%, transparent); }
.hero-split-frame .hero-heading { font-size: clamp(2rem, 4vw, 3.5rem); }
.hero-media { border: 1px solid color-mix(in srgb, currentColor 18%, transparent); background: color-mix(in srgb, currentColor 7%, transparent); }
.hero-split-frame .hero-media { border: 0; }
.hero-placeholder-icon { border: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
.hero-button { display: inline-flex; min-width: 0; max-width: 100%; min-height: 2.75rem; align-items: center; justify-content: center; gap: .75rem; padding: .625rem 1rem; border: 1px solid transparent; border-radius: .5rem; font-size: .875rem; font-weight: 600; line-height: 1.5; text-align: center; transition: opacity 140ms ease, background-color 140ms ease; }
.hero-button--primary { background: var(--section-text, #ffffff); color: var(--hero-background); }
.hero-button--primary:hover { opacity: .88; }
.hero-button--secondary { border-color: color-mix(in srgb, currentColor 45%, transparent); }
.hero-button--secondary:hover { background: color-mix(in srgb, currentColor 9%, transparent); }
.hero-button:focus-visible { outline: 2px solid var(--section-text, #ffffff); outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { .hero-button { transition: none; } }

.image-text-media { border: 1px solid color-mix(in srgb, currentColor 10%, transparent); background: color-mix(in srgb, currentColor 3%, transparent); }
.image-text-placeholder-icon { border: 1px solid color-mix(in srgb, currentColor 20%, transparent); }
.image-text-heading { font-size: clamp(1.75rem, 2.7vw, 2.5rem); line-height: 1.2; letter-spacing: -.03em; }
.image-text-body { margin-top: 1.25rem; }
.image-text-action { background: #111827; color: #ffffff; border: 1px solid rgb(255 255 255 / .2); transition: background-color 140ms ease; }
.image-text-action:hover { background: #334155; }
.image-text-action:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 4px; }
@media (min-width: 640px) {
  [data-section="image-text"][data-layout="stacked"] .image-text-copy { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 2rem; align-items: start; }
  [data-section="image-text"][data-layout="stacked"] .image-text-body { margin-top: 0; }
}
@media (prefers-reduced-motion: reduce) { .image-text-action { transition: none; } }

.faq-split { display: grid; gap: 2rem; align-items: start; }
.faq-item { min-width: 0; border: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: .75rem; transition: background-color 160ms ease, border-color 160ms ease; }
.faq-item[open] { background: color-mix(in srgb, currentColor 3%, transparent); border-color: color-mix(in srgb, currentColor 22%, transparent); }
.faq-question { padding: .875rem 1rem; border-radius: .75rem; }
.faq-question::-webkit-details-marker { display: none; }
.faq-question:hover { background: color-mix(in srgb, currentColor 4%, transparent); }
.faq-question:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 3px; }
.faq-toggle { border: 1px solid color-mix(in srgb, currentColor 16%, transparent); }
.faq-item[open] .faq-toggle { background: color-mix(in srgb, currentColor 7%, transparent); }
.faq-list-row { display: grid; gap: .75rem; padding-block: 1.5rem; border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
.faq-list-row:first-child { border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
.website-page-section[data-custom-text="true"][data-section="faq"] :is(dt, dd) { color: var(--section-text); }
@media (min-width: 640px) {
  .faq-question { padding-inline: 1.25rem; }
  .faq-list-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1.7fr); gap: 2rem; }
}
@media (min-width: 1024px) {
  .faq-split { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 4rem; }
  .faq-split .faq-intro { padding-top: .5rem; }
}
@media (prefers-reduced-motion: reduce) { .faq-item { transition: none; } }

.contact-mark { border: 1px solid color-mix(in srgb, currentColor 14%, transparent); background: color-mix(in srgb, currentColor 4%, transparent); }
.contact-compact .contact-intro { text-align: center; }
.contact-compact .contact-intro > p { margin-inline: auto; }
.contact-panel { padding: 1.25rem; border: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: 1rem; background: color-mix(in srgb, currentColor 3%, transparent); align-content: start; }
.contact-label { min-width: 0; font-size: .75rem; font-weight: 600; line-height: 1.5; }
.contact-field { display: block; width: 100%; min-width: 0; min-height: 2.75rem; margin-top: .5rem; padding: .625rem .75rem; border: 1px solid #cbd5e1; border-radius: .5rem; background: #ffffff; color: #111827; font-size: 1rem; font-weight: 400; line-height: 1.5; }
.contact-field::placeholder { color: #64748b; }
.contact-field:focus-visible { border-color: var(--color-primary-600); outline: 2px solid var(--color-primary-600); outline-offset: 2px; }
.contact-message { min-height: 8rem; resize: vertical; }
.contact-footer { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent); }
.contact-submit { display: inline-flex; min-width: 0; min-height: 2.75rem; align-items: center; justify-content: center; gap: .75rem; padding: .625rem 1rem; border: 1px solid transparent; border-radius: .5rem; background: #111827; color: #ffffff; font-size: .875rem; font-weight: 600; line-height: 1.5; transition: background-color 140ms ease; }
.contact-submit:hover { background: #334155; }
.contact-submit:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 3px; }
.contact-submit:disabled { cursor: wait; opacity: .6; }
.website-page-section[data-section="contact-form"] .contact-error { color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: .5rem; padding: .75rem; }
@media (min-width: 640px) {
  .contact-panel { padding: 1.75rem; }
  .contact-footer { flex-direction: row; align-items: center; justify-content: space-between; }
  .contact-footer > span { max-width: 13rem; }
  .contact-submit { flex-shrink: 0; }
}
@media (min-width: 1024px) { .contact-split .contact-intro { padding-top: 1.5rem; } }
@media (prefers-reduced-motion: reduce) { .contact-submit { transition: none; } }

.blog-link { display: grid; align-content: start; gap: 1.25rem; border-radius: .75rem; }
.blog-link:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 5px; }
.blog-image { aspect-ratio: 16 / 10; }
.blog-grid .blog-title { font-size: 1.25rem; }
.blog-arrow { transition: transform 180ms ease; }
.blog-link:is(:hover, :focus-visible) .blog-arrow { transform: translateX(3px); }
.blog-list .blog-link { grid-template-columns: 6rem minmax(0, 1fr); gap: 1rem; padding-block: 1.5rem; border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: 0; }
.blog-list .blog-link:first-child { border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
.blog-list .blog-image { aspect-ratio: 4 / 3; }
.blog-list .blog-summary { margin-top: .5rem; -webkit-line-clamp: 2; }
.blog-feature { gap: 2rem; }
.blog-feature .blog-link:first-child .blog-title { font-size: 1.5rem; line-height: 1.3; }
.blog-feature .blog-link:not(:first-child) { grid-template-columns: 6rem minmax(0, 1fr); gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: 0; }
.blog-feature .blog-link:not(:first-child) .blog-image { aspect-ratio: 4 / 3; }
.blog-feature .blog-link:not(:first-child) .blog-summary { margin-top: .5rem; -webkit-line-clamp: 2; }
@media (min-width: 640px) {
  .blog-list .blog-link { grid-template-columns: 12rem minmax(0, 1fr); gap: 2rem; align-items: center; }
  .blog-list .blog-title { font-size: 1.5rem; }
  .blog-feature .blog-link:not(:first-child) { grid-template-columns: 8rem minmax(0, 1fr); }
}
@media (min-width: 1024px) {
  .blog-feature:not([data-single="true"]) { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); column-gap: 3rem; align-items: start; }
  .blog-feature .blog-link:first-child { grid-row: span var(--blog-followups); }
  .blog-feature .blog-link:first-child .blog-title { font-size: 1.875rem; }
}
@media (prefers-reduced-motion: reduce) { .blog-arrow { transition: none; } .blog-link:is(:hover, :focus-visible) .blog-arrow { transform: none; } }

.service-link { position: relative; display: grid; gap: 1rem; align-items: start; border-color: color-mix(in srgb, currentColor 14%, transparent); }
.service-link:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 5px; }
.service-card { padding: 1rem; border-width: 1px; border-radius: 1rem; }
.service-card .service-details { padding-right: 2.75rem; }
.service-card .service-arrow { position: absolute; right: .875rem; bottom: .875rem; }
.service-row { grid-template-columns: 4.5rem minmax(0, 1fr) auto; align-items: center; gap: 1rem; padding-block: 1.25rem; border-bottom-width: 1px; }
.service-row:first-child { border-top-width: 1px; }
.service-feature { padding: 1rem; border-width: 1px; border-radius: 1rem; background: color-mix(in srgb, currentColor 3%, transparent); }
.service-feature .service-details { padding: .5rem 2.75rem 3rem .5rem; }
.service-feature .service-title { font-size: 1.5rem; line-height: 1.35; }
.service-feature .service-arrow { position: absolute; right: 1.25rem; bottom: 1.25rem; }
.service-arrow { border: 1px solid color-mix(in srgb, currentColor 18%, transparent); transition: transform 180ms ease, background-color 180ms ease; }
.service-link:is(:hover, :focus-visible) .service-arrow { transform: translate(2px, -2px); background: color-mix(in srgb, currentColor 6%, transparent); }
@media (min-width: 640px) {
  .service-row { grid-template-columns: 6rem minmax(0, 1fr) auto; gap: 1.5rem; }
  .service-feature { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 2rem; }
  .service-feature .service-details { padding: 1rem 2rem 3rem 0; }
  .service-feature:nth-child(even) .service-image { order: 2; }
  .service-feature:nth-child(even) .service-details { padding: 1rem 0 3rem 1rem; }
  .service-feature:nth-child(even) .service-arrow { right: auto; left: 1.25rem; bottom: 1.25rem; }
}
@media (prefers-reduced-motion: reduce) { .service-arrow { transition: none; } .service-link:is(:hover, :focus-visible) .service-arrow { transform: none; } }

.collection-link { display: block; border-radius: 1rem; }
.collection-link:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 5px; }
.collection-card { position: relative; aspect-ratio: 4 / 5; overflow: hidden; isolation: isolate; }
.collection-scrim { background: linear-gradient(to bottom, rgb(0 0 0 / 0) 25%, rgb(0 0 0 / .88) 100%); }
.website-page-section[data-section="collection-list"][data-layout="cards"] .collection-title { color: #ffffff; }
.website-page-section[data-section="collection-list"][data-layout="cards"] .collection-summary { color: rgb(255 255 255 / .85); }
.collection-arrow { transition: transform 180ms ease, background-color 180ms ease; }
.collection-link:is(:hover, :focus-visible) .collection-arrow { transform: translate(2px, -2px); background: rgb(127 127 127 / .12); }
@media (prefers-reduced-motion: reduce) { .collection-arrow { transition: none; } .collection-link:is(:hover, :focus-visible) .collection-arrow { transform: none; } }

[data-section="product-list"] .connected-items:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 4px; }
[data-section="product-list"] .product-stage { border: 1px solid color-mix(in srgb, currentColor 8%, transparent); background: color-mix(in srgb, currentColor 3%, transparent); }
[data-section="product-list"] .connected-details { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: .75rem; align-content: start; }
[data-section="product-list"] .connected-details h3 { font-size: 1rem; line-height: 1.45; letter-spacing: -.015em; }
[data-section="product-list"] .connected-price { grid-column: 1; margin-top: .75rem; }
.product-nav { display: inline-flex; grid-column: 2; grid-row: 1 / 3; align-items: center; gap: .75rem; align-self: start; }
.product-nav-icon { display: inline-flex; width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, currentColor 18%, transparent); border-radius: 50%; transition: transform 180ms ease, background-color 180ms ease; }
.product-link:is(:hover, :focus-visible) .product-nav-icon { transform: translate(2px, -2px); background: color-mix(in srgb, currentColor 6%, transparent); }
[data-section="product-list"] .product-feature { border-color: color-mix(in srgb, currentColor 12%, transparent); background: color-mix(in srgb, currentColor 2%, transparent); }
[data-section="product-list"] .product-feature .connected-details { display: block; padding: .5rem; }
[data-section="product-list"] .product-feature h3 { font-size: 1.75rem; line-height: 1.25; letter-spacing: -.025em; }
[data-section="product-list"] .product-feature .connected-price { margin-top: 1.25rem; font-size: 1.5rem; }
[data-section="product-list"] .product-feature .product-nav { margin-top: 1.5rem; }
@media (prefers-reduced-motion: reduce) { .product-nav-icon { transition: none; } .product-link:is(:hover, :focus-visible) .product-nav-icon { transform: none; } }

.cta-action { background: var(--cta-text); color: var(--cta-background); border: 1px solid transparent; overflow-wrap: anywhere; transition: opacity 140ms ease; }
.cta-action:hover { opacity: .85; }
.cta-action:focus-visible { outline: 2px solid var(--cta-text); outline-offset: 4px; }
@media (min-width: 1024px) {
  [data-section="cta"][data-layout="split"] .cta-action { flex: 0 1 auto; max-width: 40%; }
}
@media (prefers-reduced-motion: reduce) { .cta-action { transition: none; } }

.gallery-track:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 4px; }
.gallery-item { overflow-wrap: anywhere; }

.feature-item { position: relative; }
.feature-heading { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }
.feature-title { line-height: 1.4; letter-spacing: -.02em; }
.feature-open { padding-top: 1.5rem; border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent); }
.feature-open .feature-title { font-size: 1.375rem; }
.feature-card { padding: 1.5rem; border: 1px solid color-mix(in srgb, currentColor 12%, transparent); border-radius: 1rem; background: color-mix(in srgb, currentColor 2%, transparent); }
.feature-icon { display: inline-flex; flex-shrink: 0; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: .75rem; background: color-mix(in srgb, currentColor 4%, transparent); }
.feature-arrow { display: inline-flex; flex-shrink: 0; width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, currentColor 18%, transparent); border-radius: 50%; transition: transform 180ms ease, background-color 180ms ease; }
.feature-open.feature-link, .feature-card.feature-link { display: flex; flex-direction: column; align-items: flex-start; gap: 1.25rem; }
.feature-open.feature-link .feature-arrow, .feature-card.feature-link .feature-arrow { margin-top: auto; }
.feature-link:is(:hover, :focus-visible) .feature-arrow { transform: translate(2px, -2px); background: color-mix(in srgb, currentColor 6%, transparent); }
.feature-card.feature-link:is(:hover, :focus-visible) { border-color: color-mix(in srgb, currentColor 26%, transparent); }
.feature-row { display: grid; grid-template-columns: minmax(0, 1fr) 2.25rem; align-items: center; gap: 1.25rem; padding-block: 1.5rem; border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
.feature-row:first-child { border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
.feature-row .feature-heading { flex-direction: row; align-items: center; }
@media (min-width: 640px) {
  [data-section="features"][data-layout="list"] .feature-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 2rem; align-items: start; }
  [data-section="features"][data-layout="list"] .feature-content > p { margin-top: 0; }
}
@media (prefers-reduced-motion: reduce) { .feature-arrow { transition: none; } .feature-link:is(:hover, :focus-visible) .feature-arrow { transform: none; } }

.stats-item { display: flex; flex-direction: column; justify-content: center; gap: .75rem; }
.stats-value { order: -1; min-width: 0; font-size: clamp(2.25rem, 3.5vw, 3.75rem); font-weight: 600; line-height: 1.1; letter-spacing: -.04em; }
.stats-label { color: inherit; opacity: .72; }
.stats-value--placeholder { opacity: .35; }
.stats-grid-item { min-height: 10rem; padding: 1.75rem 1.5rem; border: 1px solid color-mix(in srgb, currentColor 12%, transparent); border-radius: 1rem; background: color-mix(in srgb, currentColor 2%, transparent); }
.stats-band-layout { display: grid; align-items: center; gap: 2rem; }
.stats-band-items { gap: 1.5rem; }
.stats-band-item { min-height: 7rem; padding-block: 1.25rem; border-top: 1px solid color-mix(in srgb, currentColor 24%, transparent); }
.website-page-section[data-custom-text="true"][data-section="stats"] :is(dt, dd) { color: var(--section-text); }
@media (min-width: 640px) {
  .stats-band-item { border-top: 0; border-inline-start: 1px solid color-mix(in srgb, currentColor 24%, transparent); padding-inline: 1.5rem; }
}
@media (min-width: 1024px) {
  .stats-band-layout:has(> h2) { grid-template-columns: minmax(0, 1fr) minmax(0, 3fr); gap: 3rem; }
  .stats-band-layout > h2 { max-width: 14rem; font-size: 1.5rem; line-height: 1.35; }
}

.website-page-section > div { min-width: 0; }
.website-page-section[data-custom-text="true"] :is(h1, h2, h3, p, summary, label, figcaption),
.website-page-section[data-custom-text="true"][data-section="rich-text"] > div { color: var(--section-text); }
.website-page-section[data-custom-width="true"] > div { max-width: var(--section-width); }
.website-page-section[data-custom-alignment="true"] > div { text-align: var(--section-align); align-items: var(--section-items); }
.website-page-section[data-custom-alignment="true"] :is(h1, h2, p) { text-align: var(--section-align); }
</style>
