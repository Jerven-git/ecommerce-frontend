<template>
  <section class="mt-4 border-t border-admin-border pt-4" aria-labelledby="version-history-title">
    <button
      type="button"
      class="history-focus flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-admin-text hover:bg-admin-soft"
      :aria-expanded="open"
      @click="$emit('toggle')"
    >
      <Icon name="heroicons:clock" class="h-4 w-4 text-admin-muted" aria-hidden="true" />
      <span id="version-history-title" class="flex-1 text-xs font-semibold">Published website versions</span>
      <Icon :name="open ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="h-4 w-4 text-admin-muted" aria-hidden="true" />
    </button>

    <div v-if="open" class="mt-2 px-1">
      <p class="px-2 text-[11px] leading-5 text-admin-muted">Preview a previous website version before restoring it.</p>

      <div v-if="loading" class="flex min-h-24 items-center justify-center" role="status">
        <Icon name="heroicons:arrow-path" class="h-4 w-4 animate-spin text-admin-accent motion-reduce:animate-none" aria-hidden="true" />
        <span class="ml-2 text-xs text-admin-muted">Loading versions…</span>
      </div>

      <div v-else-if="error" class="mt-3 rounded-xl bg-admin-danger-soft p-3 text-xs leading-5 text-admin-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if="versions.length === 0" class="mt-3 rounded-xl bg-admin-soft p-4 text-center">
        <Icon name="heroicons:archive-box" class="mx-auto h-5 w-5 text-admin-muted" aria-hidden="true" />
        <p class="mt-2 text-xs font-semibold text-admin-text">No earlier versions yet</p>
        <p class="mt-1 text-[11px] leading-5 text-admin-muted">The currently published website is archived the next time a draft is published.</p>
      </div>

      <div v-else class="mt-3 space-y-1">
        <button
          v-for="version in versions"
          :key="version.id"
          type="button"
          class="history-focus flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left"
          :class="selectedId === version.id ? 'bg-admin-accent-soft text-admin-accent-strong' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text'"
          :aria-pressed="selectedId === version.id"
          @click="$emit('select', version.id)"
        >
          <Icon name="heroicons:document-duplicate" class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="min-w-0 flex-1">
            <span class="block text-xs font-semibold">Saved version</span>
            <span class="block truncate text-[10px]">{{ formatDate(version.created_at) }}</span>
          </span>
          <Icon name="heroicons:eye" class="h-4 w-4 shrink-0" aria-hidden="true" />
        </button>
      </div>

      <div v-if="selectedId" class="mt-3 rounded-xl border border-admin-warning/30 bg-admin-warning-soft p-3">
        <p class="text-xs font-semibold text-admin-text">Historical preview active</p>
        <p class="mt-1 text-[11px] leading-5 text-admin-muted">Editing is paused until you return to the draft or restore this version.</p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button type="button" class="history-focus min-h-11 rounded-xl border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft" @click="$emit('exit')">Return to draft</button>
          <button type="button" class="history-focus min-h-11 rounded-xl bg-admin-accent px-3 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:opacity-50" :disabled="restoring" @click="$emit('restore')">
            {{ restoring ? 'Restoring…' : 'Restore & publish' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WebsiteEditorVersionSummary } from '~/composables/useWebsiteEditorDraft'

defineProps<{
  open: boolean
  loading: boolean
  restoring: boolean
  error: string
  versions: WebsiteEditorVersionSummary[]
  selectedId: number | null
}>()

defineEmits<{
  toggle: []
  select: [versionId: number]
  exit: []
  restore: []
}>()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value))
}
</script>

<style scoped>
.history-focus:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
</style>
