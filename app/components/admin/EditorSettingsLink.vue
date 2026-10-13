<template>
  <div class="rounded-xl bg-admin-soft p-3 text-[11px] leading-5 text-admin-muted">
    <p>{{ label }}</p>
    <NuxtLink :to="to" class="mt-2 inline-flex min-h-11 items-center font-semibold text-admin-accent-strong underline underline-offset-4">Open settings</NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; to: string }>()
</script>
