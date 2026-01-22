<template>
  <div>
    <section class="bg-gradient-to-r from-blue-600 to-green-500 text-white py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-5xl font-bold mb-4">Contact Us</h1>
        <p class="text-xl">We'd love to hear from you</p>
      </div>
    </section>

    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 class="text-3xl font-bold mb-6">Get In Touch</h2>
          <p class="text-gray-600 mb-8">Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.</p>

          <div class="space-y-4">
            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 class="font-semibold text-gray-900">Email</h3>
                <p class="text-gray-600">{{ siteConfig?.contact_email || 'contact@store.com' }}</p>
              </div>
            </div>

            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <h3 class="font-semibold text-gray-900">Phone</h3>
                <p class="text-gray-600">{{ siteConfig?.contact_phone || '+1234567890' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label class="block text-gray-700 font-medium mb-2">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input-field"
                placeholder="Your name"
              />
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium mb-2">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium mb-2">Message</label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                class="input-field"
                placeholder="Your message..."
              ></textarea>
            </div>

            <button type="submit" class="btn-primary w-full" :disabled="submitting">
              {{ submitting ? 'Sending...' : 'Send Message' }}
            </button>

            <div v-if="success" class="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
              Thank you! Your message has been received.
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">

const siteConfig = ref<any>(null)
const form = ref({
  name: '',
  email: '',
  message: ''
})
const submitting = ref(false)
const success = ref(false)

const handleSubmit = async () => {
  submitting.value = true
  success.value = false

  await new Promise(resolve => setTimeout(resolve, 1000))

  form.value = { name: '', email: '', message: '' }
  success.value = true
  submitting.value = false

  setTimeout(() => {
    success.value = false
  }, 5000)
}

onMounted(async () => {
  // const { data } = await supabase
  //   .from('site_config')
  //   .select('*')
  //   .limit(1)
  //   .maybeSingle()

  // if (data) {
  //   siteConfig.value = data
  // }
})
</script>
