<template>
  <NuxtPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin'],
})
</script>
