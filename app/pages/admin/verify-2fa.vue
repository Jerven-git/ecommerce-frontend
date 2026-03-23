<template>
  <div class="min-h-screen flex items-center justify-center bg-primary-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Base gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950"></div>

      <!-- Floating e-commerce icons -->
      <div class="float-icon icon-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
      </div>
      <div class="float-icon icon-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <div class="float-icon icon-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1"/>
        </svg>
      </div>
      <div class="float-icon icon-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div class="float-icon icon-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/>
        </svg>
      </div>
      <div class="float-icon icon-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </div>
      <div class="float-icon icon-7">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      </div>
      <div class="float-icon icon-8">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      </div>
      <div class="float-icon icon-9">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
      </div>
      <div class="float-icon icon-10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <div class="float-icon icon-11">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div class="float-icon icon-12">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1"/>
        </svg>
      </div>
      <div class="float-icon icon-13">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      </div>
      <div class="float-icon icon-14">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </div>
      <div class="float-icon icon-15">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/>
        </svg>
      </div>
      <div class="float-icon icon-16">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      </div>

      <!-- Soft glow -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/[0.06] rounded-full blur-[150px]"></div>

      <!-- Subtle dot grid -->
      <div class="absolute inset-0 opacity-[0.025]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Card -->
      <div
        class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] p-8 sm:p-10"
        :class="mounted ? 'animate-card-enter' : 'opacity-0 translate-y-6'"
      >
        <!-- Header -->
        <div
          class="text-center mb-8"
          :class="mounted ? 'animate-stagger-1' : 'opacity-0 translate-y-4'"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 mb-5 ring-1 ring-primary-600/30 animate-icon-glow">
            <Icon name="mdi:email-check-outline" class="w-8 h-8 text-primary-600" />
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Verify your identity</h2>
          <p class="mt-2 text-sm text-white/50">
            We sent a 6-digit code to
            <span class="text-white/70">{{ maskedEmail }}</span>
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleVerify" class="space-y-5">
          <div :class="mounted ? 'animate-stagger-2' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">Verification Code</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:shield-key-outline" class="w-5 h-5 text-white/30" />
              </div>
              <input
                v-model="code"
                type="text"
                inputmode="numeric"
                maxlength="6"
                pattern="[0-9]{6}"
                required
                class="w-full pl-11 pr-4 py-3 text-center tracking-[0.3em] text-lg bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 transition-all duration-200"
                placeholder="000000"
                autocomplete="one-time-code"
              />
            </div>
          </div>

          <!-- Error message -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="error" class="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Icon name="mdi:alert-circle-outline" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-300">{{ error }}</p>
            </div>
          </Transition>

          <!-- Resend success message -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="resendSuccess" class="flex items-start gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Icon name="mdi:check-circle-outline" class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-green-300">{{ resendSuccess }}</p>
            </div>
          </Transition>

          <!-- Submit button -->
          <div :class="mounted ? 'animate-stagger-3' : 'opacity-0 translate-y-4'">
          <button
            type="submit"
            class="w-full relative flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 active:scale-[0.97] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 disabled:active:scale-100 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:shadow-xl"
            :disabled="loading || code.length !== 6"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ loading ? 'Verifying...' : 'Verify Code' }}</span>
          </button>
          </div>
        </form>

        <!-- Resend link -->
        <div class="mt-4 text-center">
          <button
            @click="handleResend"
            :disabled="resendCooldown > 0 || resendLoading"
            class="text-sm text-white/70 hover:text-primary-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code' }}
          </button>
        </div>

        <!-- Footer -->
        <div
          class="mt-8 pt-6 border-t border-white/[0.08] text-center"
          :class="mounted ? 'animate-stagger-4' : 'opacity-0'"
        >
          <NuxtLink
            to="/admin/login"
            class="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white hover:gap-2.5 transition-all duration-200"
          >
            <Icon name="mdi:arrow-left" class="w-4 h-4" />
            Back to Sign In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const authStore = useAuthStore()

const mounted = ref(false)

// Redirect to login if no 2FA pending
onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })

  if (!authStore.twoFactorRequired) {
    navigateTo('/admin/login')
  }
})

const code = ref('')
const loading = ref(false)
const error = ref('')
const resendSuccess = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)

// Masked email display (e.g., "a***@gmail.com")
const maskedEmail = computed(() => {
  const email = authStore.twoFactorEmail
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  return `${local.charAt(0)}${'*'.repeat(Math.max(local.length - 1, 2))}@${domain}`
})

const handleVerify = async () => {
  loading.value = true
  error.value = ''
  resendSuccess.value = ''

  try {
    await authStore.verifyTwoFactor(code.value)
    navigateTo('/admin')
  } catch (err: any) {
    error.value = err?.data?.message || 'Invalid code. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return
  resendLoading.value = true
  error.value = ''
  resendSuccess.value = ''

  try {
    const res = await authStore.resendTwoFactor()
    resendSuccess.value = res.message || 'A new code has been sent!'
    code.value = ''

    // Start 60-second cooldown
    resendCooldown.value = 60
    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) clearInterval(interval)
    }, 1000)
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to resend code.'
  } finally {
    resendLoading.value = false
  }
}
</script>

<style scoped>
/* ---- Card & staggered entrance ---- */
.animate-card-enter {
  animation: card-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes card-enter {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-stagger-1 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
.animate-stagger-2 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
.animate-stagger-3 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
.animate-stagger-4 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both; }
@keyframes stagger-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Floating e-commerce icons ---- */
.float-icon {
  position: absolute;
  bottom: -60px;
  color: var(--color-primary, #6898ED);
  opacity: var(--fi-opacity, 0.2);
  width: var(--fi-size, 24px);
  height: var(--fi-size, 24px);
}
.float-icon svg {
  width: 100%;
  height: 100%;
}

.icon-1  { --fi-size: 28px; --fi-opacity: 0.22; left: 4%;   animation: float-up 8s   linear infinite 0s; }
.icon-2  { --fi-size: 22px; --fi-opacity: 0.18; left: 12%;  animation: float-up 10s  linear infinite 2s; }
.icon-3  { --fi-size: 18px; --fi-opacity: 0.15; left: 20%;  animation: float-up 12s  linear infinite 4.5s; }
.icon-4  { --fi-size: 16px; --fi-opacity: 0.25; left: 28%;  animation: float-up 9s   linear infinite 1s; }
.icon-5  { --fi-size: 26px; --fi-opacity: 0.17; left: 36%;  animation: float-up 11s  linear infinite 3s; }
.icon-6  { --fi-size: 14px; --fi-opacity: 0.2;  left: 44%;  animation: float-up 8.5s linear infinite 5.5s; }
.icon-7  { --fi-size: 24px; --fi-opacity: 0.22; left: 52%;  animation: float-up 10s  linear infinite 0.5s; }
.icon-8  { --fi-size: 20px; --fi-opacity: 0.18; left: 60%;  animation: float-up 9.5s linear infinite 3.5s; }
.icon-9  { --fi-size: 20px; --fi-opacity: 0.15; left: 68%;  animation: float-up 7.5s linear infinite 1.5s; }
.icon-10 { --fi-size: 30px; --fi-opacity: 0.14; left: 76%;  animation: float-up 12s  linear infinite 2.5s; }
.icon-11 { --fi-size: 22px; --fi-opacity: 0.2;  left: 85%;  animation: float-up 8s   linear infinite 4s; }
.icon-12 { --fi-size: 16px; --fi-opacity: 0.18; left: 92%;  animation: float-up 10s  linear infinite 6s; }
.icon-13 { --fi-size: 18px; --fi-opacity: 0.16; left: 8%;   animation: float-up 9s   linear infinite 7s; }
.icon-14 { --fi-size: 20px; --fi-opacity: 0.2;  left: 48%;  animation: float-up 11s  linear infinite 5s; }
.icon-15 { --fi-size: 24px; --fi-opacity: 0.15; left: 64%;  animation: float-up 8.5s linear infinite 6.5s; }
.icon-16 { --fi-size: 26px; --fi-opacity: 0.2;  left: 34%;  animation: float-up 10.5s linear infinite 1.8s; }

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(calc(-100vh - 100px)) rotate(25deg);
    opacity: 0;
  }
}

/* ---- Icon glow ---- */
.animate-icon-glow {
  animation: icon-glow 2.5s ease-in-out infinite;
}
@keyframes icon-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary, #6898ED) 0%, transparent); }
  50% { box-shadow: 0 0 30px 6px color-mix(in srgb, var(--color-primary, #6898ED) 25%, transparent); }
}
</style>
