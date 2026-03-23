<template>
  <div class="mb-6 flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Search products..."
        class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
      />
    </div>
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        @click="$emit('update:selectedStatus', filter.value)"
        class="px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all"
        :class="selectedStatus === filter.value
          ? filter.activeClass
          : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700'"
      >
        {{ filter.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  selectedStatus: string
  statusFilters: { value: string; label: string; activeClass: string }[]
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedStatus': [value: string]
}>()
</script>
