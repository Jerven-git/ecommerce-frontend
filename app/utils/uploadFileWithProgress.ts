/**
 * Wrap a multipart file POST in XMLHttpRequest so the caller can observe upload
 * progress. fetch() (and therefore $apiFetch) does not surface upload progress
 * events, so any UI that needs a "uploading X.X MB / Y.Y MB" or a percentage
 * has to drop down to XHR. Same Sanctum auth surface (cookies + XSRF token)
 * as the rest of the app.
 */
export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UploadOptions {
  /** Form field name. Defaults to "file" — matches every existing upload endpoint. */
  fieldName?: string
  /** Extra form fields to send alongside the file. */
  extraFields?: Record<string, string>
  /** Fires roughly every browser progress tick (~50ms in Chrome). */
  onProgress?: (progress: UploadProgress) => void
}

function readXsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : ''
}

export function uploadFileWithProgress<T = unknown>(
  url: string,
  file: File,
  options: UploadOptions = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.withCredentials = true
    xhr.responseType = 'json'
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    const xsrf = readXsrfToken()
    if (xsrf) xhr.setRequestHeader('X-XSRF-TOKEN', xsrf)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options.onProgress) return
      options.onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.min(100, Math.round((event.loaded / event.total) * 100)),
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as T)
      } else {
        const message =
          (xhr.response && (xhr.response.message || xhr.response.errors?.file?.[0])) ||
          `Upload failed (HTTP ${xhr.status})`
        reject(new Error(message))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload.'))
    xhr.onabort = () => reject(new Error('Upload aborted.'))

    const fd = new FormData()
    fd.append(options.fieldName ?? 'file', file)
    for (const [k, v] of Object.entries(options.extraFields ?? {})) {
      fd.append(k, v)
    }
    xhr.send(fd)
  })
}
