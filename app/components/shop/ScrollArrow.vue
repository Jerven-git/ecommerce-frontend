<template>
  <Transition name="arrow-fade">
    <button
      v-if="visible"
      @click="$emit('scroll')"
      class="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full bg-white/95 border border-gray-200 shadow-sm text-gray-500 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md hover:text-gray-700 select-none"
      :class="[
        direction === 'left' ? 'left-2 sm:left-3' : 'right-2 sm:right-3',
        small ? 'w-[26px] h-[26px] sm:w-[28px] sm:h-[28px]' : 'w-[30px] h-[30px] sm:w-8 sm:h-8'
      ]"
    >
      <Icon
        :name="direction === 'left' ? 'heroicons:chevron-left' : 'heroicons:chevron-right'"
        :class="small ? 'h-3.5 w-3.5' : 'h-4 w-4'"
        aria-hidden="true"
      />
    </button>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  direction: 'left' | 'right'
  small?: boolean
}>()

defineEmits<{
  scroll: []
}>()
</script>

<style scoped>
.arrow-fade-enter-active,
.arrow-fade-leave-active {
  transition: opacity 0.2s ease;
}
.arrow-fade-enter-from,
.arrow-fade-leave-to {
  opacity: 0;
}
</style>
