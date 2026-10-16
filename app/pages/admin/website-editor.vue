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
import type { HomepageSectionId, SiteConfig } from '~/composables/useSiteConfig'
import type { WebsiteEditorDraftPayload, WebsiteEditorDraftState, WebsiteEditorVersionSummary, WebsiteEditorWorkflow } from '~/composables/useWebsiteEditorDraft'
import { HOMEPAGE_SECTION_LABELS } from '~/utils/homepageSections'
import { applyWebsiteEditorLocale, websiteEditorLocaleName, websiteEditorLocaleProgress } from '~/utils/websiteEditorLocalization'
import { websiteEditorChangedAreas, websiteEditorReadinessWarnings, type WebsiteEditorReadinessWarning } from '~/utils/websiteEditorPublishing'
import {
  WEBSITE_EDITOR_PAGES,
  WEBSITE_EDITOR_STATIC_SECTIONS,
  websiteEditorPage,
  type WebsiteEditorNavigationItem,
  type WebsiteEditorPageId,
} from '~/utils/websiteEditorPages'

definePageMeta({ middleware: 'auth' })

type DeviceId = 'desktop' | 'tablet' | 'mobile'
type ConfirmationKind = 'discard' | 'restore'
type RecoverySnapshot = {
  payload: WebsiteEditorDraftPayload
  savedAt: string
}

const { siteConfig, fetchSiteConfig, broadcastConfigUpdate } = useSiteConfig()
const { storeUrl } = useStorefrontUrl()
const {
  fetchDraft,
  saveDraft,
  discardDraft,
  publishDraft,
  requestDraftReview,
  approveDraft,
  requestDraftChanges,
  scheduleDraft,
  cancelDraftSchedule,
  fetchVersions,
  fetchVersion,
  restoreVersion,
  deleteVersion,
} = useWebsiteEditorDraft()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const requestedPage = typeof route.query.page === 'string' ? route.query.page : ''
const initialPage = WEBSITE_EDITOR_PAGES.some(page => page.id === requestedPage)
  ? requestedPage as WebsiteEditorPageId
  : 'home'
const requestedSection = typeof route.query.section === 'string' ? route.query.section : ''
const initialSection = requestedSection || (initialPage === 'home'
  ? 'hero'
  : WEBSITE_EDITOR_STATIC_SECTIONS[initialPage][0]?.id ?? 'header')

const draft = ref<WebsiteEditorDraftPayload | null>(null)
const versionPreview = ref<WebsiteEditorDraftPayload | null>(null)
const versions = ref<WebsiteEditorVersionSummary[]>([])
const selectedVersionId = ref<number | null>(null)
const publishedHash = ref('')
const historyOpen = ref(false)
const loadingVersions = ref(false)
const restoringVersion = ref(false)
const deleteVersionTargetId = ref<number | null>(null)
const deletingVersion = ref(false)
const historyError = ref('')
const baseUpdatedAt = ref('')
const hasSavedDraft = ref(false)
const draftUpdatedAt = ref<string | null>(null)
const draftVersion = ref<number | null>(null)
const savedSnapshot = ref('')
const loadingDraft = ref(true)
const saving = ref(false)
const publishing = ref(false)
const discarding = ref(false)
const actionError = ref('')
const publishReviewOpen = ref(false)
const navigatorOpen = ref(false)
const releaseNote = ref('')
const reviewNote = ref('')
const scheduledFor = ref('')
const workflowLoading = ref(false)
const workflowError = ref('')
const workflow = ref<WebsiteEditorWorkflow>({
  status: 'draft',
  requested_by_name: null,
  requested_at: null,
  reviewed_by_name: null,
  reviewed_at: null,
  note: null,
  scheduled_publish_at: null,
  scheduled_by_name: null,
  scheduled_release_note: null,
  timezone: 'UTC',
})
const publishSuccess = ref<{ summary: string } | null>(null)
const pendingConfirmation = ref<ConfirmationKind | null>(null)
const conflictOpen = ref(false)
const conflictLoading = ref(false)
const conflictNotice = ref('')
const conflictLatestSummary = ref('')
const conflictLatest = ref<WebsiteEditorDraftState | null>(null)
const recoverySnapshot = ref<RecoverySnapshot | null>(null)
const validationErrors = ref<Record<string, string[]>>({})
const activePage = ref<WebsiteEditorPageId>(initialPage)
const selectedSection = ref(initialSection)
const requestedLocale = typeof route.query.locale === 'string' ? route.query.locale : ''
const activeLocale = ref(requestedLocale || 'en')
const activeDevice = ref<DeviceId>('desktop')
const previewFrame = ref<HTMLIFrameElement | null>(null)
const previewLoading = ref(true)
const previewError = ref(false)
const previewReady = ref(false)
const previewVersion = ref(0)
const controlsOpen = ref(false)
const controlsDocked = ref(false)
const controlsCollapsed = ref(true)
const controlsTrigger = ref<HTMLButtonElement | null>(null)
const controlsClose = ref<HTMLButtonElement | null>(null)
const undoSnapshots = ref<string[]>([])
const undoIndex = ref(-1)
let applyingUndo = false
let undoTimer: number | null = null
let previewTimeout: number | null = null
let controlsMediaQuery: MediaQueryList | null = null
let editorMounted = false

const devices = [
  { id: 'desktop' as const, label: 'Desktop', icon: 'heroicons:computer-desktop', width: '100%', widthLabel: 'Responsive width' },
  { id: 'tablet' as const, label: 'Tablet', icon: 'heroicons:device-tablet', width: '768px', widthLabel: '768 px' },
  { id: 'mobile' as const, label: 'Mobile', icon: 'heroicons:device-phone-mobile', width: '390px', widthLabel: '390 px' },
]
const pageOptions = WEBSITE_EDITOR_PAGES

const snapshot = (value: WebsiteEditorDraftPayload | null) => JSON.stringify(value)
const isDirty = computed(() => Boolean(draft.value) && snapshot(draft.value) !== savedSnapshot.value)
const canonicalWorkingDraft = computed(() => versionPreview.value ?? draft.value)
const workingDraft = computed(() => canonicalWorkingDraft.value
  ? applyWebsiteEditorLocale(canonicalWorkingDraft.value, activeLocale.value)
  : null)
const localeIsDefault = computed(() => activeLocale.value === canonicalWorkingDraft.value?.default_locale)
const activeLocaleName = computed(() => websiteEditorLocaleName(activeLocale.value))
const canUndo = computed(() => undoIndex.value > 0)
const canRedo = computed(() => undoIndex.value >= 0 && undoIndex.value < undoSnapshots.value.length - 1)
const activeDeviceConfig = computed(() => devices.find(device => device.id === activeDevice.value) ?? devices[0]!)
const activePageOption = computed(() => websiteEditorPage(activePage.value))
const activePageDisabled = computed(() => isPageDisabled(activePage.value))
const controlsVisible = computed(() => controlsDocked.value ? !controlsCollapsed.value : controlsOpen.value)
const controlsToggleLabel = computed(() => controlsDocked.value
  ? (controlsCollapsed.value ? 'Show editor sidebar' : 'Hide editor sidebar')
  : 'Open sections panel')
const confirmationLoading = computed(() => discarding.value || publishing.value || restoringVersion.value)
const confirmationContent = computed(() => {
  if (pendingConfirmation.value === 'restore') return {
    title: 'Restore version to draft?',
    message: 'This replaces the current private draft. The live website stays unchanged until you explicitly publish.',
    confirmText: 'Restore to draft',
    loadingText: 'Restoring…',
    variant: 'warning' as const,
  }
  return {
    title: 'Discard private changes?',
    message: 'This removes the saved draft and any unsaved edits, then reloads the published website.',
    confirmText: 'Discard changes',
    loadingText: 'Discarding…',
    variant: 'danger' as const,
  }
})
const activeStoreUrl = computed(() => `${storeUrl.value}${activePageOption.value.path === '/' ? '' : activePageOption.value.path}`)
const publishedDraft = computed(() => siteConfig.value ? normalizeWebsiteEditorDraft(siteConfig.value) : null)
const publishChangedAreas = computed(() => publishedDraft.value && draft.value
  ? websiteEditorChangedAreas(publishedDraft.value, draft.value)
  : [])
const publishWarnings = computed<WebsiteEditorReadinessWarning[]>(() => {
  if (!draft.value) return []
  const warnings = websiteEditorReadinessWarnings(draft.value)
  for (const locale of draft.value.supported_locales) {
    if (locale === draft.value.default_locale) continue
    const progress = websiteEditorLocaleProgress(draft.value, locale)
    if (progress.percent < 100) warnings.push({
      id: `locale-${locale}`,
      label: `${websiteEditorLocaleName(locale)} is ${progress.percent}% translated`,
      detail: `${progress.total - progress.translated} text fields will use default-language content.`,
      page: 'global',
      section: 'store-details',
    })
  }
  return warnings
})
const previewUrl = computed(() => `/admin/storefront-preview?version=${previewVersion.value}`)
const previewFrameStyle = computed(() => ({ width: activeDeviceConfig.value.width, maxWidth: '100%', height: '100%' }))
const draftSavedAt = computed(() => draftUpdatedAt.value
  ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(draftUpdatedAt.value))
  : '')
const editorStateTitle = computed(() => loadingDraft.value
  ? 'Preparing private preview'
  : selectedVersionId.value
    ? 'Historical website preview'
    : isDirty.value
      ? 'Unsaved preview changes'
      : hasSavedDraft.value
        ? workflow.value.scheduled_publish_at
          ? 'Publication scheduled'
          : workflow.value.status === 'pending'
            ? 'Review requested'
            : workflow.value.status === 'approved'
              ? 'Draft approved'
              : workflow.value.status === 'changes_requested'
                ? 'Changes requested'
                : 'Private draft saved'
        : 'Published website loaded')
const editorStateDescription = computed(() => {
  if (loadingDraft.value) return 'Loading the latest tenant configuration and private draft.'
  if (selectedVersionId.value) return 'This is an earlier published version. Restore it to the private draft before publishing.'
  if (isDirty.value) return 'The preview includes changes that are only in this browser. Save the draft before publishing.'
  if (hasSavedDraft.value && workflow.value.scheduled_publish_at) return `This approved draft will publish automatically in ${workflow.value.timezone}.`
  if (hasSavedDraft.value && workflow.value.status === 'pending') return 'The saved draft is awaiting review. You can still publish it immediately if needed.'
  if (hasSavedDraft.value && workflow.value.status === 'approved') return 'The saved draft is approved and can be scheduled or published now.'
  if (hasSavedDraft.value && workflow.value.status === 'changes_requested') return 'Review feedback is available in the publication panel.'
  if (hasSavedDraft.value) return 'This draft is private. Publish it when the preview is ready for customers.'
  return 'Start editing a section. Nothing changes publicly until you save and publish.'
})

const previewConfig = computed<SiteConfig | null>(() => {
  if (!siteConfig.value || !workingDraft.value) return siteConfig.value
  return {
    ...siteConfig.value,
    ...workingDraft.value,
    locale: activeLocale.value,
    homepage_statement: {
      ...workingDraft.value.homepage_statement,
      image_url: workingDraft.value.homepage_statement_image_url,
    },
    story_page: {
      ...workingDraft.value.story_page,
      section_a: {
        ...workingDraft.value.story_page.section_a,
        image_url: workingDraft.value.story_image_a_url,
      },
      section_b: {
        ...workingDraft.value.story_page.section_b,
        image_url: workingDraft.value.story_image_b_url,
      },
    },
  }
})

function isPageDisabled(pageId: WebsiteEditorPageId) {
  const page = websiteEditorPage(pageId)
  if (pageId === 'story') return workingDraft.value?.story_page.enabled !== true
  if (pageId === 'popup') return workingDraft.value?.welcome_popup_enabled !== true
  return page.module ? previewConfig.value?.modules_enabled?.[page.module] === false : false
}

const pagePickerOptions = computed(() => pageOptions.map(page => ({
  ...page,
  storefrontDisabled: isPageDisabled(page.id),
})))

const hasContent = (value: unknown) => {
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).some(entry => Array.isArray(entry) ? entry.length > 0 : (typeof entry === 'string' ? entry.trim().length > 0 : Boolean(entry)))
}

const sectionMeta: Record<HomepageSectionId, { icon: string; editable: boolean }> = {
  hero: { icon: 'heroicons:photo', editable: true },
  'featured-products': { icon: 'heroicons:cube', editable: false },
  showcase: { icon: 'heroicons:squares-2x2', editable: false },
  'watch-shop': { icon: 'heroicons:play-circle', editable: false },
  'best-sellers': { icon: 'heroicons:fire', editable: false },
  'how-it-works': { icon: 'heroicons:list-bullet', editable: true },
  features: { icon: 'heroicons:sparkles', editable: true },
  stats: { icon: 'heroicons:chart-bar', editable: true },
  statement: { icon: 'heroicons:chat-bubble-bottom-center-text', editable: true },
  newsletter: { icon: 'heroicons:envelope', editable: true },
}

function sectionHasContent(id: HomepageSectionId) {
  const config = previewConfig.value
  if (!config) return false
  if (id === 'hero' || id === 'featured-products') return true
  if (id === 'showcase') return Boolean(config.homepage_showcase?.enabled)
  if (id === 'watch-shop') return Boolean(config.homepage_watch_shop?.enabled && config.homepage_watch_shop.cards?.length)
  if (id === 'best-sellers') return Boolean(config.homepage_best_sellers?.enabled && config.homepage_best_sellers.products?.length)
  if (id === 'how-it-works') return hasContent(workingDraft.value?.homepage_steps)
  if (id === 'features') return hasContent(workingDraft.value?.homepage_features)
  if (id === 'stats') return hasContent(workingDraft.value?.homepage_stats)
  if (id === 'statement') return Boolean(workingDraft.value?.homepage_statement.enabled && workingDraft.value.homepage_statement.quote)
  if (id === 'newsletter') return hasContent(workingDraft.value?.homepage_newsletter)
  return false
}

function staticSectionHasContent(section: string) {
  const value = workingDraft.value
  if (!value) return false
  if (section === 'brand-assets') return Boolean(
    value.logo_url
    || value.favicon_url
    || value.cart_icon_url
    || value.footer_logo_url
    || value.logo_alt_text.trim(),
  )
  if (section === 'store-details') return Boolean(
    value.site_name.trim()
    || value.contact_email.trim()
    || value.contact_phone.trim()
    || value.contact_entries.length
    || value.social_links.length,
  )
  if (section === 'header') return value.header_cta.enabled && Boolean(value.header_cta.label)
  if (section === 'footer-banner') return value.footer_banner.enabled && Boolean(value.footer_banner.heading)
  if (section === 'footer') return hasContent(value.footer)
  if (section === 'about-content') return Boolean(value.about_image_url || value.about_content.trim() || value.about_highlights.items.length)
  if (section === 'story-content') return value.story_page.enabled && Boolean(hasContent(value.story_page.hero) || value.story_image_a_url || value.story_image_b_url)
  if (section === 'contact-content') return Boolean(value.contact_image_url || hasContent(value.contact_page))
  if (section === 'shop-content') return hasContent(value.shop_header) || hasContent(value.shop_promo)
  if (section === 'blog-content') return Boolean(value.blog_image_url || hasContent(value.blog_page.header))
  if (section === 'services-content') return Boolean(value.services_image_url || hasContent(value.services_page.header))
  if (section === 'welcome-popup') return value.welcome_popup_enabled && Boolean(value.welcome_popup_heading)
  return false
}

const sections = computed(() => {
  if (activePage.value === 'home') {
    return (workingDraft.value?.homepage_sections ?? []).map(section => ({
      ...section,
      label: HOMEPAGE_SECTION_LABELS[section.id],
      icon: sectionMeta[section.id].icon,
      editable: sectionMeta[section.id].editable,
      hasContent: sectionHasContent(section.id),
    }))
  }

  return WEBSITE_EDITOR_STATIC_SECTIONS[activePage.value].map(section => ({
    ...section,
    visible: !isPageDisabled(activePage.value),
    editable: true,
    hasContent: staticSectionHasContent(section.id),
  }))
})

const navigationItems = computed<WebsiteEditorNavigationItem[]>(() => WEBSITE_EDITOR_PAGES.flatMap(page => {
  const pageSections = page.id === 'home'
    ? (workingDraft.value?.homepage_sections ?? []).map(section => ({
        id: section.id,
        label: HOMEPAGE_SECTION_LABELS[section.id],
        icon: sectionMeta[section.id].icon,
      }))
    : WEBSITE_EDITOR_STATIC_SECTIONS[page.id]

  return pageSections.map(section => ({
    page: page.id,
    pageLabel: page.label,
    section: section.id,
    sectionLabel: section.label,
    icon: section.icon,
    disabled: isPageDisabled(page.id),
  }))
}))

function initializeUndoHistory() {
  if (undoTimer !== null) window.clearTimeout(undoTimer)
  undoTimer = null
  undoSnapshots.value = draft.value ? [snapshot(draft.value)] : []
  undoIndex.value = draft.value ? 0 : -1
}

function commitUndoSnapshot() {
  undoTimer = null
  if (!draft.value || applyingUndo || selectedVersionId.value) return
  const current = snapshot(draft.value)
  if (undoSnapshots.value[undoIndex.value] === current) return
  undoSnapshots.value = undoSnapshots.value.slice(0, undoIndex.value + 1)
  undoSnapshots.value.push(current)
  if (undoSnapshots.value.length > 60) undoSnapshots.value.shift()
  undoIndex.value = undoSnapshots.value.length - 1
}

function scheduleUndoSnapshot() {
  if (!import.meta.client || applyingUndo || selectedVersionId.value) return
  if (undoTimer !== null) window.clearTimeout(undoTimer)
  undoTimer = window.setTimeout(commitUndoSnapshot, 300)
}

function applyUndoSnapshot(index: number) {
  const value = undoSnapshots.value[index]
  if (!value) return
  applyingUndo = true
  draft.value = JSON.parse(value) as WebsiteEditorDraftPayload
  undoIndex.value = index
  nextTick(() => { applyingUndo = false })
}

function undoChange() {
  if (!draft.value || selectedVersionId.value) return
  if (undoTimer !== null) window.clearTimeout(undoTimer)
  undoTimer = null
  const current = snapshot(draft.value)
  if (undoSnapshots.value[undoIndex.value] !== current) {
    undoSnapshots.value = undoSnapshots.value.slice(0, undoIndex.value + 1)
    undoSnapshots.value.push(current)
    undoIndex.value = undoSnapshots.value.length - 1
  }
  if (undoIndex.value > 0) applyUndoSnapshot(undoIndex.value - 1)
}

function redoChange() {
  if (!canRedo.value || selectedVersionId.value) return
  applyUndoSnapshot(undoIndex.value + 1)
}

function moveSection(index: number, direction: -1 | 1) {
  if (!draft.value || selectedVersionId.value || !localeIsDefault.value || activePage.value !== 'home') return
  const destination = index + direction
  if (destination < 0 || destination >= draft.value.homepage_sections.length) return
  const next = [...draft.value.homepage_sections]
  const [moved] = next.splice(index, 1)
  if (!moved) return
  next.splice(destination, 0, moved)
  draft.value = { ...draft.value, homepage_sections: next }
  nextTick(() => selectSection(moved.id))
}

function toggleSection(index: number) {
  if (!draft.value || selectedVersionId.value || !localeIsDefault.value || activePage.value !== 'home') return
  const next = draft.value.homepage_sections.map((section, sectionIndex) => sectionIndex === index
    ? { ...section, visible: !section.visible }
    : section)
  draft.value = { ...draft.value, homepage_sections: next }
  const changed = next[index]
  if (changed) nextTick(() => selectSection(changed.id))
}

function apiMessage(error: any, fallback: string) {
  return error?.data?.message || error?.message || fallback
}

function recoveryStorageKey() {
  const owner = authStore.user
    ? `${authStore.user.id}:${authStore.user.store_id ?? authStore.user.store?.id ?? ''}`
    : 'unknown'
  return `ssu:website-editor:recovery:${owner}`
}

function persistRecovery(payload: WebsiteEditorDraftPayload) {
  const recovery = { payload: JSON.parse(JSON.stringify(payload)), savedAt: new Date().toISOString() } as RecoverySnapshot
  recoverySnapshot.value = recovery
  if (!import.meta.client) return
  try {
    window.sessionStorage.setItem(recoveryStorageKey(), JSON.stringify(recovery))
  } catch {
    // The in-memory copy remains available when browser storage is unavailable.
  }
}

function loadRecovery() {
  if (!import.meta.client) return
  try {
    const stored = window.sessionStorage.getItem(recoveryStorageKey())
    if (stored) recoverySnapshot.value = JSON.parse(stored) as RecoverySnapshot
  } catch {
    recoverySnapshot.value = null
  }
}

function dismissRecovery() {
  recoverySnapshot.value = null
  conflictNotice.value = ''
  if (!import.meta.client) return
  try {
    window.sessionStorage.removeItem(recoveryStorageKey())
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

function applyDraftState(state: WebsiteEditorDraftState) {
  if (!siteConfig.value) throw new Error('The storefront configuration is unavailable.')
  draft.value = normalizeWebsiteEditorDraft(siteConfig.value, state.payload)
  ensureActiveLocale(draft.value)
  baseUpdatedAt.value = state.base_updated_at
  hasSavedDraft.value = state.has_draft
  draftUpdatedAt.value = state.draft_updated_at
  draftVersion.value = state.draft_version
  workflow.value = state.workflow
  savedSnapshot.value = snapshot(draft.value)
  validationErrors.value = {}
  initializeUndoHistory()
}

function openSaveConflict() {
  if (draft.value) persistRecovery(draft.value)
  conflictLatest.value = null
  conflictLatestSummary.value = ''
  conflictNotice.value = 'Your edits were not overwritten.'
  conflictOpen.value = true
}

function closeConflict() {
  if (!conflictLoading.value) conflictOpen.value = false
}

async function reviewLatestConflict() {
  conflictLoading.value = true
  conflictNotice.value = ''
  try {
    const response = await fetchDraft({ force: true })
    conflictLatest.value = response.data
    conflictLatestSummary.value = response.data.draft_updated_at
      ? `Latest private draft saved ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(response.data.draft_updated_at))}.`
      : 'The latest server version is the currently published website.'
  } catch (error: any) {
    conflictNotice.value = apiMessage(error, 'The latest draft could not be reviewed. Try again.')
  } finally {
    conflictLoading.value = false
  }
}

async function copyRecoveryChanges() {
  if (!recoverySnapshot.value || !import.meta.client) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(recoverySnapshot.value.payload, null, 2))
    conflictNotice.value = 'Your changes were copied to the clipboard.'
  } catch {
    conflictNotice.value = 'The browser blocked clipboard access. Your recovery copy is still preserved.'
  }
}

function restoreRecoveryCopy() {
  if (!recoverySnapshot.value) return
  draft.value = JSON.parse(JSON.stringify(recoverySnapshot.value.payload)) as WebsiteEditorDraftPayload
  validationErrors.value = {}
  initializeUndoHistory()
  conflictNotice.value = 'Your browser copy is restored for editing.'
}

async function reloadLatestConflict() {
  conflictLoading.value = true
  conflictNotice.value = ''
  try {
    const state = conflictLatest.value ?? (await fetchDraft({ force: true })).data
    applyDraftState(state)
    conflictOpen.value = false
    actionError.value = ''
  } catch (error: any) {
    conflictNotice.value = apiMessage(error, 'The latest draft could not be loaded. Try again.')
  } finally {
    conflictLoading.value = false
  }
}

function requestConfirmation(kind: ConfirmationKind) {
  pendingConfirmation.value = kind
}

function cancelPendingAction() {
  if (!confirmationLoading.value) pendingConfirmation.value = null
}

async function confirmPendingAction() {
  const action = pendingConfirmation.value
  if (!action || confirmationLoading.value) return
  if (action === 'discard') await discardChanges()
  else await restoreSelectedVersion()
  if (!confirmationLoading.value) pendingConfirmation.value = null
}

function openPublishReview() {
  if (!hasSavedDraft.value || isDirty.value || publishing.value) return
  actionError.value = ''
  workflowError.value = ''
  reviewNote.value = ''
  if (workflow.value.scheduled_release_note && !releaseNote.value) releaseNote.value = workflow.value.scheduled_release_note
  publishReviewOpen.value = true
}

async function runWorkflowAction(action: () => Promise<{ data: WebsiteEditorWorkflow }>) {
  if (workflowLoading.value) return
  workflowLoading.value = true
  workflowError.value = ''
  try {
    const response = await action()
    workflow.value = response.data
    reviewNote.value = ''
  } catch (error: any) {
    if ((error?.statusCode ?? error?.status) === 409) {
      publishReviewOpen.value = false
      openSaveConflict()
      return
    }
    workflowError.value = apiMessage(error, 'The editorial workflow could not be updated. Try again.')
  } finally {
    workflowLoading.value = false
  }
}

const requestReview = () => draftVersion.value && runWorkflowAction(() => requestDraftReview(draftVersion.value!, reviewNote.value))
const approveReview = () => draftVersion.value && runWorkflowAction(() => approveDraft(draftVersion.value!, reviewNote.value))
const returnForChanges = () => draftVersion.value && runWorkflowAction(() => requestDraftChanges(draftVersion.value!, reviewNote.value))
const schedulePublication = () => runWorkflowAction(async () => {
  if (!draftVersion.value) throw new Error('Save the draft before scheduling publication.')
  const response = await scheduleDraft(draftVersion.value, scheduledFor.value, releaseNote.value)
  scheduledFor.value = ''
  return response
})
const cancelScheduledPublication = () => draftVersion.value && runWorkflowAction(() => cancelDraftSchedule(draftVersion.value!))

function navigateFromPublishReview(page: WebsiteEditorPageId, section: string) {
  publishReviewOpen.value = false
  switchPage(page, section)
  if (controlsDocked.value) controlsCollapsed.value = false
  else controlsOpen.value = true
}

function focusFirstInvalidSection(errors: Record<string, string[]>) {
  const field = Object.keys(errors)[0] ?? ''
  if (
    field.startsWith('payload.logo_')
    || field.startsWith('payload.favicon_')
    || field.startsWith('payload.cart_icon_')
    || field.startsWith('payload.footer_logo_')
  ) switchPage('global', 'brand-assets')
  else if (
    field === 'payload.site_name'
    || field === 'payload.contact_email'
    || field === 'payload.contact_phone'
    || field.startsWith('payload.contact_entries')
    || field.startsWith('payload.social_links')
  ) switchPage('global', 'store-details')
  else if (field.startsWith('payload.header_cta')) switchPage('global', 'header')
  else if (field.startsWith('payload.footer_banner')) switchPage('global', 'footer-banner')
  else if (field.startsWith('payload.footer')) switchPage('global', 'footer')
  else if (field.startsWith('payload.about_')) switchPage('about', 'about-content')
  else if (field.startsWith('payload.story_page') || field.startsWith('payload.story_image_')) switchPage('story', 'story-content')
  else if (field.startsWith('payload.contact_page') || field.startsWith('payload.contact_image')) switchPage('contact', 'contact-content')
  else if (field.startsWith('payload.shop_')) switchPage('shop', 'shop-content')
  else if (field.startsWith('payload.blog_page') || field.startsWith('payload.blog_image')) switchPage('blog', 'blog-content')
  else if (field.startsWith('payload.services_page') || field.startsWith('payload.services_image')) switchPage('services', 'services-content')
  else if (field.startsWith('payload.welcome_popup_')) switchPage('popup', 'welcome-popup')
  else if (field.startsWith('payload.hero_')) switchPage('home', 'hero')
  else if (field.startsWith('payload.homepage_steps')) switchPage('home', 'how-it-works')
  else if (field.startsWith('payload.homepage_features')) switchPage('home', 'features')
  else if (field.startsWith('payload.homepage_stats')) switchPage('home', 'stats')
  else if (field.startsWith('payload.homepage_statement')) switchPage('home', 'statement')
  else if (field.startsWith('payload.homepage_newsletter')) switchPage('home', 'newsletter')
  else if (field.startsWith('payload.homepage_sections')) switchPage('home', draft.value?.homepage_sections[0]?.id ?? 'hero')
}

async function loadEditor(force = false) {
  loadingDraft.value = true
  actionError.value = ''
  try {
    await fetchSiteConfig(force)
    if (!siteConfig.value) throw new Error('The storefront configuration is unavailable.')
    const response = await fetchDraft({ preferPreloaded: !force, force })
    draft.value = normalizeWebsiteEditorDraft(siteConfig.value, response.data.payload)
    ensureActiveLocale(draft.value)
    baseUpdatedAt.value = response.data.base_updated_at
    hasSavedDraft.value = response.data.has_draft
    draftUpdatedAt.value = response.data.draft_updated_at
    draftVersion.value = response.data.draft_version
    workflow.value = response.data.workflow
    savedSnapshot.value = snapshot(draft.value)
    initializeUndoHistory()
    if (activePage.value === 'home') {
      const sectionExists = draft.value.homepage_sections.some(section => section.id === selectedSection.value)
      if (!sectionExists) selectedSection.value = draft.value.homepage_sections[0]?.id ?? 'hero'
    } else {
      const sectionExists = WEBSITE_EDITOR_STATIC_SECTIONS[activePage.value].some(section => section.id === selectedSection.value)
      if (!sectionExists) selectedSection.value = WEBSITE_EDITOR_STATIC_SECTIONS[activePage.value][0]?.id ?? 'header'
    }
    previewLoading.value = true
    previewError.value = false
    await nextTick()
    if (editorMounted) startPreviewTimeout()
  } catch (error: any) {
    actionError.value = apiMessage(error, 'The website editor could not be loaded.')
  } finally {
    loadingDraft.value = false
  }
}

async function saveChanges() {
  if (!draft.value || !isDirty.value) return
  saving.value = true
  actionError.value = ''
  validationErrors.value = {}
  try {
    const response = await saveDraft(baseUpdatedAt.value, draftVersion.value, draft.value)
    hasSavedDraft.value = true
    draftUpdatedAt.value = response.data.draft_updated_at
    draftVersion.value = response.data.draft_version
    workflow.value = response.data.workflow
    savedSnapshot.value = snapshot(draft.value)
    dismissRecovery()
  } catch (error: any) {
    if ((error?.statusCode ?? error?.status) === 409) {
      openSaveConflict()
      return
    }
    validationErrors.value = error?.data?.errors ?? {}
    focusFirstInvalidSection(validationErrors.value)
    actionError.value = apiMessage(error, 'The draft could not be saved.')
  } finally {
    saving.value = false
  }
}

async function discardChanges() {
  discarding.value = true
  actionError.value = ''
  try {
    const response = await discardDraft()
    if (!siteConfig.value) throw new Error('The published website is unavailable.')
    draft.value = normalizeWebsiteEditorDraft(siteConfig.value, response.data.payload)
    ensureActiveLocale(draft.value)
    baseUpdatedAt.value = response.data.base_updated_at
    hasSavedDraft.value = false
    draftUpdatedAt.value = null
    draftVersion.value = null
    workflow.value = response.data.workflow
    savedSnapshot.value = snapshot(draft.value)
    validationErrors.value = {}
    initializeUndoHistory()
    dismissRecovery()
  } catch (error: any) {
    actionError.value = apiMessage(error, 'The draft could not be discarded.')
  } finally {
    discarding.value = false
  }
}

async function publishChanges() {
  if (!hasSavedDraft.value || isDirty.value) return
  const changedAreaCount = publishChangedAreas.value.length
  publishing.value = true
  actionError.value = ''
  try {
    await publishDraft(releaseNote.value)
    await fetchSiteConfig(true)
    broadcastConfigUpdate()
    if (!siteConfig.value) throw new Error('The published website is unavailable.')
    const publishedState = await fetchDraft({ force: true })
    applyDraftState(publishedState.data)
    dismissRecovery()
    publishReviewOpen.value = false
    releaseNote.value = ''
    publishSuccess.value = {
      summary: changedAreaCount === 1
        ? '1 changed area is now live.'
        : `${changedAreaCount} changed areas are now live.`,
    }
    if (historyOpen.value) await loadVersions()
  } catch (error: any) {
    if ((error?.statusCode ?? error?.status) === 409) {
      publishReviewOpen.value = false
      openSaveConflict()
      return
    }
    publishReviewOpen.value = false
    actionError.value = apiMessage(error, 'The website could not be published.')
  } finally {
    publishing.value = false
  }
}

async function loadVersions() {
  loadingVersions.value = true
  historyError.value = ''
  try {
    const response = await fetchVersions()
    versions.value = response.data
    publishedHash.value = response.published_hash
  } catch (error: any) {
    historyError.value = apiMessage(error, 'Published versions could not be loaded.')
  } finally {
    loadingVersions.value = false
  }
}

async function toggleHistory() {
  historyOpen.value = !historyOpen.value
  if (historyOpen.value && versions.value.length === 0) await loadVersions()
}

async function previewVersionFromHistory(versionId: number) {
  if (!siteConfig.value) return
  loadingVersions.value = true
  historyError.value = ''
  try {
    const response = await fetchVersion(versionId)
    versionPreview.value = normalizeWebsiteEditorDraft(siteConfig.value, response.data.payload)
    ensureActiveLocale(versionPreview.value)
    selectedVersionId.value = versionId
    publishedHash.value = response.published_hash
    if (activePage.value === 'home') {
      const selectedStillExists = versionPreview.value.homepage_sections.some(section => section.id === selectedSection.value)
      if (!selectedStillExists) selectedSection.value = versionPreview.value.homepage_sections[0]?.id ?? 'hero'
    } else {
      const selectedStillExists = WEBSITE_EDITOR_STATIC_SECTIONS[activePage.value].some(section => section.id === selectedSection.value)
      if (!selectedStillExists) selectedSection.value = WEBSITE_EDITOR_STATIC_SECTIONS[activePage.value][0]?.id ?? 'header'
    }
    nextTick(() => selectSection(selectedSection.value))
  } catch (error: any) {
    historyError.value = apiMessage(error, 'This published version could not be previewed.')
  } finally {
    loadingVersions.value = false
  }
}

function exitVersionPreview() {
  selectedVersionId.value = null
  versionPreview.value = null
  nextTick(() => selectSection(selectedSection.value))
}

async function restoreSelectedVersion() {
  if (!selectedVersionId.value || !publishedHash.value) return
  restoringVersion.value = true
  historyError.value = ''
  actionError.value = ''
  try {
    const response = await restoreVersion(selectedVersionId.value, publishedHash.value, draftVersion.value)
    applyDraftState(response.data)
    selectedVersionId.value = null
    versionPreview.value = null
    dismissRecovery()
  } catch (error: any) {
    if ((error?.statusCode ?? error?.status) === 409) openSaveConflict()
    historyError.value = apiMessage(error, 'This website version could not be restored.')
  } finally {
    restoringVersion.value = false
  }
}

function requestVersionDeletion(versionId: number) {
  deleteVersionTargetId.value = versionId
}

function cancelVersionDeletion() {
  if (!deletingVersion.value) deleteVersionTargetId.value = null
}

async function confirmVersionDeletion() {
  const versionId = deleteVersionTargetId.value
  if (!versionId || deletingVersion.value) return

  deletingVersion.value = true
  historyError.value = ''
  try {
    await deleteVersion(versionId)
    versions.value = versions.value.filter(version => version.id !== versionId)
    if (selectedVersionId.value === versionId) exitVersionPreview()
    deleteVersionTargetId.value = null
    await nextTick()
    document.getElementById('version-history-title')?.closest('button')?.focus({ preventScroll: true })
  } catch (error: any) {
    deleteVersionTargetId.value = null
    historyError.value = apiMessage(error, 'This published version could not be deleted.')
  } finally {
    deletingVersion.value = false
  }
}

function sendToPreview(message: Record<string, unknown>) {
  if (!import.meta.client || !previewFrame.value?.contentWindow) return
  // Vue refs and computed values can contain reactive proxies, which cannot be
  // transferred through postMessage. The preview contract is JSON-only, so
  // serialize it into plain data before crossing the iframe boundary.
  const payload = JSON.parse(JSON.stringify({ source: 'ssu-website-editor', ...message })) as Record<string, unknown>
  previewFrame.value.contentWindow.postMessage(payload, window.location.origin)
}

function sendPreviewConfig(force = false) {
  if ((!previewReady.value && !force) || !previewConfig.value) return
  sendToPreview({ type: 'preview-config', config: previewConfig.value, page: activePage.value })
}

function selectSection(section: string) {
  selectedSection.value = section
  syncEditorRoute()
  sendToPreview({ type: 'select-section', section, page: activePage.value })
}

function ensureActiveLocale(payload: WebsiteEditorDraftPayload) {
  activeLocale.value = payload.supported_locales.includes(activeLocale.value)
    ? activeLocale.value
    : payload.default_locale
}

function updateSupportedLocales(locales: string[]) {
  if (!draft.value || selectedVersionId.value) return
  const defaultLocale = draft.value.default_locale
  const supported = [defaultLocale, ...locales.filter(locale => locale !== defaultLocale)]
    .filter((locale, index, values) => values.indexOf(locale) === index)
    .slice(0, 12)
  const localizedContent = Object.fromEntries(
    Object.entries(draft.value.localized_content).filter(([locale]) => supported.includes(locale) && locale !== defaultLocale),
  )
  draft.value = {
    ...draft.value,
    supported_locales: supported,
    localized_content: localizedContent,
  }
  ensureActiveLocale(draft.value)
}

function switchPage(page: WebsiteEditorPageId, section?: string) {
  activePage.value = page
  const firstSection = page === 'home'
    ? workingDraft.value?.homepage_sections[0]?.id ?? 'hero'
    : WEBSITE_EDITOR_STATIC_SECTIONS[page][0]?.id ?? 'header'
  selectedSection.value = section ?? firstSection
  syncEditorRoute()
  sendToPreview({ type: 'select-page', page })
  nextTick(() => selectSection(selectedSection.value))
}

function navigateFromNavigator(item: WebsiteEditorNavigationItem) {
  switchPage(item.page, item.section)
}

function syncEditorRoute() {
  const routePage = typeof route.query.page === 'string' ? route.query.page : ''
  const routeSection = typeof route.query.section === 'string' ? route.query.section : ''
  const routeLocale = typeof route.query.locale === 'string' ? route.query.locale : ''
  if (routePage === activePage.value && routeSection === selectedSection.value && routeLocale === activeLocale.value) return
  void router.replace({
    query: {
      ...route.query,
      page: activePage.value,
      section: selectedSection.value,
      locale: activeLocale.value,
    },
  })
}

function refreshPreview() {
  previewReady.value = false
  previewLoading.value = true
  previewError.value = false
  previewVersion.value += 1
  nextTick(startPreviewTimeout)
}

function openControls() {
  controlsOpen.value = true
  nextTick(() => controlsClose.value?.focus())
}

function toggleControls() {
  if (controlsDocked.value) {
    controlsCollapsed.value = !controlsCollapsed.value
    return
  }
  if (controlsOpen.value) closeControls()
  else openControls()
}

function collapseControls() {
  controlsCollapsed.value = true
  nextTick(() => controlsTrigger.value?.focus())
}

function closeControls() {
  if (!controlsOpen.value) return
  controlsOpen.value = false
  nextTick(() => controlsTrigger.value?.focus())
}

function syncControlsViewport(event: MediaQueryList | MediaQueryListEvent) {
  controlsDocked.value = event.matches
  if (event.matches) controlsOpen.value = false
}

function onPreviewLoad() {
  sendToPreview({ type: 'preview-ping' })
  window.setTimeout(() => {
    sendPreviewConfig(true)
    sendToPreview({ type: 'select-page', page: activePage.value })
    sendToPreview({ type: 'select-section', section: selectedSection.value, page: activePage.value })
  }, 0)
}

function startPreviewTimeout() {
  if (previewTimeout !== null) window.clearTimeout(previewTimeout)
  previewTimeout = window.setTimeout(() => {
    if (!previewLoading.value) return
    previewLoading.value = false
    previewError.value = true
  }, 10000)
}

function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== previewFrame.value?.contentWindow) return
  if (event.data?.source !== 'ssu-storefront-preview') return

  if (event.data?.type === 'ready') {
    previewReady.value = true
    sendPreviewConfig(true)
    return
  }

  if (event.data?.type === 'rendered') {
    if (previewTimeout !== null) window.clearTimeout(previewTimeout)
    previewReady.value = true
    previewError.value = false
    previewLoading.value = false
    sendToPreview({ type: 'select-page', page: activePage.value })
    nextTick(() => selectSection(selectedSection.value))
  }
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!isDirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && controlsOpen.value) {
    closeControls()
    return
  }
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.repeat) return
  const key = event.key.toLowerCase()
  if (key === 'k') {
    event.preventDefault()
    navigatorOpen.value = true
    return
  }
  if (selectedVersionId.value) return
  if (key === 's') {
    event.preventDefault()
    if (isDirty.value && !loadingDraft.value && !saving.value) void saveChanges()
  } else if (key === 'z' && event.shiftKey) {
    event.preventDefault()
    redoChange()
  } else if (key === 'z') {
    event.preventDefault()
    undoChange()
  } else if (key === 'y') {
    event.preventDefault()
    redoChange()
  }
}

onBeforeRouteLeave(() => !isDirty.value || window.confirm('Leave the editor and lose your unsaved changes?'))
watch(previewConfig, () => sendPreviewConfig(), { deep: true })
watch(draft, scheduleUndoSnapshot, { deep: true })
watch(activeLocale, () => {
  syncEditorRoute()
  sendPreviewConfig()
})

onMounted(() => {
  editorMounted = true
  loadRecovery()
  controlsMediaQuery = window.matchMedia('(min-width: 1280px)')
  syncControlsViewport(controlsMediaQuery)
  controlsMediaQuery.addEventListener('change', syncControlsViewport)
  window.addEventListener('message', onMessage)
  window.addEventListener('beforeunload', onBeforeUnload)
  window.addEventListener('keydown', onEditorKeydown)
  void loadEditor()
})

onBeforeUnmount(() => {
  editorMounted = false
  if (previewTimeout !== null) window.clearTimeout(previewTimeout)
  if (undoTimer !== null) window.clearTimeout(undoTimer)
  controlsMediaQuery?.removeEventListener('change', syncControlsViewport)
  window.removeEventListener('message', onMessage)
  window.removeEventListener('beforeunload', onBeforeUnload)
  window.removeEventListener('keydown', onEditorKeydown)
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
