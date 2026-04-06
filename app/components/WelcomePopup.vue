<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <!-- Close button -->
          <button
            @click="close"
            class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header -->
          <div class="px-8 pt-10 pb-2 text-center">
            <div class="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
              <svg class="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ heading }}</h2>
            <p class="text-sm text-gray-500 leading-relaxed">{{ body }}</p>
          </div>

          <!-- Content -->
          <div class="px-8 pb-8 pt-4">
            <Transition name="fade" mode="out-in">
              <!-- Success state -->
              <div v-if="discountCode" key="success" class="text-center">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your discount code</p>
                <div class="relative">
                  <div class="bg-gray-50 border-2 border-dashed border-primary-200 rounded-xl px-6 py-4 text-center">
                    <span class="text-2xl font-bold text-primary-600 tracking-wider font-mono">{{ discountCode }}</span>
                  </div>
                  <button
                    @click="copyCode"
                    class="mt-3 w-full btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <svg v-if="!copied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ copied ? 'Copied!' : 'Copy Code' }}
                  </button>
                </div>
                <p class="text-xs text-gray-400 mt-3">Use this code at checkout to get your discount.</p>
              </div>

              <!-- Form state -->
              <form v-else key="form" @submit.prevent="handleSubmit" class="space-y-3">
                <div>
                  <input
                    v-model="email"
                    type="email"
                    required
                    class="input-field text-center"
                    placeholder="Enter your email address"
                    :disabled="submitting"
                  />
                </div>

                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-red-600">{{ errorMsg }}</p>
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
                  {{ submitting ? 'Getting your code...' : 'Get My Discount' }}
                </button>

                <p class="text-center text-gray-400 text-xs">Your email is only used to deliver your discount code.</p>
              </form>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfig()
const { $apiFetch } = useNuxtApp()

const STORAGE_KEY = 'ssu-welcome-popup-dismissed'

const visible = ref(false)
const email = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const discountCode = ref('')
const copied = ref(false)

const heading = computed(() => siteConfig.value?.welcome_popup_heading || 'Get 10% Off')
const body = computed(() => siteConfig.value?.welcome_popup_body || 'Enter your email to get a discount code, right here.')

// Show popup after a short delay if enabled and not previously dismissed
onMounted(() => {
  if (!import.meta.client) return

  const dismissed = localStorage.getItem(STORAGE_KEY)
  if (dismissed) return

  // Wait for siteConfig to load, then check if popup is enabled
  const stop = watch(
    () => siteConfig.value?.welcome_popup_enabled,
    (enabled) => {
      if (enabled && siteConfig.value?.welcome_popup_discount_id) {
        setTimeout(() => { visible.value = true }, 1500)
        stop()
      } else if (enabled === false) {
        stop()
      }
    },
    { immediate: true },
  )
})

function close() {
  visible.value = false
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, '1')
  }
}

async function handleSubmit() {
  submitting.value = true
  errorMsg.value = ''

  try {
    const res = await $apiFetch<{ discount_code: string | null }>('/subscribe', {
      method: 'POST',
      body: { email: email.value, source: 'welcome_popup' },
    })

    if (res.discount_code) {
      discountCode.value = res.discount_code
      // Mark as dismissed so it won't show again
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, '1')
      }
    } else {
      close()
    }
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(discountCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback: select the text
  }
}
</script>

<style scoped>
.popup-enter-active {
  transition: opacity 0.3s ease;
}
.popup-enter-active .relative {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.popup-enter-from {
  opacity: 0;
}
.popup-enter-from .relative {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.popup-leave-active {
  transition: opacity 0.2s ease;
}
.popup-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
