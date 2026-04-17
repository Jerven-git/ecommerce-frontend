export interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

export function useProductCategories() {
  const { $apiFetch } = useNuxtApp()

  const allCategories = ref<Category[]>([])
  const selectedCategoryIds = ref<Set<number>>(new Set())
  const catPickerExpanded = ref<Set<number>>(new Set())

  function normalizeCategories(cats: any[]): Category[] {
    return (cats || []).map(c => ({
      ...c,
      id: Number(c.id),
      parent_id: c.parent_id != null ? Number(c.parent_id) : null,
      children: normalizeCategories(c.children || c.children_recursive || []),
    }))
  }

  const fetchCategories = async () => {
    try {
      const res = await $apiFetch<{ data: any[] }>('/categories', { method: 'GET' })
      allCategories.value = normalizeCategories(res.data || [])
    } catch (err) {
      console.warn('Failed to load categories:', err)
    }
  }

  function findCategoryById(cats: Category[], id: number): Category | null {
    for (const cat of cats) {
      if (Number(cat.id) === Number(id)) return cat
      if (cat.children?.length) {
        const found = findCategoryById(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  function findCategoryPath(cats: Category[], id: number): Category[] {
    for (const cat of cats) {
      if (Number(cat.id) === Number(id)) return [cat]
      if (cat.children?.length) {
        const path = findCategoryPath(cat.children, id)
        if (path.length) return [cat, ...path]
      }
    }
    return []
  }

  function toggleCatPickerExpand(id: number) {
    const s = new Set(catPickerExpanded.value)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    catPickerExpanded.value = s
  }

  function toggleCategory(id: number, form: { category_ids: number[] }) {
    const s = new Set(selectedCategoryIds.value)
    if (s.has(id)) {
      s.delete(id)
    } else {
      s.add(id)
    }
    selectedCategoryIds.value = s
    form.category_ids = Array.from(s)
  }

  function clearCategorySelection(form: { category_ids: number[] }) {
    selectedCategoryIds.value = new Set()
    form.category_ids = []
  }

  function initCategoryForProduct(categoryIds: number[]) {
    selectedCategoryIds.value = new Set(categoryIds)
    // Auto-expand parent paths for all selected categories
    const expandIds = new Set(catPickerExpanded.value)
    for (const id of categoryIds) {
      const path = findCategoryPath(allCategories.value, id)
      for (const cat of path.slice(0, -1)) {
        expandIds.add(cat.id)
      }
    }
    catPickerExpanded.value = expandIds
  }

  const categoryBreadcrumb = computed(() => {
    const ids = Array.from(selectedCategoryIds.value)
    if (ids.length === 0) return ''
    const names = ids.map(id => {
      const cat = findCategoryById(allCategories.value, id)
      return cat?.name || ''
    }).filter(Boolean)
    return names.join(', ')
  })

  return {
    allCategories,
    selectedCategoryIds,
    catPickerExpanded,
    categoryBreadcrumb,
    fetchCategories,
    findCategoryById,
    findCategoryPath,
    toggleCatPickerExpand,
    toggleCategory,
    clearCategorySelection,
    initCategoryForProduct,
  }
}
