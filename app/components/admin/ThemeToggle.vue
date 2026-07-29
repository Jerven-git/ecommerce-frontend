<template>
  <button
    type="button"
    class="inline-flex min-h-11 min-w-11 items-center gap-3 rounded-xl px-3 text-admin-muted transition-colors hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
    :class="[
      block ? 'w-full' : '',
      block && showLabel ? 'justify-start text-left' : 'justify-center',
    ]"
    :aria-label="themeToggleLabel"
    :title="showLabel ? undefined : themeToggleLabel"
    @click="toggleTheme"
  >
    <svg v-if="theme === 'dark'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.36-6.36-1.06 1.06M6.7 17.3l-1.06 1.06m12.72 0-1.06-1.06M6.7 6.7 5.64 5.64M16 12a4 4 0 11-8 0 4 4 0 018 0Z" />
    </svg>
    <svg v-else class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.35 15.35A9 9 0 118.65 3.65a7 7 0 0011.7 11.7Z" />
    </svg>
    <span v-if="showLabel" class="text-xs font-medium">
      {{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  showLabel?: boolean
  block?: boolean
}>(), {
  showLabel: false,
  block: false,
})

const { theme, themeToggleLabel, toggleTheme } = useAdminAppearance()
</script>
