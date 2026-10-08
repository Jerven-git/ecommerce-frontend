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
    <Icon :name="theme === 'dark' ? 'heroicons:sun' : 'heroicons:moon'" class="h-5 w-5 shrink-0" aria-hidden="true" />
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
