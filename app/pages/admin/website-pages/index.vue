<template>
  <div>
    <AdminPageHeader title="Website pages" subtitle="Manage your custom pages. Open a page to design and publish it in the Website Editor.">
      <template #breadcrumb>
        <div class="mb-2 flex items-center gap-2 text-sm text-admin-muted"><NuxtLink to="/admin" class="hover:text-admin-text">Dashboard</NuxtLink><span>/</span><span class="font-medium text-admin-text">Website pages</span></div>
      </template>
      <template #actions>
        <NuxtLink to="/admin/website-editor" class="admin-focus inline-flex min-h-11 items-center gap-2 rounded-xl border border-admin-border px-4 py-2 text-sm font-semibold text-admin-text hover:bg-admin-soft"><Icon name="heroicons:paint-brush" class="h-4 w-4" aria-hidden="true" />Website Editor</NuxtLink>
        <NuxtLink to="/admin/website-editor?page=global&section=header" class="admin-focus inline-flex min-h-11 items-center gap-2 rounded-xl border border-admin-border px-4 py-2 text-sm font-semibold text-admin-text hover:bg-admin-soft"><Icon name="heroicons:bars-3" class="h-4 w-4" aria-hidden="true" />Header navigation</NuxtLink>
        <button type="button" class="admin-focus inline-flex min-h-11 items-center gap-2 rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-on-accent hover:bg-admin-accent-strong" @click="creating = !creating">
          <Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />New page
        </button>
      </template>
    </AdminPageHeader>

    <section v-if="creating" class="mb-6 rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-[var(--admin-shadow-quiet)]" aria-labelledby="new-page-title">
      <div class="flex items-start justify-between gap-4"><div><h2 id="new-page-title" class="text-base font-semibold text-admin-text">Create a private page draft</h2><p class="mt-1 text-sm text-admin-muted">The path becomes public only after you publish it.</p></div><button type="button" class="admin-focus min-h-11 rounded-xl px-3 text-sm font-semibold text-admin-muted hover:bg-admin-soft" @click="creating = false">Cancel</button></div>
      <form class="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end" @submit.prevent="createPage">
        <label class="text-sm font-semibold text-admin-text">Page title<input v-model="newPage.title" required maxlength="255" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" placeholder="Company profile" /></label>
        <label class="text-sm font-semibold text-admin-text">Page path<span class="mt-2 flex min-h-11 items-center rounded-xl border border-admin-border bg-admin-surface px-3 focus-within:outline focus-within:outline-2 focus-within:outline-admin-accent"><span class="text-admin-muted">/</span><input v-model="newPage.path" required class="min-w-0 flex-1 bg-transparent text-base text-admin-text outline-none" placeholder="company-profile" @input="normalizeNewPath" /></span></label>
        <button type="submit" :disabled="creatingPage" class="admin-focus min-h-11 rounded-xl bg-admin-accent px-5 text-sm font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:cursor-wait disabled:opacity-60">{{ creatingPage ? 'Creating…' : 'Create page' }}</button>
      </form>
      <p v-if="createError" class="mt-3 text-sm text-admin-danger" role="alert">{{ createError }}</p>
    </section>

    <div class="mb-6 flex items-center rounded-xl border border-admin-border bg-admin-surface focus-within:outline focus-within:outline-2 focus-within:outline-admin-accent">
      <Icon name="heroicons:magnifying-glass" class="ml-3 h-4 w-4 text-admin-muted" aria-hidden="true" />
      <input v-model="search" type="search" class="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-admin-text outline-none placeholder:text-admin-muted" placeholder="Search page titles or paths" />
    </div>

    <AdminSpinner v-if="loading" label="Loading website pages…" variant="list" />
    <div v-else-if="error" class="rounded-2xl border border-admin-danger/20 bg-admin-danger-soft p-8 text-center"><p class="text-sm text-admin-danger">{{ error }}</p><button type="button" class="admin-focus mt-4 min-h-11 rounded-xl bg-admin-surface px-4 text-sm font-semibold text-admin-text" @click="load">Try again</button></div>
    <div v-else-if="!pages.length" class="rounded-2xl border border-admin-border bg-admin-surface px-6 py-16 text-center">
      <Icon name="heroicons:document-plus" class="mx-auto h-8 w-8 text-admin-muted" aria-hidden="true" /><h2 class="mt-4 text-base font-semibold text-admin-text">No custom pages yet</h2><p class="mx-auto mt-2 max-w-md text-sm leading-6 text-admin-muted">Create a page for information that does not belong in a fixed storefront route.</p>
    </div>
    <div v-else class="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-[var(--admin-shadow-quiet)]">
      <div class="divide-y divide-admin-border">
        <article v-for="page in pages" :key="page.uuid" class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h2 class="truncate text-sm font-semibold text-admin-text">{{ page.title }}</h2><span class="rounded-md px-2 py-1 text-[11px] font-semibold" :class="page.is_published ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">{{ page.is_published ? `Live v${page.published_version}` : 'Private draft' }}</span><span v-if="page.has_unpublished_changes" class="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">Unpublished changes</span></div><p class="mt-1 truncate text-xs text-admin-muted">{{ page.path }}</p></div>
          <div class="flex items-center gap-2"><NuxtLink :to="`/admin/website-editor?customPage=${encodeURIComponent(page.uuid)}`" class="admin-focus inline-flex min-h-11 items-center gap-2 rounded-xl border border-admin-border px-4 text-sm font-semibold text-admin-text hover:bg-admin-soft"><Icon name="heroicons:pencil-square" class="h-4 w-4" aria-hidden="true" />Edit</NuxtLink><a v-if="page.is_published && page.published_path" :href="storefrontPageUrl(page.published_path)" target="_blank" rel="noopener" class="admin-focus inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-admin-muted hover:bg-admin-soft" aria-label="Open published page"><Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" aria-hidden="true" /></a></div>
        </article>
      </div>
      <div v-if="lastPage > 1" class="border-t border-admin-border px-4 py-2"><AdminPagination :current-page="currentPage" :total-pages="lastPage" :total-items="total" :per-page="20" item-label="pages" @go-to-page="goToPage" /></div>
    </div>
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
