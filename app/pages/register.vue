<template>
  <div class="min-h-screen flex items-center justify-center bg-primary-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950"></div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/[0.06] rounded-full blur-[150px]"></div>
      <div class="absolute inset-0 opacity-[0.025]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Card -->
      <div
        class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] p-8 sm:p-10"
        :class="mounted ? 'animate-card-enter' : 'opacity-0 translate-y-6'"
      >
        <!-- Header -->
        <div class="text-center mb-8" :class="mounted ? 'animate-stagger-1' : 'opacity-0 translate-y-4'">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 mb-5 ring-1 ring-primary-600/30 animate-icon-glow">
            <Icon name="mdi:storefront-outline" class="w-8 h-8 text-primary-600" />
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Open your store</h2>
          <p class="mt-2 text-sm text-white/50">Create your account — your store activates after checkout</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Store name -->
          <div :class="mounted ? 'animate-stagger-2' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">Store name</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:store-outline" class="w-5 h-5 text-white/30 group-focus-within:text-primary-600 transition-colors duration-200" />
              </div>
              <input
                v-model="form.store_name"
                type="text"
                required
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 focus:bg-white/[0.1] transition-all duration-200"
                placeholder="My Awesome Store"
                @input="handleStoreNameInput"
              />
            </div>
          </div>

          <!-- Store slug (optional) -->
          <div :class="mounted ? 'animate-stagger-3' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">
              Store URL <span class="text-white/35 font-normal">(optional)</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:link-variant" class="w-5 h-5 text-white/30 group-focus-within:text-primary-600 transition-colors duration-200" />
              </div>
              <input
                v-model="form.store_slug"
                type="text"
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 focus:bg-white/[0.1] transition-all duration-200"
                placeholder="my-awesome-store"
                @input="handleSlugInput"
              />
            </div>
            <p class="mt-1.5 text-xs text-white/40">Letters, numbers and hyphens only. Left blank, it's generated from your store name.</p>
          </div>

          <!-- Name -->
          <div :class="mounted ? 'animate-stagger-4' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">Your name</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:account-outline" class="w-5 h-5 text-white/30 group-focus-within:text-primary-600 transition-colors duration-200" />
              </div>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 focus:bg-white/[0.1] transition-all duration-200"
                placeholder="Jane Founder"
                autocomplete="name"
              />
            </div>
          </div>

          <!-- Email -->
          <div :class="mounted ? 'animate-stagger-5' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:email-outline" class="w-5 h-5 text-white/30 group-focus-within:text-primary-600 transition-colors duration-200" />
              </div>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 focus:bg-white/[0.1] transition-all duration-200"
                placeholder="jane@example.com"
                autocomplete="email"
              />
            </div>
          </div>

          <!-- Password -->
          <div :class="mounted ? 'animate-stagger-6' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:lock-outline" class="w-5 h-5 text-white/30 group-focus-within:text-primary-600 transition-colors duration-200" />
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full pl-11 pr-12 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 focus:bg-white/[0.1] transition-all duration-200"
                placeholder="At least 8 characters"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white/60 transition-colors"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Password confirmation -->
          <div :class="mounted ? 'animate-stagger-7' : 'opacity-0 translate-y-4'">
            <label class="block text-sm font-medium text-white/70 mb-1.5">Confirm password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:lock-check-outline" class="w-5 h-5 text-white/30 group-focus-within:text-primary-600 transition-colors duration-200" />
              </div>
              <input
                v-model="form.password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600/50 focus:bg-white/[0.1] transition-all duration-200"
                placeholder="Repeat your password"
                autocomplete="new-password"
              />
            </div>
          </div>

          <!-- Error message -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-2 scale-95"
          >
            <div v-if="error" class="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
              <Icon name="mdi:alert-circle-outline" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-300">{{ error }}</p>
            </div>
          </Transition>

          <!-- Submit button -->
          <div :class="mounted ? 'animate-stagger-8' : 'opacity-0 translate-y-4'">
            <button
              type="submit"
              class="w-full relative flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 active:scale-[0.97] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 disabled:active:scale-100 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:shadow-xl"
              :disabled="loading"
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
              <span>{{ loading ? 'Creating your store...' : 'Create Account' }}</span>
            </button>
            <p class="mt-4 text-center text-sm text-white/40">
              Already have an account?
              <NuxtLink to="/admin/login" class="text-white/70 hover:text-primary-600 transition-colors">Sign in</NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>

    <!-- Success modal -->
    <Teleport to="body">
      <div v-if="registered" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="registered = null"></div>
        <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center animate-card-enter">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
            <Icon name="mdi:check" class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Account created!</h3>
          <p class="mt-2 text-sm text-gray-500">
            Your store <span class="font-semibold text-gray-700">{{ registered?.store?.name }}</span> is ready to go —
            subscribe now to activate it and start selling.
          </p>
          <div class="mt-6 space-y-3">
            <NuxtLink
              to="/subscribe"
              class="block w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Subscribe &amp; activate
            </NuxtLink>
            <button
              class="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="registered = null"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const authStore = useAuthStore()

const form = ref({
  store_name: '',
  store_slug: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const mounted = ref(false)
const registered = ref<{ store: { name: string } } | null>(null)

const slugCharactersOnly = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')

const handleSlugInput = () => {
  form.value.store_slug = slugCharactersOnly(form.value.store_slug)
}

const handleStoreNameInput = () => {
  // Only prefill the slug while the user hasn't customized it already.
  if (!form.value.store_slug) {
    form.value.store_slug = slugCharactersOnly(form.value.store_name)
  }
}

const handleRegister = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    let recaptchaToken: string | undefined = undefined
    try {
      const { execute } = useRecaptcha()
      recaptchaToken = await execute('register')
    } catch {
      // reCAPTCHA not configured — skip it; backend treats it as optional.
    }

    const response = await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
      store_name: form.value.store_name,
      store_slug: form.value.store_slug || undefined,
      ...(recaptchaToken ? { recaptcha_token: recaptchaToken } : {}),
    })

    const serialized = response.data as unknown as { store: { name: string } }
    registered.value = { store: { name: serialized.store?.name || form.value.store_name } }
  } catch (err: any) {
    error.value = err?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})
</script>

<style scoped>
.animate-card-enter {
  animation: card-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes card-enter {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-stagger-1 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
.animate-stagger-2 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
.animate-stagger-3 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
.animate-stagger-4 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
.animate-stagger-5 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
.animate-stagger-6 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
.animate-stagger-7 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
.animate-stagger-8 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
@keyframes stagger-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-icon-glow {
  animation: icon-glow 2.5s ease-in-out infinite;
}
@keyframes icon-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary, #6898ED) 0%, transparent); }
  50% { box-shadow: 0 0 30px 6px color-mix(in srgb, var(--color-primary, #6898ED) 25%, transparent); }
}

.animate-shake { animation: shake 0.4s ease-out; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-5px); }
  30% { transform: translateX(5px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  75% { transform: translateX(-1px); }
}
</style>