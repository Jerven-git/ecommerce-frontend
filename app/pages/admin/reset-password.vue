<template>
  <ApexAuthShell>
    <div class="apex-auth__form-heading">
      <h2>Choose a new password.</h2>
      <p>Set a password for your SSU account, then sign in to your workspace.</p>
    </div>

    <div v-if="success">
      <p class="apex-auth__alert apex-auth__alert--success" role="status"><Icon name="heroicons:check-circle" aria-hidden="true" />Your password has been reset successfully.</p>
      <NuxtLink to="/admin/login" class="apex-auth__button" style="margin-top: 1.25rem">Sign in <Icon name="heroicons:arrow-right" aria-hidden="true" /></NuxtLink>
    </div>

    <form v-else class="apex-auth__form" @submit.prevent="handleSubmit">
      <div class="apex-auth__field">
        <label for="reset-email" class="apex-auth__label">Email address</label>
        <input id="reset-email" :value="email" type="email" autocomplete="email" readonly class="apex-auth__input">
      </div>

      <div class="apex-auth__field">
        <label for="reset-password" class="apex-auth__label">New password</label>
        <div class="apex-auth__input-wrap">
          <input id="reset-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required minlength="8" class="apex-auth__input apex-auth__input--password" placeholder="At least 8 characters">
          <button type="button" class="apex-auth__toggle" :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" aria-hidden="true" /></button>
        </div>
      </div>

      <div class="apex-auth__field">
        <label for="reset-confirm" class="apex-auth__label">Confirm password</label>
        <input id="reset-confirm" v-model="form.password_confirmation" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required minlength="8" class="apex-auth__input" placeholder="Repeat your password">
      </div>

      <p v-if="error" class="apex-auth__alert" role="alert"><Icon name="heroicons:exclamation-circle" aria-hidden="true" />{{ error }}</p>

      <button type="submit" class="apex-auth__button" :disabled="loading">
        {{ loading ? 'Resetting password…' : 'Reset password' }}
        <Icon v-if="!loading" name="heroicons:arrow-right" aria-hidden="true" />
      </button>
    </form>

    <div v-if="!success" class="apex-auth__divider" />
    <NuxtLink v-if="!success" to="/admin/login" class="apex-auth__link"><Icon name="heroicons:arrow-left" aria-hidden="true" /> Back to sign in</NuxtLink>
  </ApexAuthShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { $apiFetch } = useNuxtApp()
const route = useRoute()

const token = route.query.token as string
const email = route.query.email as string

const form = ref({ password: '', password_confirmation: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPassword = ref(false)

onMounted(() => {
  if (!token || !email) navigateTo('/admin/forgot-password')
})

const handleSubmit = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $apiFetch('/reset-password', {
      method: 'POST',
      body: { token, email, password: form.value.password, password_confirmation: form.value.password_confirmation },
    })
    success.value = true
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to reset password. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>
