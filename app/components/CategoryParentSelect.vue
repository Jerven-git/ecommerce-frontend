<template>
  <div ref="wrapperRef" class="relative min-w-0">
    <button
      ref="triggerRef"
      type="button"
      class="flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-sm shadow-sm transition-[border-color,box-shadow] hover:border-gray-300 focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      :aria-label="ariaLabel"
      @click.stop="toggle"
      @keydown.down.prevent="openPicker"
      @keydown.up.prevent="openPicker"
      @keydown.escape.prevent="closePicker"
    >
      <span class="flex min-w-0 items-center gap-2">
        <Icon :name="triggerIcon" class="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        <span class="truncate font-medium text-gray-700" :title="selectedOption.path">
          {{ selectedOption.label }}
        </span>
      </span>
      <Icon
        name="heroicons:chevron-up-down"
        class="h-4 w-4 shrink-0 text-gray-400 transition-colors"
        :class="isOpen ? 'text-primary-600' : ''"
        aria-hidden="true"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-if="isOpen"
          ref="panelRef"
          class="fixed z-[9999] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          :style="panelStyle"
          @pointerdown.stop
        >
          <div class="border-b border-gray-100 p-2.5">
            <div class="relative">
              <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                ref="searchInputRef"
                v-model="query"
                type="search"
                role="combobox"
                autocomplete="off"
                class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-500 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500"
                :placeholder="searchPlaceholder"
                :aria-expanded="isOpen"
                :aria-controls="listboxId"
                :aria-activedescendant="activeOptionId"
                @keydown="handleSearchKeydown"
              />
            </div>
          </div>

          <div
            :id="listboxId"
            ref="listRef"
            role="listbox"
            :aria-label="listLabel"
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
          >
            <button
              v-for="(option, index) in filteredOptions"
              :id="optionId(index)"
              :key="option.id ?? 'main'"
              type="button"
              role="option"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
              :class="index === highlightedIndex ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-50'"
              :aria-selected="option.id === modelValue"
              :data-option-index="index"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" :class="option.id === null ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-600'">
                <Icon :name="option.id === null ? emptyIcon : 'heroicons:folder'" class="h-4 w-4" aria-hidden="true" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium" :title="option.label">{{ option.label }}</span>
                <span v-if="option.id !== null && option.depth > 0" class="block truncate text-xs text-gray-500" :title="option.path">
                  {{ option.path }}
                </span>
                <span v-else-if="option.id === null" class="block text-xs text-gray-500">{{ emptyDescription }}</span>
              </span>
              <Icon v-if="option.id === modelValue" name="heroicons:check" class="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
            </button>

            <p v-if="filteredOptions.length === 0" class="px-3 py-8 text-center text-sm text-gray-500">
              No categories match “{{ query }}”.
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface CategoryOption {
  id: number
  label: string
  path: string
  depth: number
}

type SelectableOption = Omit<CategoryOption, 'id'> & {
  id: number | null
}

const props = withDefaults(defineProps<{
  modelValue: number | null
  options: CategoryOption[]
  disabled?: boolean
  emptyLabel?: string
  emptyDescription?: string
  ariaLabel?: string
  searchPlaceholder?: string
  listLabel?: string
  triggerIcon?: string
  emptyIcon?: string
}>(), {
  disabled: false,
  emptyLabel: 'Main shop title',
  emptyDescription: 'Top-level category',
  ariaLabel: 'Parent category',
  searchPlaceholder: 'Search parent categories...',
  listLabel: 'Parent categories',
  triggerIcon: 'heroicons:arrow-turn-down-right',
  emptyIcon: 'heroicons:home',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const instanceId = useId()
const listboxId = `category-parent-listbox-${instanceId}`
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const highlightedIndex = ref(0)
const panelStyle = ref<Record<string, string>>({})

const mainOption: SelectableOption = {
  id: null,
  label: props.emptyLabel,
  path: props.emptyLabel,
  depth: 0,
}

const allOptions = computed<SelectableOption[]>(() => [mainOption, ...props.options])

const selectedOption = computed(() =>
  allOptions.value.find(option => option.id === props.modelValue) ?? mainOption,
)

const filteredOptions = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  if (!normalizedQuery) return allOptions.value

  return allOptions.value.filter(option =>
    option.label.toLowerCase().includes(normalizedQuery)
      || option.path.toLowerCase().includes(normalizedQuery),
  )
})

const activeOptionId = computed(() =>
  filteredOptions.value.length ? optionId(highlightedIndex.value) : undefined,
)

function optionId(index: number) {
  return `${listboxId}-option-${index}`
}

function positionPanel() {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const viewportGap = 12
  const width = Math.min(Math.max(rect.width, 360), window.innerWidth - viewportGap * 2)
  const left = Math.min(
    Math.max(rect.left, viewportGap),
    window.innerWidth - width - viewportGap,
  )
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openAbove = spaceBelow < 340 && spaceAbove > spaceBelow
  const availableHeight = openAbove
    ? spaceAbove - viewportGap * 2
    : spaceBelow - viewportGap * 2

  panelStyle.value = {
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${Math.max(Math.min(availableHeight, 360), 120)}px`,
    ...(openAbove
      ? { bottom: `${window.innerHeight - rect.top + 8}px` }
      : { top: `${rect.bottom + 8}px` }),
  }
}

async function openPicker() {
  if (props.disabled || isOpen.value) return

  query.value = ''
  isOpen.value = true
  const selectedIndex = allOptions.value.findIndex(option => option.id === props.modelValue)
  highlightedIndex.value = Math.max(selectedIndex, 0)
  positionPanel()

  await nextTick()
  searchInputRef.value?.focus()
  scrollToHighlighted()
}

function closePicker({ restoreFocus = false } = {}) {
  if (!isOpen.value) return
  isOpen.value = false
  query.value = ''
  if (restoreFocus) nextTick(() => triggerRef.value?.focus())
}

function toggle() {
  if (isOpen.value) closePicker()
  else openPicker()
}

function selectOption(option: SelectableOption) {
  emit('update:modelValue', option.id)
  closePicker({ restoreFocus: true })
}

function moveHighlight(amount: number) {
  if (!filteredOptions.value.length) return
  const lastIndex = filteredOptions.value.length - 1
  highlightedIndex.value = Math.min(Math.max(highlightedIndex.value + amount, 0), lastIndex)
  scrollToHighlighted()
}

function handleSearchKeydown(event: KeyboardEvent) {
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
      highlightedIndex.value = Math.max(filteredOptions.value.length - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter': {
      event.preventDefault()
      const option = filteredOptions.value[highlightedIndex.value]
      if (option) selectOption(option)
      break
    }
    case 'Escape':
      event.preventDefault()
      closePicker({ restoreFocus: true })
      break
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const option = listRef.value?.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex.value}"]`)
    option?.scrollIntoView({ block: 'nearest' })
  })
}

function handleOutsidePointer(event: PointerEvent) {
  const target = event.target as Node
  if (!wrapperRef.value?.contains(target) && !panelRef.value?.contains(target)) {
    closePicker()
  }
}

watch(filteredOptions, () => {
  highlightedIndex.value = 0
})

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointer)
  window.addEventListener('resize', positionPanel)
  window.addEventListener('scroll', positionPanel, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
  window.removeEventListener('resize', positionPanel)
  window.removeEventListener('scroll', positionPanel, true)
})
</script>
