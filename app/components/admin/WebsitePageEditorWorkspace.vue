<template>
  <div data-page-editor-shell class="page-editor-shell editor-workspace">
    <header class="workspace-toolbar">
      <div class="workspace-identity">
        <NuxtLink to="/admin/website-pages" class="workspace-icon-button" aria-label="Back to website pages" title="Back to website pages"><Icon name="heroicons:arrow-left" class="h-5 w-5" aria-hidden="true" /></NuxtLink>
        <span class="workspace-divider" aria-hidden="true" />
        <div class="min-w-0">
          <h1 tabindex="-1" class="truncate text-sm font-semibold">Website Editor</h1>
          <p class="truncate text-xs text-admin-muted">{{ page?.title || 'Custom page' }} · Private draft</p>
        </div>
      </div>
      <div class="workspace-actions">
        <span class="hidden text-xs text-admin-muted lg:inline" role="status">{{ loading ? 'Loading…' : error ? 'Unavailable' : saving ? 'Saving…' : dirty ? 'Unsaved changes' : page?.has_unpublished_changes ? 'Draft saved · Not published' : 'No unsaved changes' }}</span>
        <AdminWebsiteEditorDocumentActions :can-save="dirty && !conflict && !uploadingMediaKey && !loading" :can-publish="Boolean(page) && !dirty && !conflict && !loading && !error && !uploadingMediaKey" :saving="saving" :publishing="publicationBusy" :publish-hint="dirty ? 'Save draft before reviewing publication' : undefined" @save="save" @publish="publication?.open()" />
      </div>
    </header>
    <div class="flex shrink-0 items-center justify-between gap-3 border-b border-admin-border bg-admin-surface px-3 py-2">
      <AdminWebsiteEditorPagePicker model-value="home" :options="pageOptions" :selected-custom-page="page || { uuid: props.uuid, title: 'Custom page' }" :custom-pages="directory.pages.value" :custom-pages-loading="directory.loading.value" :custom-pages-error="directory.error.value" @update:model-value="openBuiltinPage" @retry="directory.load().catch(() => {})" />
      <NuxtLink to="/admin/website-pages" class="workspace-button"><Icon name="heroicons:document-text" class="h-4 w-4" aria-hidden="true" /><span class="hidden sm:inline">Manage pages</span></NuxtLink>
    </div>
    <AdminWebsiteEditorPagePublication v-if="page" ref="publication" :page-uuid="page.uuid" :page-version="page.draft_version" :disabled="dirty || saving || Boolean(uploadingMediaKey) || conflict" @busy="publicationBusy = $event" @published="refreshPublishedPage" @reload-page="reloadLatestPage" />
    <div v-if="loading" class="flex-1 bg-admin-surface"><AdminSpinner label="Loading page editor…" variant="form" /></div>
    <div v-else-if="error" class="rounded-2xl border border-admin-danger/20 bg-admin-danger-soft p-8 text-center"><p class="text-sm text-admin-danger" role="alert">{{ error }}</p><button type="button" class="admin-focus mt-4 min-h-11 rounded-xl bg-admin-surface px-4 text-sm font-semibold text-admin-text" @click="load">Reload page</button></div>

    <template v-else-if="page">
      <p v-if="saveMessage" class="shrink-0 border-b border-admin-border bg-admin-success-soft px-4 py-3 text-sm font-medium text-admin-success" role="status">{{ saveMessage }}</p>
      <p v-if="saveError" class="shrink-0 border-b border-admin-border bg-admin-danger-soft px-4 py-3 text-sm font-medium text-admin-danger" role="alert">{{ saveError }}</p>

      <div v-if="recovery && !dirty" class="border-b border-admin-border bg-admin-soft px-4 py-2 text-xs text-admin-text" role="status">
        <p>A browser copy of unsaved page edits is available.</p>
        <button type="button" class="min-h-11 rounded px-2 font-semibold" :disabled="saving || publicationBusy" @click="restoreRecovery">Restore my copy</button>
        <button type="button" class="min-h-11 rounded px-2" :disabled="saving || publicationBusy" @click="dismissRecovery">Dismiss copy</button>
      </div>
      <div v-if="conflict" class="flex shrink-0 gap-2 border-b border-admin-border px-4 py-2">
        <button type="button" class="workspace-button" @click="copyChanges">Copy my changes</button>
        <button type="button" class="workspace-button" @click="reloadLatestPage">Reload latest</button>
      </div>
      <div class="workspace-mobile-switch" role="group" aria-label="Editor view">
        <button type="button" :aria-pressed="mobileView === 'tools'" @click="mobileView = 'tools'"><Icon name="heroicons:adjustments-horizontal" class="h-4 w-4" aria-hidden="true" />Edit page</button>
        <button type="button" :aria-pressed="mobileView === 'preview'" @click="mobileView = 'preview'"><Icon name="heroicons:eye" class="h-4 w-4" aria-hidden="true" />Preview</button>
      </div>
      <div class="workspace-body" :data-mobile-view="mobileView">
        <aside class="workspace-panel" aria-label="Page controls">
          <nav class="workspace-tabs" aria-label="Page tools">
            <button v-for="tool in pageTools" :key="tool.id" type="button" :aria-pressed="activeTool === tool.id" @click="activeTool = tool.id">{{ tool.label }}</button>
          </nav>
          <div class="workspace-panel-scroll">
          <div v-if="activeTool === 'settings'" class="p-5">
            <h2 class="mb-1 text-sm font-semibold">Page settings</h2>
            <p class="mb-5 text-xs leading-5 text-admin-muted">Set the name and address for this page.</p>
            <div class="grid gap-4">
              <label class="text-xs font-semibold text-admin-text">Page title<input v-model="page.title" maxlength="255" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" /></label>
              <label class="text-xs font-semibold text-admin-text">Path<span class="mt-2 flex min-h-11 items-center rounded-xl border border-admin-border px-3 focus-within:outline focus-within:outline-2 focus-within:outline-admin-accent"><span class="text-admin-muted">/</span><input v-model="pagePath" class="min-w-0 flex-1 bg-transparent text-base text-admin-text outline-none" @input="normalizePath" /></span></label>

            </div>
            <section class="mt-6 border-t border-admin-border pt-4" aria-labelledby="page-header-navigation-title">
              <h3 id="page-header-navigation-title" class="text-sm font-semibold">Header navigation</h3>
              <p class="mt-2 text-xs leading-5 text-admin-muted">Publishing a page makes its address available. Add a menu link separately so customers can find it in the header.</p>
              <NuxtLink v-if="page.is_published" :to="{ path: '/admin/website-editor', query: { page: 'global', section: 'header', navigationPage: page.uuid } }" class="workspace-button mt-3" :aria-disabled="dirty || saving || publicationBusy || Boolean(uploadingMediaKey)" @click="guardHeaderShortcut"><Icon name="heroicons:bars-3" class="h-4 w-4" aria-hidden="true" />Add to header navigation</NuxtLink>
              <p v-if="!page.is_published" class="mt-3 text-xs leading-5 text-admin-muted">Save and publish this page first. Then add it to the header.</p>
              <p v-else-if="dirty" class="mt-3 text-xs leading-5 text-admin-muted">Save your page edits before setting up its menu link.</p>
              <p v-else class="mt-3 text-xs leading-5 text-admin-muted">Choose Add to header, then save and publish the website draft to make the menu link live.</p>
            </section>
          </div>

          <div v-if="activeTool === 'sections' && !selectedBlock" class="section-tree">
            <h2 class="section-tree-title">{{ page.title || 'Untitled page' }}</h2>
            <div class="section-tree-group">
              <div class="section-tree-heading"><h3>Template</h3><span>{{ page.payload.blocks.length }}/50</span></div>
              <p v-if="!page.payload.blocks.length" class="px-3 py-4 text-xs leading-5 text-admin-muted">Add your first section to start building this page.</p>
              <AdminWebsiteSectionMenuRow
                v-for="(block, index) in page.payload.blocks" :key="block.id"
                :label="blockLabel(block.type)" :icon="blockIcon(block.type)"
                :visible="block.visible" :composable="activeLocale === 'default'"
                :first="index === 0" :last="index === page.payload.blocks.length - 1"
                :expandable="supportsItems(block)"
                :data-section-id="block.id"
                removable
                @remove="removeBlock(block.id)"
                @select="openBlock(block.id)" @toggle="block.visible = !block.visible" @move="moveBlock(index, $event)"
              >
                <button v-if="activeLocale === 'default'" type="button" class="section-tree-add" :disabled="!canAddItem(block)" @click="addMenuItem(block)"><Icon name="heroicons:plus-circle" class="h-4 w-4 shrink-0" aria-hidden="true" />Add block<span class="sr-only"> to {{ blockLabel(block.type) }}</span></button>
                <button v-for="(item, itemIndex) in block.content.items || []" :key="repeaterItemKey(item, itemIndex)" type="button" class="section-tree-item" @click="openMenuItem(block, Number(itemIndex))">
                  <img v-if="mediaUrl(item.media_id)" :src="mediaUrl(item.media_id)" alt="" class="h-5 w-5 shrink-0 rounded-sm object-cover" />
                  <Icon v-else :name="block.type === 'gallery' ? 'heroicons:photo' : 'heroicons:square-2-stack'" class="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span class="truncate">{{ item.heading || item.title || item.question || item.label || item.caption || `${repeaterItemName(block)} ${Number(itemIndex) + 1}` }}</span>
                </button>
                <p v-if="!repeaterItemCount(block)" class="px-2 py-2 text-xs text-admin-muted">No blocks yet</p>
              </AdminWebsiteSectionMenuRow>
              <button v-if="activeLocale === 'default'" ref="addSectionTrigger" type="button" class="section-tree-add section-tree-add-root" :disabled="page.payload.blocks.length >= 50" @click="sectionLibraryOpen = true"><Icon name="heroicons:plus-circle" class="h-4 w-4 shrink-0" aria-hidden="true" />Add section</button>
              <p v-else class="px-3 py-3 text-xs leading-5 text-admin-muted">Switch to default content to add or reorder sections.</p>
            </div>
          </div>

          <AdminWebsitePageSectionInspector
            v-if="activeTool === 'sections' && selectedBlock"
            ref="inspectorBack"
            v-model:panel="sectionPanel"
            :label="blockLabel(selectedBlock.type)"
            :visible="selectedBlock.visible"
            :editable="activeLocale === 'default'"
            :can-duplicate="page.payload.blocks.length < 50"
            @back="closeBlock"
            @duplicate="duplicateSelectedBlock"
            @remove="removeSelectedBlock"
            @toggle-visible="selectedBlock.visible = !selectedBlock.visible"
          >
            <template #content>
              <p v-if="activeLocale !== 'default'" class="rounded-lg bg-admin-soft px-3 py-2 text-xs leading-5 text-admin-muted">Translating content. Layout, links, and images come from default content.</p>
            <p v-if="isConnected(selectedBlock)" class="rounded-xl border border-admin-border bg-admin-soft px-3 py-2 text-xs leading-5 text-admin-muted">{{ blockDefinition(selectedBlock.type).description }} Text below belongs to this page; connected records remain managed in their existing Store Admin sections.</p>

            <template v-for="field in textFields(selectedBlock)" :key="field.key">
              <label class="block text-xs font-semibold text-admin-text">{{ field.label }}<textarea v-if="field.control === 'textarea'" :value="contentValue(selectedBlock, field.key)" :maxlength="field.max" :rows="field.key === 'body' ? 5 : 3" class="mt-2 w-full resize-y rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :placeholder="localizedPlaceholder(selectedBlock.content[field.key])" @input="setContentValue(selectedBlock, field.key, ($event.target as HTMLTextAreaElement).value)" /><input v-else :value="contentValue(selectedBlock, field.key)" :maxlength="field.max" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :placeholder="localizedPlaceholder(selectedBlock.content[field.key])" @input="setContentValue(selectedBlock, field.key, ($event.target as HTMLInputElement).value)" /></label>
            </template>

            <template v-if="hasMedia(selectedBlock) && activeLocale === 'default'">
              <div class="space-y-3 border-t border-admin-border pt-5">
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-[0.04em] text-admin-muted">Section image</h3>
                  <p class="mt-1 text-xs leading-5 text-admin-muted">Upload a new image or choose one already owned by this store.</p>
                </div>
                <AdminMediaUploader
                  :url="mediaUrl(selectedBlock.settings.media_id)"
                  :uploading="isMediaUploading(blockMediaKey(selectedBlock))"
                  label="Section image"
                  hint="JPG, PNG, GIF, WebP, or SVG up to 10 MB"
                  :input-id="blockMediaKey(selectedBlock)"
                  preview-class="h-36 w-full object-cover"
                  overlay
                  compact
                  replace-upload
                  @select="uploadBlockMedia(selectedBlock, $event)"
                  @remove="selectedBlock.settings.media_id = null"
                />
                <p v-if="mediaUploadErrors[blockMediaKey(selectedBlock)]" class="rounded-xl bg-admin-danger-soft px-3 py-2 text-xs font-medium text-admin-danger" role="alert">{{ mediaUploadErrors[blockMediaKey(selectedBlock)] }}</p>
                <label class="block text-xs font-semibold text-admin-text">Existing image<select v-model.number="selectedBlock.settings.media_id" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent"><option :value="null">No image</option><option v-for="asset in mediaAssets" :key="asset.id" :value="asset.id">{{ asset.name }}</option></select></label>
              </div>
              <label v-if="selectedBlock.type === 'image-text'" class="block text-xs font-semibold text-admin-text">Image description<input v-model="selectedBlock.settings.image_alt" maxlength="255" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text" /></label>
            </template>

            <div v-if="hasAction(selectedBlock)" class="space-y-4 border-t border-admin-border pt-5">
              <div v-for="action in actionsFor(selectedBlock)" :key="action.key" class="space-y-3">
                <h3 class="text-xs font-semibold uppercase tracking-[0.04em] text-admin-muted">{{ action.label }}</h3>
                <label class="block text-xs font-semibold text-admin-text">Label<input :value="actionLabelValue(selectedBlock, action.key)" maxlength="80" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text" :placeholder="localizedPlaceholder(actionFor(selectedBlock, action.key).label)" @input="setActionLabel(selectedBlock, action.key, ($event.target as HTMLInputElement).value)" /></label>
                <label v-if="activeLocale === 'default'" class="block text-xs font-semibold text-admin-text">Link<input v-model="actionFor(selectedBlock, action.key).link" maxlength="500" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text" placeholder="/contact" /></label>
                <p v-else class="break-words rounded-lg bg-admin-soft px-3 py-2 text-xs leading-5 text-admin-muted">Destination from default content: <span class="font-medium text-admin-text">{{ actionFor(selectedBlock, action.key).link || 'No destination set' }}</span></p>
              </div>
            </div>

            <AdminWebsitePageConnectedContentEditor
              v-if="isConnected(selectedBlock) && activeLocale === 'default'"
              :block="selectedBlock"
              :sources="sourcesFor(selectedBlock)"
              @patch="patchConnectedSettings(selectedBlock, $event)"
            />

            <div v-if="supportsItems(selectedBlock) && activeLocale === 'default'" class="space-y-3 border-t border-admin-border pt-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-[0.04em] text-admin-muted">{{ repeaterFor(selectedBlock)?.label }}</h3>
                  <p class="mt-1 text-xs tabular-nums text-admin-muted">{{ repeaterItemCount(selectedBlock) }} of {{ repeaterFor(selectedBlock)?.max_items }} added</p>
                </div>
                <button type="button" class="admin-focus min-h-11 shrink-0 rounded-xl px-3 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft disabled:cursor-not-allowed disabled:opacity-45" :disabled="!canAddItem(selectedBlock)" @click="addItem(selectedBlock)">Add {{ repeaterItemName(selectedBlock).toLowerCase() }}</button>
              </div>
              <div v-if="repeaterItemCount(selectedBlock) === 0" class="rounded-xl border border-dashed border-admin-border px-4 py-5 text-center">
                <p class="text-sm font-medium text-admin-text">No {{ repeaterFor(selectedBlock)?.label.toLowerCase() }} yet</p>
                <p class="mt-1 text-xs leading-5 text-admin-muted">Add one to start building this section. New items begin empty.</p>
              </div>
              <div v-else class="divide-y divide-admin-border border-y border-admin-border">
                <div v-for="(item, index) in selectedBlock.content.items || []" :key="repeaterItemKey(item, index)" :data-editor-item="index" class="space-y-3 py-4">
                  <div class="flex items-center justify-between gap-2">
                    <p class="min-w-0 truncate text-sm font-semibold text-admin-text">{{ repeaterItemName(selectedBlock) }} {{ Number(index) + 1 }}</p>
                    <div class="flex shrink-0 items-center gap-1">
                      <button type="button" class="admin-focus flex h-11 w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:opacity-35" :disabled="Number(index) === 0" :aria-label="'Move ' + repeaterItemName(selectedBlock).toLowerCase() + ' ' + (Number(index) + 1) + ' up'" @click="moveItem(selectedBlock, Number(index), -1)"><Icon name="heroicons:chevron-up" class="h-4 w-4" aria-hidden="true" /></button>
                      <button type="button" class="admin-focus flex h-11 w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:opacity-35" :disabled="Number(index) === repeaterItemCount(selectedBlock) - 1" :aria-label="'Move ' + repeaterItemName(selectedBlock).toLowerCase() + ' ' + (Number(index) + 1) + ' down'" @click="moveItem(selectedBlock, Number(index), 1)"><Icon name="heroicons:chevron-down" class="h-4 w-4" aria-hidden="true" /></button>
                      <button type="button" class="admin-focus flex h-11 w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-danger-soft hover:text-admin-danger" :aria-label="'Remove ' + repeaterItemName(selectedBlock).toLowerCase() + ' ' + (Number(index) + 1)" @click="removeItem(selectedBlock, Number(index))"><Icon name="heroicons:trash" class="h-4 w-4" aria-hidden="true" /></button>
                    </div>
                  </div>
                  <template v-for="itemField in itemFields(selectedBlock)" :key="itemField.key">
                    <label v-if="itemField.control === 'textarea'" class="block text-xs font-semibold text-admin-text">{{ itemField.label }}<textarea v-model="item[itemField.key]" :maxlength="itemField.max" rows="3" class="mt-1 w-full resize-y rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" /></label>
                    <div v-else-if="itemField.control === 'media'" class="space-y-2">
                      <p class="text-xs font-semibold text-admin-text">{{ itemField.label }}</p>
                      <AdminMediaUploader
                        :url="mediaUrl(item[itemField.key])"
                        :uploading="isMediaUploading(itemMediaKey(selectedBlock, item, index, itemField.key))"
                        :label="itemField.label"
                        hint="JPG, PNG, GIF, WebP, or SVG up to 10 MB"
                        :input-id="itemMediaKey(selectedBlock, item, index, itemField.key)"
                        preview-class="h-28 w-full object-cover"
                        overlay
                        compact
                        replace-upload
                        @select="uploadItemMedia(selectedBlock, item, index, itemField.key, $event)"
                        @remove="item[itemField.key] = null"
                      />
                      <p v-if="mediaUploadErrors[itemMediaKey(selectedBlock, item, index, itemField.key)]" class="rounded-lg bg-admin-danger-soft px-3 py-2 text-xs font-medium text-admin-danger" role="alert">{{ mediaUploadErrors[itemMediaKey(selectedBlock, item, index, itemField.key)] }}</p>
                      <label class="block text-xs font-semibold text-admin-text">Existing image<select v-model.number="item[itemField.key]" class="mt-1 min-h-11 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-sm text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent"><option :value="null">No image</option><option v-for="asset in mediaAssets" :key="asset.id" :value="asset.id">{{ asset.name }}</option></select></label>
                    </div>
                    <label v-else class="block text-xs font-semibold text-admin-text">{{ itemField.label }}<input v-model="item[itemField.key]" :maxlength="itemField.max" class="mt-1 min-h-11 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-sm text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :placeholder="itemField.key === 'link' ? '/services' : undefined" /></label>
                  </template>
                </div>
              </div>
              <p v-if="!canAddItem(selectedBlock)" class="text-xs leading-5 text-admin-muted">This section has reached its limit of {{ repeaterFor(selectedBlock)?.max_items }} {{ repeaterFor(selectedBlock)?.label.toLowerCase() }}.</p>
            </div>

            <div v-if="supportsItems(selectedBlock) && activeLocale !== 'default'" class="space-y-3 border-t border-admin-border pt-5">
              <div>
                <h3 class="text-xs font-semibold uppercase tracking-[0.04em] text-admin-muted">Translate {{ repeaterFor(selectedBlock)?.label }}</h3>
                <p class="mt-1 text-xs leading-5 text-admin-muted">Item order, links, and images come from default content. Leave a field empty to use its default text.</p>
              </div>
              <div v-if="repeaterItemCount(selectedBlock) === 0" class="rounded-xl border border-dashed border-admin-border px-4 py-5 text-center">
                <p class="text-sm font-medium text-admin-text">No items to translate</p>
                <p class="mt-1 text-xs leading-5 text-admin-muted">Switch to default content and add {{ repeaterFor(selectedBlock)?.label.toLowerCase() }} first.</p>
              </div>
              <div v-else class="divide-y divide-admin-border border-y border-admin-border">
                <div v-for="(item, index) in selectedBlock.content.items || []" :key="repeaterItemKey(item, index)" :data-editor-item="index" class="space-y-3 py-4">
                  <p class="min-w-0 truncate text-sm font-semibold text-admin-text">{{ repeaterItemName(selectedBlock) }} {{ Number(index) + 1 }}</p>
                  <template v-for="itemField in localizableItemFields(selectedBlock)" :key="itemField.key">
                    <label v-if="itemField.control === 'textarea'" class="block text-xs font-semibold text-admin-text">{{ itemField.label }}<textarea :value="localizedItemValue(selectedBlock, Number(index), itemField.key)" :maxlength="itemField.max" rows="3" class="mt-1 w-full resize-y rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :placeholder="localizedPlaceholder(item[itemField.key])" @input="setLocalizedItemValue(selectedBlock, Number(index), itemField.key, ($event.target as HTMLTextAreaElement).value)" /></label>
                    <label v-else class="block text-xs font-semibold text-admin-text">{{ itemField.label }}<input :value="localizedItemValue(selectedBlock, Number(index), itemField.key)" :maxlength="itemField.max" class="mt-1 min-h-11 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :placeholder="localizedPlaceholder(item[itemField.key])" @input="setLocalizedItemValue(selectedBlock, Number(index), itemField.key, ($event.target as HTMLInputElement).value)" /></label>
                  </template>
                </div>
              </div>
            </div>
              <p v-if="activeLocale === 'default'" class="text-xs leading-5 text-admin-muted">Starter text is editable. Replace it with your own words and images.</p>
            </template>
            <template #design>
              <AdminWebsitePageLayoutPicker v-model="selectedBlock.variant" :variants="variantsFor(selectedBlock.type)" :type="selectedBlock.type" compact />
              <AdminWebsitePageDesignInspector v-if="blockDefinition(selectedBlock.type).settings_keys.includes('design')" :block="selectedBlock" expanded @change="setSectionDesign(selectedBlock, $event)" />
            <div v-if="settingFields(selectedBlock).length && activeLocale === 'default'" class="space-y-4 border-t border-admin-border pt-5">
              <h3 class="text-xs font-semibold uppercase tracking-[0.04em] text-admin-muted">Section settings</h3>
              <template v-for="setting in settingFields(selectedBlock)" :key="setting.key">
                <label v-if="setting.control === 'select'" class="block text-xs font-semibold text-admin-text">{{ setting.label }}<select v-model="selectedBlock.settings[setting.key]" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text"><option v-for="option in setting.options" :key="option" :value="option">{{ humanize(option) }}</option></select></label>
                <label v-else-if="setting.control === 'number'" class="block text-xs font-semibold text-admin-text">{{ setting.label }}<span class="relative mt-2 block"><input v-model.number="selectedBlock.settings[setting.key]" type="number" :min="setting.min" :max="setting.max" :step="setting.step" class="min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text" :class="setting.suffix ? 'pr-10' : ''" /><span v-if="setting.suffix" class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-admin-muted">{{ setting.suffix }}</span></span></label>
                <fieldset v-else-if="setting.control === 'multiselect'" class="space-y-2"><legend class="text-xs font-semibold text-admin-text">{{ setting.label }}</legend><label v-for="option in setting.options" :key="option" class="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-admin-soft px-3 text-sm font-medium text-admin-text">{{ humanize(option) }}<input type="checkbox" :checked="settingIncludes(selectedBlock, setting.key, option)" class="h-5 w-5 rounded border-admin-border text-admin-accent focus:ring-admin-accent" @change="toggleSettingOption(selectedBlock, setting.key, option)" /></label></fieldset>
                <label v-else-if="setting.control === 'color'" class="block text-xs font-semibold text-admin-text">{{ setting.label }}<span class="mt-2 flex items-center gap-2"><input v-model="selectedBlock.settings[setting.key]" type="color" class="h-11 w-12 cursor-pointer rounded-xl border border-admin-border bg-admin-surface p-1" /><input v-model="selectedBlock.settings[setting.key]" maxlength="7" pattern="#[0-9A-Fa-f]{6}" class="min-h-11 min-w-0 flex-1 rounded-xl border border-admin-border bg-admin-surface px-3 font-mono text-base text-admin-text" /></span></label>
              </template>
            </div>

            </template>
          </AdminWebsitePageSectionInspector>

          <div v-if="activeTool === 'seo'" class="p-5">
            <h2 class="text-sm font-semibold text-admin-text">Search appearance</h2>
            <label class="mt-4 block text-xs font-semibold text-admin-text">SEO title<input :value="seoValue('title')" maxlength="70" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text" :placeholder="localizedPlaceholder(page.payload.seo.title)" @input="setSeoValue('title', ($event.target as HTMLInputElement).value)" /></label>
            <label class="mt-4 block text-xs font-semibold text-admin-text">Description<textarea :value="seoValue('description')" maxlength="160" rows="3" class="mt-2 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-base text-admin-text" :placeholder="localizedPlaceholder(page.payload.seo.description)" @input="setSeoValue('description', ($event.target as HTMLTextAreaElement).value)" /></label>
            <div v-if="activeLocale === 'default'" class="mt-5 space-y-3 border-t border-admin-border pt-5">
              <div>
                <h3 class="text-xs font-semibold text-admin-text">Social sharing image</h3>
                <p class="mt-1 text-xs leading-5 text-admin-muted">Used when this page is shared on supported social platforms.</p>
              </div>
              <AdminMediaUploader
                :url="mediaUrl(page.payload.seo.og_image_media_id)"
                :uploading="isMediaUploading('page-seo-image')"
                label="Social sharing image"
                hint="JPG, PNG, GIF, WebP, or SVG up to 10 MB"
                input-id="page-seo-image"
                preview-class="h-32 w-full object-cover"
                overlay
                compact
                replace-upload
                @select="uploadSeoMedia"
                @remove="page.payload.seo.og_image_media_id = null"
              />
              <p v-if="mediaUploadErrors['page-seo-image']" class="rounded-xl bg-admin-danger-soft px-3 py-2 text-xs font-medium text-admin-danger" role="alert">{{ mediaUploadErrors['page-seo-image'] }}</p>
              <label class="block text-xs font-semibold text-admin-text">Existing image<select v-model.number="page.payload.seo.og_image_media_id" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent"><option :value="null">No image</option><option v-for="asset in mediaAssets" :key="asset.id" :value="asset.id">{{ asset.name }}</option></select></label>
            </div>
            <label v-if="activeLocale === 'default'" class="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-admin-soft px-3 text-sm font-medium text-admin-text">Hide from search engines<input v-model="page.payload.seo.noindex" type="checkbox" class="h-5 w-5 rounded border-admin-border text-admin-accent" /></label>
          </div>
          </div>
          <footer class="workspace-panel-footer">
            <p class="text-xs leading-5 text-admin-muted">Save your draft, then review publication to make it live.</p>
            <button type="button" class="workspace-back workspace-mobile-publication" :disabled="dirty || saving || publicationBusy || conflict || Boolean(uploadingMediaKey)" @click="publication?.open()">Review publication<Icon name="heroicons:arrow-up-right" class="h-4 w-4" aria-hidden="true" /></button>
            <button v-if="activeTool === 'settings' && !page.is_published" type="button" class="workspace-back text-admin-danger" :disabled="saving || publicationBusy || Boolean(uploadingMediaKey)" @click="deletePage"><Icon name="heroicons:trash" class="h-4 w-4" aria-hidden="true" />Delete draft</button>
          </footer>
        </aside>

        <section class="workspace-preview" aria-label="Page preview">
          <div class="workspace-preview-toolbar">
            <div class="flex min-w-0 items-center gap-2 text-xs text-admin-muted"><Icon name="heroicons:lock-closed" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span class="truncate">{{ page.path }}</span></div>
            <div class="flex items-center gap-2">
              <label class="sr-only" for="page-editor-locale">Editing language</label>
              <select id="page-editor-locale" v-model="activeLocale" class="workspace-locale"><option value="default">Default content</option><option v-for="locale in supportedLocales" :key="locale" :value="locale">{{ locale }}</option></select>
              <div class="workspace-devices" role="group" aria-label="Preview size">
                <button v-for="device in previewDevices" :key="device.id" type="button" :aria-label="device.label + ' preview'" :title="device.label + ' preview'" :aria-pressed="previewDevice === device.id" @click="previewDevice = device.id"><Icon :name="device.icon" class="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          </div>
          <div class="workspace-canvas">
            <AdminWebsitePagePreview :title="page.title" :document="previewDocument" :media="previewMedia" :collections="previewCollections" :selected-block-id="selectedBlockId" @select-block="openBlock" :style="{ width: previewDevice === 'mobile' ? '390px' : previewDevice === 'tablet' ? '768px' : '100%' }" class="workspace-preview-frame" />
          </div>
          <footer class="workspace-preview-footer">
            <span v-if="previewCollectionsLoading" role="status">Refreshing connected content…</span>
            <span v-else-if="previewCollectionsError" class="text-admin-danger" role="alert">{{ previewCollectionsError }}</span>
            <span v-else>Preview · Links and forms disabled</span>
            <span class="hidden sm:inline">Private draft</span>
          </footer>
        </section>
      </div>
    </template>
    <AdminWebsitePageSectionLibrary :open="sectionLibraryOpen" :definitions="blockDefinitions" @close="sectionLibraryOpen = false" @add="addBlock" />
    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import type { WebsiteEditorMediaAsset } from '~/composables/useWebsiteEditorMediaLibrary'
import { useWebsitePages } from '~/composables/useWebsitePages'
import type { WebsiteBlockType } from '~/themes/contracts'
import type { WebsitePageBlock, WebsitePageBlockFieldDefinition, WebsitePageCollectionItem, WebsitePageDetail, WebsitePageDocument, WebsitePageMedia } from '~/types/websitePage'
import { websitePageStarterContent } from '~/utils/websitePageStarters'
import type { WebsitePageSectionDesign } from '~/utils/websitePageDesign'
import { WEBSITE_EDITOR_PAGES, type WebsiteEditorPageId } from '~/utils/websiteEditorPages'
import { useWebsitePageDraftSession } from '~/composables/useWebsitePageDraftSession'
import { useWebsiteEditorPageDirectory } from '~/composables/useWebsiteEditorPageDirectory'
import { applyWebsitePageLocale } from '~/utils/websitePageLocalization'

const props = defineProps<{ uuid: string }>()
const { siteConfig, fetchSiteConfig } = useSiteConfig()
const pagesApi = useWebsitePages()
const directory = useWebsiteEditorPageDirectory()
const pageOptions = computed(() => WEBSITE_EDITOR_PAGES.map(option => ({
  ...option, storefrontDisabled: Boolean(option.module && siteConfig.value?.modules_enabled?.[option.module] === false),
})))
function openBuiltinPage(page: WebsiteEditorPageId) { return navigateTo({ path: '/admin/website-editor', query: { page } }) }
const blockCatalog = useWebsitePageBlockCatalog()
const {
  definitions: blockDefinitions,
  load: loadBlockDefinitions,
  definition: blockDefinition,
  createBlock,
  label: blockLabel,
  icon: blockIcon,
  variants: variantsFor,
  fields: textFields,
  settings: settingFields,
  hasMedia,
  hasAction: contractHasAction,
  actions: actionsFor,
  isConnected,
  dynamicSources: sourcesFor,
  repeater: repeaterFor,
  addRepeaterItem: addCatalogItem,
  canAddRepeaterItem: canAddItem,
  moveRepeaterItem: moveCatalogItem,
  removeRepeaterItem: removeCatalogItem,
} = blockCatalog
const { fetchAssets, uploadPageAsset } = useWebsiteEditorMediaLibrary()
const page = ref<WebsitePageDetail | null>(null)
const loading = ref(true)
const error = ref('')
const selectedBlockId = ref<string | null>(null)
const activeLocale = ref('default')
const activeTool = ref('sections')
const sectionPanel = ref<'content' | 'design'>('content')
const sectionLibraryOpen = ref(false)
const addSectionTrigger = ref<HTMLButtonElement | null>(null)
const mobileView = ref('tools')
const previewDevice = ref('desktop')
const pageTools = [{ id: 'sections', label: 'Sections' }, { id: 'settings', label: 'Page' }, { id: 'seo', label: 'Search' }]
const previewDevices = [
  { id: 'desktop', label: 'Desktop', icon: 'heroicons:computer-desktop' },
  { id: 'tablet', label: 'Tablet', icon: 'heroicons:device-tablet' },
  { id: 'mobile', label: 'Mobile', icon: 'heroicons:device-phone-mobile' },
]
const inspectorBack = ref<{ focus: () => void } | null>(null)
function openBlock(id: string) {
  sectionPanel.value = 'content'
  selectedBlockId.value = id
  activeTool.value = 'sections'
  nextTick(() => inspectorBack.value?.focus())
}
async function openMenuItem(block: WebsitePageBlock, index: number) {
  openBlock(block.id)
  await nextTick()
  const item = document.querySelector<HTMLElement>(`[data-editor-item="${index}"]`)
  item?.scrollIntoView({ block: 'nearest' })
  const field = item?.querySelector<HTMLElement>('input:not([type="file"]):not([type="hidden"]), textarea, select') ?? item?.querySelector<HTMLElement>('button')
  field?.focus({ preventScroll: true })
}
function addMenuItem(block: WebsitePageBlock) {
  if (activeLocale.value !== 'default' || !canAddItem(block)) return
  addItem(block)
  void openMenuItem(block, repeaterItemCount(block) - 1)
}
function closeBlock() {
  selectedBlockId.value = null
  nextTick(() => document.querySelector<HTMLButtonElement>('[aria-label="Page tools"] button')?.focus())
}
const mediaAssets = ref<WebsiteEditorMediaAsset[]>([])
const uploadingMediaKey = ref<string | null>(null)
const mediaUploadErrors = reactive<Record<string, string>>({})
const previewCollections = ref<Record<string, WebsitePageCollectionItem[]>>({})
const previewCollectionsLoading = ref(false)
const previewCollectionsError = ref('')
const repeaterItemKeys = new WeakMap<object, string>()
let repeaterItemSequence = 0
let previewCollectionsTimer: ReturnType<typeof setTimeout> | null = null
let previewCollectionsRequest = 0
const pagePath = computed({ get: () => page.value?.path.replace(/^\//, '') || '', set: value => { if (page.value) page.value.path = `/${value.replace(/^\/+/, '')}` } })
const supportedLocales = computed(() => (siteConfig.value?.supported_locales || []).filter(locale => locale !== siteConfig.value?.default_locale))
const selectedBlock = computed(() => page.value?.payload.blocks.find(block => block.id === selectedBlockId.value) ?? null)
const auth = useAuthStore()
const { dirty, saving, saveError, saveMessage, savedSnapshot, conflict, recovery, markLoaded, restoreRecovery, dismissRecovery, copyChanges, save: savePageDraft } = useWebsitePageDraftSession({
  page, api: pagesApi, recoveryOwner: () => auth.user?.id && (auth.user.store_id || auth.user.store?.id) ? `${auth.user.id}:${auth.user.store_id ?? auth.user.store?.id}` : '',
})
const publication = ref<{ open: () => Promise<void> } | null>(null)
const publicationBusy = ref(false)
function guardHeaderShortcut(event: MouseEvent) {
  if (dirty.value || saving.value || publicationBusy.value || uploadingMediaKey.value) {
    event.preventDefault()
    saveError.value = 'Finish saving your page before adding its header link.'
  }
}
async function reloadLatestPage() {
  if (!canLeave()) return
  await load()
}
async function refreshPublishedPage() {
  // Publication never replaces content in the local editor.
  if (!page.value) return
  try {
    const latest = await pagesApi.get(encodeURIComponent(props.uuid))
    page.value.is_published = latest.data.is_published
    page.value.published_version = latest.data.published_version
    page.value.has_unpublished_changes = latest.data.has_unpublished_changes
    await directory.load()
  } catch { saveError.value = 'Website published, but the page status could not refresh. Reload to see its latest status.' }
}
const previewMedia = computed<Record<number, WebsitePageMedia>>(() => Object.fromEntries(mediaAssets.value.map(asset => [asset.id, { id: asset.id, url: asset.url, alt: asset.alt_text }])))
const previewDocument = computed<WebsitePageDocument>(() => {
  if (!page.value || activeLocale.value === 'default') return page.value?.payload || { blocks: [], seo: { title: null, description: null, noindex: false, og_image_media_id: null }, localized_content: {} }
  return applyWebsitePageLocale(page.value.payload, activeLocale.value)
})

async function load() {
  loading.value = true; error.value = ''; saveError.value = ''
  try {
    await fetchSiteConfig()
    const [response, mediaResponse] = await Promise.all([
      pagesApi.get(encodeURIComponent(props.uuid)),
      loadMediaAssets().catch(() => []),
      loadBlockDefinitions(),
    ])
    const loadedPage = structuredClone(response.data)
    for (const block of loadedPage.payload.blocks) normalizeBlockForEditor(block)
    page.value = loadedPage
    mediaAssets.value = mediaResponse
    selectedBlockId.value = null
    markLoaded()
  } catch (requestError: any) { error.value = requestError?.data?.message || 'The page editor could not be loaded.' } finally { loading.value = false }
}
async function loadMediaAssets() {
  const assets: WebsiteEditorMediaAsset[] = []
  let page = 1
  let lastPage = 1
  do {
    const response = await fetchAssets({ slot: 'hero', type: 'image', page })
    assets.push(...response.data)
    lastPage = response.meta.last_page
    page += 1
  } while (page <= lastPage)
  return assets
}
function snapshot() { return page.value ? JSON.stringify({ title: page.value.title, path: page.value.path, payload: page.value.payload }) : '' }
function blockMediaKey(block: WebsitePageBlock) { return 'page-block-image-' + block.id }
function itemMediaKey(block: WebsitePageBlock, item: unknown, index: string | number, field: string) { return 'page-item-image-' + block.id + '-' + repeaterItemKey(item, index) + '-' + field }
function isMediaUploading(key: string) { return uploadingMediaKey.value === key }
function mediaUrl(mediaId: unknown) {
  const id = Number(mediaId)
  if (!Number.isInteger(id) || id <= 0) return ''
  return mediaAssets.value.find(asset => asset.id === id)?.url ?? ''
}
async function uploadMedia(file: File, key: string, apply: (mediaId: number) => void) {
  if (uploadingMediaKey.value) return
  mediaUploadErrors[key] = ''

  const supportedType = file.type.startsWith('image/') || /\.(svg|svgz)$/i.test(file.name)
  if (!supportedType) {
    mediaUploadErrors[key] = 'Choose a JPG, PNG, GIF, WebP, or SVG image.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    mediaUploadErrors[key] = 'Choose an image smaller than 10 MB.'
    return
  }

  uploadingMediaKey.value = key
  try {
    const response = await uploadPageAsset(file)
    const existingIndex = mediaAssets.value.findIndex(asset => asset.id === response.data.id)
    if (existingIndex >= 0) mediaAssets.value.splice(existingIndex, 1, response.data)
    else mediaAssets.value.unshift(response.data)
    apply(response.data.id)
    saveMessage.value = 'Image uploaded and selected. Save the page draft to keep this placement.'
  } catch (requestError: any) {
    mediaUploadErrors[key] = requestError?.data?.errors?.file?.[0] || requestError?.data?.message || 'The image could not be uploaded.'
  } finally {
    uploadingMediaKey.value = null
  }
}
function uploadBlockMedia(block: WebsitePageBlock, file: File) {
  return uploadMedia(file, blockMediaKey(block), mediaId => { block.settings.media_id = mediaId })
}
function uploadItemMedia(block: WebsitePageBlock, item: Record<string, any>, index: string | number, field: string, file: File) {
  return uploadMedia(file, itemMediaKey(block, item, index, field), mediaId => {
    item[field] = mediaId
  })
}
function uploadSeoMedia(file: File) {
  if (!page.value) return
  return uploadMedia(file, 'page-seo-image', mediaId => {
    if (page.value) page.value.payload.seo.og_image_media_id = mediaId
  })
}
function normalizePath() { if (page.value) page.value.path = `/${pagePath.value.toLowerCase().replace(/[^a-z0-9/-]+/g, '-').replace(/-+/g, '-')}` }
async function save() {
  if (uploadingMediaKey.value || publicationBusy.value || loading.value) return
  await savePageDraft()
  if (page.value && selectedBlockId.value && !page.value.payload.blocks.some(block => block.id === selectedBlockId.value)) selectedBlockId.value = null
}
async function deletePage() {
  if (saving.value || publicationBusy.value || uploadingMediaKey.value) return
  if (!page.value || !confirm(`Delete the private draft “${page.value.title}”? This cannot be undone.`)) return
  saveError.value = ''
  try {
    await pagesApi.remove(page.value.uuid, page.value.draft_version)
    savedSnapshot.value = snapshot()
    dismissRecovery()
    await navigateTo('/admin/website-pages')
  } catch (requestError: any) {
    saveError.value = requestError?.data?.message || 'The page draft could not be deleted.'
  }
}
function humanize(value: string) { return value.replace(/-/g, ' ').replace(/^./, character => character.toUpperCase()) }
function addBlock(type: WebsiteBlockType, variant: string | null = null) {
  if (!page.value || activeLocale.value !== 'default' || page.value.payload.blocks.length >= 50) return
  const block = createBlock(type)
  if (variant && variantsFor(type).includes(variant)) block.variant = variant
  block.content = websitePageStarterContent(blockDefinition(type))
  page.value.payload.blocks.push(block)
  sectionLibraryOpen.value = false
  openBlock(block.id)
}
function setSectionDesign(block: WebsitePageBlock, design: WebsitePageSectionDesign) {
  if (Object.keys(design).length) block.settings.design = design
  else delete block.settings.design
}
function duplicateSelectedBlock() {
  if (!page.value || !selectedBlock.value || activeLocale.value !== 'default' || page.value.payload.blocks.length >= 50) return
  const original = selectedBlock.value
  const copy = JSON.parse(JSON.stringify(original)) as WebsitePageBlock
  copy.id = createBlock(original.type).id
  const index = page.value.payload.blocks.findIndex(block => block.id === original.id)
  page.value.payload.blocks.splice(index + 1, 0, copy)
  for (const translation of Object.values(page.value.payload.localized_content)) {
    if (translation.blocks?.[original.id]) translation.blocks[copy.id] = JSON.parse(JSON.stringify(translation.blocks[original.id]))
  }
  openBlock(copy.id)
}
function moveBlock(index: number, direction: number) { if (!page.value) return; const target = index + direction; if (target < 0 || target >= page.value.payload.blocks.length) return; const [block] = page.value.payload.blocks.splice(index, 1); if (block) page.value.payload.blocks.splice(target, 0, block) }
function hasLocalizedValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasLocalizedValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasLocalizedValue)
  return value !== '' && value !== null && value !== undefined
}
function pruneLocale(locale: string) {
  if (!page.value) return
  const translation = page.value.payload.localized_content[locale]
  if (!translation) return
  if (translation.seo) {
    for (const [key, value] of Object.entries(translation.seo)) {
      if (!hasLocalizedValue(value)) delete translation.seo[key as keyof typeof translation.seo]
    }
    if (Object.keys(translation.seo).length === 0) delete translation.seo
  }
  if (translation.blocks) {
    for (const [blockId, localizedBlock] of Object.entries(translation.blocks)) {
      if (!hasLocalizedValue(localizedBlock.content)) delete translation.blocks[blockId]
    }
    if (Object.keys(translation.blocks).length === 0) delete translation.blocks
  }
  if (!translation.seo && !translation.blocks) delete page.value.payload.localized_content[locale]
}
function pruneLocalizedBlock(locale: string, blockId: string) {
  const localizedBlock = page.value?.payload.localized_content[locale]?.blocks?.[blockId]
  if (localizedBlock && !hasLocalizedValue(localizedBlock.content)) {
    delete page.value?.payload.localized_content[locale]?.blocks?.[blockId]
  }
  pruneLocale(locale)
}
function removeSelectedBlock() {
  if (selectedBlock.value) removeBlock(selectedBlock.value.id)
}
function removeBlock(blockId: string) {
  if (!page.value || activeLocale.value !== 'default') return
  const index = page.value.payload.blocks.findIndex(block => block.id === blockId)
  if (index < 0) return
  const removingFromList = selectedBlockId.value === null
  page.value.payload.blocks.splice(index, 1)
  for (const locale of Object.keys(page.value.payload.localized_content)) {
    delete page.value.payload.localized_content[locale]?.blocks?.[blockId]
    pruneLocale(locale)
  }
  const nextId = page.value.payload.blocks[index]?.id || page.value.payload.blocks[index - 1]?.id || null
  if (selectedBlockId.value === blockId) selectedBlockId.value = nextId
  if (removingFromList) nextTick(() => {
    if (nextId) document.querySelector<HTMLButtonElement>(`[data-section-id="${CSS.escape(nextId)}"] .section-menu-select`)?.focus()
    else addSectionTrigger.value?.focus()
  })
}

function localizedContent(block: WebsitePageBlock) { if (!page.value || activeLocale.value === 'default') return block.content; const locale = activeLocale.value; page.value.payload.localized_content[locale] ??= { seo: {}, blocks: {} }; page.value.payload.localized_content[locale].blocks ??= {}; page.value.payload.localized_content[locale].blocks![block.id] ??= { content: {} }; return page.value.payload.localized_content[locale].blocks![block.id]!.content }
function contentValue(block: WebsitePageBlock, key: string) { const localized = activeLocale.value === 'default' ? block.content : page.value?.payload.localized_content[activeLocale.value]?.blocks?.[block.id]?.content || {}; return localized[key] ?? '' }
function setContentValue(block: WebsitePageBlock, key: string, value: string) {
  if (activeLocale.value === 'default') { block.content[key] = value; return }
  if (value === '') {
    const content = page.value?.payload.localized_content[activeLocale.value]?.blocks?.[block.id]?.content
    if (content) delete content[key]
    pruneLocalizedBlock(activeLocale.value, block.id)
    return
  }
  localizedContent(block)[key] = value
}
function localizedPlaceholder(value: unknown) {
  if (activeLocale.value === 'default') return undefined
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return 'Uses default content'
  return `Default: ${text.length > 120 ? `${text.slice(0, 117)}…` : text}`
}
function seoValue(key: 'title' | 'description') { if (!page.value) return ''; return activeLocale.value === 'default' ? page.value.payload.seo[key] || '' : page.value.payload.localized_content[activeLocale.value]?.seo?.[key] || '' }
function setSeoValue(key: 'title' | 'description', value: string) {
  if (!page.value) return
  if (activeLocale.value === 'default') { page.value.payload.seo[key] = value; return }
  if (value === '') {
    const seo = page.value.payload.localized_content[activeLocale.value]?.seo
    if (seo) delete seo[key]
    pruneLocale(activeLocale.value)
    return
  }
  const localized = page.value.payload.localized_content[activeLocale.value] ??= { seo: {}, blocks: {} }
  localized.seo ??= {}
  localized.seo[key] = value
}
function hasAction(block: WebsitePageBlock) { return contractHasAction(block) }
function actionFor(block: WebsitePageBlock, key: string) { return block.content[key] ??= { label: '', link: '' } }
function actionLabelValue(block: WebsitePageBlock, key: string) {
  if (activeLocale.value === 'default') return actionFor(block, key).label ?? ''
  return page.value?.payload.localized_content[activeLocale.value]?.blocks?.[block.id]?.content?.[key]?.label ?? ''
}
function setActionLabel(block: WebsitePageBlock, key: string, value: string) {
  if (activeLocale.value === 'default') { actionFor(block, key).label = value; return }
  if (value === '') {
    const content = page.value?.payload.localized_content[activeLocale.value]?.blocks?.[block.id]?.content
    if (content?.[key] && typeof content[key] === 'object') delete content[key].label
    pruneLocalizedBlock(activeLocale.value, block.id)
    return
  }
  const content = localizedContent(block)
  if (!content[key] || typeof content[key] !== 'object' || Array.isArray(content[key])) content[key] = {}
  content[key].label = value
}
function settingIncludes(block: WebsitePageBlock, key: string, option: string) { return Array.isArray(block.settings[key]) && block.settings[key].includes(option) }
function toggleSettingOption(block: WebsitePageBlock, key: string, option: string) {
  const values = Array.isArray(block.settings[key]) ? [...block.settings[key]] : []
  block.settings[key] = values.includes(option) ? values.filter(value => value !== option) : [...values, option]
}
function normalizeBlockForEditor(block: WebsitePageBlock) {
  const contract = blockDefinition(block.type)
  block.variant ??= contract.default_variant
  block.settings = { ...JSON.parse(JSON.stringify(contract.defaults.settings)), ...block.settings }
  for (const action of actionsFor(block)) actionFor(block, action.key)
}
function patchConnectedSettings(block: WebsitePageBlock, settings: Record<string, unknown>) {
  block.settings = { ...block.settings, ...settings }
}
function connectedBlocksForPreview() {
  return (page.value?.payload.blocks ?? [])
    .filter(block => isConnected(block))
    .map(block => ({ id: block.id, type: block.type, settings: block.settings }))
}
async function refreshPreviewCollections() {
  const blocks = connectedBlocksForPreview()
  const request = ++previewCollectionsRequest
  if (blocks.length === 0) {
    previewCollections.value = {}
    previewCollectionsError.value = ''
    previewCollectionsLoading.value = false
    return
  }
  previewCollectionsLoading.value = true
  previewCollectionsError.value = ''
  try {
    const response = await pagesApi.previewCollections(blocks)
    if (request === previewCollectionsRequest) previewCollections.value = response.data.collections
  } catch (requestError: any) {
    if (request === previewCollectionsRequest) {
      previewCollectionsError.value = requestError?.data?.message || 'Connected content preview is temporarily unavailable.'
    }
  } finally {
    if (request === previewCollectionsRequest) previewCollectionsLoading.value = false
  }
}
function schedulePreviewCollections() {
  if (previewCollectionsTimer) clearTimeout(previewCollectionsTimer)
  previewCollectionsTimer = setTimeout(() => { void refreshPreviewCollections() }, 250)
}
function supportsItems(block: WebsitePageBlock) { return repeaterFor(block) !== null }
function itemFields(block: WebsitePageBlock) { return repeaterFor(block)?.fields ?? [] }
function localizableItemFields(block: WebsitePageBlock): WebsitePageBlockFieldDefinition[] { return itemFields(block).filter(field => field.control !== 'media' && field.key !== 'link') }
function repeaterItemCount(block: WebsitePageBlock) { return Array.isArray(block.content.items) ? block.content.items.length : 0 }
function repeaterItemName(block: WebsitePageBlock) { return repeaterFor(block)?.item_label || 'Item' }
function localizedItems(block: WebsitePageBlock) {
  return page.value?.payload.localized_content[activeLocale.value]?.blocks?.[block.id]?.content?.items
}
function localizedItemValue(block: WebsitePageBlock, index: number, key: string) {
  const items = localizedItems(block)
  return Array.isArray(items) ? items[index]?.[key] ?? '' : ''
}
function setLocalizedItemValue(block: WebsitePageBlock, index: number, key: string, value: string) {
  if (activeLocale.value === 'default' || index < 0 || index >= repeaterItemCount(block)) return
  if (value === '') {
    const items = localizedItems(block)
    if (Array.isArray(items) && items[index] && typeof items[index] === 'object') delete items[index][key]
    pruneLocalizedBlock(activeLocale.value, block.id)
    return
  }
  const content = localizedContent(block)
  if (!Array.isArray(content.items)) content.items = []
  while (content.items.length <= index) content.items.push({})
  content.items[index][key] = value
}
function forEachLocalizedItems(block: WebsitePageBlock, apply: (items: Record<string, any>[]) => void) {
  if (!page.value) return
  for (const [locale, translation] of Object.entries(page.value.payload.localized_content)) {
    const items = translation.blocks?.[block.id]?.content?.items
    if (!Array.isArray(items)) continue
    apply(items)
    pruneLocalizedBlock(locale, block.id)
  }
}
function addItem(block: WebsitePageBlock) {
  const previousCount = repeaterItemCount(block)
  addCatalogItem(block)
  const nextCount = repeaterItemCount(block)
  if (nextCount === previousCount) return
  forEachLocalizedItems(block, (items) => { while (items.length < nextCount) items.push({}) })
}
function moveItem(block: WebsitePageBlock, index: number, direction: number) {
  const itemCount = repeaterItemCount(block)
  const target = index + direction
  if (index < 0 || target < 0 || index >= itemCount || target >= itemCount) return
  moveCatalogItem(block, index, direction === -1 ? -1 : 1)
  forEachLocalizedItems(block, (items) => {
    while (items.length < itemCount) items.push({})
    const [item] = items.splice(index, 1)
    items.splice(target, 0, item ?? {})
  })
}
function removeItem(block: WebsitePageBlock, index: number) {
  if (index < 0 || index >= repeaterItemCount(block)) return
  removeCatalogItem(block, index)
  forEachLocalizedItems(block, (items) => { if (index < items.length) items.splice(index, 1) })
}
function repeaterItemKey(item: unknown, index: string | number) {
  if (typeof item !== 'object' || item === null) return 'legacy-item-' + index
  const existing = repeaterItemKeys.get(item)
  if (existing) return existing
  repeaterItemSequence += 1
  const key = 'page-repeater-item-' + repeaterItemSequence
  repeaterItemKeys.set(item, key)
  return key
}

watch(
  () => JSON.stringify(connectedBlocksForPreview()),
  schedulePreviewCollections,
  { immediate: true },
)
function canLeave() { if (saving.value || publicationBusy.value || uploadingMediaKey.value) { saveError.value = 'Wait for the current save, upload or publication action to finish before leaving.'; return false } return !dirty.value || window.confirm('Discard unsaved page changes?') }
onBeforeRouteLeave(canLeave)
defineExpose({ canLeave })
function guardUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
function saveShortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void save()
  }
}
onMounted(() => {
  void directory.load().catch(() => {})
  window.addEventListener('beforeunload', guardUnload)
  window.addEventListener('keydown', saveShortcut)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', guardUnload)
  window.removeEventListener('keydown', saveShortcut)
  if (previewCollectionsTimer) clearTimeout(previewCollectionsTimer)
  previewCollectionsRequest += 1
})
await load()
</script>

<style scoped src="~/assets/css/editor-workspace.css"></style>
