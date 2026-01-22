<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Site Settings</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="card text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="loadSettings" class="btn-primary">Retry</button>
      </div>

      <div v-else class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-bold mb-6">General Settings</h2>
          <form @submit.prevent="saveSettings" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Store Name</label>
              <input v-model="form.site_name" type="text" class="input-field" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Logo URL (optional)</label>
              <input v-model="form.logo_url" type="url" class="input-field" placeholder="https://example.com/logo.png" />
            </div>
          </form>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold mb-6">Brand Colors</h2>
          <form @submit.prevent="saveSettings" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Primary Color</label>
                <div class="flex items-center space-x-3">
                  <input v-model="form.primary_color" type="color" class="h-12 w-20 rounded cursor-pointer" />
                  <input v-model="form.primary_color" type="text" class="input-field flex-1" placeholder="#2563eb" />
                </div>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2">Secondary Color</label>
                <div class="flex items-center space-x-3">
                  <input v-model="form.secondary_color" type="color" class="h-12 w-20 rounded cursor-pointer" />
                  <input v-model="form.secondary_color" type="text" class="input-field flex-1" placeholder="#10b981" />
                </div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">Color Preview</p>
              <div class="flex space-x-4">
                <div class="flex-1 h-20 rounded-lg flex items-center justify-center text-white font-semibold" :style="{ backgroundColor: form.primary_color }">
                  Primary
                </div>
                <div class="flex-1 h-20 rounded-lg flex items-center justify-center text-white font-semibold" :style="{ backgroundColor: form.secondary_color }">
                  Secondary
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold mb-6">Homepage Content</h2>
          <form @submit.prevent="saveSettings" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Hero Title</label>
              <input v-model="form.hero_title" type="text" class="input-field" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Hero Subtitle</label>
              <input v-model="form.hero_subtitle" type="text" class="input-field" />
            </div>
          </form>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold mb-6">About Page Content</h2>
          <form @submit.prevent="saveSettings" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">About Content</label>
              <textarea v-model="form.about_content" rows="6" class="input-field"></textarea>
            </div>
          </form>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold mb-6">Contact Information</h2>
          <form @submit.prevent="saveSettings" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Contact Email</label>
              <input v-model="form.contact_email" type="email" class="input-field" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Contact Phone</label>
              <input v-model="form.contact_phone" type="tel" class="input-field" />
            </div>
          </form>
        </div>

        <div class="flex justify-end space-x-3">
          <button @click="loadSettings" class="btn-secondary">Reset</button>
          <button @click="saveSettings" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>

        <div v-if="success" class="card bg-green-50 border-green-200">
          <p class="text-green-800 font-medium">Settings saved successfully!</p>
        </div>

        <div v-if="saveError" class="card bg-red-50 border-red-200">
          <p class="text-red-800 font-medium">{{ saveError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface SiteConfig {
  id: number
  site_name: string
  primary_color: string
  secondary_color: string
  logo_url: string
  hero_title: string
  hero_subtitle: string
  about_content: string
  contact_email: string
  contact_phone: string
  updated_at: string
}

interface SiteConfigResponse {
  data: SiteConfig
}

const { $apiFetch } = useNuxtApp()

const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const saveError = ref<string | null>(null)
const configId = ref<number | null>(null)

const form = ref({
  site_name: '',
  primary_color: '#2563eb',
  secondary_color: '#10b981',
  logo_url: '',
  hero_title: '',
  hero_subtitle: '',
  about_content: '',
  contact_email: '',
  contact_phone: ''
})

const loadSettings = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<SiteConfigResponse>('/site-config', {
      method: 'GET'
    })

    if (response?.data) {
      configId.value = response.data.id
      form.value = {
        site_name: response.data.site_name || '',
        primary_color: response.data.primary_color || '#2563eb',
        secondary_color: response.data.secondary_color || '#10b981',
        logo_url: response.data.logo_url || '',
        hero_title: response.data.hero_title || '',
        hero_subtitle: response.data.hero_subtitle || '',
        about_content: response.data.about_content || '',
        contact_email: response.data.contact_email || '',
        contact_phone: response.data.contact_phone || ''
      }
    }
  } catch (err: any) {
    console.error('Error loading settings:', err)
    error.value = err?.data?.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  success.value = false
  saveError.value = null

  try {
    await $apiFetch('/site-config', {
      method: 'PATCH',
      body: form.value
    })

    success.value = true

    setTimeout(() => {
      success.value = false
    }, 3000)

    await loadSettings()
  } catch (err: any) {
    console.error('Error saving settings:', err)
    saveError.value = err?.data?.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>