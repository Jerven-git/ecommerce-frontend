<template>
  <div ref="wrapperRef" class="relative min-w-0">
    <button
      ref="triggerRef"
      type="button"
      class="group flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 text-left text-sm shadow-sm transition-[border-color,box-shadow] hover:border-primary-300 focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown.down.prevent="openSelect(1)"
      @keydown.up.prevent="openSelect(-1)"
      @keydown.escape.prevent="closeSelect"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-700"
        :class="isOpen ? 'bg-primary-50 text-primary-700' : ''"
      >
        <Icon :name="selectedOption.icon || 'heroicons:funnel'" class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1 truncate font-medium text-gray-700" :title="selectedOption.label">
        {{ selectedOption.label }}
      </span>
      <Icon
        name="heroicons:chevron-down"
        class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150 motion-reduce:transition-none"
        :class="isOpen ? 'rotate-180 text-primary-600' : ''"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="-translate-y-1 opacity-0 motion-reduce:transform-none"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0 motion-reduce:transform-none"
    >
      <div
        v-if="isOpen"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        tabindex="-1"
        :aria-label="listLabel"
        :aria-activedescendant="activeOptionId"
        class="absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 w-full min-w-[13rem] overflow-y-auto rounded-xl bg-white p-1.5 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.42)] outline-none"
        @keydown="handleListboxKeydown"
      >
        <button
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.value"
          type="button"
          role="option"
          tabindex="-1"
          class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors"
          :class="index === highlightedIndex
            ? 'bg-primary-50 text-primary-800'
            : 'text-gray-700 hover:bg-gray-50'"
          :aria-selected="option.value === modelValue"
          :data-option-index="index"
          @click="selectOption(option.value)"
          @mouseenter="highlightedIndex = index"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            :class="option.value === modelValue ? 'bg-white text-primary-700' : 'bg-gray-50 text-gray-500'"
          >
            <Icon :name="option.icon || 'heroicons:adjustments-horizontal'" class="h-4 w-4" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1 truncate font-medium" :title="option.label">{{ option.label }}</span>
          <Icon
            v-if="option.value === modelValue"
            name="heroicons:check"
            class="h-4 w-4 shrink-0 text-primary-600"
            aria-hidden="true"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: string
  label: string
  icon?: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: FilterOption[]
  ariaLabel: string
  listLabel?: string
}>(), {
  listLabel: 'Filter options',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const instanceId = useId()
const listboxId = `admin-filter-select-${instanceId}`
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const highlightedIndex = ref(0)

const selectedOption = computed(() =>
  props.options.find(option => option.value === props.modelValue)
    ?? props.options[0]
    ?? { value: '', label: 'Select' },
)

const activeOptionId = computed(() =>
  isOpen.value && props.options[highlightedIndex.value]
    ? optionId(highlightedIndex.value)
    : undefined,
)

function optionId(index: number) {
  return `${listboxId}-option-${index}`
}

async function openSelect(direction = 0) {
  if (isOpen.value || !props.options.length) return

  const selectedIndex = props.options.findIndex(option => option.value === props.modelValue)
  const baseIndex = Math.max(selectedIndex, 0)
  highlightedIndex.value = Math.min(
    Math.max(baseIndex + direction, 0),
    props.options.length - 1,
  )
  isOpen.value = true

  await nextTick()
  listboxRef.value?.focus()
  scrollToHighlighted()
}

function closeSelect({ restoreFocus = false } = {}) {
  if (!isOpen.value) return
  isOpen.value = false
  if (restoreFocus) nextTick(() => triggerRef.value?.focus())
}

function toggle() {
  if (isOpen.value) closeSelect()
  else openSelect()
}

function moveHighlight(amount: number) {
  if (!props.options.length) return
  const lastIndex = props.options.length - 1
  highlightedIndex.value = Math.min(Math.max(highlightedIndex.value + amount, 0), lastIndex)
  scrollToHighlighted()
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  closeSelect({ restoreFocus: true })
}

function handleListboxKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveHighlight(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveHighlight(-1)
      break
    case 'Home':
      event.preventDefault()
      highlightedIndex.value = 0
      scrollToHighlighted()
      break
    case 'End':
      event.preventDefault()
      highlightedIndex.value = Math.max(props.options.length - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (props.options[highlightedIndex.value]) {
        selectOption(props.options[highlightedIndex.value].value)
      }
      break
    case 'Escape':
      event.preventDefault()
      closeSelect({ restoreFocus: true })
      break
    case 'Tab':
      closeSelect()
      break
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const option = listboxRef.value?.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex.value}"]`)
    option?.scrollIntoView({ block: 'nearest' })
  })
}

function handleOutsidePointer(event: PointerEvent) {
  if (!wrapperRef.value?.contains(event.target as Node)) closeSelect()
}

watch(() => props.options.length, () => {
  highlightedIndex.value = Math.min(highlightedIndex.value, Math.max(props.options.length - 1, 0))
})

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>
