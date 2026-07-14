<template>
  <div>
    <!-- ─────────────────────────  HERO  ───────────────────────── -->
    <section
      class="relative isolate flex min-h-[52vh] overflow-hidden text-white"
      :style="heroStyle"
      :aria-label="coverAltText || undefined"
    >
      <template v-if="!siteConfig?.contact_image_url">
        <div class="hero-media-gradient absolute inset-0" aria-hidden="true" />
        <div class="hero-media-grain absolute inset-0" aria-hidden="true" />
      </template>

      <Transition name="fade">
        <div v-if="imageLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <Transition name="fade">
        <div
          v-if="imageLoaded && siteConfig?.contact_image_url"
          class="absolute inset-0"
          :style="{
            backgroundColor: siteConfig?.contact_overlay_color || '#000000',
            opacity: (siteConfig?.contact_overlay_opacity ?? 45) / 100,
          }"
        />
      </Transition>

      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

      <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <p class="hero-stagger mb-3 text-sm font-medium text-white/70" style="animation-delay: 0.15s">We're here to help</p>
          <h1 class="hero-stagger display-1 font-bold leading-tight text-balance drop-shadow-sm" style="animation-delay: 0.3s">Contact us</h1>
          <p class="hero-stagger mt-5 max-w-lg text-lg text-white/85" style="animation-delay: 0.45s">Have a question or need support? We'd love to hear from you — and we reply promptly.</p>
        </div>
      </div>
    </section>

    <!-- ─────────────────  INFO + FORM  ───────────────── -->
    <section class="bg-white py-24 lg:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-start gap-12 lg:gap-16 md:grid-cols-2">

          <!-- Info -->
          <div :ref="addRevealRef" class="reveal">
            <h2 class="display-2 font-bold text-gray-900">{{ contactPage.info_title }}</h2>
            <p class="mt-5 max-w-md text-lg leading-relaxed text-gray-600">{{ contactPage.info_description }}</p>

            <div class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2 text-xs font-semibold text-primary-700">
              <span class="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse"></span>
              {{ contactPage.info_badge }}
            </div>

            <!-- Skeleton -->
            <div v-if="loading" class="mt-8 space-y-3">
              <div v-for="i in 2" :key="i" class="flex items-center gap-3 animate-pulse">
                <div class="h-9 w-9 rounded-lg bg-gray-100 shrink-0"></div>
                <div class="h-3.5 w-40 rounded bg-gray-100"></div>
              </div>
            </div>

            <div v-else class="mt-8 space-y-6">
              <template v-if="contactEntries.length">
                <div v-for="(entry, i) in contactEntries" :key="i">
                  <p v-if="entry.label" class="mb-2.5 text-sm font-medium text-gray-500">{{ entry.label }}</p>
                  <div class="space-y-2.5">
                    <a v-if="entry.email" :href="`mailto:${entry.email}`" class="group flex items-center gap-3">
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span class="text-gray-700 transition-colors group-hover:text-primary-600">{{ entry.email }}</span>
                    </a>
                    <a v-if="entry.phone" :href="`tel:${entry.phone}`" class="group flex items-center gap-3">
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <span class="text-gray-700 transition-colors group-hover:text-primary-600">{{ entry.phone }}</span>
                    </a>
                  </div>
                </div>
              </template>

              <p v-else class="text-gray-500">Contact information not configured yet.</p>
            </div>
          </div>

          <!-- Form -->
          <div :ref="addRevealRef" class="reveal" style="transition-delay: 0.1s">
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h3 class="text-lg font-semibold text-gray-900">Send a message</h3>
              <p class="mt-1 text-sm text-gray-500">We'll reply within 24 hours.</p>

              <Transition name="fade" mode="out-in">
                <!-- Success State -->
                <div v-if="success" key="success" class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 animate-bounce-once">
                    <svg class="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p class="mb-1 text-base font-bold text-gray-900">Message sent!</p>
                  <p class="max-w-xs text-sm text-gray-500">Thank you — we've received your message and will get back to you within 24 hours.</p>
                </div>

                <!-- Form -->
                <form v-else key="form" @submit.prevent="handleSubmit" class="mt-6 space-y-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Your name <span class="text-red-500">*</span></label>
                    <input v-model="form.name" type="text" placeholder="John Doe" :class="['input-field', formAttempted && fieldErrors.name ? '!border-red-300' : '']" />
                    <p v-if="formAttempted && fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Email address <span class="text-red-500">*</span></label>
                    <input v-model="form.email" type="email" placeholder="you@email.com" :class="['input-field', formAttempted && fieldErrors.email ? '!border-red-300' : '']" />
                    <p v-if="formAttempted && fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Subject <span class="text-red-500">*</span></label>
                    <select v-model="form.subject" :class="['input-field', formAttempted && fieldErrors.subject ? '!border-red-300' : '']">
                      <option value="" disabled>Select a topic</option>
                      <option value="order">Order Issue</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="return">Returns & Refunds</option>
                      <option value="product">Product Question</option>
                      <option value="other">Other</option>
                    </select>
                    <p v-if="formAttempted && fieldErrors.subject" class="mt-1 text-xs text-red-600">{{ fieldErrors.subject }}</p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Message <span class="text-red-500">*</span></label>
                    <textarea v-model="form.message" rows="4" placeholder="Tell us how we can help…" :class="['input-field resize-none', formAttempted && fieldErrors.message ? '!border-red-300' : '']"></textarea>
                    <p v-if="formAttempted && fieldErrors.message" class="mt-1 text-xs text-red-600">{{ fieldErrors.message }}</p>
                  </div>

                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <div v-if="submitError" class="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3">
                      <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-sm text-red-600">{{ submitError }}</p>
                    </div>
                  </Transition>

                  <button
                    type="submit"
                    class="btn-primary flex w-full items-center justify-center gap-2"
                    :disabled="submitting"
                  >
                    <svg v-if="submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ submitting ? 'Sending…' : 'Send message' }}
                  </button>

                  <p class="text-center text-xs text-gray-400">We'll never share your information with anyone.</p>
                </form>
              </Transition>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ────────────────  SUPPORT PROMISES  ──────────────── -->
    <section class="relative overflow-hidden bg-secondary-900 py-16 text-white">
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
        :style="{ background: 'radial-gradient(70% 130% at 50% -10%, color-mix(in srgb, var(--color-primary) 38%, transparent), transparent 62%)' }"
      />
      <div class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-y-10 md:grid-cols-3 md:gap-y-0">
          <div
            v-for="(promise, i) in promises"
            :key="i"
            :ref="addRevealRef"
            class="reveal text-center md:px-8"
            :class="i > 0 ? 'md:border-l md:border-white/10' : ''"
            :style="{ transitionDelay: `${0.1 + i * 0.12}s` }"
          >
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Icon :name="promise.icon || 'heroicons:check-circle'" class="h-6 w-6" :style="{ color: 'var(--color-primary-300)' }" />
            </div>
            <h3 class="text-base font-semibold">{{ promise.title }}</h3>
            <p class="mt-1 text-sm text-white/70">{{ promise.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────  FAQ  ────────────────────── -->
    <section class="section-accent border-t border-gray-100 py-20 lg:py-24">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div ref="faqHeadingRef" class="reveal mb-10">
          <h2 class="display-2 font-bold text-gray-900">{{ faqHeading }}</h2>
          <p class="mt-3 text-gray-600">{{ faqSubtitle }}</p>
        </div>

        <div class="border-y border-gray-200">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            :class="i > 0 ? 'border-t border-gray-200' : ''"
          >
            <button
              class="flex w-full items-center justify-between gap-4 py-5 text-left"
              @click="toggleFaq(i)"
            >
              <span class="text-base font-semibold text-gray-900">{{ faq.question }}</span>
              <svg
                class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300"
                :class="{ 'rotate-180': openFaq === i }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <Transition name="accordion">
              <div v-if="openFaq === i" class="pb-5">
                <p class="leading-relaxed text-gray-600">{{ faq.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
interface ContactEntry {
  label: string
  email: string
  phone: string
}

const { $apiFetch } = useNuxtApp()

const { siteConfig, pending: loading } = useSiteConfig()

const contactPage = computed(() => siteConfig.value?.contact_page ?? {
  info_title: 'Get In Touch',
  info_subtitle: "We'd love to hear from you",
  info_description: "Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.",
  info_badge: 'Usually responds within 24 hours',
  promises: [],
})

const defaultPromises = [
  { icon: 'heroicons:bolt', title: 'Fast Response', description: 'We reply to all inquiries within 24 hours, guaranteed.' },
  { icon: 'heroicons:users', title: 'Expert Help', description: 'Our trained support team is ready to resolve any issue.' },
  { icon: 'heroicons:lock-closed', title: '100% Private', description: 'Your details are always kept safe and never shared.' },
]

const promises = computed(() => contactPage.value.promises?.length ? contactPage.value.promises : defaultPromises)

// Scroll reveal
const { revealRef: faqHeadingRef } = useScrollReveal()
const { addRevealRef } = useScrollRevealAll()
const imageLoading = ref(false)
const imageLoaded = ref(false)

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const success = ref(false)
const submitError = ref('')
const { execute: executeRecaptcha } = useRecaptcha()

const formAttempted = ref(false)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const fieldErrors = computed(() => ({
  name: !form.value.name.trim() ? 'Your name is required.' : null,
  email: !form.value.email.trim()
    ? 'Email is required.'
    : !isValidEmail(form.value.email) ? 'Enter a valid email address.' : null,
  subject: !form.value.subject ? 'Please select a topic.' : null,
  message: !form.value.message.trim() ? 'Message is required.' : null,
}))

const hasFieldErrors = computed(() => Object.values(fieldErrors.value).some(Boolean))

const contactEntries = computed(() => {
  const entries = siteConfig.value?.contact_entries?.filter(e => e.email || e.phone)
  if (entries?.length) return entries
  // Fallback to legacy single fields
  if (siteConfig.value?.contact_email || siteConfig.value?.contact_phone) {
    return [{ label: 'General', email: siteConfig.value.contact_email, phone: siteConfig.value.contact_phone }]
  }
  return []
})

const openFaq = ref<number | null>(null)
const toggleFaq = (i: number) => {
  openFaq.value = openFaq.value === i ? null : i
}

const defaultFaqs = [
  {
    question: 'How do I track my order?',
    answer: 'Once your order has shipped, you\'ll receive a confirmation email with a tracking number. You can use this to track your package in real time on our shipping partner\'s website.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of delivery. Items must be in their original condition and packaging. Simply contact us with your order number and we\'ll guide you through the process.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3–7 business days. Expedited shipping (1–3 business days) is available at checkout for an additional fee. Orders are processed within 1 business day.'
  },
  {
    question: 'Can I change or cancel my order?',
    answer: 'Orders can be modified or cancelled within 1 hour of placing them. After that, the order enters processing and can no longer be changed. Please contact us immediately if you need to make a change.'
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Yes! We ship to most countries worldwide. International shipping times and costs vary by destination and will be calculated at checkout.'
  },
]

const faqs = computed(() => contactPage.value.faqs?.length ? contactPage.value.faqs : defaultFaqs)
const faqHeading = computed(() => contactPage.value.faq_heading || 'Common Questions')
const faqSubtitle = computed(() => contactPage.value.faq_subtitle || "Can't find what you need? Use the form above to reach us directly.")

const heroStyle = computed(() => {
  const imageUrl = siteConfig.value?.contact_image_url

  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url("${imageUrl}")` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1e293b',
    }
  }

  // No image — the layered `.hero-media-gradient` element paints the background.
  return {}
})

const preloadImage = (url: string) => {
  imageLoading.value = true
  imageLoaded.value = false
  const img = new Image()
  img.onload = () => { imageLoaded.value = true; imageLoading.value = false }
  img.onerror = () => { imageLoading.value = false }
  img.src = url
}

watch(() => siteConfig.value?.contact_image_url, (url) => {
  if (url) preloadImage(url)
}, { immediate: true })

const handleSubmit = async () => {
  formAttempted.value = true
  if (hasFieldErrors.value) return
  submitting.value = true
  success.value = false
  submitError.value = ''

  try {
    let recaptchaToken: string
    try {
      recaptchaToken = await executeRecaptcha('contact_form')
    } catch (recaptchaErr) {
      console.error('reCAPTCHA error:', recaptchaErr)
      submitError.value = 'Security verification failed. Please refresh the page and try again.'
      submitting.value = false
      return
    }

    await $apiFetch('/contact', {
      method: 'POST',
      body: {
        ...form.value,
        recaptcha_token: recaptchaToken,
      },
    })

    form.value = { name: '', email: '', subject: '', message: '' }
    success.value = true
    setTimeout(() => { success.value = false }, 5000)
  } catch (err: any) {
    console.error('Contact form error:', err)
    submitError.value = err?.data?.message || 'Failed to send message. Please try again.'
  } finally {
    submitting.value = false
  }
}

// JSON-LD structured data for local SEO (NAP)
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
        'name': config.site_name,
        ...(entry?.email || config.contact_email
          ? { email: entry?.email || config.contact_email }
          : {}),
        ...(entry?.phone || config.contact_phone
          ? { telephone: entry?.phone || config.contact_phone }
          : {}),
        'url': useRequestURL().origin,
      }),
    }]
  }),
})

useStaticPageSeo('contact')

const coverAltText = computed(() => siteConfig.value?.pages_seo?.contact?.cover_alt_text ?? '')
</script>

<style scoped>
.slide-bar {
  background: rgba(255, 255, 255, 0.85);
  width: 40%;
  border-radius: 9999px;
  animation: slide 1.4s ease-in-out infinite;
}

@keyframes slide {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(200%); }
  100% { transform: translateX(200%); }
}

/* Hero text staggered entrance */
.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.7s ease forwards;
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* FAQ accordion slide */
.accordion-enter-active,
.accordion-leave-active {
  transition: opacity 0.25s ease, max-height 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

@keyframes bounce-once {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-10px); }
  70%       { transform: translateY(-4px); }
}
.animate-bounce-once {
  animation: bounce-once 0.6s ease;
}

@media (prefers-reduced-motion: reduce) {
  .hero-stagger { animation: none; opacity: 1; transform: none; }
  .animate-bounce-once { animation: none; }
}
</style>
