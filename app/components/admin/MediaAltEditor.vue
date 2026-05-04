<template>
  <div>
    <button
      v-if="!editing"
      type="button"
      @click="open"
      class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      :title="modelValue ? `Alt text: ${modelValue}` : 'Add alt text for accessibility & SEO'"
    >
      <Icon name="heroicons:tag" class="w-3 h-3" />
      <span>{{ modelValue ? 'Alt set' : 'Add alt' }}</span>
    </button>

    <div v-else class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md p-1.5 shadow-sm">
      <input
        ref="inputRef"
        v-model="draft"
        type="text"
        maxlength="255"
        placeholder="Describe the image…"
        class="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:border-primary-400 outline-none"
        @keydown.enter.prevent="save"
        @keydown.esc.prevent="cancel"
      />
      <button
        type="button"
        @click="save"
        :disabled="saving"
        class="px-2 py-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded disabled:opacity-50"
      >
        {{ saving ? '…' : 'Save' }}
      </button>
      <button
        type="button"
        @click="cancel"
        class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  mediaId: number
  modelValue: string | null | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { $apiFetch } = useNuxtApp()

const editing = ref(false)
const draft = ref('')
const saving = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

async function open() {
  draft.value = props.modelValue ?? ''
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
}

function cancel() {
  editing.value = false
  draft.value = ''
}

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const trimmed = draft.value.trim()
    const value = trimmed.length ? trimmed : null
    await $apiFetch(`/media/${props.mediaId}`, {
      method: 'PATCH',
      body: { alt_text: value },
    })
    emit('update:modelValue', value)
    editing.value = false
  } catch (err) {
    console.error('Failed to save alt text', err)
  } finally {
    saving.value = false
  }
}
</script>
