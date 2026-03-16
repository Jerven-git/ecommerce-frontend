<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div class="h-48 bg-gray-100" />
      <div class="p-4 space-y-3">
        <div class="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div class="h-3 bg-gray-100 rounded-lg w-full" />
        <div class="h-3 bg-gray-100 rounded-lg w-2/3" />
        <div class="flex items-center justify-between mt-2">
          <div class="h-5 bg-gray-100 rounded-lg w-16" />
          <div class="h-8 bg-gray-100 rounded-lg w-24" />
        </div>
      </div>
    </div>
  </div>
</template>