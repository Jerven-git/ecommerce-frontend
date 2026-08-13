<template>
  <div class="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)_auto] lg:items-center">
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
        aria-label="Search products"
      />
    </div>

    <CategoryParentSelect
      :model-value="selectedCategoryId"
      :options="categoryOptions"
      empty-label="All categories"
      empty-description="Show products from every category"
      aria-label="Filter products by category"
      search-placeholder="Search categories..."
      list-label="Product category filters"
      trigger-icon="heroicons:funnel"
      empty-icon="heroicons:squares-2x2"
      @update:model-value="$emit('update:selectedCategoryId', $event)"
    />

    <div class="flex flex-wrap gap-2 lg:justify-end">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        type="button"
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
  selectedCategoryId: number | null
  categoryOptions: { id: number; label: string; path: string; depth: number }[]
  statusFilters: { value: string; label: string; activeClass: string }[]
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedStatus': [value: string]
  'update:selectedCategoryId': [value: number | null]
}>()
</script>
