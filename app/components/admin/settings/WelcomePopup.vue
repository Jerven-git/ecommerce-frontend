<template>
  <section data-guide="settings-welcome-popup" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <Icon name="heroicons:gift" class="w-4 h-4 text-amber-600" aria-hidden="true" />
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Welcome Popup</h2>
        <p class="text-xs text-gray-400">Show a discount popup to first-time visitors</p>
      </div>
    </div>

    <div v-if="settingsOnly" class="p-6 space-y-5">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Linked Discount</label>
        <select
          :value="modelValue.welcome_popup_discount_id || ''"
          class="input-field"
          :disabled="discountsLoading"
          @change="update('welcome_popup_discount_id', Number(($event.target as HTMLSelectElement).value) || null)"
        >
          <option value="">{{ discountsLoading ? 'Loading discounts…' : 'Select a discount…' }}</option>
          <option v-for="d in discounts" :key="d.id" :value="d.id">
            {{ d.code }} — {{ d.type === 'percentage' ? `${d.value}%` : `$${d.value}` }}
            <template v-if="d.min_order_amount > 0"> (min ${{ d.min_order_amount }})</template>
          </option>
        </select>
        <p class="mt-1 text-xs leading-5 text-gray-500">Choose an existing discount used when a visitor subscribes through the popup. Create and manage discount rules from Discounts.</p>
        <div v-if="discountsError" role="alert" class="mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
          <p class="text-xs leading-5 text-red-700">{{ discountsError }}</p>
          <button type="button" class="shrink-0 text-xs font-semibold text-red-700 underline underline-offset-2" @click="loadDiscounts">
            Retry
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-6 space-y-5">
      <!-- Enable toggle -->
      <label class="flex items-center justify-between cursor-pointer">
        <div>
          <p class="text-sm font-medium text-gray-700">Enable Popup</p>
          <p class="text-xs text-gray-400">Show discount popup when visitors first open the site</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="modelValue.welcome_popup_enabled"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="modelValue.welcome_popup_enabled ? 'bg-primary-600' : 'bg-gray-200'"
          @click="update('welcome_popup_enabled', !modelValue.welcome_popup_enabled)"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="modelValue.welcome_popup_enabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </label>

      <!-- Fields (shown when enabled) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="modelValue.welcome_popup_enabled" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Heading</label>
              <input
                :value="modelValue.welcome_popup_heading"
                @input="update('welcome_popup_heading', ($event.target as HTMLInputElement).value)"
                type="text"
                class="input-field"
                placeholder="Get 10% Off"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Linked Discount</label>
              <select
                :value="modelValue.welcome_popup_discount_id || ''"
                @change="update('welcome_popup_discount_id', Number(($event.target as HTMLSelectElement).value) || null)"
                class="input-field"
                :disabled="discountsLoading"
              >
                <option value="">{{ discountsLoading ? 'Loading discounts…' : 'Select a discount…' }}</option>
                <option v-for="d in discounts" :key="d.id" :value="d.id">
                  {{ d.code }} — {{ d.type === 'percentage' ? `${d.value}%` : `$${d.value}` }}
                  <template v-if="d.min_order_amount > 0"> (min ${{ d.min_order_amount }})</template>
                </option>
              </select>
              <p class="text-xs text-gray-400 mt-1">Each subscriber gets a unique single-use code cloned from this discount.</p>
              <div v-if="discountsError" role="alert" class="mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
                <p class="text-xs leading-5 text-red-700">{{ discountsError }}</p>
                <button type="button" class="shrink-0 text-xs font-semibold text-red-700 underline underline-offset-2" @click="loadDiscounts">
                  Retry
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Body Text</label>
            <textarea
              :value="modelValue.welcome_popup_body"
              @input="update('welcome_popup_body', ($event.target as HTMLTextAreaElement).value)"
              rows="2"
              class="input-field resize-none"
              placeholder="Sign up and get a discount code, right here."
            />
          </div>

          <!-- Preview hint -->
          <div class="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:information-circle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p class="text-sm font-medium text-amber-800">How it works</p>
                <p class="text-xs text-amber-600 mt-0.5">The popup shows once per visitor. When they enter their email, a unique single-use discount code is generated and displayed instantly. The code can only be used once at checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Discount {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount: number
  is_active: boolean
}

export interface WelcomePopupForm {
  welcome_popup_enabled: boolean
  welcome_popup_heading: string
  welcome_popup_body: string
  welcome_popup_discount_id: number | null
}

const props = defineProps<{
  modelValue: WelcomePopupForm
  settingsOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WelcomePopupForm]
}>()

const { $apiFetch } = useNuxtApp()
const discounts = ref<Discount[]>([])
const discountsLoading = ref(false)
const discountsError = ref<string | null>(null)

function update(key: keyof WelcomePopupForm, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

async function loadDiscounts() {
  if (discountsLoading.value) return
  discountsLoading.value = true
  discountsError.value = null

  try {
    const res = await $apiFetch<{ data: Discount[] }>('/discounts', {
      params: { is_active: true, per_page: 100 },
    })
    discounts.value = res.data || []
  } catch {
    discountsError.value = 'Discounts could not be loaded. Try again before linking this popup.'
  } finally {
    discountsLoading.value = false
  }
}

onMounted(loadDiscounts)
</script>
