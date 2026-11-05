<template>
  <div class="document-actions">
    <button type="button" class="document-action" :disabled="!canSave || saving || publishing" :aria-label="saving ? 'Saving draft' : 'Save draft'" title="Save draft (Ctrl or Command + S)" @click="$emit('save')">
      <Icon :name="saving ? 'heroicons:arrow-path' : 'heroicons:cloud-arrow-up'" class="h-4 w-4" :class="saving ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
      <span>{{ saving ? 'Saving…' : 'Save draft' }}</span>
    </button>
    <button type="button" class="document-action document-publish" :disabled="!canPublish || saving || publishing" :title="publishHint || 'Review website publication'" @click="$emit('publish')">{{ publishing ? 'Preparing…' : 'Publish' }}</button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ canSave: boolean; canPublish: boolean; saving: boolean; publishing: boolean; publishHint?: string }>()
defineEmits<{ save: []; publish: [] }>()
</script>
<style scoped>
.document-actions { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; }
.document-action { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 2.75rem; padding: 0 .75rem; border: 1px solid var(--admin-border); border-radius: .375rem; background: var(--admin-surface); color: var(--admin-text); font-size: .8125rem; font-weight: 600; }
.document-action:hover:not(:disabled) { background: var(--admin-soft); }
.document-publish { background: var(--admin-accent); color: var(--admin-on-accent); border-color: transparent; }
.document-publish:hover:not(:disabled) { background: var(--admin-accent-strong); }
.document-action:disabled { opacity: .5; cursor: not-allowed; }
.document-action:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
@media (min-width: 768px) and (pointer: fine) { .document-action { min-height: 2rem; } }
@media (max-width: 420px) { .document-action { padding: 0 .5rem; font-size: .75rem; } }
</style>
