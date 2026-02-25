<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
      <p class="text-sm text-gray-500 mt-1">Manage product categories and subcategories</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
        <div class="h-5 bg-gray-100 rounded-lg w-1/3"></div>
        <div class="h-10 bg-gray-100 rounded-lg"></div>
        <div class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
        <div class="h-5 bg-gray-100 rounded-lg w-1/2"></div>
        <div class="h-32 bg-gray-100 rounded-lg"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-sm mx-auto">
      <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
      <button @click="fetchCategories" class="btn-primary">Retry</button>
    </div>

    <!-- Main content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Left: Parent Categories -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Categories</p>
            <p class="text-xs text-gray-400">{{ categories.length }} total</p>
          </div>
        </div>

        <div class="p-5 space-y-4">
          <!-- Add new category -->
          <form @submit.prevent="addCategory" class="flex gap-2">
            <input
              v-model="newCategoryName"
              type="text"
              class="input-field flex-1"
              placeholder="New category name..."
              :disabled="saving"
            />
            <button type="submit" class="btn-primary whitespace-nowrap" :disabled="!newCategoryName.trim() || saving">
              Add
            </button>
          </form>

          <!-- Category list -->
          <div v-if="categories.length" class="space-y-1.5">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat)"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group"
              :class="selectedCategory?.id === cat.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'"
            >
              <div class="flex-1 min-w-0">
                <!-- Inline edit mode -->
                <div v-if="editingId === cat.id" class="flex items-center gap-2" @click.stop>
                  <input
                    v-model="editName"
                    type="text"
                    class="input-field text-sm py-1"
                    @keydown.enter="saveEdit(cat)"
                    @keydown.escape="cancelEdit"
                    ref="editInput"
                  />
                  <button @click="saveEdit(cat)" class="text-blue-600 hover:text-blue-800">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <!-- Display mode -->
                <template v-else>
                  <p class="text-sm font-medium text-gray-900 truncate">{{ cat.name }}</p>
                  <p class="text-xs text-gray-400">{{ cat.children?.length || 0 }} subcategories</p>
                </template>
              </div>

              <!-- Actions -->
              <div v-if="editingId !== cat.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                <button @click="startEdit(cat)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Rename">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button @click="confirmDelete(cat)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </button>
          </div>

          <p v-else class="text-sm text-gray-400 text-center py-6">No categories yet. Add one above.</p>
        </div>
      </section>

      <!-- Right: Subcategories -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">
              {{ selectedCategory ? `Subcategories of "${selectedCategory.name}"` : 'Subcategories' }}
            </p>
            <p class="text-xs text-gray-400">
              {{ selectedCategory ? `${selectedCategory.children?.length || 0} items` : 'Select a category' }}
            </p>
          </div>
        </div>

        <div class="p-5">
          <template v-if="selectedCategory">
            <!-- Add subcategory -->
            <form @submit.prevent="addSubcategory" class="flex gap-2 mb-4">
              <input
                v-model="newSubcategoryName"
                type="text"
                class="input-field flex-1"
                placeholder="New subcategory name..."
                :disabled="saving"
              />
              <button type="submit" class="btn-primary whitespace-nowrap" :disabled="!newSubcategoryName.trim() || saving">
                Add
              </button>
            </form>

            <!-- Subcategory list -->
            <div v-if="selectedCategory.children?.length" class="space-y-1.5">
              <div
                v-for="sub in selectedCategory.children"
                :key="sub.id"
                class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent"
              >
                <div class="flex-1 min-w-0">
                  <div v-if="editingId === sub.id" class="flex items-center gap-2">
                    <input
                      v-model="editName"
                      type="text"
                      class="input-field text-sm py-1"
                      @keydown.enter="saveEdit(sub)"
                      @keydown.escape="cancelEdit"
                    />
                    <button @click="saveEdit(sub)" class="text-blue-600 hover:text-blue-800">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <p v-else class="text-sm font-medium text-gray-700 truncate">{{ sub.name }}</p>
                </div>

                <div v-if="editingId !== sub.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="startEdit(sub)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Rename">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button @click="confirmDelete(sub)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-gray-400 text-center py-6">No subcategories yet. Add one above.</p>
          </template>

          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <p class="text-sm text-gray-400">Select a category on the left to manage its subcategories.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Delete confirmation -->
    <ConfirmDeleteModal
      :open="!!deleteTarget"
      :title="`Delete ${deleteTarget?.parent_id ? 'Subcategory' : 'Category'}`"
      :message="`Are you sure you want to delete &quot;${deleteTarget?.name}&quot;?${!deleteTarget?.parent_id && deleteTarget?.children?.length ? ' All subcategories will also be deleted.' : ''}`"
      @confirm="executeDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface Category {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
  children?: Category[]
}

interface CategoriesResponse {
  data: Category[]
}

const { $apiFetch } = useNuxtApp()

const categories = ref<Category[]>([])
const selectedCategory = ref<Category | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const newCategoryName = ref('')
const newSubcategoryName = ref('')

// Inline editing
const editingId = ref<number | null>(null)
const editName = ref('')

// Delete
const deleteTarget = ref<Category | null>(null)

async function fetchCategories() {
  loading.value = true
  error.value = null
  try {
    const res = await $apiFetch<CategoriesResponse>('/categories', { method: 'GET' })
    categories.value = res.data || []

    // Refresh selected category data
    if (selectedCategory.value) {
      selectedCategory.value = categories.value.find(c => c.id === selectedCategory.value!.id) || null
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load categories.'
  } finally {
    loading.value = false
  }
}

function selectCategory(cat: Category) {
  selectedCategory.value = selectedCategory.value?.id === cat.id ? null : cat
}

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  saving.value = true
  try {
    await $apiFetch('/categories', {
      method: 'POST',
      body: { name: newCategoryName.value.trim() },
    })
    newCategoryName.value = ''
    await fetchCategories()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to create category.')
  } finally {
    saving.value = false
  }
}

async function addSubcategory() {
  if (!newSubcategoryName.value.trim() || !selectedCategory.value) return
  saving.value = true
  try {
    await $apiFetch('/categories', {
      method: 'POST',
      body: { name: newSubcategoryName.value.trim(), parent_id: selectedCategory.value.id },
    })
    newSubcategoryName.value = ''
    await fetchCategories()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to create subcategory.')
  } finally {
    saving.value = false
  }
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
    if (selectedCategory.value?.id === deleteTarget.value.id) {
      selectedCategory.value = null
    }
    deleteTarget.value = null
    await fetchCategories()
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to delete category.')
  } finally {
    saving.value = false
  }
}

onMounted(fetchCategories)
</script>
