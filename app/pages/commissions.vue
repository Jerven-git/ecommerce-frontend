<template>
  <div>
    <section class="bg-gradient-to-br from-gray-50 to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block text-xs font-semibold tracking-widest uppercase text-primary-600 mb-3">
          Custom Artwork
        </span>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          Commission a piece
        </h1>
        <p class="mt-4 text-base text-gray-500 max-w-xl mx-auto">
          Tell us about the artwork you have in mind. We'll respond within 48 hours with availability and pricing.
        </p>
      </div>
    </section>

    <section class="py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <div
          v-if="submitted"
          class="bg-white rounded-2xl border border-green-100 shadow-sm p-8 text-center"
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900">Request submitted</h2>
          <p class="mt-2 text-sm text-gray-500">
            Thanks {{ submittedName }}. We've received your commission brief and will be in touch at <span class="font-medium text-gray-700">{{ submittedEmail }}</span> within 48 hours.
          </p>
          <button
            type="button"
            class="mt-6 inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            @click="resetForm"
          >Submit another</button>
        </div>

        <form
          v-else
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
          @submit.prevent="onSubmit"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Your name <span class="text-red-500">*</span></label>
              <input
                v-model="form.customer_name"
                type="text"
                maxlength="255"
                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:border-primary-400 focus:ring-2 outline-none"
                :class="formAttempted && fieldErrors.customer_name ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100'"
              />
              <p v-if="formAttempted && fieldErrors.customer_name" class="mt-1 text-xs text-red-600">{{ fieldErrors.customer_name }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
              <input
                v-model="form.customer_email"
                type="email"
                maxlength="255"
                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:border-primary-400 focus:ring-2 outline-none"
                :class="formAttempted && fieldErrors.customer_email ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100'"
              />
              <p v-if="formAttempted && fieldErrors.customer_email" class="mt-1 text-xs text-red-600">{{ fieldErrors.customer_email }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Phone <span class="text-gray-400 font-normal">(optional)</span></label>
            <input
              v-model="form.customer_phone"
              type="tel"
              maxlength="50"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Short title for the piece <span class="text-red-500">*</span></label>
            <input
              v-model="form.title"
              type="text"
              maxlength="255"
              placeholder="e.g. Mountain landscape at sunrise"
              class="w-full px-3 py-2.5 text-sm border rounded-lg focus:border-primary-400 focus:ring-2 outline-none"
              :class="formAttempted && fieldErrors.title ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100'"
            />
            <p v-if="formAttempted && fieldErrors.title" class="mt-1 text-xs text-red-600">{{ fieldErrors.title }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Describe the piece you're after <span class="text-red-500">*</span></label>
            <textarea
              v-model="form.description"
              rows="5"
              maxlength="5000"
              placeholder="Subject, mood, colors, anything that matters to you…"
              class="w-full px-3 py-2.5 text-sm border rounded-lg focus:border-primary-400 focus:ring-2 outline-none resize-y"
              :class="formAttempted && fieldErrors.description ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100'"
            ></textarea>
            <p v-if="formAttempted && fieldErrors.description" class="mt-1 text-xs text-red-600">{{ fieldErrors.description }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Budget range</label>
              <select
                v-model="form.budget_range"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              >
                <option value="">Not sure yet</option>
                <option>Under $500</option>
                <option>$500–$1000</option>
                <option>$1000–$2500</option>
                <option>$2500+</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Preferred medium</label>
              <input
                v-model="form.preferred_medium"
                type="text"
                maxlength="100"
                placeholder="Oil, watercolor…"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Preferred size</label>
              <input
                v-model="form.preferred_size"
                type="text"
                maxlength="100"
                placeholder="A2, 60×90cm…"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Deadline <span class="text-gray-400 font-normal">(optional)</span></label>
              <input
                v-model="form.deadline"
                type="date"
                :min="minDeadline"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Reference image <span class="text-gray-400 font-normal">(optional, max 5MB)</span></label>
              <input
                type="file"
                accept="image/*"
                class="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                @change="onFileChange"
              />
              <p v-if="referenceFile" class="mt-1 text-[11px] text-gray-500">{{ referenceFile.name }} · {{ Math.round(referenceFile.size / 1024) }} KB</p>
            </div>
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{{ error }}</div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <span v-if="submitting">Sending…</span>
              <span v-else>Send commission request</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { $apiFetch } = useNuxtApp()

useHead({ title: 'Commissions' })

const form = ref({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  title: '',
  description: '',
  budget_range: '',
  preferred_medium: '',
  preferred_size: '',
  deadline: '',
})

const referenceFile = ref<File | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)
const submitted = ref(false)
const submittedName = ref('')
const submittedEmail = ref('')

const formAttempted = ref(false)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const fieldErrors = computed(() => ({
  customer_name: !form.value.customer_name.trim() ? 'Your name is required.' : null,
  customer_email: !form.value.customer_email.trim()
    ? 'Email is required.'
    : !isValidEmail(form.value.customer_email) ? 'Enter a valid email address.' : null,
  title: !form.value.title.trim() ? 'A short title is required.' : null,
  description: !form.value.description.trim() ? 'Please describe the piece you have in mind.' : null,
}))

const hasFieldErrors = computed(() => Object.values(fieldErrors.value).some(Boolean))

const minDeadline = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

function onFileChange(e: Event): void {
  const target = e.target as HTMLInputElement
  referenceFile.value = target.files?.[0] ?? null
}

async function onSubmit(): Promise<void> {
  formAttempted.value = true
  if (hasFieldErrors.value || submitting.value) return
  submitting.value = true
  error.value = null

  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => {
      if (v !== '' && v !== null) {
        fd.append(k, String(v))
      }
    })
    if (referenceFile.value) {
      fd.append('reference_image', referenceFile.value)
    }

    await $apiFetch('/commission-requests', {
      method: 'POST',
      body: fd,
    })

    submittedName.value = form.value.customer_name
    submittedEmail.value = form.value.customer_email
    submitted.value = true
  } catch (err: any) {
    error.value = err?.data?.message
      || (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null)
      || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

function resetForm(): void {
  form.value = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    title: '',
    description: '',
    budget_range: '',
    preferred_medium: '',
    preferred_size: '',
    deadline: '',
  }
  referenceFile.value = null
  submitted.value = false
  error.value = null
}
</script>
