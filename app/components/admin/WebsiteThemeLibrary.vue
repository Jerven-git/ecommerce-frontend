<template>
  <div v-if="open" class="fixed inset-0 z-[80] flex flex-col bg-admin-surface" role="dialog" aria-modal="true" aria-labelledby="theme-library-title">
    <header class="flex min-h-16 shrink-0 items-center gap-3 border-b border-admin-border px-4 sm:px-6">
      <button ref="closeButton" type="button" class="theme-focus flex min-h-11 min-w-11 items-center justify-center rounded-xl text-admin-muted hover:bg-admin-soft hover:text-admin-text" aria-label="Close Theme Library" @click="emit('close')">
        <Icon name="heroicons:arrow-left" class="h-5 w-5" aria-hidden="true" />
      </button>
      <div class="min-w-0 flex-1">
        <h2 id="theme-library-title" class="truncate text-base font-semibold text-admin-text">Theme Library</h2>
        <p class="truncate text-xs text-admin-muted">Choose a trusted SSU layout, review its blueprint, then apply it only to your private draft.</p>
      </div>
      <span class="hidden rounded-full bg-admin-info-soft px-3 py-1 text-xs font-semibold text-admin-info sm:inline">Draft only</span>
    </header>

    <div v-if="error" class="flex items-center gap-3 border-b border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-sm text-admin-danger" role="alert">
      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 shrink-0" aria-hidden="true" />
      <p class="min-w-0 flex-1">{{ error }}</p>
      <button type="button" class="theme-focus min-h-11 rounded-lg px-3 text-xs font-semibold" @click="load">Try again</button>
    </div>

    <div v-if="loading" class="grid min-h-0 flex-1 place-items-center" role="status" aria-live="polite">
      <div class="text-center">
        <Icon name="heroicons:arrow-path" class="mx-auto h-6 w-6 animate-spin text-admin-accent motion-reduce:animate-none" aria-hidden="true" />
        <p class="mt-3 text-sm font-medium text-admin-text">Loading trusted themes…</p>
      </div>
    </div>

    <div v-else class="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <main class="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
        <div class="mx-auto max-w-6xl">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label class="relative min-w-0 flex-1">
              <span class="sr-only">Search themes</span>
              <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
              <input v-model="query" type="search" class="theme-focus min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface pe-3 ps-10 text-sm text-admin-text placeholder:text-admin-muted" placeholder="Search themes or business types" aria-describedby="theme-library-results-status" />
            </label>
            <div class="flex gap-1 overflow-x-auto" role="group" aria-label="Filter themes by category">
              <button v-for="option in categories" :key="option.value" type="button" class="theme-focus min-h-11 shrink-0 rounded-lg px-3 text-xs font-semibold" :class="category === option.value ? 'bg-admin-accent text-admin-on-accent' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text'" :aria-pressed="category === option.value" @click="category = option.value">{{ option.label }}</button>
            </div>
          </div>

          <p id="theme-library-results-status" class="sr-only" role="status" aria-live="polite">{{ resultStatus }}</p>

          <div v-if="filteredThemes.length" class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button v-for="theme in filteredThemes" :key="theme.id" type="button" class="theme-focus group overflow-hidden rounded-2xl border bg-admin-surface text-start transition-colors" :class="selected?.id === theme.id ? 'border-admin-accent' : 'border-admin-border hover:border-admin-muted'" :aria-pressed="selected?.id === theme.id" @click="selectTheme(theme)">
              <div class="relative grid aspect-[16/10] place-items-center bg-admin-soft">
                <img v-if="theme.preview_assets.desktop" :src="theme.preview_assets.desktop" :alt="`${theme.name} desktop preview`" class="h-full w-full object-cover" />
                <div v-else class="max-w-52 px-5 text-center">
                  <Icon :name="theme.available ? 'heroicons:computer-desktop' : 'heroicons:photo'" class="mx-auto h-7 w-7 text-admin-muted" aria-hidden="true" />
                  <p class="mt-2 text-xs font-medium text-admin-muted">{{ theme.available ? 'Preview with your real content' : 'Reviewed screenshots are not available yet' }}</p>
                </div>
                <span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="theme.available ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-surface text-admin-muted'">{{ theme.available ? 'Available' : 'Planned' }}</span>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-sm font-semibold text-admin-text">{{ theme.name }}</h3>
                  <span v-if="theme.is_live || theme.is_draft" class="shrink-0 text-[11px] font-semibold text-admin-accent-strong">{{ theme.is_draft ? 'Draft' : 'Live' }}</span>
                </div>
                <p class="mt-2 line-clamp-2 text-xs leading-5 text-admin-muted">{{ theme.description }}</p>
              </div>
            </button>
          </div>
          <div v-else class="mt-12 text-center">
            <Icon name="heroicons:magnifying-glass" class="mx-auto h-6 w-6 text-admin-muted" aria-hidden="true" />
            <h3 class="mt-3 text-sm font-semibold text-admin-text">No themes match this search</h3>
            <p class="mt-1 text-xs text-admin-muted">Clear the search or choose another category.</p>
          </div>
        </div>
      </main>

      <aside class="min-h-0 overflow-y-auto border-t border-admin-border bg-admin-soft/40 p-5 lg:border-l lg:border-t-0" aria-label="Selected theme details">
        <template v-if="selected">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-admin-text">{{ selected.name }}</h3>
              <p class="mt-1 text-xs text-admin-muted">Version {{ selected.version }} · {{ categoryLabel(selected.category) }}</p>
            </div>
            <Icon :name="selected.available ? 'heroicons:check-badge' : 'heroicons:clock'" class="h-6 w-6 shrink-0" :class="selected.available ? 'text-admin-success' : 'text-admin-muted'" aria-hidden="true" />
          </div>
          <p class="mt-4 text-sm leading-6 text-admin-muted">{{ selected.description }}</p>

          <div class="mt-5">
            <h4 class="text-xs font-semibold uppercase tracking-wide text-admin-muted">Best for</h4>
            <ul class="mt-2 flex flex-wrap gap-2">
              <li v-for="item in selected.best_for" :key="item" class="rounded-full bg-admin-surface px-2.5 py-1 text-xs text-admin-text">{{ item }}</li>
            </ul>
          </div>

          <label class="mt-5 block text-xs font-semibold text-admin-text" for="theme-profile">Website profile</label>
          <select id="theme-profile" v-model="profile" class="theme-focus mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-sm text-admin-text" :disabled="!selected.available || proposing || applying">
            <option v-for="item in compatibleProfiles" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <p class="mt-2 text-xs leading-5 text-admin-muted">This changes starter navigation in the draft. It does not enable modules automatically.</p>

          <div v-if="proposal" class="mt-5 rounded-xl bg-admin-surface p-4" role="status" aria-live="polite">
            <h4 class="text-sm font-semibold text-admin-text">Review blueprint</h4>
            <dl class="mt-3 space-y-2 text-xs">
              <div class="flex justify-between gap-3"><dt class="text-admin-muted">Theme</dt><dd class="font-medium text-admin-text">{{ selected.name }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-admin-muted">Profile</dt><dd class="font-medium text-admin-text">{{ profileName }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-admin-muted">Starter links</dt><dd class="font-medium text-admin-text">{{ proposal.navigation.length }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-admin-muted">Content retained</dt><dd class="font-medium text-admin-success">Yes</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-admin-muted">Automatic module changes</dt><dd class="font-medium text-admin-text">None</dd></div>
            </dl>
            <ul v-if="proposal.module_proposal.changes.length" class="mt-3 space-y-2">
              <li v-for="change in proposal.module_proposal.changes" :key="`${change.priority}-${change.module}`" class="text-xs leading-5 text-admin-warning">{{ change.label }} is {{ change.priority }} and remains disabled until you enable it in Settings.</li>
            </ul>
          </div>

          <div v-if="!selected.available" class="mt-5 rounded-xl bg-admin-warning-soft p-4 text-xs leading-5 text-admin-text">
            This theme is listed for planning visibility only. It cannot be previewed or applied until its reviewed renderer and assets ship with SSU.
          </div>

          <div class="mt-6 grid gap-2">
            <button type="button" class="theme-focus min-h-11 rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:bg-admin-soft disabled:cursor-not-allowed disabled:opacity-50" :disabled="!selected.available || proposing || applying" @click="emit('preview', { id: selected.id, version: selected.version })">
              Preview with my content
            </button>
            <button v-if="!proposal" type="button" class="theme-focus min-h-11 rounded-xl bg-admin-accent px-4 text-sm font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:cursor-not-allowed disabled:opacity-50" :disabled="!selected.available || proposing || applying || !profile" @click="prepareProposal">
              {{ proposing ? 'Preparing blueprint…' : 'Review before applying' }}
            </button>
            <button v-else type="button" class="theme-focus min-h-11 rounded-xl bg-admin-accent px-4 text-sm font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:cursor-not-allowed disabled:opacity-50" :disabled="applying" @click="applyProposal">
              {{ applying ? 'Applying to draft…' : 'Apply to private draft' }}
            </button>
          </div>
        </template>
        <div v-else class="grid min-h-48 place-items-center text-center text-xs text-admin-muted">Select a theme to review its details.</div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeLayoutReference, WebsiteProfileId } from '~/composables/useSiteConfig'
import type { WebsiteBlueprintProposal, WebsiteThemeCatalogueItem, WebsiteThemeCategory, WebsiteProfileCatalogueItem } from '~/composables/useWebsiteThemes'

const props = defineProps<{ open: boolean; draftVersion: number | null; currentProfile: WebsiteProfileId }>()
const emit = defineEmits<{ close: []; preview: [theme: ThemeLayoutReference]; applied: [] }>()
const api = useWebsiteThemes()
const closeButton = ref<HTMLButtonElement | null>(null)
const themes = ref<WebsiteThemeCatalogueItem[]>([])
const profiles = ref<WebsiteProfileCatalogueItem[]>([])
const selected = ref<WebsiteThemeCatalogueItem | null>(null)
const profile = ref<WebsiteProfileId>(props.currentProfile)
const proposal = ref<WebsiteBlueprintProposal | null>(null)
const query = ref('')
const category = ref<'all' | WebsiteThemeCategory>('all')
const loading = ref(false)
const proposing = ref(false)
const applying = ref(false)
const error = ref('')
const categories = [
  { value: 'all' as const, label: 'All' },
  { value: 'ecommerce' as const, label: 'Ecommerce' },
  { value: 'services' as const, label: 'Services' },
  { value: 'informational' as const, label: 'Informational' },
  { value: 'general' as const, label: 'General' },
]
function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return
  const container = closeButton.value?.closest('[role="dialog"]')
  const focusable = Array.from(container?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]') ?? [])
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
const filteredThemes = computed(() => {
  const search = query.value.trim().toLowerCase()
  return themes.value.filter((theme) => {
    const matchesCategory = category.value === 'all' || theme.category === category.value
    const haystack = [theme.name, theme.description, ...theme.best_for].join(' ').toLowerCase()
    return matchesCategory && (!search || haystack.includes(search))
  })
})
const resultStatus = computed(() => {
  const count = filteredThemes.value.length
  return `${count} ${count === 1 ? 'theme' : 'themes'} shown.`
})
const compatibleProfiles = computed(() => profiles.value.filter(item => selected.value?.compatible_profiles.includes(item.id)))
const profileName = computed(() => profiles.value.find(item => item.id === profile.value)?.name ?? profile.value)

function categoryLabel(value: WebsiteThemeCategory) {
  return categories.find(item => item.value === value)?.label ?? value
}
function selectTheme(theme: WebsiteThemeCatalogueItem) {
  selected.value = theme
  proposal.value = null
  if (!theme.compatible_profiles.includes(profile.value)) profile.value = theme.compatible_profiles[0] ?? props.currentProfile
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const [themeResponse, profileResponse] = await Promise.all([api.fetchThemes(), api.fetchProfiles()])
    themes.value = themeResponse.data
    profiles.value = profileResponse.data
    profile.value = themeResponse.current.website_profile
    selected.value = themes.value.find(item => item.is_draft || item.is_live) ?? themes.value[0] ?? null
  } catch {
    error.value = 'The Theme Library could not be loaded. Your website and draft were not changed.'
  } finally {
    loading.value = false
    await nextTick()
    closeButton.value?.focus()
  }
}
async function prepareProposal() {
  if (!selected.value) return
  proposing.value = true
  error.value = ''
  try {
    proposal.value = (await api.proposeBlueprint({ website_profile: profile.value, theme_id: selected.value.id, theme_version: selected.value.version, draft_version: props.draftVersion })).data
  } catch {
    error.value = 'The blueprint could not be prepared. Reload the editor if this draft changed in another tab.'
  } finally {
    proposing.value = false
  }
}
async function applyProposal() {
  if (!proposal.value) return
  applying.value = true
  error.value = ''
  try {
    await api.applyBlueprint(proposal.value)
    emit('applied')
  } catch {
    error.value = 'The blueprint was not applied. Review a fresh proposal and try again.'
    proposal.value = null
  } finally {
    applying.value = false
  }
}
watch(() => props.open, value => { if (value) void load() })
watch(profile, () => { proposal.value = null })
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.theme-focus:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
</style>
