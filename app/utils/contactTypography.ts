export const CONTACT_TEXT_FIELDS = [
  { key: 'page_heading', label: 'Page heading size', min: 24, max: 56, default: 40 },
  { key: 'section_heading', label: 'Section heading size', min: 18, max: 32, default: 24 },
  { key: 'body', label: 'Body text size', min: 12, max: 22, default: 15 },
  { key: 'field', label: 'Form text size', min: 14, max: 20, default: 16 },
] as const
export type ContactTextKey = typeof CONTACT_TEXT_FIELDS[number]['key']
export type ContactTypography = Partial<Record<ContactTextKey, number>>
export function normalizeContactTypography(value: unknown): ContactTypography {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: ContactTypography = {}
  for (const field of CONTACT_TEXT_FIELDS) {
    const size = (value as Record<string, unknown>)[field.key]
    if (typeof size === 'number' && Number.isFinite(size)) result[field.key] = Math.round(Math.min(field.max, Math.max(field.min, size)))
  }
  return result
}
