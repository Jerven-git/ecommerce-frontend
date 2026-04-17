<template>
  <div ref="wrapperRef" class="relative inline-block">
    <button
      type="button"
      @click.stop="toggle"
      class="w-[18px] h-[18px] rounded-full border border-gray-300 bg-white hover:bg-gray-100 inline-flex items-center justify-center text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
      aria-label="Help"
    >
      ?
    </button>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        ref="tooltipRef"
        class="fixed z-50 w-72 p-3 bg-white text-gray-700 text-xs leading-relaxed rounded-xl shadow-lg border border-gray-200 whitespace-pre-line"
        :style="tooltipStyle"
      >
        {{ text }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text: string }>()

const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

const CLOSE_EVENT = 'helptip:close'

function positionTooltip() {
  nextTick(() => {
    if (!wrapperRef.value) return
    const btn = wrapperRef.value.getBoundingClientRect()
    const tipWidth = 256 // w-64 = 16rem = 256px
    const gap = 8

    // Try right side first
    if (btn.right + gap + tipWidth < window.innerWidth) {
      tooltipStyle.value = {
        left: `${btn.right + gap}px`,
        top: `${btn.top + btn.height / 2}px`,
        transform: 'translateY(-50%)',
      }
    } else {
      // Fall back to left side
      tooltipStyle.value = {
        left: `${btn.left - gap - tipWidth}px`,
        top: `${btn.top + btn.height / 2}px`,
        transform: 'translateY(-50%)',
      }
    }
  })
}

function toggle() {
  if (open.value) {
    open.value = false
  } else {
    document.dispatchEvent(new CustomEvent(CLOSE_EVENT))
    open.value = true
    positionTooltip()
  }
}

function handleClose() {
  open.value = false
}

function handleClickOutside() {
  open.value = false
}

if (import.meta.client) {
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener(CLOSE_EVENT, handleClose)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener(CLOSE_EVENT, handleClose)
  })
}
</script>
