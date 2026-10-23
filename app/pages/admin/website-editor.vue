<template>
  <div data-website-editor-shell class="website-editor-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-admin-canvas text-admin-text">
    <header class="z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-admin-border bg-admin-surface px-2 sm:px-3">
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <NuxtLink
          to="/admin"
          class="editor-focus flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-admin-muted hover:bg-admin-soft hover:text-admin-text"
          aria-label="Back to admin dashboard"
          title="Back to admin dashboard"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" aria-hidden="true" />
        </NuxtLink>
        <span class="hidden h-7 w-px bg-admin-border sm:block" aria-hidden="true" />
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-accent-soft text-admin-accent-strong md:flex">
          <Icon name="heroicons:paint-brush" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div class="min-w-0 sm:max-w-none">
          <h1 class="truncate text-sm font-semibold text-admin-text" aria-label="Website Editor">
            <span class="sm:hidden">Editor</span>
            <span class="hidden sm:inline">Website Editor</span>
          </h1>
          <p class="hidden truncate text-xs text-admin-muted md:block">Private storefront customizer</p>
        </div>
      </div>

      <div class="flex min-w-0 items-center justify-end gap-1 overflow-x-auto">
        <button
          ref="controlsTrigger"
          type="button"
          class="editor-focus flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-text hover:bg-admin-soft"
          aria-controls="website-editor-controls"
          :aria-label="controlsToggleLabel"
          :aria-expanded="controlsVisible"
          :title="controlsToggleLabel"
          @click="toggleControls"
        >
          <Icon name="heroicons:adjustments-horizontal" class="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="editor-focus flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-text hover:bg-admin-soft"
          aria-label="Find pages and sections"
          title="Find pages and sections (Ctrl or Command + K)"
          @click="navigatorOpen = true"
        >
          <Icon name="heroicons:magnifying-glass" class="h-4 w-4" aria-hidden="true" />
        </button>

        <div class="hidden items-center gap-1 md:flex" role="group" aria-label="Editing history">
          <button
            type="button"
            class="editor-focus flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!canUndo || Boolean(selectedVersionId)"
            aria-label="Undo last edit"
            title="Undo (Ctrl or Command + Z)"
            @click="undoChange"
          >
            <Icon name="heroicons:arrow-uturn-left" class="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="editor-focus flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!canRedo || Boolean(selectedVersionId)"
            aria-label="Redo last edit"
            title="Redo (Ctrl or Command + Shift + Z)"
            @click="redoChange"
          >
            <Icon name="heroicons:arrow-uturn-right" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          class="editor-focus inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loadingDraft || discarding || Boolean(selectedVersionId) || (!isDirty && !hasSavedDraft)"
          :aria-label="discarding ? 'Discarding changes' : 'Discard changes'"
          :title="discarding ? 'Discarding changes' : 'Discard changes'"
          @click="requestConfirmation('discard')"
        >
          <Icon name="heroicons:arrow-path" class="h-4 w-4" :class="discarding ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="editor-focus inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-admin-accent bg-admin-surface text-admin-accent-strong hover:bg-admin-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loadingDraft || saving || Boolean(selectedVersionId) || !isDirty"
          :aria-label="saving ? 'Saving draft' : 'Save draft'"
          :title="saving ? 'Saving draft' : 'Save draft (Ctrl or Command + S)'"
          @click="saveChanges"
        >
          <Icon :name="saving ? 'heroicons:arrow-path' : 'heroicons:cloud-arrow-up'" class="h-4 w-4" :class="saving ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="editor-focus inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-admin-accent text-admin-on-accent hover:bg-admin-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loadingDraft || publishing || Boolean(selectedVersionId) || isDirty || !hasSavedDraft"
          :aria-label="publishing ? 'Publishing website' : 'Publish'"
          :title="publishing ? 'Publishing website' : 'Publish'"
          @click="openPublishReview"
        >
          <Icon :name="publishing ? 'heroicons:arrow-path' : 'heroicons:rocket-launch'" class="h-4 w-4" :class="publishing ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
        </button>
        <a
          :href="activeStoreUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="editor-focus hidden min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-text hover:bg-admin-soft sm:inline-flex"
          aria-label="Open live store"
          title="Open live store"
        >
          <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </header>

    <div v-if="actionError" class="z-30 flex shrink-0 items-center gap-3 border-b border-admin-danger/20 bg-admin-danger-soft px-4 py-2 text-admin-danger" role="alert">
      <Icon name="heroicons:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div class="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-2">
        <p class="shrink-0 text-xs font-semibold">The editor needs attention</p>
        <p class="truncate text-xs leading-5">{{ actionError }}</p>
      </div>
      <button v-if="!draft && !loadingDraft" type="button" class="editor-focus min-h-11 shrink-0 rounded-lg px-3 text-xs font-semibold" @click="loadEditor(true)">Try again</button>
      <button v-else type="button" class="editor-focus min-h-11 shrink-0 rounded-lg px-3 text-xs font-semibold" aria-label="Dismiss error" @click="actionError = ''">Dismiss</button>
    </div>

    <div v-if="recoverySnapshot" class="z-30 flex shrink-0 flex-wrap items-center gap-2 border-b border-admin-warning/30 bg-admin-warning-soft px-4 py-2 text-admin-text" role="status">
      <Icon name="heroicons:shield-check" class="h-4 w-4 shrink-0 text-admin-warning" aria-hidden="true" />
      <p class="min-w-48 flex-1 text-xs leading-5">A browser copy of your edits is preserved for recovery.</p>
      <button type="button" class="editor-focus min-h-11 rounded-lg px-3 text-xs font-semibold hover:bg-admin-surface" @click="restoreRecoveryCopy">Restore my copy</button>
      <button type="button" class="editor-focus min-h-11 rounded-lg px-3 text-xs font-semibold hover:bg-admin-surface" @click="copyRecoveryChanges">Copy changes</button>
      <button type="button" class="editor-focus min-h-11 rounded-lg px-3 text-xs font-semibold text-admin-muted hover:bg-admin-surface" @click="dismissRecovery">Dismiss backup</button>
    </div>

    <div v-if="publishSuccess" class="z-30 flex shrink-0 flex-wrap items-center gap-2 border-b border-admin-success/30 bg-admin-success-soft px-4 py-2 text-admin-text" role="status" aria-live="polite">
      <Icon name="heroicons:check-circle" class="h-4 w-4 shrink-0 text-admin-success" aria-hidden="true" />
      <p class="min-w-48 flex-1 text-xs leading-5"><span class="font-semibold">Website published.</span> {{ publishSuccess.summary }}</p>
      <a :href="activeStoreUrl" target="_blank" rel="noopener noreferrer" class="editor-focus inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold text-admin-success hover:bg-admin-surface">View live website</a>
      <button type="button" class="editor-focus min-h-11 rounded-lg px-3 text-xs font-semibold text-admin-muted hover:bg-admin-surface" @click="publishSuccess = null">Dismiss</button>
    </div>

    <div class="z-20 flex shrink-0 items-center gap-2 border-b border-admin-border bg-admin-info-soft px-4 py-2 text-admin-text" role="status" aria-live="polite" aria-atomic="true">
      <Icon
        :name="loadingDraft ? 'heroicons:arrow-path' : selectedVersionId ? 'heroicons:clock' : (hasSavedDraft || isDirty ? 'heroicons:pencil-square' : 'heroicons:check-circle')"
        class="h-4 w-4 shrink-0 text-admin-info"
        :class="loadingDraft ? 'animate-spin motion-reduce:animate-none' : ''"
        aria-hidden="true"
      />
      <div class="flex min-w-0 flex-1 items-baseline gap-2">
        <p class="shrink-0 text-xs font-semibold">{{ editorStateTitle }}</p>
        <p class="hidden truncate text-xs text-admin-muted lg:block">{{ editorStateDescription }}</p>
      </div>
      <span v-if="draftSavedAt" class="text-xs font-medium text-admin-muted">Saved {{ draftSavedAt }}</span>
    </div>

    <AdminWebsiteEditorLoading v-if="loadingDraft" />

    <div v-else-if="draft" class="relative flex min-h-0 flex-1 overflow-hidden">
      <button
        v-if="controlsOpen"
        type="button"
        class="absolute inset-0 z-30 bg-gray-950/35 xl:hidden"
        aria-label="Close website editor controls"
        @click="closeControls"
      />

      <aside
        id="website-editor-controls"
        class="absolute inset-y-0 left-0 z-40 flex w-[min(20rem,calc(100%-3rem))] shrink-0 flex-col border-r border-admin-border bg-admin-surface transition-transform duration-200 xl:static xl:z-auto xl:w-80"
        :class="[
          controlsOpen ? 'translate-x-0' : '-translate-x-full',
          controlsCollapsed ? 'xl:hidden' : 'xl:flex xl:translate-x-0',
        ]"
        :aria-hidden="!controlsVisible ? 'true' : undefined"
        :inert="!controlsVisible"
        aria-label="Website editor controls"
      >
        <div class="flex shrink-0 items-start gap-3 border-b border-admin-border px-4 py-4">
          <div class="min-w-0 flex-1">
            <h2 class="text-sm font-semibold text-admin-text">{{ activePageOption.label }} sections</h2>
          <p class="mt-1 text-xs leading-5 text-admin-muted">Choose a section, then edit its content below.</p>
          <p v-if="activePageDisabled" class="mt-2 rounded-lg bg-admin-warning-soft px-2.5 py-2 text-xs leading-5 text-admin-muted">
            This page is currently disabled on the storefront. Its content can be prepared here, but navigation visibility stays in Site Settings.
          </p>
          </div>
          <button ref="controlsClose" type="button" class="editor-focus flex min-h-11 min-w-11 items-center justify-center rounded-xl text-admin-muted hover:bg-admin-soft hover:text-admin-text xl:hidden" aria-label="Close sections panel" @click="closeControls">
            <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" class="editor-focus hidden min-h-11 min-w-11 items-center justify-center rounded-xl text-admin-muted hover:bg-admin-soft hover:text-admin-text xl:flex" aria-label="Hide editor sidebar" title="Hide editor sidebar" @click="collapseControls">
            <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="editor-controls-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <AdminEditorSettingsLink
          v-if="activePageDisabled && activePageOption.module"
          class="mb-3"
          label="This page is hidden because its storefront module is disabled."
          to="/admin/settings?tab=modules"
          action="Manage page visibility"
          icon="heroicons:eye-slash"
        />
        <div class="grid gap-1">
          <AdminWebsiteEditorSectionRow
            v-for="(section, index) in sections"
            :key="section.id"
            :label="section.label"
            :icon="section.icon"
            :selected="selectedSection === section.id"
            :visible="section.visible"
            :editable="section.editable"
            :has-content="section.hasContent"
            :incomplete="publishWarnings.some(warning => warning.page === activePage && warning.section === section.id)"
            :first="index === 0"
            :last="index === sections.length - 1"
            :disabled="Boolean(selectedVersionId) || !localeIsDefault"
            :composable="activePage === 'home' && localeIsDefault"
            @select="selectSection(section.id)"
            @move="moveSection(index, $event)"
            @toggle="toggleSection(index)"
          />
        </div>

        <AdminWebsiteEditorHistory
          :open="historyOpen"
          :loading="loadingVersions"
          :restoring="restoringVersion"
          :deleting-id="deletingVersion ? deleteVersionTargetId : null"
          :error="historyError"
          :versions="versions"
          :selected-id="selectedVersionId"
          @toggle="toggleHistory"
          @select="previewVersionFromHistory"
          @exit="exitVersionPreview"
          @restore="requestConfirmation('restore')"
          @delete="requestVersionDeletion"
          @retry="loadVersions"
        />

        <AdminWebsiteEditorInspector
          v-if="!selectedVersionId && localeIsDefault && activePage === 'home'"
          v-model="draft"
          :section="selectedSection"
          :errors="validationErrors"
        />
        <AdminWebsiteEditorPageInspector
          v-else-if="!selectedVersionId && localeIsDefault"
          v-model="draft"
          :section="selectedSection"
          :errors="validationErrors"
        />
        <AdminWebsiteEditorTranslationInspector
          v-else-if="!selectedVersionId && draft"
          v-model="draft"
          :locale="activeLocale"
          :page="activePage"
          :section="selectedSection"
        />
        </div>
      </aside>

      <section class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-admin-surface" aria-label="Storefront preview workspace">
        <div class="flex shrink-0 flex-col gap-3 border-b border-admin-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-2">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-muted">
              <Icon :name="activePageOption.icon" class="h-4 w-4" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-admin-text">{{ activePageOption.label }}</p>
              <p class="truncate text-xs text-admin-muted">{{ selectedVersionId ? 'Historical preview · editing paused' : 'Private preview · changes are not live' }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <AdminWebsiteEditorLocalePicker
              v-if="draft"
              v-model="activeLocale"
              :draft="draft"
              @update:supported-locales="updateSupportedLocales"
            />
            <AdminWebsiteEditorPagePicker
              :model-value="activePage"
              :options="pagePickerOptions"
              @update:model-value="switchPage"
            />
            <div class="flex items-center rounded-xl border border-admin-border bg-admin-soft p-1" role="group" aria-label="Preview size">
              <button
                v-for="device in devices"
                :key="device.id"
                type="button"
                class="editor-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-admin-muted transition-colors"
                :class="activeDevice === device.id ? 'bg-admin-surface text-admin-accent-strong shadow-[var(--admin-shadow-quiet)]' : 'hover:text-admin-text'"
                :aria-label="`${device.label} preview`"
                :aria-pressed="activeDevice === device.id"
                :title="`${device.label} preview`"
                @click="activeDevice = device.id"
              >
                <Icon :name="device.icon" class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button type="button" class="editor-focus inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft" aria-label="Refresh preview" title="Refresh preview" @click="refreshPreview">
              <Icon name="heroicons:arrow-path" class="h-4 w-4" :class="previewLoading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
              <span class="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div class="preview-canvas relative flex min-h-0 flex-1 justify-center overflow-auto bg-admin-soft p-3 sm:p-4">
          <div class="relative shrink-0 overflow-hidden rounded-xl bg-white shadow-[var(--admin-shadow-quiet)] ring-1 ring-admin-border transition-[width] duration-200 motion-reduce:transition-none" :style="previewFrameStyle">
            <div v-if="previewError" class="absolute inset-0 z-20 flex items-center justify-center bg-admin-surface px-6" role="alert">
              <div class="max-w-sm text-center">
                <Icon name="heroicons:exclamation-triangle" class="mx-auto h-6 w-6 text-admin-danger" aria-hidden="true" />
                <p class="mt-3 text-sm font-semibold text-admin-text">Preview did not load</p>
                <p class="mt-1 text-xs leading-5 text-admin-muted">Your draft is safe. Check the connection and try again.</p>
                <button type="button" class="editor-focus mt-4 min-h-11 rounded-xl bg-admin-accent px-4 text-xs font-semibold text-admin-on-accent" @click="refreshPreview">Try again</button>
              </div>
            </div>

            <div v-else-if="previewLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-admin-surface" role="status">
              <div class="text-center">
                <Icon name="heroicons:arrow-path" class="mx-auto h-5 w-5 animate-spin text-admin-accent motion-reduce:animate-none" aria-hidden="true" />
                <p class="mt-3 text-xs font-medium text-admin-muted">Loading private preview…</p>
              </div>
            </div>

            <iframe
              ref="previewFrame"
              :key="previewVersion"
              :src="previewUrl"
              :title="`Private storefront ${activePageOption.label.toLowerCase()} preview`"
              class="block h-full w-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts"
              @load="onPreviewLoad"
            />
          </div>
        </div>

        <div class="flex shrink-0 items-center justify-between gap-3 border-t border-admin-border px-4 py-2 text-xs text-admin-muted">
          <span>{{ activeDeviceConfig.label }} · {{ activeDeviceConfig.widthLabel }} · {{ activeLocaleName }}</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-admin-warning" aria-hidden="true" />{{ selectedVersionId ? 'Historical version' : 'Private draft preview' }}</span>
        </div>
      </section>
    </div>

    <AdminWebsiteEditorNavigator
      :open="navigatorOpen"
      :items="navigationItems"
      :current-page="activePage"
      :current-section="selectedSection"
      @close="navigatorOpen = false"
      @navigate="navigateFromNavigator"
    />

    <ConfirmModal
      :open="pendingConfirmation !== null"
      :title="confirmationContent.title"
      :message="confirmationContent.message"
      :confirm-text="confirmationContent.confirmText"
      :loading-text="confirmationContent.loadingText"
      :loading="confirmationLoading"
      :variant="confirmationContent.variant"
      compact
      @confirm="confirmPendingAction"
      @cancel="cancelPendingAction"
    />

    <AdminWebsiteEditorPublishReview
      :open="publishReviewOpen"
      :changed-areas="publishChangedAreas"
      :warnings="publishWarnings"
      :release-note="releaseNote"
      :loading="publishing"
      :workflow="workflow"
      :workflow-loading="workflowLoading"
      :workflow-error="workflowError"
      :review-note="reviewNote"
      :scheduled-for="scheduledFor"
      @close="publishReviewOpen = false"
      @publish="publishChanges"
      @navigate="navigateFromPublishReview"
      @update:release-note="releaseNote = $event"
      @update:review-note="reviewNote = $event"
      @update:scheduled-for="scheduledFor = $event"
      @request-review="requestReview"
      @approve="approveReview"
      @request-changes="returnForChanges"
      @schedule="schedulePublication"
      @cancel-schedule="cancelScheduledPublication"
    />

    <BaseModal :open="conflictOpen" aria-label="Your draft changed elsewhere" size="sm" hide-close body-class="p-5" @close="closeConflict">
      <div class="flex items-start gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-warning-soft text-admin-warning">
          <Icon name="heroicons:arrows-right-left" class="h-5 w-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-admin-text">Your draft changed elsewhere</h2>
          <p class="mt-1 text-xs leading-5 text-admin-muted">Your browser edits are preserved. Review the latest server draft, copy your edits, or reload the latest version before continuing.</p>
          <p v-if="conflictLatestSummary" class="mt-2 text-xs font-medium text-admin-text">{{ conflictLatestSummary }}</p>
          <p v-if="conflictNotice" class="mt-2 text-xs font-medium text-admin-accent-strong" role="status">{{ conflictNotice }}</p>
        </div>
      </div>
      <template #footer>
        <div class="grid gap-2 sm:grid-cols-3">
          <button type="button" class="editor-focus min-h-11 rounded-lg border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft disabled:opacity-50" :disabled="conflictLoading" @click="reviewLatestConflict">Review latest</button>
          <button type="button" class="editor-focus min-h-11 rounded-lg border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft" @click="copyRecoveryChanges">Copy my changes</button>
          <button type="button" class="editor-focus min-h-11 rounded-lg bg-admin-accent px-3 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:opacity-50" :disabled="conflictLoading" @click="reloadLatestConflict">{{ conflictLoading ? 'Loading…' : 'Reload latest' }}</button>
        </div>
      </template>
    </BaseModal>

    <ConfirmModal
      :open="deleteVersionTargetId !== null"
      title="Delete published version?"
      message="This permanently removes this rollback point. Your live website and private draft will not change."
      confirm-text="Delete version"
      loading-text="Deleting…"
      :loading="deletingVersion"
      variant="danger"
      compact
      @confirm="confirmVersionDeletion"
      @cancel="cancelVersionDeletion"
    />
  </div>
</template>

<script setup lang="ts">
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import { withWebsiteEditorSupportedLocales } from '~/utils/websiteEditorDraftMutations'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'
import { websiteEditorValidationTarget } from '~/utils/websiteEditorValidation'

definePageMeta({ middleware: 'auth' })

const { siteConfig, fetchSiteConfig, broadcastConfigUpdate } = useSiteConfig()
const { storeUrl } = useStorefrontUrl()
const draftApi = useWebsiteEditorDraft()
const authStore = useAuthStore()
const {
  activePage,
  selectedSection,
  activeLocale,
  sync: syncEditorRoute,
  selectSection: selectRouteSection,
  selectPage: selectRoutePage,
  ensureActiveLocale,
} = useWebsiteEditorRoute()

let editorMounted = false

const {
  draft,
  hasSavedDraft,
  draftUpdatedAt,
  draftVersion,
  loadingDraft,
  saving,
  publishing,
  discarding,
  actionError,
  validationErrors,
  isDirty,
  publishReviewOpen,
  releaseNote,
  reviewNote,
  scheduledFor,
  workflowLoading,
  workflowError,
  workflow,
  publishSuccess,
  conflictOpen,
  conflictLoading,
  conflictNotice,
  conflictLatestSummary,
  recoverySnapshot,
  loadRecovery,
  dismissRecovery,
  restoreRecoveryCopy,
  copyRecoveryChanges,
  reviewLatestConflict,
  reloadLatestConflict,
  closeConflict,
  openSaveConflict,
  applyDraftState,
  openPublishReview,
  requestReview,
  approveReview,
  returnForChanges,
  schedulePublication,
  cancelScheduledPublication,
  loadEditor,
  saveChanges,
  discardChanges,
  publishChanges: publishDraftChanges,
} = useWebsiteEditorSession({
  siteConfig,
  fetchSiteConfig,
  broadcastConfigUpdate,
  draftApi,
  recoveryOwner: () => authStore.user
    ? `${authStore.user.id}:${authStore.user.store_id ?? authStore.user.store?.id ?? ''}`
    : 'unknown',
  onDraftApplied: handleDraftApplied,
  onDraftLoaded: handleDraftLoaded,
  onValidationError: focusFirstInvalidSection,
  onPublished: refreshPublishedHistory,
})

const {
  versionPreview,
  versions,
  selectedVersionId,
  historyOpen,
  loadingVersions,
  restoringVersion,
  deleteVersionTargetId,
  deletingVersion,
  historyError,
  loadVersions,
  refreshIfOpen: refreshHistoryIfOpen,
  toggleHistory,
  previewVersionFromHistory,
  exitVersionPreview,
  restoreSelectedVersion,
  requestVersionDeletion,
  cancelVersionDeletion,
  confirmVersionDeletion,
} = useWebsiteEditorVersionHistory({
  siteConfig,
  draftVersion,
  actionError,
  draftApi,
  applyDraftState,
  dismissRecovery,
  openSaveConflict,
  onPreviewSelected: handleVersionPreviewSelected,
  onPreviewExited: handleVersionPreviewExited,
  onDeleteFocus: () => document.getElementById('version-history-title')?.closest('button')?.focus({ preventScroll: true }),
})

const {
  canUndo,
  canRedo,
  initialize: initializeUndoHistory,
  undo: undoChange,
  redo: redoChange,
} = useWebsiteEditorUndoHistory(draft, {
  disabled: computed(() => Boolean(selectedVersionId.value)),
})

const {
  workingDraft,
  localeIsDefault,
  activeLocaleName,
  activePageOption,
  activePageDisabled,
  previewConfig,
  pagePickerOptions,
  sections,
  navigationItems,
  publishChangedAreas,
  publishWarnings,
} = useWebsiteEditorContentModel({
  siteConfig,
  draft,
  versionPreview,
  activeLocale,
  activePage,
})

const {
  devices,
  navigatorOpen,
  activeDevice,
  activeDeviceConfig,
  previewFrameStyle,
  controlsOpen,
  controlsDocked,
  controlsCollapsed,
  controlsVisible,
  controlsToggleLabel,
  controlsTrigger,
  controlsClose,
  toggleControls,
  collapseControls,
  closeControls,
} = useWebsiteEditorShell({
  isDirty,
  selectedVersionId,
  loadingDraft,
  saving,
  saveChanges,
  undoChange,
  redoChange,
})

const {
  pendingConfirmation,
  confirmationLoading,
  confirmationContent,
  draftSavedAt,
  editorStateTitle,
  editorStateDescription,
  requestConfirmation,
  cancelPendingAction,
  confirmPendingAction,
} = useWebsiteEditorFeedback({
  draftUpdatedAt,
  loadingDraft,
  selectedVersionId,
  isDirty,
  hasSavedDraft,
  workflow,
  discarding,
  publishing,
  restoringVersion,
  discardChanges,
  restoreSelectedVersion,
})

const activeStoreUrl = computed(() => `${storeUrl.value}${activePageOption.value.path === '/' ? '' : activePageOption.value.path}`)

const {
  previewFrame,
  previewLoading,
  previewError,
  previewVersion,
  previewUrl,
  sendConfig: sendPreviewConfig,
  selectPage: selectPreviewPage,
  selectSection: selectPreviewSection,
  startTimeout: startPreviewTimeout,
  prepare: preparePreview,
  refresh: refreshPreview,
  onLoad: onPreviewLoad,
} = useWebsiteEditorPreview({
  config: previewConfig,
  activePage,
  selectedSection,
  onRendered: () => selectSection(selectedSection.value),
})

const {
  moveSection,
  toggleSection,
  ensureSelectedSection,
  selectSection,
  switchPage,
  navigateFromNavigator,
} = useWebsiteEditorSectionNavigation({
  draft,
  workingDraft,
  selectedVersionId,
  localeIsDefault,
  activePage,
  selectedSection,
  selectRouteSection,
  selectRoutePage,
  selectPreviewPage,
  selectPreviewSection,
})

function navigateFromPublishReview(page: WebsiteEditorPageId, section: string) {
  publishReviewOpen.value = false
  switchPage(page, section)
  if (controlsDocked.value) controlsCollapsed.value = false
  else controlsOpen.value = true
}

function focusFirstInvalidSection(errors: Record<string, string[]>) {
  const target = websiteEditorValidationTarget(errors, draft.value?.homepage_sections[0]?.id)
  if (target) switchPage(target.page, target.section)
}

function handleDraftApplied(payload: WebsiteEditorDraftPayload) {
  ensureActiveLocale(payload)
  initializeUndoHistory()
}

async function handleDraftLoaded(payload: WebsiteEditorDraftPayload) {
  ensureSelectedSection(payload)
  preparePreview()
  await nextTick()
  if (editorMounted) startPreviewTimeout()
}

function refreshPublishedHistory() {
  return refreshHistoryIfOpen()
}

function handleVersionPreviewSelected(payload: WebsiteEditorDraftPayload) {
  ensureActiveLocale(payload)
  ensureSelectedSection(payload)
  nextTick(() => selectSection(selectedSection.value))
}

function handleVersionPreviewExited() {
  nextTick(() => selectSection(selectedSection.value))
}

function publishChanges() {
  return publishDraftChanges(publishChangedAreas.value.length)
}

function updateSupportedLocales(locales: string[]) {
  if (!draft.value || selectedVersionId.value) return
  draft.value = withWebsiteEditorSupportedLocales(draft.value, locales)
  ensureActiveLocale(draft.value)
}

onBeforeRouteLeave(() => !isDirty.value || window.confirm('Leave the editor and lose your unsaved changes?'))
watch(previewConfig, () => sendPreviewConfig(), { deep: true })
watch(activeLocale, () => {
  syncEditorRoute()
  sendPreviewConfig()
})

onMounted(() => {
  editorMounted = true
  loadRecovery()
  void loadEditor()
})

onBeforeUnmount(() => {
  editorMounted = false
})
</script>

<style scoped>
.website-editor-shell,
.website-editor-shell :deep(h1),
.website-editor-shell :deep(h2),
.website-editor-shell :deep(h3),
.website-editor-shell :deep(h4),
.website-editor-shell :deep(h5),
.website-editor-shell :deep(h6) {
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.editor-focus:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
.preview-canvas {
  scrollbar-color: var(--admin-border) transparent;
  scrollbar-width: thin;
}
.editor-controls-scroll {
  scrollbar-color: var(--admin-border) transparent;
  scrollbar-width: thin;
}
</style>
