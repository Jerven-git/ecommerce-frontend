<template>
  <div class="max-w-7xl mx-auto pb-24">
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <NuxtLink to="/admin/services" class="hover:text-gray-600 transition-colors">Services</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">{{ isNew ? 'New' : 'Edit' }}</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isNew ? 'New Service' : 'Edit Service' }}</h1>
        <p class="text-gray-500 text-sm mt-1">Write the full detail page in Markdown — visible at /services/[slug].</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <NuxtLink to="/admin/services" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </NuxtLink>
        <button
          type="button"
          :disabled="saving || !form.title.trim()"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          @click="save"
        >
          <span v-if="saving" class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
          {{ isNew ? 'Create service' : 'Save changes' }}
        </button>
      </div>
    </div>

    <!-- Loading existing service -->
    <AdminSpinner v-if="loading" label="Loading service editor…" variant="form" />

    <form v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6" @submit.prevent="save">
      <!-- Main column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Title + slug + eyebrow + description -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Eyebrow (optional)</label>
            <input
              v-model="form.eyebrow"
              type="text"
              class="w-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="e.g. CHEQUING"
            />
            <p class="text-[11px] text-gray-400 mt-1">Small label shown above the service title on cards.</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="Service title"
              @input="onTitleInput"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 font-mono shrink-0">/services/</span>
              <input
                v-model="form.slug_manual"
                type="text"
                :placeholder="autoSlug || 'service-slug'"
                class="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <p class="text-[11px] text-gray-400 mt-1">Leave empty to generate automatically from the title.</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Short description</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
              placeholder="One or two sentences shown on the services index card"
            ></textarea>
          </div>
        </div>

        <!-- Body editor with preview -->
        <Teleport to="body" :disabled="!isBodyFullscreen">
          <div
            :class="isBodyFullscreen
              ? 'fixed inset-0 z-[60] bg-white flex flex-col'
              : 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'"
          >
            <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ isBodyFullscreen ? (form.title || 'Untitled service') : 'Body' }}
                </p>
                <p class="text-xs text-gray-400 truncate">
                  Markdown — supports headings, lists, links, images, code, tables
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    v-for="mode in ['write', 'split', 'preview'] as const"
                    :key="mode"
                    type="button"
                    class="px-3 py-1 rounded-md text-[11px] font-medium transition-colors"
                    :class="editorMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    @click="editorMode = mode"
                  >
                    {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
                  </button>
                </div>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  :title="isBodyFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen editor'"
                  @click="isBodyFullscreen = !isBodyFullscreen"
                >
                  <Icon :name="isBodyFullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'" class="w-4 h-4" />
                </button>
                <button
                  v-if="isBodyFullscreen"
                  type="button"
                  :disabled="saving || !form.title.trim()"
                  class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                  @click="save"
                >
                  <span v-if="saving" class="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  {{ isNew ? 'Create' : 'Save' }}
                </button>
              </div>
            </div>

            <!-- Toolbar -->
            <div
              v-show="editorMode !== 'preview'"
              class="px-3 py-1.5 border-b border-gray-100 flex flex-wrap items-center gap-0.5 bg-gray-50/60 shrink-0"
            >
              <button type="button" class="toolbar-btn" title="Bold (Ctrl+B)" @click="fmt.bold()">
                <Icon name="heroicons:bold" class="w-4 h-4" />
              </button>
              <button type="button" class="toolbar-btn" title="Italic (Ctrl+I)" @click="fmt.italic()">
                <Icon name="heroicons:italic" class="w-4 h-4" />
              </button>
              <div class="toolbar-divider"></div>
              <button type="button" class="toolbar-btn text-[11px] font-bold" title="Heading 1" @click="fmt.heading(1)">H1</button>
              <button type="button" class="toolbar-btn text-[11px] font-bold" title="Heading 2" @click="fmt.heading(2)">H2</button>
              <button type="button" class="toolbar-btn text-[11px] font-bold" title="Heading 3" @click="fmt.heading(3)">H3</button>
              <div class="toolbar-divider"></div>
              <button type="button" class="toolbar-btn" title="Link (Ctrl+K)" @click="fmt.link()">
                <Icon name="heroicons:link" class="w-4 h-4" />
              </button>
              <button type="button" class="toolbar-btn" title="Image" @click="fmt.image()">
                <Icon name="heroicons:photo" class="w-4 h-4" />
              </button>
              <div class="toolbar-divider"></div>
              <button type="button" class="toolbar-btn" title="Bullet list" @click="fmt.bullet()">
                <Icon name="heroicons:list-bullet" class="w-4 h-4" />
              </button>
              <button type="button" class="toolbar-btn" title="Numbered list" @click="fmt.ordered()">
                <Icon name="heroicons:numbered-list" class="w-4 h-4" />
              </button>
              <button type="button" class="toolbar-btn" title="Quote" @click="fmt.quote()">
                <Icon name="heroicons:chat-bubble-left" class="w-4 h-4" />
              </button>
              <div class="toolbar-divider"></div>
              <button type="button" class="toolbar-btn" title="Inline code" @click="fmt.code()">
                <Icon name="heroicons:code-bracket" class="w-4 h-4" />
              </button>
              <button type="button" class="toolbar-btn" title="Code block" @click="fmt.codeBlock()">
                <Icon name="heroicons:command-line" class="w-4 h-4" />
              </button>
              <button type="button" class="toolbar-btn" title="Horizontal rule" @click="fmt.hr()">
                <Icon name="heroicons:minus" class="w-4 h-4" />
              </button>
            </div>

            <div
              class="grid gap-px bg-gray-100 flex-1 min-h-0"
              :class="editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
            >
              <div v-show="editorMode !== 'preview'" class="bg-white flex flex-col min-h-0">
                <textarea
                  ref="bodyTextarea"
                  v-model="form.body"
                  :class="isBodyFullscreen
                    ? 'flex-1 w-full px-6 py-5 text-[15px] font-mono leading-7 border-0 focus:outline-none focus:ring-0 resize-none'
                    : 'w-full px-4 py-3 text-[15px] font-mono leading-7 border-0 focus:outline-none focus:ring-0 resize-y min-h-[560px]'"
                  placeholder="# Your service starts here&#10;&#10;Write anything in markdown..."
                  @keydown="onBodyKeydown"
                ></textarea>
              </div>
              <div
                v-show="editorMode !== 'write'"
                :class="isBodyFullscreen
                  ? 'bg-white overflow-auto min-h-0'
                  : 'bg-white p-5 overflow-auto min-h-[560px]'"
              >
                <div
                  v-if="form.body"
                  class="post-prose"
                  :class="isBodyFullscreen ? 'max-w-3xl mx-auto px-8 py-6' : ''"
                  v-html="renderedBody"
                ></div>
                <p v-else class="text-sm text-gray-300 italic" :class="isBodyFullscreen ? 'px-8 py-6' : ''">
                  Preview will appear here.
                </p>
              </div>
            </div>

            <div class="px-5 py-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
              <span>{{ wordCount }} words · {{ charCount }} characters</span>
              <span v-if="isBodyFullscreen" class="hidden sm:inline">Press Esc to exit fullscreen</span>
            </div>
          </div>
        </Teleport>

        <!-- Call to action -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">Call to action (optional)</p>
            <p class="text-xs text-gray-400">Button shown on the service card and detail page.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Button label</label>
              <input
                v-model="form.cta_label"
                type="text"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
                placeholder="e.g. Get started"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Button link</label>
              <input
                v-model="form.cta_link"
                type="text"
                class="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
                placeholder="/contact or https://..."
              />
            </div>
          </div>
        </div>

        <!-- SEO -->
        <AdminSeoFields
          v-model:seo-title="form.seo_title"
          v-model:seo-description="form.seo_description"
          v-model:og-image-url="form.og_image_url"
          v-model:noindex="form.noindex"
          title-placeholder="Defaults to service title"
          description-placeholder="Defaults to short description"
        />
      </div>

      <!-- Sidebar -->
      <aside class="space-y-6">
        <!-- Cover image -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-sm font-semibold text-gray-900 mb-1">Cover image</p>
          <p class="text-xs text-gray-400 mb-3">Shown on cards and the service header</p>

          <div class="relative">
            <img
              v-if="previewCoverUrl"
              :src="previewCoverUrl"
              alt="Cover preview"
              class="w-full aspect-[16/9] object-cover rounded-xl border border-gray-100"
            />
            <label
              v-else
              class="flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-300 hover:text-primary-500 cursor-pointer transition-colors"
            >
              <Icon name="heroicons:photo" class="w-8 h-8 mb-1" />
              <span class="text-xs font-medium">Upload cover</span>
              <input type="file" accept="image/*" class="hidden" @change="onCoverSelect" />
            </label>

            <div v-if="previewCoverUrl" class="absolute top-2 right-2 flex gap-1">
              <label class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-gray-700 hover:bg-white cursor-pointer shadow-sm">
                Replace
                <input type="file" accept="image/*" class="hidden" @change="onCoverSelect" />
              </label>
              <button
                type="button"
                class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-red-500 hover:bg-white shadow-sm"
                @click="clearCover"
              >
                Remove
              </button>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Cover image alt text</label>
            <input
              v-model="form.cover_alt_text"
              type="text"
              maxlength="255"
              :placeholder="`Defaults to service title${form.title ? ` — “${form.title}”` : ''}`"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
            <p class="text-[11px] text-gray-400 mt-1">Used for screen readers and image search. Describe what the image shows.</p>
          </div>
        </div>

        <!-- Publish controls -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <p class="text-sm font-semibold text-gray-900 mb-3">Publishing</p>

            <label class="flex items-start gap-3 cursor-pointer">
              <input v-model="form.is_published" type="checkbox" class="mt-0.5 rounded" />
              <div>
                <p class="text-sm font-medium text-gray-900">Published</p>
                <p class="text-xs text-gray-400">Visible on the public services page</p>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer mt-3">
              <input v-model="form.is_featured" type="checkbox" class="mt-0.5 rounded" />
              <div>
                <p class="text-sm font-medium text-gray-900">Featured</p>
                <p class="text-xs text-gray-400">Highlighted in featured strips</p>
              </div>
            </label>
          </div>

          <div v-if="form.is_published">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Publish date</label>
            <input
              v-model="form.published_at"
              type="datetime-local"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
            <p class="text-[11px] text-gray-400 mt-1">Leave empty to publish immediately.</p>
          </div>
        </div>

        <!-- Category -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select
              v-model="form.category_id"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
            >
              <option :value="null">No category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <NuxtLink to="/admin/service-categories" class="text-[11px] text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block">
              Manage categories →
            </NuxtLink>
          </div>
        </div>

        <!-- Danger zone -->
        <div v-if="!isNew" class="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <p class="text-sm font-semibold text-gray-900 mb-1">Danger zone</p>
          <p class="text-xs text-gray-400 mb-3">Deleting a service is permanent.</p>
          <button
            type="button"
            class="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            @click="showDelete = true"
          >
            Delete service
          </button>
        </div>
      </aside>
    </form>

    <ConfirmDeleteModal
      :open="showDelete"
      title="Delete Service"
      :message="`Are you sure you want to delete &quot;${form.title}&quot;? This cannot be undone.`"
      :deleting="deleting"
      @confirm="executeDelete"
      @cancel="showDelete = false"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import type { ServiceCategory, ServiceDetail } from '~/types/service'
import { renderMarkdown } from '~/utils/markdown'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { $apiFetch } = useNuxtApp()
const { showToast } = useAdminToast()

const idParam = computed(() => route.params.id as string)
const isNew = computed(() => idParam.value === 'new')

const loading = ref(!isNew.value)
const saving = ref(false)
const deleting = ref(false)
const showDelete = ref(false)

const categories = ref<ServiceCategory[]>([])
const editorMode = ref<'write' | 'split' | 'preview'>('split')
const isBodyFullscreen = ref(false)
const bodyTextarea = ref<HTMLTextAreaElement | null>(null)

const form = reactive({
  title: '',
  slug_manual: '',
  eyebrow: '',
  description: '',
  body: '',
  category_id: null as number | null,
  cta_label: '',
  cta_link: '',
  is_published: false,
  is_featured: false,
  published_at: '',
  seo_title: '',
  seo_description: '',
  og_image_url: '',
  noindex: false,
  cover_alt_text: '',
})

const coverFile = ref<File | null>(null)
const coverPreviewUrl = ref<string | null>(null)
const existingCoverUrl = ref<string | null>(null)
const coverCleared = ref(false)

const previewCoverUrl = computed(() => coverPreviewUrl.value || (coverCleared.value ? null : existingCoverUrl.value))
const renderedBody = computed(() => renderMarkdown(form.body))

const autoSlug = computed(() => slugify(form.title))

const wordCount = computed(() => {
  const s = form.body.trim()
  return s ? s.split(/\s+/).length : 0
})
const charCount = computed(() => form.body.length)

type InsertOpts = {
  prefix: string
  suffix?: string
  placeholder?: string
  block?: boolean
}

function insertAtCursor(opts: InsertOpts) {
  const ta = bodyTextarea.value
  if (!ta) return
  const start = ta.selectionStart ?? 0
  const end = ta.selectionEnd ?? 0
  const value = ta.value

  if (opts.block) {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const before = value.slice(0, lineStart)
    const middle = value.slice(lineStart, end)
    const after = value.slice(end)
    const prefixed = middle.split('\n').map((ln) => opts.prefix + ln).join('\n')
    form.body = before + prefixed + after
    const addedOnFirstLine = opts.prefix.length
    const totalAdded = prefixed.length - middle.length
    nextTick(() => {
      ta.focus()
      ta.setSelectionRange(start + addedOnFirstLine, end + totalAdded)
    })
    return
  }

  const suffix = opts.suffix ?? opts.prefix
  const selected = value.slice(start, end)
  const text = selected || (opts.placeholder ?? '')
  const inserted = opts.prefix + text + suffix
  form.body = value.slice(0, start) + inserted + value.slice(end)
  nextTick(() => {
    ta.focus()
    const selStart = start + opts.prefix.length
    ta.setSelectionRange(selStart, selStart + text.length)
  })
}

function insertLinkOrImage(kind: 'link' | 'image') {
  const ta = bodyTextarea.value
  if (!ta) return
  const start = ta.selectionStart ?? 0
  const end = ta.selectionEnd ?? 0
  const selected = form.body.slice(start, end) || (kind === 'image' ? 'alt text' : 'link text')
  const url = 'https://'
  const prefix = kind === 'image' ? '![' : '['
  const inserted = `${prefix}${selected}](${url})`
  form.body = form.body.slice(0, start) + inserted + form.body.slice(end)
  nextTick(() => {
    ta.focus()
    const urlStart = start + prefix.length + selected.length + 2
    ta.setSelectionRange(urlStart, urlStart + url.length)
  })
}

const fmt = {
  bold: () => insertAtCursor({ prefix: '**', placeholder: 'bold text' }),
  italic: () => insertAtCursor({ prefix: '*', placeholder: 'italic text' }),
  heading: (n: 1 | 2 | 3) => insertAtCursor({ prefix: '#'.repeat(n) + ' ', block: true }),
  link: () => insertLinkOrImage('link'),
  image: () => insertLinkOrImage('image'),
  bullet: () => insertAtCursor({ prefix: '- ', block: true }),
  ordered: () => insertAtCursor({ prefix: '1. ', block: true }),
  quote: () => insertAtCursor({ prefix: '> ', block: true }),
  code: () => insertAtCursor({ prefix: '`', placeholder: 'code' }),
  codeBlock: () => insertAtCursor({ prefix: '\n```\n', suffix: '\n```\n', placeholder: 'code' }),
  hr: () => insertAtCursor({ prefix: '\n\n---\n\n', suffix: '' }),
}

function onBodyKeydown(e: KeyboardEvent) {
  if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return
  const k = e.key.toLowerCase()
  if (k === 'b') { e.preventDefault(); fmt.bold() }
  else if (k === 'i') { e.preventDefault(); fmt.italic() }
  else if (k === 'k') { e.preventDefault(); fmt.link() }
}

let titleTouched = false
function onTitleInput() {
  titleTouched = true
}
watch(() => form.slug_manual, (val) => {
  if (val && !titleTouched) titleTouched = true
})

function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function loadCategories() {
  try {
    const res = await $apiFetch<{ data: ServiceCategory[] }>('/service-categories')
    categories.value = res.data ?? []
  } catch {}
}

async function loadService() {
  if (isNew.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await $apiFetch<{ data: ServiceDetail }>(`/admin/services/${idParam.value}`)
    const s = res.data
    form.title = s.title
    form.slug_manual = s.slug
    form.eyebrow = s.eyebrow || ''
    form.description = s.description || ''
    form.body = s.body || ''
    form.category_id = s.category_id
    form.cta_label = s.cta_label || ''
    form.cta_link = s.cta_link || ''
    form.is_published = s.is_published
    form.is_featured = s.is_featured
    form.published_at = s.published_at ? toLocalInput(s.published_at) : ''
    form.seo_title = s.seo_title || ''
    form.seo_description = s.seo_description || ''
    form.og_image_url = s.og_image_url || ''
    form.noindex = !!s.noindex
    form.cover_alt_text = s.cover_alt_text || ''
    existingCoverUrl.value = s.cover_image_url
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to load service', 'error')
    router.push('/admin/services')
  } finally {
    loading.value = false
  }
}

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function onCoverSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverFile.value = file
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
  coverPreviewUrl.value = URL.createObjectURL(file)
  coverCleared.value = false
}

function clearCover() {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
  coverPreviewUrl.value = null
  coverFile.value = null
  coverCleared.value = true
}

function buildPayload(): Record<string, any> {
  const payload: Record<string, any> = {
    title: form.title.trim(),
    eyebrow: form.eyebrow.trim() || null,
    description: form.description.trim() || null,
    body: form.body,
    category_id: form.category_id,
    cta_label: form.cta_label.trim() || null,
    cta_link: form.cta_link.trim() || null,
    is_published: form.is_published ? 1 : 0,
    is_featured: form.is_featured ? 1 : 0,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
    og_image_url: form.og_image_url.trim() || null,
    noindex: form.noindex ? 1 : 0,
    cover_alt_text: form.cover_alt_text.trim() || null,
  }
  if (form.is_published && form.published_at) {
    payload.published_at = new Date(form.published_at).toISOString()
  }
  if (coverCleared.value && !coverFile.value) {
    payload.cover_image_url = null
  }
  return payload
}

async function save() {
  if (!form.title.trim() || saving.value) return
  saving.value = true
  try {
    const payload = buildPayload()

    let saved: { data: ServiceDetail }

    if (isNew.value) {
      if (coverFile.value) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v))
        })
        fd.append('cover_image', coverFile.value)
        saved = await $apiFetch('/admin/services', { method: 'POST', body: fd })
      } else {
        saved = await $apiFetch('/admin/services', { method: 'POST', body: payload })
      }
    } else {
      if (coverFile.value) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v))
        })
        fd.append('cover_image', coverFile.value)
        fd.append('_method', 'PATCH')
        saved = await $apiFetch(`/admin/services/${idParam.value}`, { method: 'POST', body: fd })
      } else {
        saved = await $apiFetch(`/admin/services/${idParam.value}`, { method: 'PATCH', body: payload })
      }
    }

    showToast(isNew.value ? 'Service created' : 'Service saved', 'success')
    if (isNew.value && saved?.data?.id) {
      router.replace(`/admin/services/${saved.data.id}`)
    } else {
      coverFile.value = null
      if (coverPreviewUrl.value) {
        URL.revokeObjectURL(coverPreviewUrl.value)
        coverPreviewUrl.value = null
      }
      existingCoverUrl.value = saved.data.cover_image_url
    }
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to save service', 'error')
  } finally {
    saving.value = false
  }
}

async function executeDelete() {
  if (isNew.value) return
  deleting.value = true
  try {
    await $apiFetch(`/admin/services/${idParam.value}`, { method: 'DELETE' })
    showToast('Service deleted', 'success')
    router.push('/admin/services')
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to delete service', 'error')
  } finally {
    deleting.value = false
    showDelete.value = false
  }
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isBodyFullscreen.value) {
    isBodyFullscreen.value = false
  }
}

watch(isBodyFullscreen, (v) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})

onMounted(() => {
  loadCategories()
  loadService()
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
  window.removeEventListener('keydown', onGlobalKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 6px;
  color: rgb(75, 85, 99);
  transition: background-color 120ms, color 120ms;
}
.toolbar-btn:hover {
  background: rgb(229, 231, 235);
  color: rgb(17, 24, 39);
}
.toolbar-btn:active {
  background: rgb(209, 213, 219);
}
.toolbar-divider {
  width: 1px;
  height: 18px;
  background: rgb(229, 231, 235);
  margin: 0 4px;
}

.post-prose :deep(h1) { font-size: 1.5rem; font-weight: 700; color: rgb(17, 24, 39); margin: 1.25rem 0 0.75rem; line-height: 1.2; }
.post-prose :deep(h2) { font-size: 1.25rem; font-weight: 700; color: rgb(17, 24, 39); margin: 1rem 0 0.5rem; }
.post-prose :deep(h3) { font-size: 1.125rem; font-weight: 600; color: rgb(17, 24, 39); margin: 0.75rem 0 0.5rem; }
.post-prose :deep(p)  { margin: 0.75rem 0; color: rgb(55, 65, 81); line-height: 1.6; font-size: 0.9375rem; }
.post-prose :deep(a)  { color: rgb(79, 70, 229); text-decoration: underline; text-underline-offset: 2px; }
.post-prose :deep(ul), .post-prose :deep(ol) { margin: 0.75rem 0; padding-left: 1.5rem; color: rgb(55, 65, 81); font-size: 0.9375rem; }
.post-prose :deep(ul) { list-style-type: disc; }
.post-prose :deep(ol) { list-style-type: decimal; }
.post-prose :deep(blockquote) { border-left: 3px solid rgb(99, 102, 241); padding-left: 0.875rem; margin: 1rem 0; color: rgb(75, 85, 99); font-style: italic; }
.post-prose :deep(code) { background: rgb(243, 244, 246); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125em; font-family: ui-monospace, SFMono-Regular, monospace; }
.post-prose :deep(pre) { background: rgb(17, 24, 39); color: rgb(229, 231, 235); padding: 0.875rem 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.875rem 0; font-size: 0.8125rem; }
.post-prose :deep(pre code) { background: transparent; color: inherit; padding: 0; }
.post-prose :deep(img) { border-radius: 0.5rem; margin: 1rem 0; max-width: 100%; }
.post-prose :deep(hr) { border: 0; border-top: 1px solid rgb(229, 231, 235); margin: 1.5rem 0; }
</style>
