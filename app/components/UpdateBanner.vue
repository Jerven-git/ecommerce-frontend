<template>
  <Transition name="slide-down">
    <div
      v-if="realtimeStore.newVersionAvailable"
      class="fixed top-0 inset-x-0 z-[9999] bg-blue-600 text-white text-center py-2 px-4 text-sm"
    >
      A new version is available.
      <button
        class="ml-2 underline font-semibold"
        @click="realtimeStore.reload()"
      >
        Refresh now
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const realtimeStore = useRealtimeStore()
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
