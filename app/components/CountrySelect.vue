<template>
  <div ref="wrapperRef" class="relative">
    <input
      ref="inputRef"
      v-model="search"
      type="text"
      :placeholder="placeholder"
      :required="required"
      class="input-field"
      autocomplete="off"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <!-- Chevron icon -->
    <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </span>

    <!-- Dropdown -->
    <ul
      v-if="isOpen && filtered.length > 0"
      class="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1"
    >
      <li
        v-for="(country, index) in filtered"
        :key="country.code"
        class="px-4 py-2 text-sm cursor-pointer transition-colors"
        :class="index === highlightedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
        @mousedown.prevent="select(country)"
        @mouseenter="highlightedIndex = index"
      >
        {{ country.name }}
      </li>
    </ul>

    <!-- Hint / No results -->
    <div
      v-if="isOpen && filtered.length === 0"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-3 px-4"
    >
      <p class="text-sm text-gray-400">{{ !search ? 'Start typing to search...' : 'No countries found' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useCountries } from '../composables/useCountries'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  required?: boolean
}>(), {
  placeholder: 'Select country',
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { countries } = useCountries()

const inputRef = ref<HTMLInputElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const search = ref('')
const highlightedIndex = ref(0)

// Sync search text with modelValue on mount and when modelValue changes externally
watch(() => props.modelValue, (val) => {
  if (!isOpen.value) {
    search.value = val || ''
  }
}, { immediate: true })

const filtered = computed(() => {
  if (!search.value) return []
  const q = search.value.toLowerCase()
  return countries.filter(c => c.name.toLowerCase().includes(q))
})

function onFocus() {
  isOpen.value = true
  search.value = ''
  highlightedIndex.value = 0
}

function onBlur() {
  // Delay to allow mousedown on dropdown items to fire first
  setTimeout(() => {
    isOpen.value = false
    // Restore display to current value
    search.value = props.modelValue || ''
  }, 150)
}

function select(country: { code: string; name: string }) {
  emit('update:modelValue', country.name)
  search.value = country.name
  isOpen.value = false
  inputRef.value?.blur()
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      isOpen.value = true
      e.preventDefault()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filtered.value.length - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
      e.preventDefault()
      const country = filtered.value[highlightedIndex.value]
      if (country) {
        select(country)
      }
      break
    case 'Escape':
      isOpen.value = false
      search.value = props.modelValue || ''
      inputRef.value?.blur()
      break
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const list = wrapperRef.value?.querySelector('ul')
    const item = list?.children[highlightedIndex.value] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  })
}

// Reset highlighted index when filter changes
watch(filtered, () => {
  highlightedIndex.value = 0
})
</script>
