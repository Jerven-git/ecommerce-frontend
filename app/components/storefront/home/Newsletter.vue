<template>
  <section class="relative overflow-hidden bg-secondary-900 py-16 lg:py-24 text-white">
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.06]"
      style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 22px 22px;"
      aria-hidden="true"
    />
    <div ref="newsletterRef" class="reveal relative mx-auto max-w-5xl px-6 lg:px-8">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p v-if="label" class="mb-3 text-sm font-medium text-white/60">{{ label }}</p>
          <h2 class="display-2 font-bold">{{ heading }}</h2>
          <p class="mt-4 max-w-md text-white/70">{{ subtitle }}</p>
        </div>
        <div>
          <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="subscribe">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="newsletter-input flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder-white/40 transition focus:border-transparent focus:outline-none focus:ring-2"
              :disabled="submitting"
            />
            <button
              type="submit"
              class="btn-primary text-white shrink-0 disabled:opacity-50"
              :disabled="submitting || !email"
            >
              {{ submitting ? 'Subscribing…' : 'Subscribe' }}
            </button>
          </form>
          <p v-if="message" class="mt-4 text-sm font-medium text-white/90">{{ message }}</p>
          <p v-else class="mt-4 text-xs text-white/50">{{ disclaimer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageNewsletter } from '~/composables/useSiteConfig'

const props = defineProps<{
  config: HomepageNewsletter | null
}>()

const { $apiFetch } = useNuxtApp()
const email = ref('')
const submitting = ref(false)
const message = ref('')
const label = computed(() => props.config?.label || 'Stay in the loop')
const heading = computed(() => props.config?.heading || "Don't miss a deal.")
const subtitle = computed(() => props.config?.subtitle || 'Get the latest products, exclusive offers, and updates delivered straight to your inbox.')
const disclaimer = computed(() => props.config?.disclaimer || 'No spam, ever. Unsubscribe anytime.')
const { revealRef: newsletterRef } = useScrollReveal()

async function subscribe() {
  if (!email.value || submitting.value) return

  submitting.value = true
  message.value = ''

  try {
    const response = await $apiFetch<{ message: string }>('/subscribe', {
      method: 'POST',
      body: { email: email.value, source: 'newsletter' },
    })
    message.value = response.message || 'Subscribed successfully!'
    email.value = ''
  } catch (err: any) {
    message.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.newsletter-input:focus {
  --tw-ring-color: var(--color-primary-400);
}
</style>
