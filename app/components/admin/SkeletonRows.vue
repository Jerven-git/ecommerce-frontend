<template>
  <div class="rounded-2xl border border-admin-border bg-admin-surface p-5 sm:p-6" aria-hidden="true">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="space-y-2">
        <div class="skeleton h-4 w-32"></div>
        <div class="skeleton h-3 w-48 max-w-full"></div>
      </div>
      <div class="skeleton h-9 w-24"></div>
    </div>

    <div class="space-y-4">
      <div
        v-for="item in 5"
        :key="item"
        class="flex items-center gap-4 border-t border-admin-border pt-4 first:border-t-0 first:pt-0"
      >
        <div class="skeleton h-10 w-10 shrink-0 rounded-xl"></div>
        <div class="min-w-0 flex-1 space-y-2">
          <div class="skeleton h-3" :class="item % 2 ? 'w-2/5' : 'w-1/3'"></div>
          <div class="skeleton h-3" :class="item % 2 ? 'w-3/5' : 'w-1/2'"></div>
        </div>
        <div class="skeleton hidden h-6 w-16 shrink-0 sm:block"></div>
      </div>
    </div>
  </div>
</template>
