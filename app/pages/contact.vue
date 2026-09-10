<template>
  <div class="storefront-page">
    <section class="relative overflow-hidden border-b border-secondary-200/70 text-white" :style="heroFallbackStyle">
      <img
        v-if="contactImageUrl"
        :src="contactImageUrl"
        :alt="coverAltText"
        class="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <div
        v-if="contactImageUrl"
        class="absolute inset-0"
        :style="{
          backgroundColor: siteConfig?.contact_overlay_color || '#000000',
          opacity: (siteConfig?.contact_overlay_opacity ?? 45) / 100,
        }"
        aria-hidden="true"
      />

      <div class="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <p class="mb-3 text-sm font-semibold text-white/90">Customer care</p>
        <h1 class="max-w-3xl text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl contact-display">
          How can we help?
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
          Tell us what you need and our team will point you in the right direction.
        </p>
      </div>
    </section>

    <section class="section-accent py-14 sm:py-20">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-start gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-16">
          <div class="min-w-0">
            <div class="mb-9 border-b border-secondary-200/70 pb-7">
              <p class="storefront-kicker">Send an enquiry</p>
              <h2 class="text-2xl font-semibold text-secondary-950 sm:text-3xl">Tell us what’s happening</h2>
              <p class="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                Complete the form below. Fields marked with an asterisk are required.
              </p>
            </div>

            <Transition name="fade" mode="out-in" @after-enter="focusCurrentContactState">
              <div
                v-if="success"
                key="success"
                ref="successStateRef"
                class="border-y border-secondary-200/70 py-10"
                role="status"
                aria-live="polite"
                tabindex="-1"
              >
                <Icon name="heroicons:check-circle" class="mb-5 h-9 w-9 text-primary-700" />
                <h3 class="text-2xl font-semibold text-secondary-950">Your message has been sent</h3>
                <p class="mt-3 max-w-lg text-base leading-7 text-gray-600">
                  We’ll respond using the email address you provided. You can also use the direct contact details on this page if your enquiry becomes urgent.
                </p>
                <button type="button" class="btn-secondary mt-7 inline-flex min-h-11 items-center justify-center" @click="resetForm">
                  Send another message
                </button>
              </div>

              <form
                v-else
                key="form"
                ref="contactFormRef"
                class="space-y-6"
                novalidate
                @submit.prevent="handleSubmit"
              >
                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="contact-name" class="storefront-field-label">
                      Your name <span aria-hidden="true" class="text-red-600">*</span>
                    </label>
                    <input
                      id="contact-name"
                      v-model="form.name"
                      type="text"
                      name="name"
                      autocomplete="name"
                      maxlength="255"
                      required
                      placeholder="Jane Smith"
                      :aria-invalid="formAttempted && !!fieldErrors.name"
                      :aria-describedby="formAttempted && fieldErrors.name ? 'contact-name-error' : undefined"
                      :class="['contact-input', formAttempted && fieldErrors.name ? 'contact-input--error' : '']"
                    />
                    <p v-if="formAttempted && fieldErrors.name" id="contact-name-error" class="mt-2 text-sm text-red-700">
                      {{ fieldErrors.name }}
                    </p>
                  </div>

                  <div>
                    <label for="contact-email" class="storefront-field-label">
                      Email address <span aria-hidden="true" class="text-red-600">*</span>
                    </label>
                    <input
                      id="contact-email"
                      v-model="form.email"
                      type="email"
                      name="email"
                      autocomplete="email"
                      inputmode="email"
                      maxlength="255"
                      required
                      placeholder="jane@example.com"
                      :aria-invalid="formAttempted && !!fieldErrors.email"
                      :aria-describedby="formAttempted && fieldErrors.email ? 'contact-email-error' : undefined"
                      :class="['contact-input', formAttempted && fieldErrors.email ? 'contact-input--error' : '']"
                    />
                    <p v-if="formAttempted && fieldErrors.email" id="contact-email-error" class="mt-2 text-sm text-red-700">
                      {{ fieldErrors.email }}
                    </p>
                  </div>
                </div>

                <div>
                  <label for="contact-subject" class="storefront-field-label">
                    What can we help with? <span aria-hidden="true" class="text-red-600">*</span>
                  </label>
                  <select
                    id="contact-subject"
                    v-model="form.subject"
                    name="subject"
                    required
                    :aria-invalid="formAttempted && !!fieldErrors.subject"
                    :aria-describedby="formAttempted && fieldErrors.subject ? 'contact-subject-error' : undefined"
                    :class="['contact-input', formAttempted && fieldErrors.subject ? 'contact-input--error' : '']"
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="order">Order issue</option>
                    <option value="shipping">Shipping and delivery</option>
                    <option value="return">Returns and refunds</option>
                    <option value="product">Product question</option>
                    <option value="other">Something else</option>
                  </select>
                  <p v-if="formAttempted && fieldErrors.subject" id="contact-subject-error" class="mt-2 text-sm text-red-700">
                    {{ fieldErrors.subject }}
                  </p>
                </div>

                <div>
                  <label for="contact-message" class="storefront-field-label">
                    Message <span aria-hidden="true" class="text-red-600">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    v-model="form.message"
                    name="message"
                    rows="6"
                    maxlength="5000"
                    required
                    placeholder="Include any details that will help us understand your enquiry."
                    :aria-invalid="formAttempted && !!fieldErrors.message"
                    :aria-describedby="formAttempted && fieldErrors.message ? 'contact-message-error' : undefined"
                    :class="['contact-input resize-y', formAttempted && fieldErrors.message ? 'contact-input--error' : '']"
                  ></textarea>
                  <p v-if="formAttempted && fieldErrors.message" id="contact-message-error" class="mt-2 text-sm text-red-700">
                    {{ fieldErrors.message }}
                  </p>
                </div>

                <div
                  v-if="submitError"
                  class="flex items-start gap-3 border-y border-red-200 bg-red-50/70 px-4 py-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <Icon name="heroicons:exclamation-circle" class="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
                  <p class="text-sm leading-6 text-red-800">{{ submitError }}</p>
                </div>

                <div class="flex flex-col gap-4 border-t border-secondary-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p class="max-w-sm text-sm leading-6 text-gray-600">
                    We use your details only to review and respond to this enquiry.
                  </p>
                  <button
                    type="submit"
                    class="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="submitting"
                  >
                    <svg v-if="submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ submitting ? 'Sending message…' : 'Send message' }}
                  </button>
                </div>
              </form>
            </Transition>
          </div>

          <aside class="min-w-0 border-t border-secondary-200/70 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p class="storefront-kicker">Direct contact</p>
            <h2 class="text-xl font-semibold text-secondary-950">{{ contactPage.info_title }}</h2>
            <p v-if="contactPage.info_subtitle" class="mt-2 text-sm font-medium text-secondary-700">{{ contactPage.info_subtitle }}</p>
            <p class="mt-3 text-sm leading-6 text-gray-600">{{ contactPage.info_description }}</p>
            <p v-if="contactPage.info_badge" class="mt-5 border-y border-secondary-200/70 py-4 text-sm font-medium text-secondary-800">
              {{ contactPage.info_badge }}
            </p>

            <div v-if="loading" class="mt-7 space-y-5" aria-label="Loading contact details">
              <div v-for="i in 2" :key="i" class="animate-pulse">
                <div class="h-4 w-20 rounded bg-gray-200"></div>
                <div class="mt-2 h-5 w-48 max-w-full rounded bg-gray-200"></div>
              </div>
            </div>

            <div v-else-if="contactEntries.length" class="mt-7 divide-y divide-secondary-200/70 border-b border-t border-secondary-200/70">
              <div v-for="(entry, i) in contactEntries" :key="i" class="py-5">
                <p v-if="entry.label" class="mb-3 text-sm font-semibold text-secondary-900">{{ entry.label }}</p>
                <div class="space-y-3">
                  <a
                    v-if="entry.email"
                    :href="`mailto:${entry.email}`"
                    class="flex min-h-11 items-center gap-3 break-all text-sm text-gray-700 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Icon name="heroicons:envelope" class="h-5 w-5 shrink-0 text-primary-700" />
                    {{ entry.email }}
                  </a>
                  <a
                    v-if="entry.phone"
                    :href="telHref(entry.phone)"
                    class="flex min-h-11 items-center gap-3 text-sm text-gray-700 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Icon name="heroicons:phone" class="h-5 w-5 shrink-0 text-primary-700" />
                    {{ entry.phone }}
                  </a>
                </div>
              </div>
            </div>

            <div v-if="promises.length" class="mt-10">
              <h3 class="text-base font-semibold text-secondary-950">What to expect</h3>
              <div class="mt-4 divide-y divide-secondary-200/70 border-y border-secondary-200/70">
                <div v-for="(promise, i) in promises" :key="i" class="grid grid-cols-[1.5rem_1fr] gap-3 py-4">
                  <Icon :name="promise.icon || 'heroicons:check-circle'" class="mt-0.5 h-5 w-5 text-primary-700" />
                  <div>
                    <p class="text-sm font-semibold text-secondary-900">{{ promise.title }}</p>
                    <p class="mt-1 text-sm leading-6 text-gray-600">{{ promise.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section v-if="faqs.length" class="border-t border-secondary-200/70 bg-white py-16 sm:py-20">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div ref="faqHeadingRef" class="reveal mb-10">
          <p class="storefront-kicker">{{ faqLabel }}</p>
          <h2 class="text-3xl font-semibold text-secondary-950">{{ faqHeading }}</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-gray-600">{{ faqSubtitle }}</p>
        </div>

        <MotionAccordion :items="faqs" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import MotionAccordion from '~/components/storefront/MotionAccordion.vue'

interface ContactEntry {
  label: string
  email: string
  phone: string
}

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const emptyForm = (): ContactForm => ({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const { $apiFetch } = useNuxtApp()
const { siteConfig, pending: loading } = useSiteConfig()
const { execute: executeRecaptcha } = useRecaptcha()

const contactPage = computed(() => siteConfig.value?.contact_page ?? {
  info_title: 'Get in touch',
  info_subtitle: '',
  info_description: 'Prefer email or phone? Contact our team directly using the details below.',
  info_badge: '',
  promises: [],
})

const promises = computed(() => contactPage.value.promises ?? [])
const form = ref<ContactForm>(emptyForm())
const submitting = ref(false)
const success = ref(false)
const submitError = ref('')
const formAttempted = ref(false)
const contactFormRef = ref<HTMLFormElement | null>(null)
const successStateRef = ref<HTMLElement | null>(null)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const fieldErrors = computed(() => ({
  name: !form.value.name.trim() ? 'Enter your name.' : null,
  email: !form.value.email.trim()
    ? 'Enter your email address.'
    : !isValidEmail(form.value.email) ? 'Enter an email address in the format name@example.com.' : null,
  subject: !form.value.subject ? 'Select what you need help with.' : null,
  message: !form.value.message.trim() ? 'Tell us how we can help.' : null,
}))

const hasFieldErrors = computed(() => Object.values(fieldErrors.value).some(Boolean))

const contactEntries = computed(() => {
  const entries = siteConfig.value?.contact_entries?.filter(entry => entry.email || entry.phone)
  if (entries?.length) return entries

  if (siteConfig.value?.contact_email || siteConfig.value?.contact_phone) {
    return [{
      label: 'General enquiries',
      email: siteConfig.value.contact_email,
      phone: siteConfig.value.contact_phone,
    }]
  }

  return []
})

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

const defaultFaqs = [
  {
    question: 'How do I track my order?',
    answer: 'Once your order has shipped, you’ll receive a confirmation email with a tracking number. Use that number on our tracking page to see the latest delivery status.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of delivery. Items must be in their original condition and packaging. Contact us with your order number and we’ll guide you through the process.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3–7 business days. Expedited shipping may be available at checkout. Orders are generally processed within one business day.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer: 'Contact us as soon as possible if you need to change or cancel an order. We’ll confirm whether the order can still be updated before processing begins.',
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Available destinations, shipping times, and costs are shown during checkout based on the delivery address.',
  },
]

const faqs = computed(() => contactPage.value.faqs?.length ? contactPage.value.faqs : defaultFaqs)
const faqLabel = computed(() => contactPage.value.faq_label || 'Frequently asked questions')
const faqHeading = computed(() => contactPage.value.faq_heading || 'A few answers before you write')
const faqSubtitle = computed(() => contactPage.value.faq_subtitle || 'If your question is not covered here, send us a message above.')

const { revealRef: faqHeadingRef } = useScrollReveal()

async function focusFirstInvalidField() {
  await nextTick()
  contactFormRef.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

function resetForm() {
  form.value = emptyForm()
  formAttempted.value = false
  submitError.value = ''
  success.value = false
}

function focusCurrentContactState() {
  if (success.value) {
    successStateRef.value?.focus()
    return
  }

  document.getElementById('contact-name')?.focus()
}

const handleSubmit = async () => {
  if (submitting.value) return

  formAttempted.value = true
  submitError.value = ''

  if (hasFieldErrors.value) {
    await focusFirstInvalidField()
    return
  }

  submitting.value = true
  success.value = false

  try {
    let recaptchaToken: string

    try {
      recaptchaToken = await executeRecaptcha('contact_form')
    } catch (recaptchaError) {
      console.error('reCAPTCHA error:', recaptchaError)
      submitError.value = 'We could not complete the security check. Refresh the page and try again.'
      return
    }

    await $apiFetch('/contact', {
      method: 'POST',
      body: {
        ...form.value,
        recaptcha_token: recaptchaToken,
      },
    })

    form.value = emptyForm()
    formAttempted.value = false
    success.value = true
  } catch (error: any) {
    console.error('Contact form error:', error)
    submitError.value = error?.status === 429
      ? 'Too many messages were sent from this connection. Wait a minute, then try again.'
      : error?.data?.message || 'We could not send your message. Check your connection and try again.'
  } finally {
    submitting.value = false
  }
}

const contactImageUrl = computed(() => siteConfig.value?.contact_image_url || '')
const coverAltText = computed(() => siteConfig.value?.pages_seo?.contact?.cover_alt_text || '')
const requestUrl = useRequestURL()
const heroFallbackStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, ${siteConfig.value?.theme?.primary_color || '#6898ED'}, ${
    siteConfig.value?.theme?.secondary_color || '#4B5979'
  })`,
}))

useHead({
  script: computed(() => {
    const config = siteConfig.value
    if (!config) return []

    const entry = contactEntries.value[0]

    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: config.site_name,
        ...(entry?.email || config.contact_email ? { email: entry?.email || config.contact_email } : {}),
        ...(entry?.phone || config.contact_phone ? { telephone: entry?.phone || config.contact_phone } : {}),
        url: seoBaseUrl(config, requestUrl),
      }),
    }]
  }),
})

useStaticPageSeo('contact')
</script>

<style scoped>
.contact-display {
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.contact-input {
  width: 100%;
  min-height: 3rem;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.75rem;
  background: rgb(255 255 255 / 0.86);
  padding: 0.75rem 0.875rem;
  color: rgb(17 24 39);
  outline: none;
  transition: border-color 180ms ease-out, box-shadow 180ms ease-out, background-color 180ms ease-out;
}

.contact-input::placeholder {
  color: rgb(107 114 128);
}

.contact-input:hover {
  border-color: var(--color-secondary-300);
}

.contact-input:focus {
  border-color: var(--color-primary-600);
  background: white;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 22%, transparent);
}

.contact-input--error {
  border-color: rgb(185 28 28);
}

.fade-enter-active,
.fade-leave-active,
.field-reveal-enter-active,
.field-reveal-leave-active {
  transition: opacity 220ms ease-out, transform 220ms ease-out;
}

.fade-enter-from,
.fade-leave-to,
.field-reveal-enter-from,
.field-reveal-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .field-reveal-enter-active,
  .field-reveal-leave-active {
    transition-duration: 0ms;
  }

  .fade-enter-from,
  .fade-leave-to,
  .field-reveal-enter-from,
  .field-reveal-leave-to {
    transform: none;
  }
}
</style>
