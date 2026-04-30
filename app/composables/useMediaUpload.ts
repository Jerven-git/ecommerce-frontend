import { uploadFileWithProgress } from '~/utils/uploadFileWithProgress'

export type MediaCollection = 'logo' | 'favicon' | 'cart_icon' | 'hero' | 'about' | 'contact' | 'blog' | 'services' | 'showcase_video'

export interface UploadLimits {
  maxMB: number
  label: string
  accept?: string[] // MIME type prefixes, defaults to ['image/']
}

export interface UseMediaUploadOptions {
  collections: MediaCollection[]
  limits: Record<MediaCollection, UploadLimits>
  apiFetch: typeof $fetch
}

export interface UploadProgressState {
  loaded: number
  total: number
  percent: number
}

export function useMediaUpload(options: UseMediaUploadOptions) {
  const { collections, limits, apiFetch } = options

  // Mirror $apiFetch's baseURL so progress-aware XHR uploads hit the same path.
  const config = useRuntimeConfig()
  const apiBase = `${config.public.apiBase}${config.public.apiPath}`

  // Build initial records from collections
  const makeRecord = <T>(val: T) =>
    Object.fromEntries(collections.map((c) => [c, val])) as Record<MediaCollection, T>

  const pending = reactive<Record<MediaCollection, File | null>>(makeRecord(null))
  const blobPreview = reactive<Record<MediaCollection, string | null>>(makeRecord(null))
  const dragCounter = reactive<Record<MediaCollection, number>>(makeRecord(0))
  const pendingDelete = reactive<Record<MediaCollection, boolean>>(makeRecord(false))
  const uploading = reactive<Record<MediaCollection, boolean>>(makeRecord(false))
  const dragging = reactive<Record<MediaCollection, boolean>>(makeRecord(false))
  const uploadProgress = reactive<Record<MediaCollection, UploadProgressState>>(
    makeRecord({ loaded: 0, total: 0, percent: 0 }),
  )

  const lastError = ref<string | null>(null)

  // --- Helpers ---

  function clearPreview(collection: MediaCollection) {
    if (blobPreview[collection]) {
      URL.revokeObjectURL(blobPreview[collection]!)
      blobPreview[collection] = null
    }
  }

  function queueFile(file: File, collection: MediaCollection): string | null {
    lastError.value = null
    const { maxMB, label, accept } = limits[collection]
    const acceptPrefixes = accept || ['image/']

    if (!acceptPrefixes.some(prefix => file.type.startsWith(prefix))) {
      const types = acceptPrefixes.includes('video/')
        ? 'PNG, JPG, GIF, MP4, WebM'
        : 'PNG, JPG, SVG, GIF'
      lastError.value = `${label}: Please upload a valid file (${types})`
      return null
    }

    if (file.size > maxMB * 1024 * 1024) {
      lastError.value = `${label}: File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the ${maxMB}MB limit`
      return null
    }

    clearPreview(collection)
    pending[collection] = file
    pendingDelete[collection] = false

    const url = URL.createObjectURL(file)
    blobPreview[collection] = url
    return url
  }

  function markDeleted(collection: MediaCollection) {
    pending[collection] = null
    pendingDelete[collection] = true
    clearPreview(collection)
  }

  function cancelPending(collection: MediaCollection) {
    pending[collection] = null
    pendingDelete[collection] = false
    clearPreview(collection)
  }

  // --- Drag handlers ---

  function onDragEnter(collection: MediaCollection) {
    dragCounter[collection]++
    dragging[collection] = true
  }

  function onDragLeave(collection: MediaCollection) {
    dragCounter[collection] = Math.max(0, dragCounter[collection] - 1)
    dragging[collection] = dragCounter[collection] > 0
  }

  function onDropReset(collection: MediaCollection) {
    dragCounter[collection] = 0
    dragging[collection] = false
  }

  // --- Upload / Delete ---

  async function uploadAllPending(): Promise<Partial<Record<MediaCollection, string>>> {
    const results: Partial<Record<MediaCollection, string>> = {}

    try {
      for (const c of collections) {
        if (!pending[c]) continue

        uploading[c] = true
        uploadProgress[c] = { loaded: 0, total: pending[c]!.size, percent: 0 }

        const res = await uploadFileWithProgress<{ url: string }>(
          `${apiBase}/site-config/media/${c}`,
          pending[c]!,
          {
            onProgress: (p) => {
              uploadProgress[c] = p
            },
          },
        )

        if (!res?.url) throw new Error('Upload response missing url')

        results[c] = res.url
        clearPreview(c)
        pending[c] = null
        pendingDelete[c] = false
        uploading[c] = false
        uploadProgress[c] = { loaded: 0, total: 0, percent: 0 }
      }
    } finally {
      // Ensure all uploading flags are cleared even on error
      for (const c of collections) {
        uploading[c] = false
        uploadProgress[c] = { loaded: 0, total: 0, percent: 0 }
      }
    }

    return results
  }

  async function deleteAllMarked(): Promise<void> {
    for (const c of collections) {
      if (pendingDelete[c]) {
        await apiFetch(`/site-config/media/${c}`, { method: 'DELETE' })
        pendingDelete[c] = false
      }
    }
  }

  // --- Reset / Cleanup ---

  function reset() {
    for (const c of collections) {
      pending[c] = null
      pendingDelete[c] = false
      clearPreview(c)
      uploading[c] = false
      dragging[c] = false
      dragCounter[c] = 0
      uploadProgress[c] = { loaded: 0, total: 0, percent: 0 }
    }
    lastError.value = null
  }

  function cleanup() {
    for (const c of collections) {
      clearPreview(c)
    }
  }

  return {
    lastError,
    uploading,
    uploadProgress,
    dragging,
    pending,
    pendingDelete,

    queueFile,
    markDeleted,
    cancelPending,
    clearPreview,

    onDragEnter,
    onDragLeave,
    onDropReset,

    uploadAllPending,
    deleteAllMarked,
    reset,
    cleanup,
  }
}
