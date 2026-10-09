<template>
  <div ref="wrapperRef" class="relative min-w-0">
    <button
      ref="triggerRef"
      type="button"
      class="admin-filter-select__trigger group flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-admin-border bg-admin-surface px-2.5 text-left text-sm transition-[border-color,box-shadow] hover:border-admin-accent/40 focus-visible:border-admin-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/20"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown.down.prevent="openSelect(1)"
      @keydown.up.prevent="openSelect(-1)"
      @keydown.escape.prevent="closeSelect()"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-admin-soft text-admin-muted transition-colors group-hover:bg-admin-accent-soft group-hover:text-admin-accent"
        :class="isOpen ? 'bg-admin-accent-soft text-admin-accent' : ''"
      >
        <Icon :name="selectedOption.icon || 'heroicons:funnel'" class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1 truncate font-medium text-admin-text" :title="selectedOption.label">
        {{ selectedOption.label }}
      </span>
      <Icon
        name="heroicons:chevron-down"
        class="h-4 w-4 shrink-0 text-admin-muted transition-transform duration-150 motion-reduce:transition-none"
        :class="isOpen ? 'rotate-180 text-admin-accent' : ''"
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
        class="absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 w-full min-w-[13rem] overflow-y-auto rounded-xl border border-admin-border bg-admin-surface p-1.5 shadow-lg outline-none"
        @keydown="handleListboxKeydown"
      >
        <button
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.value"
          type="button"
          role="option"
          tabindex="-1"
          class="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45"
          :class="index === highlightedIndex && !option.disabled
            ? 'bg-admin-accent-soft text-admin-accent-strong'
            : 'text-admin-text hover:bg-admin-soft'"
          :disabled="option.disabled"
          :aria-selected="option.value === modelValue"
          :aria-disabled="option.disabled || undefined"
          :data-option-index="index"
          @click="selectOption(option)"
          @mouseenter="!option.disabled && (highlightedIndex = index)"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
            :class="option.value === modelValue ? 'bg-admin-surface text-admin-accent' : 'bg-admin-soft text-admin-muted'"
          >
            <Icon :name="option.icon || 'heroicons:adjustments-horizontal'" class="h-4 w-4" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1 truncate font-medium" :title="option.label">{{ option.label }}</span>
          <Icon
            v-if="option.value === modelValue"
            name="heroicons:check"
            class="h-4 w-4 shrink-0 text-admin-accent"
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
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: FilterOption[]
  ariaLabel: string
  listLabel?: string
  describedBy?: string
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
  highlightedIndex.value = findEnabledIndex(baseIndex, direction || 1)
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
  highlightedIndex.value = findEnabledIndex(highlightedIndex.value + amount, amount)
  scrollToHighlighted()
}

function findEnabledIndex(start: number, direction: number) {
  const step = direction < 0 ? -1 : 1
  let index = Math.min(Math.max(start, 0), props.options.length - 1)
  while (props.options[index]?.disabled && index >= 0 && index < props.options.length) index += step
  if (index < 0 || index >= props.options.length) {
    const fallback = props.options.findIndex(option => !option.disabled)
    return fallback >= 0 ? fallback : 0
  }
  return index
}

function selectOption(option: FilterOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
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
      highlightedIndex.value = findEnabledIndex(0, 1)
      scrollToHighlighted()
      break
    case 'End':
      event.preventDefault()
      highlightedIndex.value = findEnabledIndex(Math.max(props.options.length - 1, 0), -1)
      scrollToHighlighted()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (props.options[highlightedIndex.value]) {
        selectOption(props.options[highlightedIndex.value])
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
  highlightedIndex.value = findEnabledIndex(Math.min(highlightedIndex.value, Math.max(props.options.length - 1, 0)), 1)
})

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>
