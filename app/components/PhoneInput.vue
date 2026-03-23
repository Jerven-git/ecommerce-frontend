<template>
  <div class="flex">
    <!-- Country selector button -->
    <div ref="wrapperRef" class="relative">
      <button
        type="button"
        @click="toggleDropdown"
        class="flex items-center gap-1.5 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap h-full"
      >
        <Icon v-if="selected" :name="`circle-flags:${selected.code.toLowerCase()}`" class="w-5 h-5 shrink-0" />
        <Icon v-else name="circle-flags:xx" class="w-5 h-5 shrink-0 opacity-40" />
        <span class="text-gray-700 font-medium">{{ selected?.dial || '+?' }}</span>
        <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
      >
        <!-- Search -->
        <div class="p-2 border-b border-gray-100">
          <input
            ref="searchRef"
            v-model="search"
            type="text"
            placeholder="Search country..."
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @keydown="onKeydown"
          />
        </div>

        <!-- List -->
        <ul class="max-h-52 overflow-auto py-1">
          <li
            v-for="(entry, index) in filtered"
            :key="entry.code"
            class="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors"
            :class="index === highlightedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
            @mousedown.prevent="selectEntry(entry)"
            @mouseenter="highlightedIndex = index"
          >
            <Icon :name="`circle-flags:${entry.code.toLowerCase()}`" class="w-5 h-5 shrink-0" />
            <span class="flex-1 truncate">{{ entry.name }}</span>
            <span class="text-xs text-gray-400 font-mono shrink-0">{{ entry.dial }}</span>
          </li>
          <li v-if="filtered.length === 0" class="px-3 py-2 text-sm text-gray-400">No results</li>
        </ul>
      </div>
    </div>

    <!-- Phone input -->
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="tel"
      class="input-field !rounded-l-none flex-1"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useDialCodes, type DialEntry } from '../composables/useDialCodes'

const props = withDefaults(defineProps<{
  modelValue: string
  defaultCountry?: string   // country name, e.g. "Philippines"
  placeholder?: string
}>(), {
  defaultCountry: '',
  placeholder: 'Phone number',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:dialCode': [value: string]
}>()

const { entries, findByName } = useDialCodes()

const selected = ref<DialEntry | undefined>(undefined)
const isOpen = ref(false)
const search = ref('')
const highlightedIndex = ref(0)
const wrapperRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  if (!search.value) return entries
  const q = search.value.toLowerCase()
  return entries.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.dial.includes(q) ||
    e.code.toLowerCase().includes(q)
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    search.value = ''
    highlightedIndex.value = 0
    nextTick(() => searchRef.value?.focus())
  }
}

function selectEntry(entry: DialEntry) {
  selected.value = entry
  isOpen.value = false
  emit('update:dialCode', entry.dial)
}

function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filtered.value.length - 1
      )
      break

    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break

    case 'Enter':
      e.preventDefault()
      const entry = filtered.value[highlightedIndex.value]

      if (entry) {
        selectEntry(entry)
      }
      break

    case 'Escape':
      isOpen.value = false
      break
  }
}

// Close on outside click
function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))

// Set default from prop
watch(() => props.defaultCountry, (name) => {
  if (name && !selected.value) {
    const entry = findByName(name)
    if (entry) {
      selected.value = entry
      emit('update:dialCode', entry.dial)
    }
  }
}, { immediate: true })

watch(filtered, () => { highlightedIndex.value = 0 })
</script>
