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
            class="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-h-[90vh] flex flex-col overflow-hidden"
            :class="sizeClass"
          >
            <!-- Header (slot or default) -->
            <div v-if="$slots.header || title" class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <slot name="header">
                <div class="min-w-0">
                  <h2 class="text-sm font-semibold text-gray-900 truncate">{{ title }}</h2>
                  <p v-if="subtitle" class="text-xs text-gray-400 truncate mt-0.5">{{ subtitle }}</p>
                </div>
              </slot>
              <button
                v-if="!hideClose"
                type="button"
                @click="$emit('close')"
                class="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  subtitle?: string
  size?: Size
  bodyClass?: string
  hideClose?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}>(), {
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const emit = defineEmits<{ close: [] }>()

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}[props.size]))

// Track mousedown on backdrop so a drag-release over the backdrop doesn't close
// the modal (prevents accidental dismiss when selecting text inside).
const backdropMouseDown = ref(false)
function onBackdropMouseUp() {
  if (backdropMouseDown.value && props.closeOnBackdrop) emit('close')
  backdropMouseDown.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open && props.closeOnEscape) {
    e.preventDefault()
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
