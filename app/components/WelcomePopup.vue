<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-discount-heading"
        @click.self="close"
        @keydown="handleDialogKeydown"
      >
        <div class="absolute inset-0 bg-secondary-900/75" aria-hidden="true" @click="close" />

        <div
          ref="dialogPanelRef"
          class="welcome-popup-panel relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-[0_28px_80px_-24px_rgba(15,23,42,0.65)] sm:max-h-[calc(100dvh-3rem)]"
          tabindex="-1"
        >
          <button
            ref="closeButtonRef"
            type="button"
            @click="close"
            class="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary-700 shadow-[0_8px_22px_-10px_rgba(15,23,42,0.45)] transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 sm:right-4 sm:top-4"
            aria-label="Close discount offer"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="grid md:grid-cols-[0.9fr_1.1fr]">
            <section class="welcome-popup-offer relative overflow-hidden bg-secondary-800 px-6 pb-8 pt-9 text-white sm:px-8 sm:pb-10 sm:pt-11 md:flex md:min-h-[440px] md:flex-col md:justify-between md:px-10 md:py-12">
              <div class="welcome-popup-orb welcome-popup-orb-top" aria-hidden="true" />
              <div class="welcome-popup-orb welcome-popup-orb-bottom" aria-hidden="true" />

              <div class="relative max-w-md">
                <div class="mb-7 flex items-center gap-3 text-sm font-semibold text-white">
                  <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </span>
                  <span>A welcome gift</span>
                </div>

                <h2 id="welcome-discount-heading" class="max-w-[12ch] text-3xl font-bold leading-[1.08] tracking-[-0.025em] text-balance sm:text-4xl">
                  {{ heading }}
                </h2>
                <p class="mt-4 max-w-[34ch] text-sm leading-6 text-white/80 sm:text-base">
                  {{ body }}
                </p>
              </div>

              <div class="relative mt-8 hidden items-center gap-3 border-t border-white/15 pt-5 text-sm text-white/80 md:flex">
                <svg class="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-16 10h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Available immediately after sign-up
              </div>
            </section>

            <section class="flex min-h-[330px] items-center px-6 py-8 sm:px-9 sm:py-10 md:px-10 md:py-12">
              <div class="w-full">
                <Transition name="fade" mode="out-in">
                  <div v-if="submitted" key="success" aria-live="polite">
                    <template v-if="discountCode">
                      <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 class="text-2xl font-bold tracking-[-0.02em] text-secondary-900">Your discount is ready</h3>
                      <p class="mt-3 text-sm leading-6 text-secondary-600">
                        Copy this one-use code and enter it at checkout.
                      </p>
                      <div class="mt-6 rounded-xl border border-primary-200 bg-primary-50 px-4 py-4 text-center">
                        <span class="select-all font-mono text-xl font-bold tracking-[0.16em] text-primary-800">{{ discountCode }}</span>
                      </div>
                      <button ref="successButtonRef" type="button" class="btn-primary mt-4 flex min-h-11 w-full items-center justify-center gap-2 text-sm" @click="copyCode">
                        <svg v-if="!copied" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ copied ? 'Code copied' : 'Copy discount code' }}
                      </button>
                      <p v-if="copyError" class="mt-3 text-sm leading-5 text-red-700" role="alert">{{ copyError }}</p>
                      <button type="button" class="mt-3 min-h-11 w-full text-sm font-semibold text-secondary-700 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" @click="close">
                        Close
                      </button>
                    </template>

                    <template v-else>
                      <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v4m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                        </svg>
                      </div>
                      <h3 class="text-2xl font-bold tracking-[-0.02em] text-secondary-900">No code is available</h3>
                      <p class="mt-3 text-sm leading-6 text-secondary-600">{{ terminalMessage }}</p>
                      <button ref="successButtonRef" type="button" class="btn-primary mt-7 flex min-h-11 w-full items-center justify-center text-sm" @click="close">
                        Close
                      </button>
                    </template>
                  </div>

                  <form v-else key="form" class="w-full" :aria-busy="submitting" @submit.prevent="handleSubmit">
                    <div class="mb-6">
                      <h3 class="text-2xl font-bold tracking-[-0.02em] text-secondary-900">Unlock your welcome code</h3>
                      <p class="mt-2 text-sm leading-6 text-secondary-600">
                        Enter your email address to reveal the code instantly.
                      </p>
                    </div>

                    <label for="welcome-discount-email" class="mb-2 block text-sm font-semibold text-secondary-800">
                      Email address
                    </label>
                    <input
                      id="welcome-discount-email"
                      ref="emailInputRef"
                      v-model="email"
                      type="email"
                      required
                      maxlength="255"
                      autocomplete="email"
                      inputmode="email"
                      class="input-field"
                      placeholder="name@example.com"
                      :disabled="submitting"
                      :aria-invalid="Boolean(errorMsg)"
                      :aria-describedby="errorMsg ? 'welcome-email-help welcome-email-error' : 'welcome-email-help'"
                    />

                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <div v-if="errorMsg" id="welcome-email-error" class="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-700" role="alert">
                        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-sm leading-5">{{ errorMsg }}</p>
                      </div>
                    </Transition>

                    <button
                      type="submit"
                      class="btn-primary mt-4 flex min-h-11 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="submitting"
                    >
                      <svg v-if="submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {{ submitting ? 'Unlocking your code...' : 'Reveal My Discount' }}
                    </button>

                    <p id="welcome-email-help" class="mt-3 text-center text-xs leading-5 text-secondary-500">
                      Your email is used to register this one-use offer.
                    </p>
                  </form>
                </Transition>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="launcher">
      <button
        v-if="launcherVisible && !visible"
        ref="launcherButtonRef"
        type="button"
        class="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_14px_32px_-12px_rgba(15,23,42,0.55)] ring-4 ring-white transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-[0_18px_38px_-12px_rgba(15,23,42,0.65)] focus-visible:outline-none focus-visible:ring-primary-200 sm:bottom-6 sm:right-6"
        aria-label="Open discount offer"
        title="Open discount offer"
        @click="open"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </button>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfig()
const { $apiFetch } = useNuxtApp()

const STORAGE_KEY = 'ssu-welcome-popup-dismissed'

const visible = ref(false)
const launcherVisible = ref(false)
const email = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const submitted = ref(false)
const discountCode = ref('')
const copied = ref(false)
const copyError = ref('')
const terminalMessage = ref('')
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const emailInputRef = ref<HTMLInputElement | null>(null)
const launcherButtonRef = ref<HTMLButtonElement | null>(null)
const successButtonRef = ref<HTMLButtonElement | null>(null)
const dialogPanelRef = ref<HTMLElement | null>(null)
let showTimer: ReturnType<typeof setTimeout> | null = null
let previouslyFocusedElement: HTMLElement | null = null
let previousBodyOverflow = ''
let openedFromLauncher = false

const heading = computed(() => siteConfig.value?.welcome_popup_heading || 'Get 10% Off')
const body = computed(() => siteConfig.value?.welcome_popup_body || 'Enter your email to get a discount code, right here.')
const promotionAvailable = computed(() => Boolean(
  siteConfig.value?.welcome_popup_enabled
  && siteConfig.value?.welcome_popup_discount_id,
))

function clearShowTimer() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
}

// Automatically interrupt only on the first visit. Once dismissed, keep the
// offer recoverable through the quieter floating launcher.
onMounted(() => {
  if (!import.meta.client) return

  watch(
    promotionAvailable,
    (available) => {
      clearShowTimer()

      if (!available) {
        visible.value = false
        launcherVisible.value = false
        return
      }

      const popupState = localStorage.getItem(STORAGE_KEY)
      if (popupState === 'claimed') {
        visible.value = false
        launcherVisible.value = false
        return
      }

      if (popupState) {
        launcherVisible.value = true
        return
      }

      showTimer = setTimeout(() => {
        rememberCurrentFocus()
        openedFromLauncher = false
        visible.value = true
        launcherVisible.value = false
      }, 1500)
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => {
  clearShowTimer()
  restoreBodyScroll()
})

watch(visible, async (isVisible) => {
  if (!import.meta.client) return

  if (!isVisible) {
    restoreBodyScroll()
    return
  }

  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  if (!submitted.value && emailInputRef.value) {
    emailInputRef.value.focus()
  } else {
    closeButtonRef.value?.focus()
  }
})

function rememberCurrentFocus() {
  if (!import.meta.client) return
  previouslyFocusedElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
}

function restoreBodyScroll() {
  if (!import.meta.client) return
  document.body.style.overflow = previousBodyOverflow
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }

  if (event.key !== 'Tab' || !dialogPanelRef.value) return

  const focusableElements = Array.from(dialogPanelRef.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ))

  if (!focusableElements.length) {
    event.preventDefault()
    dialogPanelRef.value.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

function close() {
  visible.value = false
  launcherVisible.value = promotionAvailable.value && !submitted.value
  const shouldFocusLauncher = openedFromLauncher && launcherVisible.value
  openedFromLauncher = false

  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, submitted.value ? 'claimed' : 'dismissed')
  }

  nextTick(() => {
    if (shouldFocusLauncher) {
      launcherButtonRef.value?.focus()
    } else {
      previouslyFocusedElement?.focus()
    }
  })
}

function open() {
  rememberCurrentFocus()
  openedFromLauncher = true
  launcherVisible.value = false
  visible.value = true
}

async function handleSubmit() {
  submitting.value = true
  errorMsg.value = ''

  try {
    const response = await $apiFetch<{ message?: string, discount_code: string | null }>('/subscribe', {
      method: 'POST',
      body: { email: email.value, source: 'welcome_popup' },
    })

    if (!response.discount_code) {
      terminalMessage.value = response.message
        || 'This offer cannot provide a discount code for this email address.'
      submitted.value = true
      launcherVisible.value = false

      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, 'claimed')
      }

      await nextTick()
      successButtonRef.value?.focus()
      return
    }

    discountCode.value = response.discount_code
    submitted.value = true
    launcherVisible.value = false

    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, 'claimed')
    }

    await nextTick()
    successButtonRef.value?.focus()
  } catch (err: any) {
    errorMsg.value = err?.data?.errors?.email?.[0]
      || err?.data?.message
      || 'We could not send your code. Check the email and try again.'
  } finally {
    submitting.value = false
  }
}

async function copyCode() {
  copyError.value = ''

  try {
    await navigator.clipboard.writeText(discountCode.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copyError.value = 'Copy was blocked by your browser. Select the code above and copy it manually.'
  }
}
</script>

<style scoped>
.popup-enter-active {
  transition: opacity 0.28s ease-out;
}
.popup-enter-active .welcome-popup-panel {
  transition: opacity 0.34s cubic-bezier(0.16, 1, 0.3, 1), transform 0.34s cubic-bezier(0.16, 1, 0.3, 1);
}
.popup-enter-from {
  opacity: 0;
}
.popup-enter-from .welcome-popup-panel {
  opacity: 0;
  transform: scale(0.97) translateY(18px);
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

.launcher-enter-active,
.launcher-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.launcher-enter-from,
.launcher-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}

.welcome-popup-offer {
  isolation: isolate;
}

.welcome-popup-orb {
  position: absolute;
  z-index: -1;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-primary-500) 24%, transparent);
}

.welcome-popup-orb-top {
  width: 11rem;
  height: 11rem;
  top: -6.5rem;
  right: -4.5rem;
}

.welcome-popup-orb-bottom {
  width: 15rem;
  height: 15rem;
  bottom: -10rem;
  left: -6rem;
  background: color-mix(in srgb, var(--color-primary-400) 16%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .popup-enter-active,
  .popup-enter-active .welcome-popup-panel,
  .popup-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .launcher-enter-active,
  .launcher-leave-active {
    transition: none;
  }
}
</style>
