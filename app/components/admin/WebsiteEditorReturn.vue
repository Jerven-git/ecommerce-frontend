<template>
  <div v-if="returnTo" class="mb-4 flex items-center justify-between gap-3 rounded-xl bg-admin-info-soft px-3 py-2 text-xs text-admin-muted">
    <p class="min-w-0 truncate">You opened this screen from Website Editor.</p>
    <NuxtLink :to="returnTo" class="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 font-semibold text-admin-accent-strong hover:bg-admin-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent">
      <Icon name="heroicons:arrow-left" class="h-3.5 w-3.5" aria-hidden="true" />
      Back to editor
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const returnTo = computed(() => {
  const requested = typeof route.query.returnTo === 'string' ? route.query.returnTo : ''
  return requested === '/admin/website-editor' || requested.startsWith('/admin/website-editor?') ? requested : ''
})
</script>
