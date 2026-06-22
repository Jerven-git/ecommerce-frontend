<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
      <p class="text-sm text-gray-500 mt-1">Manage product categories and subcategories at any depth</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-3">
      <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded-xl" :style="{ marginLeft: `${(i % 3) * 24}px` }"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-sm mx-auto">
      <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
      <button @click="fetchCategories" class="btn-primary">Retry</button>
    </div>

    <!-- Main content -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Category Tree</p>
              <p class="text-xs text-gray-400">{{ totalCount }} total</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="categories.length" @click="expandAll" class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              Expand all
            </button>
            <button v-if="categories.length" @click="collapseAll" class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              Collapse all
            </button>
          </div>
        </div>

        <!-- Search bar -->
        <div v-if="categories.length" class="mt-3 relative">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-1 focus:ring-primary-300 outline-none transition-all placeholder-gray-400"
            placeholder="Search categories..."
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div data-guide="category-tree" class="p-5 space-y-3">
        <!-- Add root category -->
        <form data-guide="add-category" @submit.prevent="addCategory(null)" class="flex gap-2 items-center">
          <div class="relative flex-1">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <input
              v-model="newName"
              type="text"
              class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-1 focus:ring-primary-300 outline-none transition-all placeholder-gray-400"
              placeholder="New root category..."
              :disabled="saving"
            />
          </div>
          <button type="submit" class="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap disabled:opacity-50" :disabled="!newName.trim() || saving || addingParentId !== null">
            Add
          </button>
        </form>

        <!-- Search results info -->
        <p v-if="searchQuery && !filteredCategories.length" class="text-sm text-gray-400 text-center py-4">
          No categories matching "{{ searchQuery }}"
        </p>
        <p v-else-if="searchQuery" class="text-xs text-gray-400">
          Showing results for "{{ searchQuery }}"
        </p>

        <!-- Divider -->
        <div v-if="filteredCategories.length" class="border-t border-gray-100"></div>

        <!-- Tree -->
        <div v-if="filteredCategories.length" class="mt-1">
          <CategoryNode
            v-for="(cat, index) in filteredCategories"
            :key="cat.id"
            :category="cat"
            :depth="0"
            :is-last="index === filteredCategories.length - 1"
            :editing-id="editingId"
            :edit-name="editName"
            :expanded-ids="expandedIds"
            :adding-parent-id="addingParentId"
            :adding-name="addingName"
            :saving="saving"
            :search-query="searchQuery"
            :dragging-id="draggingId"
            :dragging-parent-id="draggingParentId"
            @toggle="toggleExpand"
            @start-edit="startEdit"
            @save-edit="saveEdit"
            @cancel-edit="cancelEdit"
            @edit-cover="openCover"
            @update:edit-name="editName = $event"
            @confirm-delete="confirmDelete"
            @start-add="startAddChild"
            @save-add="saveAddChild"
            @cancel-add="cancelAddChild"
            @update:adding-name="addingName = $event"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drag-drop="handleDragDrop"
          />
        </div>

        <p v-else-if="!searchQuery" class="text-sm text-gray-400 text-center py-6">No categories yet. Add one above.</p>
      </div>
    </div>

    <!-- Delete confirmation -->
    <ConfirmDeleteModal
      :open="!!deleteTarget"
      :title="`Delete Category`"
      :message="`Are you sure you want to delete &quot;${deleteTarget?.name}&quot;?${deleteTarget?.children?.length ? ' All subcategories will also be deleted.' : ''}`"
      @confirm="executeDelete"
      @cancel="deleteTarget = null"
    />

    <!-- Category cover image -->
    <AdminCategoryCoverModal
      :open="!!coverTarget"
      :category="coverTarget"
      @close="coverTarget = null"
      @saved="onCoverSaved"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface Category {
  id: number
  name: string
  slug?: string | null
  image_url?: string | null
  overlay_opacity?: number | null
  parent_id: number | null
  sort_order: number
  children?: Category[]
}

interface CategoriesResponse {
  data: Category[]
}

const { $apiFetch } = useNuxtApp()

const categories = ref<Category[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

// Add root
const newName = ref('')

// Add child inline
const addingParentId = ref<number | null>(null)
const addingName = ref('')

// Inline editing
const editingId = ref<number | null>(null)
const editName = ref('')

// Delete
const deleteTarget = ref<Category | null>(null)

// Cover image
const coverTarget = ref<Category | null>(null)
function openCover(cat: Category) {
  coverTarget.value = cat
}
function onCoverSaved() {
  coverTarget.value = null
  fetchCategories()
}

// Search
const searchQuery = ref('')

// Drag and drop
const draggingId = ref<number | null>(null)
const draggingParentId = ref<number | null | undefined>(undefined)

function filterTree(cats: Category[], query: string): Category[] {
  if (!query) return cats
  const q = query.toLowerCase()
  return cats.reduce<Category[]>((acc, cat) => {
    const childMatches = filterTree(cat.children || [], q)
    if (cat.name.toLowerCase().includes(q) || childMatches.length) {
      acc.push({ ...cat, children: childMatches.length ? childMatches : cat.children })
    }
    return acc
  }, [])
}

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) return categories.value
  return filterTree(categories.value, searchQuery.value.trim())
})

// Auto-expand all when searching
watch(searchQuery, (q) => {
  if (q.trim()) {
    expandedIds.value = new Set(collectIds(filteredCategories.value))
  }
})

// Expand/collapse
const expandedIds = ref<Set<number>>(new Set())

const totalCount = computed(() => {
  function count(cats: Category[]): number {
    return cats.reduce((sum, c) => sum + 1 + count(c.children || []), 0)
  }
  return count(categories.value)
})

function collectIds(cats: Category[]): number[] {
  return cats.flatMap(c => [c.id, ...collectIds(c.children || [])])
}

function expandAll() {
  expandedIds.value = new Set(collectIds(categories.value))
}

function collapseAll() {
  expandedIds.value = new Set()
}

function toggleExpand(id: number) {
  const s = new Set(expandedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedIds.value = s
}

function normalizeCategories(cats: any[]): Category[] {
  return (cats || []).map(c => ({
    ...c,
    id: Number(c.id),
    slug: c.slug ?? null,
    image_url: c.image_url ?? null,
    overlay_opacity: c.overlay_opacity ?? null,
    parent_id: c.parent_id != null ? Number(c.parent_id) : null,
    children: normalizeCategories(c.children || c.children_recursive || []),
  }))
}

async function fetchCategories() {
  loading.value = true
  error.value = null
  try {
    const res = await $apiFetch<CategoriesResponse>('/categories', { method: 'GET' })
    categories.value = normalizeCategories(res.data || [])
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load categories.'
  } finally {
    loading.value = false
  }
}

async function addCategory(parentId: number | null) {
  const name = parentId === null ? newName.value.trim() : addingName.value.trim()
  if (!name) return
  saving.value = true
  try {
    const body: Record<string, any> = { name }
    if (parentId !== null) body.parent_id = parentId
    await $apiFetch('/categories', { method: 'POST', body })
    if (parentId === null) {
      newName.value = ''
    } else {
      addingName.value = ''
      addingParentId.value = null
      expandedIds.value = new Set([...expandedIds.value, parentId])
    }
    await fetchCategories()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to create category.')
  } finally {
    saving.value = false
  }
}

function startAddChild(parentId: number) {
  addingParentId.value = parentId
  addingName.value = ''
  expandedIds.value = new Set([...expandedIds.value, parentId])
}

function saveAddChild(parentId: number) {
  addCategory(parentId)
}

function cancelAddChild() {
  addingParentId.value = null
  addingName.value = ''
}

function startEdit(cat: Category) {
  editingId.value = cat.id
  editName.value = cat.name
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

async function saveEdit(cat: Category) {
  if (!editName.value.trim()) return
  saving.value = true
  try {
    await $apiFetch(`/categories/${cat.id}`, {
      method: 'PATCH',
      body: { name: editName.value.trim() },
    })
    cancelEdit()
    await fetchCategories()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to update category.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(cat: Category) {
  deleteTarget.value = cat
}

async function executeDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await $apiFetch(`/categories/${deleteTarget.value.id}`, { method: 'DELETE' })
    deleteTarget.value = null
    await fetchCategories()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to delete category.')
  } finally {
    saving.value = false
  }
}

// --- Drag and drop handlers ---

function handleDragStart(catId: number, parentId: number | null) {
  draggingId.value = catId
  draggingParentId.value = parentId
}

function handleDragEnd() {
  draggingId.value = null
  draggingParentId.value = undefined
}

function handleDragDrop(draggedId: number, targetId: number, parentId: number | null, pos: 'before' | 'after') {
  const list = parentId === null
    ? categories.value
    : findCategory(categories.value, parentId)?.children

  if (!list) return

  const fromIdx = list.findIndex(c => c.id === draggedId)
  if (fromIdx === -1) return

  const arr = [...list]
  const item = arr.splice(fromIdx, 1)[0]
  if (!item) return

  let toIdx = arr.findIndex(c => c.id === targetId)
  if (toIdx === -1) return
  if (pos === 'after') toIdx++

  arr.splice(toIdx, 0, item)

  if (parentId === null) {
    categories.value = arr
  } else {
    const parent = findCategory(categories.value, parentId)
    if (parent) parent.children = arr
  }

  handleDragEnd()
  saveReorder(arr.map(c => c.id))
}

function findCategory(cats: Category[], id: number): Category | null {
  for (const cat of cats) {
    if (cat.id === id) return cat
    if (cat.children?.length) {
      const found = findCategory(cat.children, id)
      if (found) return found
    }
  }
  return null
}

async function saveReorder(ids: number[]) {
  try {
    await $apiFetch('/categories/reorder', { method: 'POST', body: { ids } })
  } catch {
    await fetchCategories()
  }
}

onMounted(fetchCategories)
</script>
