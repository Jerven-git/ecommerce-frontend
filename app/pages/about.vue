<template>
  <div>
    <section class="bg-gradient-to-r from-blue-600 to-green-500 text-white py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-5xl font-bold mb-4">About Us</h1>
        <p class="text-xl">Learn more about our story and mission</p>
      </div>
    </section>

    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        <p class="mb-4">{{ error }}</p>
        <button @click="fetchSiteConfig" class="btn-primary">Retry</button>
      </div>

      <div v-else class="prose prose-lg max-w-none">
        <div class="bg-white rounded-lg shadow-md p-8">
          <p class="text-gray-700 text-lg leading-relaxed whitespace-pre-line break-words">
            {{ siteConfig?.about_content || 'Welcome to our store. We are committed to providing quality products and excellent customer service.' }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div class="text-center p-6 bg-white rounded-lg shadow-md">
            <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Quality Assured</h3>
            <p class="text-gray-600">Every product is carefully selected and tested</p>
          </div>

          <div class="text-center p-6 bg-white rounded-lg shadow-md">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Fast Shipping</h3>
            <p class="text-gray-600">Quick delivery to your doorstep</p>
          </div>

          <div class="text-center p-6 bg-white rounded-lg shadow-md">
            <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Happy Customers</h3>
            <p class="text-gray-600">Dedicated to your satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
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

const siteConfig = ref<SiteConfig | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchSiteConfig = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<SiteConfigResponse>('/site-config', {
      method: 'GET'
    })

    if (response?.data) {
      siteConfig.value = response.data
    }
  } catch (err: any) {
    console.error('Error fetching site config:', err)
    error.value = err?.data?.message || 'Failed to load site configuration.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSiteConfig()
})
</script>