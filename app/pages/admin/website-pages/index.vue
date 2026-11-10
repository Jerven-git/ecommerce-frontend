<template>
  <div>
    <nav aria-label="Breadcrumb" class="mb-4 flex items-center gap-2 text-xs text-admin-muted">
      <NuxtLink to="/admin" class="admin-focus rounded hover:text-admin-text">Dashboard</NuxtLink>
      <Icon name="heroicons:chevron-right" class="h-3 w-3" aria-hidden="true" />
      <span aria-current="page" class="text-admin-text">Website pages</span>
    </nav>

    <header class="pages-header">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-admin-text">Website pages</h1>
        <p class="mt-1 text-sm text-admin-muted">Manage your custom pages. Design and publish in the Website Editor.</p>
      </div>
      <div class="pages-actions">
        <NuxtLink to="/admin/website-editor" class="pages-button pages-button--quiet admin-focus">
          <Icon name="heroicons:paint-brush" class="h-4 w-4" aria-hidden="true" />Website Editor
        </NuxtLink>
        <NuxtLink to="/admin/website-editor?page=global&section=header" class="pages-button admin-focus">
          <Icon name="heroicons:bars-3" class="h-4 w-4" aria-hidden="true" />Header navigation
        </NuxtLink>
        <button type="button" class="pages-button pages-button--primary admin-focus" :aria-expanded="creating" aria-controls="new-page-form" @click="creating = !creating">
          <Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />New page
        </button>
      </div>
    </header>

    <section v-if="creating" id="new-page-form" class="pages-create mb-4 rounded-xl border border-admin-border bg-admin-surface p-4" aria-labelledby="new-page-title">
      <div class="flex items-start justify-between gap-4"><div><h2 id="new-page-title" class="text-base font-semibold text-admin-text">Create a private page draft</h2><p class="mt-1 text-sm text-admin-muted">The path becomes public only after you publish it.</p></div><button type="button" class="pages-button pages-button--quiet admin-focus" @click="creating = false">Cancel</button></div>
      <form class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end" @submit.prevent="createPage">
        <label class="text-sm font-semibold text-admin-text">Page title<input v-model="newPage.title" required maxlength="255" class="mt-1.5 min-h-9 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-sm text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" placeholder="Company profile" /></label>
        <label class="text-sm font-semibold text-admin-text">Page path<span class="mt-1.5 flex min-h-9 items-center rounded-lg border border-admin-border bg-admin-surface px-3 focus-within:outline focus-within:outline-2 focus-within:outline-admin-accent"><span class="text-admin-muted">/</span><input v-model="newPage.path" required class="min-w-0 flex-1 bg-transparent text-sm text-admin-text outline-none" placeholder="company-profile" @input="normalizeNewPath" /></span></label>
        <button type="submit" :disabled="creatingPage" class="pages-button pages-button--primary admin-focus disabled:cursor-wait disabled:opacity-60">{{ creatingPage ? 'Creating…' : 'Create page' }}</button>
      </form>
      <p v-if="createError" class="mt-3 text-sm text-admin-danger" role="alert">{{ createError }}</p>
    </section>

    <section class="overflow-hidden rounded-xl border border-admin-border bg-admin-surface" aria-label="Custom pages">
      <div class="pages-toolbar">
        <div class="flex items-center gap-2 text-sm font-semibold text-admin-text">
          All pages
          <span v-if="!loading && !error" class="rounded bg-admin-soft px-1.5 py-0.5 text-xs font-medium text-admin-muted">{{ total }}</span>
        </div>
        <label class="pages-search">
          <Icon name="heroicons:magnifying-glass" class="h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" />
          <span class="sr-only">Search page titles or paths</span>
          <input v-model="search" type="search" class="min-w-0 flex-1 bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-muted" placeholder="Search pages…" />
        </label>
      </div>

      <AdminSpinner v-if="loading" label="Loading website pages…" variant="list" />
      <div v-else-if="error" class="px-4 py-8 text-center" role="alert">
        <p class="text-sm text-admin-danger">{{ error }}</p>
        <button type="button" class="pages-button admin-focus mx-auto mt-3" @click="load">Try again</button>
      </div>
      <div v-else-if="!pages.length" class="px-6 py-10 text-center">
        <Icon name="heroicons:document-text" class="mx-auto h-6 w-6 text-admin-muted" aria-hidden="true" />
        <h2 class="mt-3 text-sm font-semibold text-admin-text">{{ search.trim() ? 'No matching pages' : 'No custom pages yet' }}</h2>
        <p class="mx-auto mt-1 max-w-md text-sm text-admin-muted">{{ search.trim() ? 'Try a different title or path.' : 'Create a page for information that does not belong in a fixed storefront route.' }}</p>
        <button v-if="search.trim()" type="button" class="pages-button admin-focus mx-auto mt-4" @click="search = ''">Clear search</button>
        <button v-else type="button" class="pages-button pages-button--primary admin-focus mx-auto mt-4" @click="creating = true">New page</button>
      </div>
      <template v-else>
        <div class="pages-columns" aria-hidden="true"><span>Page</span><span>Status</span><span class="text-right">Actions</span></div>
        <div class="divide-y divide-admin-border">
          <article v-for="page in pages" :key="page.uuid" class="pages-row">
            <div class="pages-identity">
              <span class="pages-document" aria-hidden="true"><Icon name="heroicons:document-text" class="h-4 w-4" /></span>
              <div class="min-w-0">
                <h2 class="truncate text-sm font-medium text-admin-text" :title="page.title">{{ page.title }}</h2>
                <p class="mt-0.5 truncate text-xs text-admin-muted" :title="page.path">{{ page.path }}</p>
              </div>
            </div>
            <div class="pages-status">
              <span class="pages-badge" :class="page.is_published ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
                {{ page.is_published ? `Live v${page.published_version}` : 'Private draft' }}
              </span>
              <span v-if="page.has_unpublished_changes" class="pages-badge bg-admin-warning-soft text-admin-warning">Unpublished changes</span>
            </div>
            <div class="pages-row-actions">
              <NuxtLink :to="`/admin/website-editor?customPage=${encodeURIComponent(page.uuid)}`" class="pages-button pages-button--edit admin-focus" :aria-label="`Edit ${page.title}`">
                <Icon name="heroicons:pencil-square" class="h-3.5 w-3.5" aria-hidden="true" />Edit
              </NuxtLink>
              <a v-if="page.is_published && page.published_path" :href="storefrontPageUrl(page.published_path)" target="_blank" rel="noopener" class="pages-button pages-button--icon admin-focus" aria-label="Open published page" :title="`Open ${page.title} in a new tab`">
                <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
        <div v-if="lastPage > 1" class="border-t border-admin-border px-4 py-2"><AdminPagination :current-page="currentPage" :total-pages="lastPage" :total-items="total" :per-page="20" item-label="pages" @go-to-page="goToPage" /></div>
      </template>
    </section>
    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import { useWebsitePages } from '~/composables/useWebsitePages'
import type { WebsitePageSummary } from '~/types/websitePage'

definePageMeta({ middleware: 'auth' })
const { list, create } = useWebsitePages()
const { storefrontPageUrl } = useStorefrontUrl()
const { showToast } = useAdminToast()
const pages = ref<WebsitePageSummary[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const creating = ref(useRoute().query.create === '1')
const creatingPage = ref(false)
const createError = ref('')
const newPage = reactive({ title: '', path: '' })
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await list({ page: currentPage.value, per_page: 20, ...(search.value.trim() ? { search: search.value.trim() } : {}) })
    pages.value = response.data
    lastPage.value = response.last_page
    total.value = response.total
  } catch (requestError: any) {
    error.value = requestError?.data?.message || 'Website pages could not be loaded.'
  } finally { loading.value = false }
}
function normalizeNewPath() { newPage.path = newPage.path.toLowerCase().replace(/^\/+/, '').replace(/[^a-z0-9/-]+/g, '-').replace(/-+/g, '-') }
async function createPage() {
  if (creatingPage.value) return
  creatingPage.value = true
  createError.value = ''
  try {
    const response = await create({ title: newPage.title.trim(), path: `/${newPage.path.replace(/^\/+/, '')}` })
    showToast('Page draft created.', 'success')
    await navigateTo(`/admin/website-editor?customPage=${encodeURIComponent(response.data.uuid)}`)
  } catch (requestError: any) {
    createError.value = Object.values(requestError?.data?.errors ?? {}).flat()[0] as string || requestError?.data?.message || 'The page could not be created.'
  } finally { creatingPage.value = false }
}
function goToPage(page: number) { currentPage.value = page; void load() }
watch(search, () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { currentPage.value = 1; void load() }, 250) })
onBeforeUnmount(() => { if (searchTimer) clearTimeout(searchTimer) })
await load()
</script>

<style scoped>
.pages-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.pages-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.pages-button { display: inline-flex; min-height: 2.25rem; align-items: center; justify-content: center; gap: .5rem; padding: .375rem .75rem; border: 1px solid var(--admin-border); border-radius: .5rem; background: var(--admin-surface); color: var(--admin-text); font-size: .75rem; font-weight: 600; line-height: 1.5; transition: background-color 140ms ease, border-color 140ms ease; }
.pages-button:hover { background: var(--admin-surface-soft); }
.pages-button--quiet { border-color: transparent; background: transparent; color: var(--admin-text-muted); }
.pages-button--primary { border-color: transparent; background: var(--admin-accent); color: var(--admin-on-accent); }
.pages-button--primary:hover { background: color-mix(in srgb, var(--admin-accent) 85%, #000); }
.pages-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding: .75rem 1rem; border-bottom: 1px solid var(--admin-border); }
.pages-search { display: flex; width: 18rem; max-width: 100%; min-height: 2.25rem; align-items: center; gap: .5rem; padding: .375rem .625rem; border: 1px solid var(--admin-border); border-radius: .5rem; background: var(--admin-canvas); }
.pages-search:focus-within { outline: 2px solid var(--admin-accent-strong); outline-offset: 2px; }
.pages-columns, .pages-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(12rem, .55fr) 7.5rem; align-items: center; gap: 1rem; padding-inline: 1rem; }
.pages-columns { padding-block: .5rem; background: var(--admin-canvas); color: var(--admin-text-muted); font-size: .75rem; font-weight: 500; border-bottom: 1px solid var(--admin-border); }
.pages-row { min-height: 4.25rem; padding-block: .75rem; }
.pages-identity { display: flex; min-width: 0; align-items: center; gap: .75rem; }
.pages-document { display: flex; flex-shrink: 0; width: 2rem; height: 2rem; align-items: center; justify-content: center; border: 1px solid var(--admin-border); border-radius: .5rem; color: var(--admin-text-muted); }
.pages-status { display: flex; flex-wrap: wrap; gap: .375rem; }
.pages-badge { display: inline-flex; align-items: center; gap: .375rem; padding: .125rem .5rem; border-radius: .25rem; font-size: .75rem; font-weight: 500; }
.pages-row-actions { display: flex; align-items: center; justify-content: flex-end; gap: .25rem; }
.pages-button--edit { min-height: 2rem; padding: .25rem .625rem; }
.pages-button--icon { width: 2rem; min-height: 2rem; padding: .25rem; border-color: transparent; color: var(--admin-text-muted); }
@media (max-width: 1100px) {
  .pages-header { flex-direction: column; }
}
@media (max-width: 640px) {
  .pages-actions { width: 100%; }
  .pages-columns { display: none; }
  .pages-row { grid-template-columns: minmax(0, 1fr) auto; gap: .5rem .75rem; }
  .pages-status { grid-column: 1; padding-left: 2.75rem; }
  .pages-row-actions { grid-column: 2; grid-row: 1 / 3; }
  .pages-toolbar { align-items: stretch; }
  .pages-search { width: 100%; }
}
@media (pointer: coarse) {
  .pages-button, .pages-search, .pages-create input, .pages-create label > span { min-height: 2.75rem; }
  .pages-button--icon { width: 2.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .pages-button { transition: none; }
}
</style>
