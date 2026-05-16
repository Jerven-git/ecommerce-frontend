import type { Product } from './useProducts'

export interface OptionValueDraft {
  id: number | null
  label: string
  image_url: string | null
  position: number
}

export interface OptionDraft {
  id: number | null
  name: string
  position: number
  values: OptionValueDraft[]
}

export interface VariantDraft {
  id: number | null
  sku: string
  price: number | null
  stock: number
  image_url: string | null
  is_active: boolean
  // optionIndex → value array index within that option (not the DB id)
  selectedValueIds: Record<number, number>
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  weight: number
  length_cm: number
  width_cm: number
  height_cm: number
  shipping_calc_type: 'weight' | 'dimensions'
  category: string
  category_id: number | null
  category_ids: number[]
  is_active: boolean
  hover_zoom_enabled: boolean
  allow_backorder: boolean
  backorder_charge_policy: 'charged_now' | 'charged_later'
  seo_title: string
  seo_description: string
  og_image_url: string
  noindex: boolean
}

function defaultFormData(): ProductFormData {
  return {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    weight: 0,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    shipping_calc_type: 'weight',
    category: 'general',
    category_id: null,
    category_ids: [],
    is_active: true,
    hover_zoom_enabled: false,
    allow_backorder: false,
    backorder_charge_policy: 'charged_later',
    seo_title: '',
    seo_description: '',
    og_image_url: '',
    noindex: false,
  }
}

export function useProductForm() {
  const { $apiFetch } = useNuxtApp()

  const showModal = ref(false)
  const backdropMouseDown = ref(false)
  const submitting = ref(false)
  const formError = ref<string | null>(null)
  const editingProduct = ref<Product | null>(null)
  const form = ref<ProductFormData>(defaultFormData())

  // Unified product images — gallery works for both new and existing products.
  // Staged galleryFiles are uploaded by saveProduct after the product is
  // created (new) or updated (edit).
  // `legacy: true` marks items that come from product.image_url alone (no
  // Media record) — removing them PATCHes the product to clear image_url.
  interface GalleryItem {
    id: number
    url: string
    alt_text?: string | null
    legacy?: boolean
  }
  const galleryImages = ref<GalleryItem[]>([])
  const galleryFiles = ref<File[]>([])
  const galleryInput = ref<HTMLInputElement | null>(null)

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 MB

  // Object-URL previews for staged files. Oversized ones are shown as tiles
  // with an error state; they are excluded from the actual upload.
  const stagedPreviews = ref<{ key: string; url: string; name: string; oversized: boolean }[]>([])
  watch(galleryFiles, (files) => {
    for (const p of stagedPreviews.value) URL.revokeObjectURL(p.url)
    stagedPreviews.value = files.map((file, i) => ({
      key: `${file.name}-${file.size}-${i}`,
      url: URL.createObjectURL(file),
      name: file.name,
      oversized: file.size > MAX_IMAGE_SIZE,
    }))
  })

  const removeStagedFile = (index: number) => {
    galleryFiles.value = galleryFiles.value.filter((_, i) => i !== index)
    if (!galleryFiles.value.length && galleryInput.value) galleryInput.value.value = ''
  }

  const computedVolumeCbm = computed(() => {
    const l = Number(form.value.length_cm) || 0
    const w = Number(form.value.width_cm) || 0
    const h = Number(form.value.height_cm) || 0
    if (l <= 0 || w <= 0 || h <= 0) return 0
    return (l * w * h) / 1000000
  })

  const onGallerySelected = (event: Event) => {
    const input = event.target as HTMLInputElement
    const incoming = Array.from(input.files || [])
    // Append all files — oversized ones are shown highlighted but not uploaded.
    if (incoming.length) galleryFiles.value = [...galleryFiles.value, ...incoming]
  }

  // POSTs galleryFiles to the given product id and refreshes the gallery
  // from the response media list. Called by saveProduct after the product
  // is created or updated.
  const uploadGalleryFilesTo = async (productId: number) => {
    const validFiles = galleryFiles.value.filter(f => f.size <= MAX_IMAGE_SIZE)
    if (!validFiles.length) return
    const formData = new FormData()
    for (const file of validFiles) {
      formData.append('images[]', file)
    }
    const res = await $apiFetch<{ data: any }>(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    })
    if (res?.data?.media) {
      galleryImages.value = res.data.media
        .filter((m: any) => m.collection === 'gallery' || m.collection === 'image')
        .map((m: any) => ({ id: m.id, url: m.url, alt_text: m.alt_text ?? null }))
    }
    galleryFiles.value = []
    if (galleryInput.value) galleryInput.value.value = ''
  }

  const deleteGalleryImage = async (mediaId: number, onSuccess?: () => Promise<void>) => {
    if (!editingProduct.value) return

    // Legacy item (no Media row — product.image_url only): clear it by
    // PATCHing the product instead of hitting the media delete endpoint.
    const item = galleryImages.value.find(img => img.id === mediaId)
    if (item?.legacy) {
      try {
        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('image_url', '')
        await $apiFetch(`/products/${editingProduct.value.id}`, {
          method: 'POST',
          body: formData,
        })
        galleryImages.value = galleryImages.value.filter(img => img.id !== mediaId)
        if (onSuccess) await onSuccess()
      } catch (err: any) {
        console.error('Error clearing legacy image_url:', err)
        formError.value = err?.data?.message || 'Failed to remove image'
      }
      return
    }

    try {
      const res = await $apiFetch<{ data: any }>(`/products/${editingProduct.value.id}/images/${mediaId}`, {
        method: 'DELETE',
      })
      if (res?.data?.media) {
        galleryImages.value = res.data.media
          .filter((m: any) => m.collection === 'gallery' || m.collection === 'image')
          .map((m: any) => ({ id: m.id, url: m.url }))
      } else {
        galleryImages.value = galleryImages.value.filter(img => img.id !== mediaId)
      }
      if (onSuccess) await onSuccess()
    } catch (err: any) {
      console.error('Error deleting gallery image:', err)
    }
  }

  // ── Variant Editor State ────────────────────────────────────────────────────
  const variantOptions = ref<OptionDraft[]>([])
  const variantDrafts = ref<VariantDraft[]>([])
  const variantsSaving = ref(false)
  const variantsError = ref<string | null>(null)

  const resetVariantState = () => {
    variantOptions.value = []
    variantDrafts.value = []
    variantsError.value = null
  }

  const loadVariants = async (productId: number) => {
    try {
      const res = await $apiFetch<{ data: { options: any[]; variants: any[] } }>(
        `/products/${productId}/variants`,
        { method: 'GET' }
      )
      const { options, variants } = res?.data ?? { options: [], variants: [] }

      variantOptions.value = options.map((opt: any, optIdx: number) => ({
        id: opt.id,
        name: opt.name,
        position: optIdx,
        values: (opt.values ?? []).map((v: any, vIdx: number) => ({
          id: v.id,
          label: v.label,
          image_url: v.image_url ?? null,
          position: vIdx,
        })),
      }))

      variantDrafts.value = variants.map((v: any) => {
        const selectedValueIds: Record<number, number> = {}
        variantOptions.value.forEach((opt, optIdx) => {
          const match = (v.option_values ?? []).find(
            (ov: any) => ov.pivot?.product_option_id === opt.id
          )
          if (match) {
            const valIdx = opt.values.findIndex((val: any) => val.id === match.id)
            if (valIdx !== -1) selectedValueIds[optIdx] = valIdx
          }
        })
        return {
          id: v.id,
          sku: v.sku ?? '',
          price: v.price !== null ? Number(v.price) : null,
          stock: v.stock ?? 0,
          image_url: v.image_url ?? null,
          is_active: v.is_active ?? true,
          selectedValueIds,
        }
      })
    } catch {
      // Silently fail — variants section will show empty state.
    }
  }

  const addOption = () => {
    variantOptions.value.push({
      id: null,
      name: '',
      position: variantOptions.value.length,
      values: [],
    })
  }

  const removeOption = (optIdx: number) => {
    variantOptions.value.splice(optIdx, 1)
    variantOptions.value.forEach((opt, i) => { opt.position = i })

    // Re-index draft selectedValueIds: drop removed key, shift higher keys down
    variantDrafts.value = variantDrafts.value.map(draft => {
      const newIds: Record<number, number> = {}
      for (const [k, v] of Object.entries(draft.selectedValueIds)) {
        const key = Number(k)
        if (key < optIdx) newIds[key] = v
        else if (key > optIdx) newIds[key - 1] = v
      }
      return { ...draft, selectedValueIds: newIds }
    })

    // Deduplicate combos that became identical after the dimension was removed
    const seen = new Set<string>()
    variantDrafts.value = variantDrafts.value.filter(draft => {
      const key = JSON.stringify(draft.selectedValueIds)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const addOptionValue = (optIdx: number) => {
    const opt = variantOptions.value[optIdx]
    if (!opt) return
    opt.values.push({ id: null, label: '', image_url: null, position: opt.values.length })
    generateVariants()
  }

  const removeOptionValue = (optIdx: number, valIdx: number) => {
    variantOptions.value[optIdx]?.values.splice(valIdx, 1)
    variantOptions.value[optIdx]?.values.forEach((v, i) => { v.position = i })

    // Remove variants that used this value; shift higher indices down
    variantDrafts.value = variantDrafts.value
      .filter(draft => draft.selectedValueIds[optIdx] !== valIdx)
      .map(draft => {
        const idx = draft.selectedValueIds[optIdx]
        if (idx !== undefined && idx > valIdx) {
          return { ...draft, selectedValueIds: { ...draft.selectedValueIds, [optIdx]: idx - 1 } }
        }
        return draft
      })
  }

  const generateVariants = () => {
    if (variantOptions.value.some(o => o.values.length === 0)) return

    // Cartesian product using value array indices (not DB ids — handles unsaved values too)
    const combinations = variantOptions.value.reduce<Record<number, number>[]>(
      (acc, opt, optIdx) => {
        if (acc.length === 0) return opt.values.map((_, vIdx) => ({ [optIdx]: vIdx }))
        return acc.flatMap(existing => opt.values.map((_, vIdx) => ({ ...existing, [optIdx]: vIdx })))
      },
      []
    )

    for (const combo of combinations) {
      const alreadyExists = variantDrafts.value.some(draft =>
        variantOptions.value.every((_, i) => draft.selectedValueIds[i] === combo[i])
      )
      if (!alreadyExists) {
        variantDrafts.value.push({
          id: null, sku: '', price: null, stock: 0, image_url: null, is_active: true,
          selectedValueIds: { ...combo },
        })
      }
    }
  }

  const variantLabel = (draft: VariantDraft): string => {
    return variantOptions.value.map((opt, i) => {
      const valIdx = draft.selectedValueIds[i]
      return valIdx !== undefined ? (opt.values[valIdx]?.label ?? '—') : '—'
    }).join(' / ')
  }

  const saveVariants = async (productId: number) => {
    variantsSaving.value = true
    variantsError.value = null

    try {
      const optCount = variantOptions.value.length

      const buildOptionsPayload = () =>
        variantOptions.value.map((opt, i) => ({
          id: opt.id,
          name: opt.name,
          position: i,
          values: opt.values.map((v, j) => ({
            id: v.id,
            label: v.label,
            image_url: v.image_url ?? null,
            position: j,
          })),
        }))

      const buildVariantRow = (draft: VariantDraft) => ({
        id: draft.id,
        sku: draft.sku || null,
        price: draft.price,
        stock: draft.stock,
        image_url: draft.image_url,
        is_active: draft.is_active,
        option_value_ids: Object.entries(draft.selectedValueIds)
          .map(([k, valIdx]) => variantOptions.value[Number(k)]?.values[valIdx]?.id)
          .filter((id): id is number => typeof id === 'number'),
      })

      // Only include variants that cover every current option dimension
      const completeDrafts = variantDrafts.value.filter(d =>
        variantOptions.value.every((_, i) => d.selectedValueIds[i] !== undefined)
      )

      const hasNewValues = variantOptions.value.some(
        opt => opt.id === null || opt.values.some(v => v.id === null)
      )

      if (hasNewValues) {
        // Phase 1: save options to get real DB ids, preserving already-saved complete variants
        const savedComplete = completeDrafts
          .filter(d => d.id !== null)
          .map(buildVariantRow)
          .filter(d => d.option_value_ids.length === optCount)

        const phase1 = await $apiFetch<{ data: { options: any[] } }>(
          `/products/${productId}/variants/sync`,
          { method: 'POST', body: { options: buildOptionsPayload(), variants: savedComplete } }
        )

        // Stamp real ids onto local option/value drafts so Phase 2 can resolve them
        ;(phase1?.data?.options ?? []).forEach((savedOpt: any, oi: number) => {
          const localOpt = variantOptions.value[oi]
          if (!localOpt) return
          localOpt.id = savedOpt.id
          ;(savedOpt.values ?? []).forEach((savedVal: any, vi: number) => {
            const localVal = localOpt.values[vi]
            if (localVal) localVal.id = savedVal.id
          })
        })
      }

      // Phase 2 (always): full sync — real ids now available for all values
      const fullVariants = completeDrafts
        .map(buildVariantRow)
        .filter(d => d.option_value_ids.length === optCount)

      await $apiFetch(`/products/${productId}/variants/sync`, {
        method: 'POST',
        body: { options: buildOptionsPayload(), variants: fullVariants },
      })

      await loadVariants(productId)
    } catch (err: any) {
      variantsError.value = err?.data?.message || 'Failed to save variants.'
    } finally {
      variantsSaving.value = false
    }
  }
  const uploadVariantImage = async (productId: number, variantIdx: number, file: File) => {
    const draft = variantDrafts.value[variantIdx]
    if (!draft?.id) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await $apiFetch<{ data: { image_url: string } }>(
        `/products/${productId}/variants/${draft.id}/image`,
        { method: 'POST', body: formData }
      )
      draft.image_url = res.data.image_url
    } catch (err) {
      console.error('Failed to upload variant image:', err)
    }
  }

  const deleteVariantImage = async (productId: number, variantIdx: number) => {
    const draft = variantDrafts.value[variantIdx]
    if (!draft?.id) return
    try {
      await $apiFetch(`/products/${productId}/variants/${draft.id}/image`, { method: 'DELETE' })
      draft.image_url = null
    } catch (err) {
      console.error('Failed to delete variant image:', err)
    }
  }
  // ── End Variant Editor State ─────────────────────────────────────────────────

  const openAddModal = () => {
    editingProduct.value = null
    form.value = defaultFormData()
    galleryImages.value = []
    galleryFiles.value = []
    if (galleryInput.value) galleryInput.value.value = ''
    formError.value = null
    resetVariantState()
    showModal.value = true
  }

  const openEditModal = async (product: Product) => {
    editingProduct.value = product
    form.value = {
      name: product.name,
      description: product.description,
      price: parseFloat(product.price as string),
      stock: product.stock,
      weight: parseFloat(String(product.weight || 0)),
      length_cm: parseFloat(String(product.length_cm || 0)),
      width_cm: parseFloat(String(product.width_cm || 0)),
      height_cm: parseFloat(String(product.height_cm || 0)),
      shipping_calc_type: product.shipping_calc_type || 'weight',
      category: product.category,
      category_id: product.category_id,
      category_ids: product.categories?.map((c: any) => c.id) || (product.category_id ? [product.category_id] : []),
      is_active: product.is_active,
      hover_zoom_enabled: (product as any).hover_zoom_enabled ?? false,
      allow_backorder: product.allow_backorder ?? false,
      backorder_charge_policy: product.backorder_charge_policy ?? 'charged_later',
      seo_title: (product as any).seo_title ?? '',
      seo_description: (product as any).seo_description ?? '',
      og_image_url: (product as any).og_image_url ?? '',
      noindex: !!(product as any).noindex,
    }
    galleryFiles.value = []
    galleryImages.value = []
    if (galleryInput.value) galleryInput.value.value = ''

    // Fetch product with media to populate the image gallery. We include
    // both 'image' (the legacy single main image) and 'gallery' collections
    // so admins can see and remove every image attached to the product.
    try {
      const res = await $apiFetch<{ data: any }>(`/products/${product.slug}`, { method: 'GET' })
      if (res?.data?.media) {
        galleryImages.value = res.data.media
          .filter((m: any) => m.collection === 'gallery' || m.collection === 'image')
          .map((m: any) => ({ id: m.id, url: m.url }))
      }
    } catch {
      // Silently fail — the gallery just won't show existing images.
    }

    // Fallback: older/seeded products may have `image_url` set directly
    // with no Media record. Surface that as a legacy gallery item so it
    // can still be previewed and removed from the same UI.
    if (galleryImages.value.length === 0 && product.image_url) {
      galleryImages.value = [{ id: 0, url: product.image_url, legacy: true }]
    }

    formError.value = null
    resetVariantState()
    if (product.id) {
      loadVariants(product.id)
    }
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingProduct.value = null
    formError.value = null
    galleryFiles.value = []
    if (galleryInput.value) galleryInput.value.value = ''
    resetVariantState()
  }

  const saveProduct = async (onSuccess?: () => Promise<void>) => {
    submitting.value = true
    formError.value = null

    try {
      const formData = new FormData()
      formData.append('name', form.value.name)
      formData.append('description', form.value.description)
      formData.append('price', String(form.value.price))
      formData.append('stock', String(form.value.stock))
      formData.append('weight', String(form.value.weight))
      formData.append('length_cm', String(form.value.length_cm))
      formData.append('width_cm', String(form.value.width_cm))
      formData.append('height_cm', String(form.value.height_cm))
      formData.append('shipping_calc_type', form.value.shipping_calc_type)
      formData.append('category', form.value.category)
      if (form.value.category_id !== null) {
        formData.append('category_id', String(form.value.category_id))
      }
      for (const id of form.value.category_ids) {
        formData.append('category_ids[]', String(id))
      }
      formData.append('is_active', form.value.is_active ? '1' : '0')
      formData.append('hover_zoom_enabled', form.value.hover_zoom_enabled ? '1' : '0')
      formData.append('allow_backorder', form.value.allow_backorder ? '1' : '0')
      formData.append('backorder_charge_policy', form.value.backorder_charge_policy)
      if (form.value.seo_title.trim()) formData.append('seo_title', form.value.seo_title.trim())
      if (form.value.seo_description.trim()) formData.append('seo_description', form.value.seo_description.trim())
      if (form.value.og_image_url.trim()) formData.append('og_image_url', form.value.og_image_url.trim())
      formData.append('noindex', form.value.noindex ? '1' : '0')

      if (editingProduct.value) {
        formData.append('_method', 'PATCH')
        await $apiFetch(`/products/${editingProduct.value.id}`, {
          method: 'POST',
          body: formData,
        })
        if (galleryFiles.value.length) {
          try {
            await uploadGalleryFilesTo(editingProduct.value.id)
          } catch (err: any) {
            console.error('Error uploading images after product update:', err)
            formError.value = err?.data?.message || 'Product saved but image upload failed'
          }
        }
        if (variantOptions.value.length > 0) {
          await saveVariants(editingProduct.value.id)
          if (variantsError.value) return
        }
      } else {
        // Create the product, then upload any staged gallery files against
        // the new product's id so users can attach images during creation.
        const res = await $apiFetch<{ data: any }>('/products', {
          method: 'POST',
          body: formData,
        })
        const newId = res?.data?.id
        if (newId && galleryFiles.value.length) {
          try {
            await uploadGalleryFilesTo(newId)
          } catch (err: any) {
            console.error('Error uploading images after product creation:', err)
            // Product was created; surface the error but don't roll back.
            formError.value = err?.data?.message || 'Product saved but image upload failed'
          }
        }
      }

      if (onSuccess) await onSuccess()
      closeModal()
    } catch (err: any) {
      console.error('Error saving product:', err)
      formError.value = err?.data?.message || 'Failed to save product'
    } finally {
      submitting.value = false
    }
  }

  return {
    showModal,
    backdropMouseDown,
    submitting,
    formError,
    editingProduct,
    form,
    galleryImages,
    galleryFiles,
    galleryInput,
    stagedPreviews,
    computedVolumeCbm,
    onGallerySelected,
    removeStagedFile,
    deleteGalleryImage,
    openAddModal,
    openEditModal,
    closeModal,
    saveProduct,
    variantOptions,
    variantDrafts,
    variantsSaving,
    variantsError,
    loadVariants,
    addOption,
    removeOption,
    addOptionValue,
    removeOptionValue,
    generateVariants,
    variantLabel,
    saveVariants,
    uploadVariantImage,
    deleteVariantImage,
  }
}
