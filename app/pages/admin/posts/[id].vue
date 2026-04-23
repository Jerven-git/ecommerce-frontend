<template>
  <div class="max-w-6xl mx-auto pb-24">
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <NuxtLink to="/admin/posts" class="hover:text-gray-600 transition-colors">Posts</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">{{ isNew ? 'New' : 'Edit' }}</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isNew ? 'New Post' : 'Edit Post' }}</h1>
        <p class="text-gray-500 text-sm mt-1">Write in Markdown — use the preview to see the final styling.</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <NuxtLink to="/admin/posts" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </NuxtLink>
        <button
          type="button"
          :disabled="saving || !form.title.trim()"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          @click="save"
        >
          <span v-if="saving" class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
          {{ isNew ? 'Create post' : 'Save changes' }}
        </button>
      </div>
    </div>

    <!-- Loading existing post -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading post…</p>
    </div>

    <form v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6" @submit.prevent="save">
      <!-- Main column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Title + slug -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="Post title"
              @input="onTitleInput"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 font-mono shrink-0">/blog/</span>
              <input
                v-model="form.slug_manual"
                type="text"
                :placeholder="autoSlug || 'post-slug'"
                class="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <p class="text-[11px] text-gray-400 mt-1">Leave empty to generate automatically from the title.</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Excerpt</label>
            <textarea
              v-model="form.excerpt"
              rows="2"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
              placeholder="Short summary shown in listings and previews"
            ></textarea>
          </div>
        </div>

        <!-- Body editor with preview -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-gray-900">Body</p>
              <p class="text-xs text-gray-400">Markdown — supports headings, lists, links, images, code, tables</p>
            </div>
            <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                v-for="mode in ['write', 'split', 'preview'] as const"
                :key="mode"
                type="button"
                class="px-3 py-1 rounded-md text-[11px] font-medium transition-colors"
                :class="editorMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                @click="editorMode = mode"
              >
                {{ mode[0].toUpperCase() + mode.slice(1) }}
              </button>
            </div>
          </div>

          <div
            class="grid gap-px bg-gray-100"
            :class="editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
          >
            <div v-show="editorMode !== 'preview'" class="bg-white">
              <textarea
                v-model="form.body"
                rows="20"
                class="w-full px-4 py-3 text-sm font-mono leading-relaxed border-0 focus:outline-none focus:ring-0 resize-y min-h-[420px]"
                placeholder="# Your post starts here&#10;&#10;Write anything in markdown..."
              ></textarea>
            </div>
            <div v-show="editorMode !== 'write'" class="bg-white p-5 overflow-auto min-h-[420px]">
              <div v-if="form.body" class="post-prose" v-html="renderedBody"></div>
              <p v-else class="text-sm text-gray-300 italic">Preview will appear here.</p>
            </div>
          </div>
        </div>

        <!-- SEO -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">SEO</p>
            <p class="text-xs text-gray-400">Overrides the default title/description used by search engines.</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">SEO title</label>
            <input
              v-model="form.seo_title"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="Defaults to post title"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">SEO description</label>
            <textarea
              v-model="form.seo_description"
              rows="2"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
              placeholder="Defaults to excerpt"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-6">
        <!-- Cover image -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-sm font-semibold text-gray-900 mb-1">Cover image</p>
          <p class="text-xs text-gray-400 mb-3">Shown on cards and the post header</p>

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
        </div>

        <!-- Publish controls -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <p class="text-sm font-semibold text-gray-900 mb-3">Publishing</p>

            <label class="flex items-start gap-3 cursor-pointer">
              <input v-model="form.is_published" type="checkbox" class="mt-0.5 rounded" />
              <div>
                <p class="text-sm font-medium text-gray-900">Published</p>
                <p class="text-xs text-gray-400">Visible on the public blog</p>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer mt-3">
              <input v-model="form.is_featured" type="checkbox" class="mt-0.5 rounded" />
              <div>
                <p class="text-sm font-medium text-gray-900">Featured</p>
                <p class="text-xs text-gray-400">Shown in the "Featured blogs" strip</p>
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

        <!-- Category + author -->
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
            <NuxtLink to="/admin/post-categories" class="text-[11px] text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block">
              Manage categories →
            </NuxtLink>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Author</label>
            <input
              v-model="form.author_name"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="Author name"
            />
          </div>
        </div>

        <!-- Danger zone -->
        <div v-if="!isNew" class="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <p class="text-sm font-semibold text-gray-900 mb-1">Danger zone</p>
          <p class="text-xs text-gray-400 mb-3">Deleting a post is permanent.</p>
          <button
            type="button"
            class="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            @click="showDelete = true"
          >
            Delete post
          </button>
        </div>
      </aside>
    </form>

    <ConfirmDeleteModal
      :open="showDelete"
      title="Delete Post"
      :message="`Are you sure you want to delete &quot;${form.title}&quot;? This cannot be undone.`"
      :deleting="deleting"
      @confirm="executeDelete"
      @cancel="showDelete = false"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import type { PostCategory, PostDetail } from '~/types/post'
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

const categories = ref<PostCategory[]>([])
const editorMode = ref<'write' | 'split' | 'preview'>('split')

const form = reactive({
  title: '',
  slug_manual: '',
  excerpt: '',
  body: '',
  author_name: '',
  category_id: null as number | null,
  is_published: false,
  is_featured: false,
  published_at: '',
  seo_title: '',
  seo_description: '',
})

const coverFile = ref<File | null>(null)
const coverPreviewUrl = ref<string | null>(null)
const existingCoverUrl = ref<string | null>(null)
const coverCleared = ref(false)

const previewCoverUrl = computed(() => coverPreviewUrl.value || (coverCleared.value ? null : existingCoverUrl.value))
const renderedBody = computed(() => renderMarkdown(form.body))

const autoSlug = computed(() => slugify(form.title))
const effectiveSlug = computed(() => form.slug_manual.trim() || autoSlug.value)

let titleTouched = false
function onTitleInput() {
  titleTouched = true
}
// allow auto-slug to update as user types title, until they manually edit slug
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
    const res = await $apiFetch<{ data: PostCategory[] }>('/post-categories')
    categories.value = res.data ?? []
  } catch {}
}

async function loadPost() {
  if (isNew.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await $apiFetch<{ data: PostDetail }>(`/admin/posts/${idParam.value}`)
    const p = res.data
    form.title = p.title
    form.slug_manual = p.slug
    form.excerpt = p.excerpt || ''
    form.body = p.body || ''
    form.author_name = p.author_name || ''
    form.category_id = p.category_id
    form.is_published = p.is_published
    form.is_featured = p.is_featured
    form.published_at = p.published_at ? toLocalInput(p.published_at) : ''
    form.seo_title = p.seo_title || ''
    form.seo_description = p.seo_description || ''
    existingCoverUrl.value = p.cover_image_url
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to load post', 'error')
    router.push('/admin/posts')
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
    excerpt: form.excerpt.trim() || null,
    body: form.body,
    author_name: form.author_name.trim() || null,
    category_id: form.category_id,
    is_published: form.is_published ? 1 : 0,
    is_featured: form.is_featured ? 1 : 0,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
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

    let saved: { data: PostDetail }

    if (isNew.value) {
      if (coverFile.value) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v))
        })
        fd.append('cover_image', coverFile.value)
        saved = await $apiFetch('/admin/posts', { method: 'POST', body: fd })
      } else {
        saved = await $apiFetch('/admin/posts', { method: 'POST', body: payload })
      }
    } else {
      if (coverFile.value) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v))
        })
        fd.append('cover_image', coverFile.value)
        fd.append('_method', 'PATCH')
        saved = await $apiFetch(`/admin/posts/${idParam.value}`, { method: 'POST', body: fd })
      } else {
        saved = await $apiFetch(`/admin/posts/${idParam.value}`, { method: 'PATCH', body: payload })
      }
    }

    showToast(isNew.value ? 'Post created' : 'Post saved', 'success')
    if (isNew.value && saved?.data?.id) {
      router.replace(`/admin/posts/${saved.data.id}`)
    } else {
      coverFile.value = null
      if (coverPreviewUrl.value) {
        URL.revokeObjectURL(coverPreviewUrl.value)
        coverPreviewUrl.value = null
      }
      existingCoverUrl.value = saved.data.cover_image_url
    }
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to save post', 'error')
  } finally {
    saving.value = false
  }
}

async function executeDelete() {
  if (isNew.value) return
  deleting.value = true
  try {
    await $apiFetch(`/admin/posts/${idParam.value}`, { method: 'DELETE' })
    showToast('Post deleted', 'success')
    router.push('/admin/posts')
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to delete post', 'error')
  } finally {
    deleting.value = false
    showDelete.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadPost()
})

onBeforeUnmount(() => {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
})
</script>

<style scoped>
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
