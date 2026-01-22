<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-500 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Replace .card with actual Tailwind classes -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p class="mt-2 text-gray-600">Sign in to access the dashboard</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Email</label>
            <!-- Replace .input-field with actual Tailwind classes -->
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <!-- Replace .btn-primary with actual Tailwind classes -->
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>

          <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {{ error }}
          </div>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Store
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

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value.email, form.value.password)
    navigateTo('/admin')
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials or not authorized as admin'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAdmin) {
    navigateTo('/admin')
  }
})
</script>