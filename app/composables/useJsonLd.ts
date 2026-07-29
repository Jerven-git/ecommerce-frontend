export type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>

/**
 * Inject reactive JSON-LD without allowing entity content to terminate the
 * script element. Each schema gets a stable key so client navigation replaces
 * stale data instead of accumulating duplicate scripts.
 */
export function useJsonLd(
  key: string,
  value: MaybeRefOrGetter<JsonLdValue | null | undefined>,
) {
  useHead({
    script: () => {
      const schema = toValue(value)
      if (!schema) return []

      return [{
        key: `json-ld:${key}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }]
    },
  })
}

