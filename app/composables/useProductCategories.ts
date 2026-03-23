export interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

export function useProductCategories() {
  const { $apiFetch } = useNuxtApp()

  const allCategories = ref<Category[]>([])
  const categorySelections = ref<(number | null)[]>([])
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

  function selectCategory(id: number, form: { category_id: number | null; category: string }) {
    if (form.category_id === id) {
      form.category_id = null
      form.category = 'general'
      categorySelections.value = []
      return
    }
    form.category_id = id
    const cat = findCategoryById(allCategories.value, id)
    form.category = cat?.name || 'general'
    const path = findCategoryPath(allCategories.value, id)
    categorySelections.value = path.map(c => c.id)
    const parentIds = path.slice(0, -1).map(c => c.id)
    catPickerExpanded.value = new Set([...catPickerExpanded.value, ...parentIds])
  }

  function clearCategorySelection(form: { category_id: number | null; category: string }) {
    form.category_id = null
    form.category = 'general'
    categorySelections.value = []
  }

  function initCategoryForProduct(categoryId: number | null) {
    if (categoryId) {
      const path = findCategoryPath(allCategories.value, categoryId)
      categorySelections.value = path.map(c => Number(c.id))
      catPickerExpanded.value = new Set(path.slice(0, -1).map(c => Number(c.id)))
    } else {
      categorySelections.value = []
      catPickerExpanded.value = new Set()
    }
  }

  const categoryBreadcrumb = computed(() => {
    const names: string[] = []
    for (const selId of categorySelections.value) {
      if (selId == null) break
      const cat = findCategoryById(allCategories.value, selId)
      if (cat) names.push(cat.name)
    }
    return names.length > 1 ? names.join(' > ') : ''
  })

  return {
    allCategories,
    categorySelections,
    catPickerExpanded,
    categoryBreadcrumb,
    fetchCategories,
    findCategoryById,
    findCategoryPath,
    toggleCatPickerExpand,
    selectCategory,
    clearCategorySelection,
    initCategoryForProduct,
  }
}
