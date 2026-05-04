import type { Product } from './useProducts'

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

  // Object-URL previews for staged (not-yet-uploaded) files. Kept in sync
  // with galleryFiles via a watcher that revokes the previous URLs so the
  // browser can reclaim the blob memory.
  const stagedPreviews = ref<{ key: string; url: string; name: string }[]>([])
  watch(galleryFiles, (files) => {
    for (const p of stagedPreviews.value) URL.revokeObjectURL(p.url)
    stagedPreviews.value = files.map((file, i) => ({
      key: `${file.name}-${file.size}-${i}`,
      url: URL.createObjectURL(file),
      name: file.name,
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
    const files = (event.target as HTMLInputElement).files
    if (files) galleryFiles.value = Array.from(files)
  }

  // POSTs galleryFiles to the given product id and refreshes the gallery
  // from the response media list. Called by saveProduct after the product
  // is created or updated.
  const uploadGalleryFilesTo = async (productId: number) => {
    if (!galleryFiles.value.length) return
    const formData = new FormData()
    for (const file of galleryFiles.value) {
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

  const openAddModal = () => {
    editingProduct.value = null
    form.value = defaultFormData()
    galleryImages.value = []
    galleryFiles.value = []
    if (galleryInput.value) galleryInput.value.value = ''
    formError.value = null
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
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingProduct.value = null
    formError.value = null
    galleryFiles.value = []
    if (galleryInput.value) galleryInput.value.value = ''
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
  }
}
