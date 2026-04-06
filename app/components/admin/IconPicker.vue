<template>
  <div class="relative" ref="triggerRef">
    <button
      type="button"
      class="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50/40 transition-colors shrink-0"
      :class="open ? 'border-primary-400 bg-primary-50' : 'bg-gray-50'"
      @click="toggle"
    >
      <Icon :name="modelValue || DEFAULT_ICON" class="w-4.5 h-4.5 text-gray-600" />
    </button>

    <Teleport to="body">
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
          ref="dropdownRef"
          class="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-[280px]"
          :style="dropdownStyle"
        >
          <div class="grid grid-cols-6 gap-1">
            <button
              v-for="icon in ICON_SET"
              :key="icon.name"
              type="button"
              class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
              :class="modelValue === icon.name ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-500'"
              :title="icon.label"
              @click="select(icon.name)"
            >
              <Icon :name="icon.name" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ICON_SET, DEFAULT_ICON } from '~/composables/useHighlightIcons'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) nextTick(updatePosition)
}

function select(name: string) {
  emit('update:modelValue', name)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    triggerRef.value && !triggerRef.value.contains(target) &&
    (!dropdownRef.value || !dropdownRef.value.contains(target))
  ) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>
