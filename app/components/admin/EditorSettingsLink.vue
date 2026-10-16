<template>
  <div class="flex items-start gap-3 rounded-xl bg-admin-soft p-3 text-xs leading-5 text-admin-muted">
    <Icon :name="icon" class="mt-0.5 h-4 w-4 shrink-0 text-admin-accent-strong" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p>{{ label }}</p>
      <NuxtLink :to="destination" class="mt-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg font-semibold text-admin-accent-strong underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent">
        {{ action }}
        <Icon name="heroicons:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  to: string
  action?: string
  icon?: string
}>(), {
  action: 'Open settings',
  icon: 'heroicons:cog-6-tooth',
})

const route = useRoute()
const destination = computed(() => {
  const [path, search = ''] = props.to.split('?')
  const query = Object.fromEntries(new URLSearchParams(search))
  return {
    path,
    query: {
      ...query,
      returnTo: route.fullPath,
    },
  }
})
</script>
