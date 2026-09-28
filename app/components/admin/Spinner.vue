<template>
  <div
    class="admin-skeleton"
    role="status"
    aria-live="polite"
    :aria-label="label"
  >
    <template v-if="variant === 'dashboard'">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        <div v-for="item in 3" :key="item" class="h-28 rounded-2xl border border-admin-border bg-admin-surface p-5">
          <div class="skeleton h-3 w-20"></div>
          <div class="skeleton mt-5 h-7" :class="item === 1 ? 'w-28' : 'w-20'"></div>
        </div>
      </div>
      <AdminSkeletonRows class="mt-4" />
    </template>

    <template v-else-if="variant === 'form'">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-hidden="true">
        <div class="space-y-6 lg:col-span-2">
          <div v-for="section in 2" :key="section" class="rounded-2xl border border-admin-border bg-admin-surface p-5 sm:p-6">
            <div class="mb-6 space-y-2">
              <div class="skeleton h-4 w-36"></div>
              <div class="skeleton h-3 w-64 max-w-full"></div>
            </div>
            <div class="space-y-5">
              <div v-for="field in 3" :key="field" class="space-y-2">
                <div class="skeleton h-3" :class="field === 2 ? 'w-24' : 'w-32'"></div>
                <div class="skeleton h-11 w-full rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="rounded-2xl border border-admin-border bg-admin-surface p-5">
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton mt-5 aspect-[4/3] w-full rounded-xl"></div>
            <div class="skeleton mt-4 h-10 w-full rounded-xl"></div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="mb-4 flex flex-col gap-3 rounded-2xl border border-admin-border bg-admin-surface p-4 sm:flex-row" aria-hidden="true">
        <div class="skeleton h-10 flex-1 rounded-xl"></div>
        <div class="skeleton h-10 w-full rounded-xl sm:w-36"></div>
      </div>
      <AdminSkeletonRows />
    </template>

    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  variant?: 'dashboard' | 'list' | 'form'
}>(), {
  label: 'Loading…',
  variant: 'list',
})

</script>
