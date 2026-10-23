export function websiteEditorApiMessage(error: unknown, fallback: string) {
  const candidate = error as { data?: { message?: unknown }; message?: unknown } | null
  if (typeof candidate?.data?.message === 'string') return candidate.data.message
  if (typeof candidate?.message === 'string') return candidate.message
  return fallback
}
