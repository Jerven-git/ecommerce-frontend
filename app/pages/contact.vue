<template>
  <div>
    <!-- Hero Section -->
    <section class="relative text-white py-28 overflow-hidden" :style="heroStyle">
      <Transition name="fade">
        <div v-if="imageLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="imageLoaded" class="absolute inset-0 bg-black/45" />
      </Transition>

      <Transition name="hero-up" appear>
        <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span class="inline-block bg-white/15 backdrop-blur-sm text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            We're here to help
          </span>
          <h1 class="text-5xl font-bold mb-4 leading-tight drop-shadow-md">Contact Us</h1>
          <p class="text-lg text-white/80 drop-shadow max-w-lg mx-auto">Have a question or need support? We'd love to hear from you and will get back to you promptly.</p>
        </div>
      </Transition>
    </section>

    <!-- Main Contact Section -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          <!-- Contact Info card -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Get In Touch</p>
                <p class="text-xs text-gray-400">We'd love to hear from you</p>
              </div>
            </div>

            <div class="px-6 py-5">
              <p class="text-sm text-gray-500 leading-relaxed mb-5">Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.</p>

              <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3.5 py-2 rounded-lg mb-6">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Usually responds within 24 hours
              </div>

              <!-- Skeleton -->
              <div v-if="loading" class="space-y-3">
                <div v-for="i in 3" :key="i" class="flex items-center gap-3 animate-pulse">
                  <div class="w-10 h-10 rounded-xl bg-gray-100 shrink-0"></div>
                  <div class="space-y-1.5 flex-1">
                    <div class="h-3.5 bg-gray-100 rounded-lg w-20"></div>
                    <div class="h-3 bg-gray-100 rounded-lg w-40"></div>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-2">
                <template v-if="contactEntries.length">
                  <div v-for="(entry, i) in contactEntries" :key="i" class="p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <p v-if="entry.label" class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ entry.label }}</p>
                    <div class="space-y-1.5">
                      <div v-if="entry.email" class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                          <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <a :href="`mailto:${entry.email}`" class="text-sm text-gray-700 hover:text-blue-600 transition-colors">{{ entry.email }}</a>
                      </div>
                      <div v-if="entry.phone" class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                          <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <a :href="`tel:${entry.phone}`" class="text-sm text-gray-700 hover:text-emerald-600 transition-colors">{{ entry.phone }}</a>
                      </div>
                    </div>
                  </div>
                </template>

                <div v-else class="text-sm text-gray-400 text-center py-4">
                  Contact information not configured yet.
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form card -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Send a Message</p>
                <p class="text-xs text-gray-400">We'll reply within 24 hours</p>
              </div>
            </div>

            <div class="px-6 py-6">
              <Transition name="fade" mode="out-in">
                <!-- Success State -->
                <div v-if="success" key="success" class="flex flex-col items-center justify-center py-10 text-center">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 animate-bounce-once">
                    <svg class="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p class="text-sm font-bold text-gray-900 mb-1">Message Sent!</p>
                  <p class="text-sm text-gray-400 max-w-xs">Thank you! We've received your message and will get back to you within 24 hours.</p>
                </div>

                <!-- Form -->
                <form v-else key="form" @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input v-model="form.name" type="text" required class="input-field" placeholder="John Doe" />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input v-model="form.email" type="email" required class="input-field" placeholder="you@email.com" />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <select v-model="form.subject" required class="input-field">
                      <option value="" disabled>Select a topic</option>
                      <option value="order">Order Issue</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="return">Returns & Refunds</option>
                      <option value="product">Product Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea v-model="form.message" required rows="4" class="input-field resize-none" placeholder="Tell us how we can help..."></textarea>
                  </div>

                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <div v-if="submitError" class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-sm text-red-600">{{ submitError }}</p>
                    </div>
                  </Transition>

                  <button
                    type="submit"
                    class="btn-primary w-full flex items-center justify-center gap-2"
                    :disabled="submitting"
                  >
                    <svg v-if="submitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ submitting ? 'Sending...' : 'Send Message' }}
                  </button>

                  <p class="text-center text-gray-400 text-xs">We'll never share your information with anyone.</p>
                </form>
              </Transition>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Support Promise Strip -->
    <section class="text-white py-14" :style="{ backgroundColor: 'var(--color-secondary)' }">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="group flex flex-col items-center px-6">
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
              <svg class="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-1">Fast Response</h3>
            <p class="text-white text-sm">We reply to all inquiries within 24 hours, guaranteed.</p>
          </div>

          <div class="group flex flex-col items-center px-6 border-y md:border-y-0 md:border-x border-white/10 py-8 md:py-0">
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
              <svg class="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-1">Expert Help</h3>
            <p class="text-white text-sm">Our trained support team is ready to resolve any issue.</p>
          </div>

          <div class="group flex flex-col items-center px-6">
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
              <svg class="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-1">100% Private</h3>
            <p class="text-white text-sm">Your details are always kept safe and never shared.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="bg-gray-50 border-t border-gray-100 py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">FAQ</p>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Common Questions</h2>
          <p class="text-sm text-gray-500">Can't find what you need? Use the form above to reach us directly.</p>
        </div>

        <div class="space-y-2">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <button
              class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
              @click="toggleFaq(i)"
            >
              <span class="text-sm font-semibold text-gray-900">{{ faq.question }}</span>
              <svg
                class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ml-4"
                :class="{ 'rotate-180': openFaq === i }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <Transition name="accordion">
              <div v-if="openFaq === i" class="px-6 pb-5 border-t border-gray-50">
                <p class="text-sm text-gray-500 leading-relaxed pt-3">{{ faq.answer }}</p>
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
const imageLoading = ref(false)
const imageLoaded = ref(false)

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const success = ref(false)
const submitError = ref('')
const { execute: executeRecaptcha } = useRecaptcha()

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

const faqs = [
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

const heroStyle = computed(() => {
  const imageUrl = siteConfig.value?.contact_image_url

  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url(${imageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1e293b',
    }
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${siteConfig.value?.primary_color || '#6898ED'}, ${
      siteConfig.value?.secondary_color || '#4B5979'
    })`,
  }
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

.hero-up-enter-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.hero-up-enter-from {
  opacity: 0;
  transform: translateY(28px);
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
</style>
