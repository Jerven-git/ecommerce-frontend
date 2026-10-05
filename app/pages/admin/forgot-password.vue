<template>
  <ApexAuthShell>
    <div class="apex-auth__form-heading">
      <h2>Reset your password.</h2>
      <p>Enter your account email and we’ll send you a link to choose a new password.</p>
    </div>

    <p v-if="sent" class="apex-auth__alert apex-auth__alert--success" role="status"><Icon name="heroicons:check-circle" aria-hidden="true" />{{ message }}</p>

    <form v-else class="apex-auth__form" @submit.prevent="handleSubmit">
      <div class="apex-auth__field">
        <label for="forgot-email" class="apex-auth__label">Email address</label>
        <input id="forgot-email" v-model="email" type="email" autocomplete="email" required class="apex-auth__input" placeholder="you@example.com">
      </div>

      <p v-if="error" class="apex-auth__alert" role="alert"><Icon name="heroicons:exclamation-circle" aria-hidden="true" />{{ error }}</p>

      <button type="submit" class="apex-auth__button" :disabled="loading">
        {{ loading ? 'Sending link…' : 'Send reset link' }}
        <Icon v-if="!loading" name="heroicons:arrow-right" aria-hidden="true" />
      </button>
    </form>

    <div class="apex-auth__divider" />
    <NuxtLink to="/admin/login" class="apex-auth__link"><Icon name="heroicons:arrow-left" aria-hidden="true" /> Back to sign in</NuxtLink>
  </ApexAuthShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { $apiFetch } = useNuxtApp()

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)
const message = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await $apiFetch<{ message: string }>('/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    message.value = res.message || 'If your email is in our system, you will receive a reset link.'
    sent.value = true
  } catch (err: any) {
    error.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
