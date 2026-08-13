<template>
  <!-- Parent wrapper for all /admin/* routes -->
  <NuxtPage
    :page-key="route => route.path"
    :transition="{
      name: 'admin-page',
      mode: 'out-in',
    }"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>

<style>
.admin-page-enter-active {
  transition: opacity 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-page-leave-active {
  transition: opacity 90ms ease-in;
}

.admin-page-enter-from,
.admin-page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .admin-page-enter-active,
  .admin-page-leave-active {
    transition: none;
  }
}
</style>
