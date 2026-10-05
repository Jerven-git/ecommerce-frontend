<template>
  <ApexAuthShell>
    <div v-if="registered" class="apex-auth__success">
      <span class="apex-auth__success-icon"><Icon name="heroicons:check" aria-hidden="true" /></span>
      <h2 ref="successHeading" tabindex="-1">Account created.</h2>
      <p>Your store <strong>{{ registered.store.name }}</strong> is ready to set up. Sign in, choose a plan, and complete checkout to activate it.</p>
      <NuxtLink to="/admin/login?redirect=/subscribe" class="apex-auth__button">Sign in to choose a plan <Icon name="heroicons:arrow-right" aria-hidden="true" /></NuxtLink>
      <p class="apex-auth__secondary">You can also return later and sign in with your new account.</p>
    </div>

    <div v-else class="apex-auth__form-heading">
      <h2>Create your store.</h2>
      <p>Set up your account now. Your store activates after you choose a plan and complete checkout.</p>
    </div>

    <form v-if="!registered" class="apex-auth__form" @submit.prevent="handleRegister">
      <div class="apex-auth__field">
        <label for="register-store-name" class="apex-auth__label">Store name</label>
        <input id="register-store-name" v-model="form.store_name" type="text" required class="apex-auth__input" placeholder="Your store name" @input="handleStoreNameInput">
      </div>

      <div class="apex-auth__field">
        <label for="register-store-slug" class="apex-auth__label">Store URL <span class="apex-auth__hint">(optional)</span></label>
        <input id="register-store-slug" v-model="form.store_slug" type="text" class="apex-auth__input" placeholder="your-store" aria-describedby="register-slug-hint" @input="handleSlugInput">
        <p id="register-slug-hint" class="apex-auth__hint">Letters, numbers and hyphens only. Leave blank to generate it from your store name.</p>
      </div>

      <div class="apex-auth__form-grid">
        <div class="apex-auth__field">
          <label for="register-name" class="apex-auth__label">Your name</label>
          <input id="register-name" v-model="form.name" type="text" autocomplete="name" required class="apex-auth__input" placeholder="Your name">
        </div>
        <div class="apex-auth__field">
          <label for="register-email" class="apex-auth__label">Email address</label>
          <input id="register-email" v-model="form.email" type="email" autocomplete="email" required class="apex-auth__input" placeholder="you@example.com">
        </div>
      </div>

      <div class="apex-auth__form-grid">
        <div class="apex-auth__field">
          <label for="register-password" class="apex-auth__label">Password</label>
          <div class="apex-auth__input-wrap">
            <input id="register-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required minlength="8" class="apex-auth__input apex-auth__input--password" placeholder="At least 8 characters">
            <button type="button" class="apex-auth__toggle" :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" aria-hidden="true" /></button>
          </div>
        </div>
        <div class="apex-auth__field">
          <label for="register-confirm" class="apex-auth__label">Confirm password</label>
          <input id="register-confirm" v-model="form.password_confirmation" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required class="apex-auth__input" placeholder="Repeat your password">
        </div>
      </div>

      <p v-if="error" class="apex-auth__alert" role="alert"><Icon name="heroicons:exclamation-circle" aria-hidden="true" />{{ error }}</p>

      <button type="submit" class="apex-auth__button" :disabled="loading">
        {{ loading ? 'Creating your store…' : 'Create account' }}
        <Icon v-if="!loading" name="heroicons:arrow-right" aria-hidden="true" />
      </button>
    </form>

    <p v-if="!registered" class="apex-auth__secondary">Already have an account? <NuxtLink to="/admin/login" class="apex-auth__link">Sign in</NuxtLink></p>
  </ApexAuthShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

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
const registered = ref<{ store: { name: string } } | null>(null)
const successHeading = ref<HTMLElement | null>(null)

watch(registered, async (value) => {
  if (value) {
    await nextTick()
    successHeading.value?.focus()
  }
})

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
</script>
