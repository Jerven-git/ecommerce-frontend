<template>
  <div class="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6" aria-hidden="true">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="space-y-2">
        <div class="h-4 w-32 rounded-full bg-gray-200"></div>
        <div class="h-3 w-48 max-w-full rounded-full bg-gray-100"></div>
      </div>
      <div class="h-9 w-24 rounded-lg bg-gray-100"></div>
    </div>

    <div class="space-y-4">
      <div
        v-for="item in 5"
        :key="item"
        class="flex items-center gap-4 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
      >
        <div class="h-10 w-10 shrink-0 rounded-xl bg-gray-100"></div>
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-3 rounded-full bg-gray-200" :class="item % 2 ? 'w-2/5' : 'w-1/3'"></div>
          <div class="h-3 rounded-full bg-gray-100" :class="item % 2 ? 'w-3/5' : 'w-1/2'"></div>
        </div>
        <div class="hidden h-6 w-16 shrink-0 rounded-full bg-gray-100 sm:block"></div>
      </div>
    </div>
  </div>
</template>
