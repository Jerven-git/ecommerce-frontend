<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
        @mousedown.self="backdropMouseDown = true"
        @mouseup.self="onBackdropMouseUp"
        @mouseup.capture="backdropMouseDown = false"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="open"
            ref="dialogRef"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            :aria-label="title ? undefined : ariaLabel"
            tabindex="-1"
            class="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500 motion-reduce:transition-none"
            :class="sizeClass"
          >
            <!-- Header (slot or default) -->
            <div v-if="$slots.header || title" class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <slot name="header">
                <div class="min-w-0">
                  <h2 :id="titleId" class="text-sm font-semibold text-gray-900 truncate">{{ title }}</h2>
                  <p v-if="subtitle" class="text-xs text-gray-400 truncate mt-0.5">{{ subtitle }}</p>
                </div>
              </slot>
              <button
                v-if="!hideClose"
                type="button"
                @click="$emit('close')"
                class="shrink-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body (scrollable) -->
            <div class="overflow-y-auto flex-1" :class="bodyClass ?? 'p-5'">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-5 py-4 border-t border-gray-100 shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  subtitle?: string
  size?: Size
  bodyClass?: string
  hideClose?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  ariaLabel?: string
}>(), {
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true,
  ariaLabel: 'Dialog',
})

const emit = defineEmits<{ close: [] }>()
const titleId = useId()
const dialogRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null
let previousBodyOverflow = ''

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
}[props.size]))

// Track mousedown on backdrop so a drag-release over the backdrop doesn't close
// the modal (prevents accidental dismiss when selecting text inside).
const backdropMouseDown = ref(false)
function onBackdropMouseUp() {
  if (backdropMouseDown.value && props.closeOnBackdrop) emit('close')
  backdropMouseDown.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return

  if (e.key === 'Escape' && props.closeOnEscape) {
    e.preventDefault()
    emit('close')
    return
  }

  if (e.key !== 'Tab' || !dialogRef.value) return

  const focusable = getFocusableElements()
  if (focusable.length === 0) {
    e.preventDefault()
    dialogRef.value.focus()
    return
  }

  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value) return []
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter(element => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true')
}

async function focusDialog() {
  await nextTick()
  const autofocusTarget = dialogRef.value?.querySelector<HTMLElement>('[autofocus]')
  const target = autofocusTarget ?? getFocusableElements()[0] ?? dialogRef.value
  target?.focus({ preventScroll: true })
}

function restorePageState() {
  document.body.style.overflow = previousBodyOverflow
  if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
  previouslyFocused = null
}

watch(() => props.open, async (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await focusDialog()
  } else if (previouslyFocused) {
    restorePageState()
  }
}, { immediate: true, flush: 'post' })

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (props.open) restorePageState()
})
</script>
