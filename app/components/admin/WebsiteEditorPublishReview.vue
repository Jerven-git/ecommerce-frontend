<template>
  <BaseModal
    :open="open"
    title="Review website publication"
    subtitle="Confirm what will change before it reaches customers."
    size="2xl"
    :close-on-backdrop="!loading && !workflowLoading"
    :close-on-escape="!loading && !workflowLoading"
    @close="requestClose"
  >
    <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section aria-labelledby="publish-changes-heading">
        <div class="flex items-center justify-between gap-3">
          <h3 id="publish-changes-heading" class="text-sm font-semibold text-admin-text">Changes in this draft</h3>
          <span class="text-xs font-medium tabular-nums text-admin-muted">{{ changedAreas.length }} {{ changedAreas.length === 1 ? 'area' : 'areas' }}</span>
        </div>
        <ul v-if="changedAreas.length" class="mt-3 divide-y divide-admin-border border-y border-admin-border">
          <li v-for="area in changedAreas" :key="area.id" class="flex items-center gap-3 py-2.5">
            <Icon :name="pageIcon(area.page)" class="h-4 w-4 shrink-0 text-admin-accent-strong" aria-hidden="true" />
            <span class="min-w-0 flex-1 truncate text-xs font-medium text-admin-text">{{ area.label }}</span>
            <button type="button" class="publish-review-focus min-h-11 rounded-lg px-2 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft" @click="$emit('navigate', area.page, area.section)">Review</button>
          </li>
        </ul>
        <p v-else class="mt-3 rounded-xl bg-admin-soft px-3 py-4 text-xs leading-5 text-admin-muted">No differences were found between this draft and the published website.</p>
      </section>

      <section aria-labelledby="publish-readiness-heading">
        <div class="flex items-center justify-between gap-3">
          <h3 id="publish-readiness-heading" class="text-sm font-semibold text-admin-text">Content readiness</h3>
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold" :class="warnings.length ? 'text-admin-warning' : 'text-admin-success'">
            <Icon :name="warnings.length ? 'heroicons:exclamation-triangle' : 'heroicons:check-circle'" class="h-4 w-4" aria-hidden="true" />
            {{ warnings.length ? `${warnings.length} to review` : 'Ready' }}
          </span>
        </div>
        <ul v-if="warnings.length" class="mt-3 divide-y divide-admin-border border-y border-admin-border">
          <li v-for="warning in warnings" :key="warning.id" class="py-3">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:exclamation-circle" class="mt-0.5 h-4 w-4 shrink-0 text-admin-warning" aria-hidden="true" />
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-admin-text">{{ warning.label }}</p>
                <p class="mt-0.5 text-xs leading-5 text-admin-muted">{{ warning.detail }}</p>
              </div>
              <button type="button" class="publish-review-focus min-h-11 shrink-0 rounded-lg px-2 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft" @click="$emit('navigate', warning.page, warning.section)">Fix</button>
            </div>
          </li>
        </ul>
        <p v-else class="mt-3 flex items-start gap-2 rounded-xl bg-admin-success-soft px-3 py-4 text-xs leading-5 text-admin-text">
          <Icon name="heroicons:check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-admin-success" aria-hidden="true" />
          Enabled editable content has the essentials needed for publishing.
        </p>
      </section>
    </div>

    <section class="mt-6 border-t border-admin-border pt-5" aria-labelledby="editorial-workflow-heading">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 id="editorial-workflow-heading" class="text-sm font-semibold text-admin-text">Review and scheduling</h3>
          <p class="mt-1 max-w-2xl text-xs leading-5 text-admin-muted">Optional review adds accountability. Scheduling is available after approval and uses your store timezone.</p>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" :class="workflowStatus.tone">
          <Icon :name="workflowStatus.icon" class="h-4 w-4" aria-hidden="true" />
          {{ workflowStatus.label }}
        </span>
      </div>

      <div v-if="workflowMeta" class="mt-3 flex items-start gap-2 text-xs leading-5 text-admin-muted">
        <Icon name="heroicons:user-circle" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p class="min-w-0 break-words">{{ workflowMeta }}</p>
      </div>
      <div v-if="workflow.note" class="mt-2 flex items-start gap-2 text-xs leading-5 text-admin-text">
        <Icon name="heroicons:chat-bubble-left-ellipsis" class="mt-0.5 h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" />
        <p class="min-w-0 break-words">{{ workflow.note }}</p>
      </div>

      <p v-if="workflowError" class="mt-3 flex items-start gap-2 text-xs leading-5 text-admin-danger" role="alert">
        <Icon name="heroicons:exclamation-circle" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {{ workflowError }}
      </p>

      <template v-if="workflow.status !== 'approved'">
        <label for="website-review-note" class="mt-4 block text-xs font-semibold text-admin-text">
          Review note
          <span class="font-normal text-admin-muted">{{ workflow.status === 'pending' ? '(required to request changes)' : '(optional)' }}</span>
        </label>
        <textarea
          id="website-review-note"
          :value="reviewNote"
          rows="2"
          maxlength="500"
          class="publish-review-focus mt-2 w-full resize-y rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5 text-base leading-5 text-admin-text placeholder:text-admin-muted sm:text-xs"
          :placeholder="workflow.status === 'pending' ? 'Explain the approval or the changes needed.' : 'Add context for the reviewer.'"
          @input="$emit('update:reviewNote', ($event.target as HTMLTextAreaElement).value)"
        />
      </template>

      <div v-if="workflow.status === 'approved' && !workflow.scheduled_publish_at" class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label for="website-scheduled-for" class="text-xs font-semibold text-admin-text">Publish date and time</label>
          <input
            id="website-scheduled-for"
            type="datetime-local"
            :value="scheduledFor"
            class="publish-review-focus mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text sm:text-xs"
            :aria-describedby="'website-schedule-timezone'"
            @input="$emit('update:scheduledFor', ($event.target as HTMLInputElement).value)"
          >
          <p id="website-schedule-timezone" class="mt-1 text-xs text-admin-muted">Store timezone: {{ workflow.timezone }}</p>
        </div>
        <button type="button" class="publish-review-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-admin-accent bg-admin-surface px-4 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft disabled:opacity-50" :disabled="workflowLoading || !scheduledFor" @click="$emit('schedule')">
          <Icon :name="workflowLoading ? 'heroicons:arrow-path' : 'heroicons:calendar-days'" class="h-4 w-4" :class="workflowLoading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
          Schedule
        </button>
      </div>

      <div v-else-if="workflow.scheduled_publish_at" class="mt-4 flex flex-wrap items-center gap-2 border-y border-admin-border py-3">
        <Icon name="heroicons:calendar-days" class="h-4 w-4 shrink-0 text-admin-accent-strong" aria-hidden="true" />
        <p class="min-w-48 flex-1 text-xs leading-5 text-admin-text">
          Scheduled for <span class="font-semibold">{{ formatDate(workflow.scheduled_publish_at, workflow.timezone) }}</span>
          <span v-if="workflow.scheduled_by_name" class="text-admin-muted"> by {{ workflow.scheduled_by_name }}</span>
        </p>
        <button type="button" class="publish-review-focus min-h-11 rounded-lg px-3 text-xs font-semibold text-admin-muted hover:bg-admin-soft disabled:opacity-50" :disabled="workflowLoading" @click="$emit('cancelSchedule')">Cancel schedule</button>
        <p v-if="workflow.scheduled_release_note" class="w-full break-words ps-6 text-xs leading-5 text-admin-muted">Release note: {{ workflow.scheduled_release_note }}</p>
      </div>

      <div v-if="workflow.status !== 'approved'" class="mt-4 flex flex-wrap justify-end gap-2">
        <button v-if="workflow.status === 'pending'" type="button" class="publish-review-focus min-h-11 rounded-xl border border-admin-border bg-admin-surface px-4 text-xs font-semibold text-admin-text hover:bg-admin-soft disabled:opacity-50" :disabled="workflowLoading || !reviewNote.trim()" @click="$emit('requestChanges')">Request changes</button>
        <button v-if="workflow.status === 'pending'" type="button" class="publish-review-focus inline-flex min-h-11 items-center gap-2 rounded-xl border border-admin-accent bg-admin-surface px-4 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft disabled:opacity-50" :disabled="workflowLoading" @click="$emit('approve')">
          <Icon name="heroicons:check" class="h-4 w-4" aria-hidden="true" />
          Approve draft
        </button>
        <button v-else type="button" class="publish-review-focus inline-flex min-h-11 items-center gap-2 rounded-xl border border-admin-accent bg-admin-surface px-4 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft disabled:opacity-50" :disabled="workflowLoading" @click="$emit('requestReview')">
          <Icon :name="workflowLoading ? 'heroicons:arrow-path' : 'heroicons:paper-airplane'" class="h-4 w-4" :class="workflowLoading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
          {{ workflow.status === 'changes_requested' ? 'Request review again' : 'Request review' }}
        </button>
      </div>
    </section>

    <div class="mt-6 border-t border-admin-border pt-5">
      <label for="website-publish-note" class="text-xs font-semibold text-admin-text">Release note <span class="font-normal text-admin-muted">(optional)</span></label>
      <textarea
        id="website-publish-note"
        :value="releaseNote"
        rows="3"
        maxlength="500"
        class="publish-review-focus mt-2 w-full resize-y rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5 text-base leading-5 text-admin-text placeholder:text-admin-muted sm:text-xs"
        placeholder="Example: Updated the homepage message and spring announcement."
        @input="$emit('update:releaseNote', ($event.target as HTMLTextAreaElement).value)"
      />
      <p class="mt-1 text-right text-xs tabular-nums text-admin-muted">{{ releaseNote.length }}/500</p>
      <p v-if="workflow.status === 'approved' && !workflow.scheduled_publish_at" class="mt-1 text-xs leading-5 text-admin-muted">This note is also saved with a scheduled publication.</p>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="publish-review-focus min-h-11 rounded-xl border border-admin-border bg-admin-surface px-4 text-xs font-semibold text-admin-text hover:bg-admin-soft disabled:opacity-50" :disabled="loading || workflowLoading" @click="requestClose">Continue editing</button>
        <button type="button" class="publish-review-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-admin-accent px-4 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:opacity-50" :disabled="loading || changedAreas.length === 0" @click="$emit('publish')">
          <Icon :name="loading ? 'heroicons:arrow-path' : 'heroicons:rocket-launch'" class="h-4 w-4" :class="loading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
          {{ loading ? 'Publishing…' : (warnings.length ? 'Publish with warnings' : 'Publish website') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { WebsiteEditorWorkflow } from '~/composables/useWebsiteEditorDraft'
import type { WebsiteEditorChangedArea, WebsiteEditorReadinessWarning } from '~/utils/websiteEditorPublishing'
import { websiteEditorPage, type WebsiteEditorPageId } from '~/utils/websiteEditorPages'

const props = defineProps<{
  open: boolean
  changedAreas: WebsiteEditorChangedArea[]
  warnings: WebsiteEditorReadinessWarning[]
  releaseNote: string
  loading: boolean
  workflow: WebsiteEditorWorkflow
  workflowLoading: boolean
  workflowError: string
  reviewNote: string
  scheduledFor: string
}>()

const emit = defineEmits<{
  close: []
  publish: []
  navigate: [page: WebsiteEditorPageId, section: string]
  'update:releaseNote': [value: string]
  'update:reviewNote': [value: string]
  'update:scheduledFor': [value: string]
  requestReview: []
  approve: []
  requestChanges: []
  schedule: []
  cancelSchedule: []
}>()

const pageIcon = (page: WebsiteEditorPageId) => websiteEditorPage(page).icon
const workflowStatus = computed(() => ({
  draft: { label: 'Not reviewed', icon: 'heroicons:pencil-square', tone: 'bg-admin-soft text-admin-muted' },
  pending: { label: 'Review requested', icon: 'heroicons:clock', tone: 'bg-admin-warning-soft text-admin-warning' },
  approved: { label: props.workflow.scheduled_publish_at ? 'Approved and scheduled' : 'Approved', icon: 'heroicons:check-circle', tone: 'bg-admin-success-soft text-admin-success' },
  changes_requested: { label: 'Changes requested', icon: 'heroicons:arrow-uturn-left', tone: 'bg-admin-warning-soft text-admin-warning' },
}[props.workflow.status]))
const workflowMeta = computed(() => {
  if (props.workflow.status === 'pending' && props.workflow.requested_at) {
    return `Requested${props.workflow.requested_by_name ? ` by ${props.workflow.requested_by_name}` : ''} ${formatDate(props.workflow.requested_at)}`
  }
  if (['approved', 'changes_requested'].includes(props.workflow.status) && props.workflow.reviewed_at) {
    const verb = props.workflow.status === 'approved' ? 'Approved' : 'Returned'
    return `${verb}${props.workflow.reviewed_by_name ? ` by ${props.workflow.reviewed_by_name}` : ''} ${formatDate(props.workflow.reviewed_at)}`
  }
  return ''
})
function formatDate(value: string, timeZone?: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'an unavailable time'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...(timeZone ? { timeZone } : {}),
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }
}
const requestClose = () => {
  if (!props.loading && !props.workflowLoading) emit('close')
}
</script>

<style scoped>
.publish-review-focus:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
</style>
