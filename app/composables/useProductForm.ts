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
  is_active: boolean
  allow_backorder: boolean
  backorder_charge_policy: 'charged_now' | 'charged_later'
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
    is_active: true,
    allow_backorder: false,
    backorder_charge_policy: 'charged_later',
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

  // Image (new product)
  const imageFile = ref<File | null>(null)
  const imagePreview = ref<string | null>(null)
  const imageInput = ref<HTMLInputElement | null>(null)

  // Gallery (editing existing product)
  const galleryImages = ref<{ id: number; url: string }[]>([])
  const galleryFiles = ref<File[]>([])
  const galleryInput = ref<HTMLInputElement | null>(null)
  const uploadingGallery = ref(false)

  const computedVolumeCbm = computed(() => {
    const l = Number(form.value.length_cm) || 0
    const w = Number(form.value.width_cm) || 0
    const h = Number(form.value.height_cm) || 0
    if (l <= 0 || w <= 0 || h <= 0) return 0
    return (l * w * h) / 1000000
  })

  const onImageSelected = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      imageFile.value = file
      imagePreview.value = URL.createObjectURL(file)
    }
  }

  const removeImage = () => {
    imageFile.value = null
    imagePreview.value = null
    if (imageInput.value) imageInput.value.value = ''
  }

  const onGallerySelected = (event: Event) => {
    const files = (event.target as HTMLInputElement).files
    if (files) galleryFiles.value = Array.from(files)
  }

  const uploadGalleryImages = async (onSuccess?: () => Promise<void>) => {
    if (!editingProduct.value || !galleryFiles.value.length) return
    uploadingGallery.value = true
    try {
      const formData = new FormData()
      for (const file of galleryFiles.value) {
        formData.append('images[]', file)
      }
      const res = await $apiFetch<{ data: any }>(`/products/${editingProduct.value.id}/images`, {
        method: 'POST',
        body: formData,
      })
      if (res?.data?.media) {
        galleryImages.value = res.data.media
          .filter((m: any) => m.collection === 'gallery')
          .map((m: any) => ({ id: m.id, url: m.url }))
      }
      galleryFiles.value = []
      if (galleryInput.value) galleryInput.value.value = ''
      if (onSuccess) await onSuccess()
    } catch (err: any) {
      console.error('Error uploading gallery images:', err)
      formError.value = err?.data?.message || 'Failed to upload images'
    } finally {
      uploadingGallery.value = false
    }
  }

  const deleteGalleryImage = async (mediaId: number, onSuccess?: () => Promise<void>) => {
    if (!editingProduct.value) return
    try {
      const res = await $apiFetch<{ data: any }>(`/products/${editingProduct.value.id}/images/${mediaId}`, {
        method: 'DELETE',
      })
      if (res?.data?.media) {
        galleryImages.value = res.data.media
          .filter((m: any) => m.collection === 'gallery')
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
    imageFile.value = null
    imagePreview.value = null
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
      is_active: product.is_active,
      allow_backorder: product.allow_backorder ?? false,
      backorder_charge_policy: product.backorder_charge_policy ?? 'charged_later',
    }
    imageFile.value = null
    imagePreview.value = null
    galleryFiles.value = []
    galleryImages.value = []

    // Fetch product with media to populate gallery
    try {
      const res = await $apiFetch<{ data: any }>(`/products/${product.id}`, { method: 'GET' })
      if (res?.data?.media) {
        galleryImages.value = res.data.media
          .filter((m: any) => m.collection === 'gallery')
          .map((m: any) => ({ id: m.id, url: m.url }))
      }
    } catch {
      // Silently fail — gallery just won't show existing images
    }

    formError.value = null
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingProduct.value = null
    formError.value = null
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
      formData.append('is_active', form.value.is_active ? '1' : '0')
      formData.append('allow_backorder', form.value.allow_backorder ? '1' : '0')
      formData.append('backorder_charge_policy', form.value.backorder_charge_policy)
      if (imageFile.value) {
        formData.append('image', imageFile.value)
      }

      if (editingProduct.value) {
        formData.append('_method', 'PATCH')
        await $apiFetch(`/products/${editingProduct.value.id}`, {
          method: 'POST',
          body: formData,
        })
      } else {
        await $apiFetch('/products', {
          method: 'POST',
          body: formData,
        })
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
    imageFile,
    imagePreview,
    imageInput,
    galleryImages,
    galleryFiles,
    galleryInput,
    uploadingGallery,
    computedVolumeCbm,
    onImageSelected,
    removeImage,
    onGallerySelected,
    uploadGalleryImages,
    deleteGalleryImage,
    openAddModal,
    openEditModal,
    closeModal,
    saveProduct,
  }
}
