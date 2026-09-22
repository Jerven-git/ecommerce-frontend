<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <AdminPageHeader title="Service Categories" subtitle="Group services into topics with color-styled tiles">
      <template #breadcrumb>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Service Categories</span>
        </div>
      </template>
      <template #actions>
        <button
          data-guide="add-service-category-btn"
          type="button"
          @click="startAdd"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shrink-0"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          New Category
        </button>
      </template>
    </AdminPageHeader>

    <!-- Search -->
    <div class="mb-6">
      <div class="flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 bg-white">
        <span class="pl-3 text-gray-400 shrink-0">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or slug…"
          class="flex-1 py-2 pr-3 pl-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="pr-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Clear search"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>
      <p v-if="searchQuery && !loading" class="text-xs text-gray-500 mt-2">
        Showing results for "{{ searchQuery }}"
      </p>
    </div>

    <!-- Loading -->
    <AdminSpinner v-if="loading" label="Loading service categories…" />

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-sm mx-auto">
      <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
      <button @click="load" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <AdminCard v-else-if="!categories.length && !searchQuery">
      <AdminEmptyState
        title="No service categories yet"
        description="Create your first category to organize services"
        :icon="'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z'"
      >
        <template #action>
          <button
            @click="startAdd"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            New Category
          </button>
        </template>
      </AdminEmptyState>
    </AdminCard>

    <!-- No search results -->
    <AdminCard v-else-if="!categories.length">
      <AdminEmptyState
        title="No matching categories"
        :description="`Nothing found for &quot;${searchQuery}&quot;`"
        :icon="'M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z'"
      >
        <template #action>
          <button
            @click="searchQuery = ''"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear search
          </button>
        </template>
      </AdminEmptyState>
    </AdminCard>

    <!-- List -->
    <div v-else data-guide="service-category-list" class="bg-white rounded-2xl border border-gray-200/70 shadow-sm divide-y divide-gray-100">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="flex items-center gap-3 sm:gap-4 p-4 hover:bg-gray-50/50 transition-colors"
      >
        <!-- Gradient preview -->
        <div
          class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-sm flex items-center justify-center shrink-0"
          :style="{ background: `linear-gradient(135deg, ${cat.gradient_from}, ${cat.gradient_to})` }"
        >
          <span class="text-[10px] font-bold text-white/90 uppercase tracking-wider">{{ cat.name.slice(0, 2) }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ cat.name }}</p>
          <p class="text-xs text-gray-500 font-mono truncate">{{ cat.slug }}</p>
          <p class="text-xs text-gray-500 mt-0.5 truncate">
            {{ cat.services_count ?? 0 }} published {{ (cat.services_count ?? 0) === 1 ? 'service' : 'services' }}
          </p>
        </div>

        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            @click="startEdit(cat)"
            class="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            @click="deleteTarget = cat"
            class="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
      <div v-if="totalPages > 1" class="flex justify-end border-t border-gray-100 px-4 py-2">
        <AdminPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :per-page="perPage"
          item-label="categories"
          @go-to-page="goToPage"
        />
      </div>
    </div>

    <!-- Form Modal -->
    <BaseModal
      :open="showModal"
      :title="editing ? 'Edit Category' : 'New Service Category'"
      size="md"
      body-class="p-0"
      @close="closeModal"
    >
      <form id="serviceCategoryForm" class="p-5 space-y-4" @submit.prevent="save">
        <!-- Name -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="e.g. Everyday spending"
          />
        </div>

        <!-- Gradient colors -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Gradient from</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="form.gradient_from"
                class="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
              />
              <input
                v-model="form.gradient_from"
                type="text"
                class="flex-1 min-w-0 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Gradient to</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="form.gradient_to"
                class="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
              />
              <input
                v-model="form.gradient_to"
                type="text"
                class="flex-1 min-w-0 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Optional image upload -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Image (optional)</label>

          <div class="relative">
            <img
              v-if="previewImageUrl"
              :src="previewImageUrl"
              alt="Category image preview"
              class="w-full aspect-[5/2] object-cover rounded-xl border border-gray-100"
            />
            <label
              v-else
              class="flex flex-col items-center justify-center w-full aspect-[5/2] border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-300 hover:text-primary-500 cursor-pointer transition-colors"
            >
              <Icon name="heroicons:photo" class="w-7 h-7 mb-1" />
              <span class="text-xs font-medium">Upload image</span>
              <input type="file" accept="image/*" class="hidden" @change="onImageSelect" />
            </label>

            <div v-if="previewImageUrl" class="absolute top-2 right-2 flex gap-1">
              <label class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-gray-700 hover:bg-white cursor-pointer shadow-sm">
                Replace
                <input type="file" accept="image/*" class="hidden" @change="onImageSelect" />
              </label>
              <button
                type="button"
                class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-red-500 hover:bg-white shadow-sm"
                @click="clearImage"
              >
                Remove
              </button>
            </div>
          </div>
          <p class="text-[11px] text-gray-500 mt-1">Blends over the gradient when set. JPG, PNG, WebP — max 5 MB.</p>
        </div>

        <!-- Color overlay (only meaningful when an image is present) -->
        <div v-if="previewImageUrl">
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-gray-700">Color overlay</label>
            <span class="text-xs font-mono text-gray-500 tabular-nums">{{ form.overlay_opacity }}%</span>
          </div>
          <input
            v-model.number="form.overlay_opacity"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-full accent-primary-600"
          />
          <div class="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
            <span>Image only</span>
            <span>Strong color</span>
          </div>
        </div>

        <!-- Preview -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Preview</label>
          <div
            class="relative w-full aspect-[5/2] rounded-xl overflow-hidden flex items-end p-4"
            :style="{ background: `linear-gradient(135deg, ${form.gradient_from}, ${form.gradient_to})` }"
          >
            <img
              v-if="previewImageUrl"
              :src="previewImageUrl"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div
              v-if="previewImageUrl"
              class="absolute inset-0 mix-blend-multiply"
              :style="{
                background: `linear-gradient(135deg, ${form.gradient_from}, ${form.gradient_to})`,
                opacity: form.overlay_opacity / 100,
              }"
            />
            <span class="relative inline-flex items-center px-3 py-1.5 rounded-lg bg-white/95 text-[12px] font-semibold text-gray-900 shadow-sm">
              {{ form.name || 'Category name' }}
            </span>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="serviceCategoryForm"
            :disabled="saving || !form.name.trim()"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <span v-if="saving" class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            {{ editing ? 'Save changes' : 'Create category' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <ConfirmDeleteModal
      :open="!!deleteTarget"
      title="Delete Category"
      :message="`Are you sure you want to delete &quot;${deleteTarget?.name}&quot;? Services in this category will be left uncategorized.`"
      :deleting="deleting"
      @confirm="executeDelete"
      @cancel="deleteTarget = null"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import type { PaginatedServiceCategories, ServiceCategory } from '~/types/service'

definePageMeta({ middleware: 'auth' })

const { $apiFetch } = useNuxtApp()
const { showToast } = useAdminToast()

const categories = ref<ServiceCategory[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = 10

const showModal = ref(false)
const editing = ref<ServiceCategory | null>(null)
const saving = ref(false)
const form = reactive({
  name: '',
  gradient_from: '#6898ED',
  gradient_to: '#4B5979',
  overlay_opacity: 60,
})

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const existingImageUrl = ref<string | null>(null)
const imageCleared = ref(false)

const previewImageUrl = computed(
  () => imagePreviewUrl.value || (imageCleared.value ? null : existingImageUrl.value),
)

const deleteTarget = ref<ServiceCategory | null>(null)
const deleting = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    const query: Record<string, string | number> = {
      page: currentPage.value,
      per_page: perPage,
    }
    if (searchQuery.value.trim()) query.search = searchQuery.value.trim()

    const res = await $apiFetch<PaginatedServiceCategories>('/service-categories', { query })
    categories.value = res.data ?? []
    currentPage.value = res.current_page ?? 1
    totalPages.value = res.last_page ?? 1
    totalItems.value = res.total ?? 0
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load categories'
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  load()
}

function resetForm() {
  form.name = ''
  form.gradient_from = '#6898ED'
  form.gradient_to = '#4B5979'
  form.overlay_opacity = 60
  resetImageState()
}

function resetImageState() {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imageFile.value = null
  imagePreviewUrl.value = null
  existingImageUrl.value = null
  imageCleared.value = false
}

function startAdd() {
  editing.value = null
  resetForm()
  showModal.value = true
}

function startEdit(cat: ServiceCategory) {
  editing.value = cat
  form.name = cat.name
  form.gradient_from = cat.gradient_from
  form.gradient_to = cat.gradient_to
  form.overlay_opacity = cat.overlay_opacity ?? 60
  resetImageState()
  existingImageUrl.value = cat.image_url || null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
  resetForm()
}

function onImageSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = URL.createObjectURL(file)
  imageCleared.value = false
}

function clearImage() {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = null
  imageFile.value = null
  imageCleared.value = true
}

async function save() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    const hasFile = !!imageFile.value

    if (hasFile) {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('gradient_from', form.gradient_from)
      fd.append('gradient_to', form.gradient_to)
      fd.append('overlay_opacity', String(form.overlay_opacity))
      fd.append('image', imageFile.value as File)
      if (editing.value) fd.append('_method', 'PATCH')

      const url = editing.value
        ? `/service-categories/${editing.value.id}`
        : '/service-categories'

      await $apiFetch(url, { method: 'POST', body: fd })
    } else {
      const body = {
        name: form.name.trim(),
        gradient_from: form.gradient_from,
        gradient_to: form.gradient_to,
        overlay_opacity: form.overlay_opacity,
      }
      if (editing.value) {
        await $apiFetch(`/service-categories/${editing.value.id}`, { method: 'PATCH', body })
      } else {
        await $apiFetch('/service-categories', { method: 'POST', body })
      }
    }

    if (editing.value && imageCleared.value && !hasFile && existingImageUrl.value) {
      await $apiFetch(`/service-categories/${editing.value.id}/image`, { method: 'DELETE' })
    }

    showToast(editing.value ? 'Category updated' : 'Category created', 'success')
    const wasEditing = !!editing.value
    closeModal()
    // New categories sort by name — jump to page 1 so the created row is visible
    if (!wasEditing) currentPage.value = 1
    await load()
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to save category', 'error')
  } finally {
    saving.value = false
  }
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $apiFetch(`/service-categories/${deleteTarget.value.id}`, { method: 'DELETE' })
    showToast('Category deleted', 'success')
    deleteTarget.value = null
    // Step back if the last item on the page was removed
    if (categories.value.length <= 1 && currentPage.value > 1) currentPage.value -= 1
    await load()
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to delete category', 'error')
  } finally {
    deleting.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    load()
  }, 400)
})

onMounted(load)
onBeforeUnmount(() => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
})
</script>
