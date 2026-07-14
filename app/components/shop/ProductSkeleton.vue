<template>
  <div class="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
    <div v-for="i in 8" :key="i" class="animate-pulse">
      <div class="aspect-[4/5] rounded-xl bg-gray-200/70" />
      <div class="mx-auto mt-3.5 h-3.5 w-2/3 rounded bg-gray-200/70" />
      <div class="mx-auto mt-2 h-3 w-1/3 rounded bg-gray-200/70" />
    </div>
  </div>
</template>