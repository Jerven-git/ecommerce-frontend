import type { WebsitePageBlock, WebsitePageBlockDefinition, WebsitePageCollectionItem } from '~/types/websitePage'

export function websitePageSectionGroup(type: string): string {
  if (type === 'hero' || type === 'cta') return 'Banners'
  if (type === 'rich-text' || type === 'image-text') return 'Text and images'
  if (type === 'contact-form') return 'Forms'
  if (type.endsWith('-list')) return 'Store content'
  return 'Lists and galleries'
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

// Generic editing prompts carry no merchant claims, metrics, or invented records.
export function websitePageStarterContent(definition: WebsitePageBlockDefinition): Record<string, any> {
  const content = clone(definition.defaults.content)
  const type = definition.type
  const headings: Record<string, string> = {
    hero: 'Your story starts here', 'image-text': 'A little more about you', features: 'What makes you different',
    stats: 'Your business in numbers', gallery: 'A closer look', faq: 'Frequently asked questions',
    cta: 'Let’s take the next step', 'contact-form': 'Get in touch', 'product-list': 'Explore our products',
    'collection-list': 'Explore our collections', 'service-list': 'Explore our services', 'blog-post-list': 'From the journal',
  }
  if (Object.hasOwn(content, 'heading')) content.heading = headings[type] ?? definition.label
  if (Object.hasOwn(content, 'body')) content.body = type === 'rich-text'
    ? 'Use this space to tell your story. Share what matters to you, introduce an idea, or give visitors the details they need. Replace this starter text with your own words.'
    : 'Add your own words here. Tell visitors what this section is about and what they can do next.'
  if (Object.hasOwn(content, 'subtitle')) content.subtitle = 'Introduce this section in your own words.'
  for (const action of definition.editor.actions ?? []) content[action.key] = { label: 'Button label', link: '#' }
  if (type === 'features') content.items = Array.from({ length: 3 }, (_, index) => ({ ...clone(definition.editor.repeater?.default_item ?? {}), title: `Feature ${index + 1}`, description: 'Describe a detail that matters to your visitors.' }))
  if (type === 'faq') content.items = Array.from({ length: 3 }, (_, index) => ({ question: `Add question ${index + 1}`, answer: 'Write a helpful answer for your visitors here.' }))
  if (type === 'gallery') content.items = Array.from({ length: 3 }, () => ({ media_id: null, alt: '', caption: '' }))
  // Numbers must always be supplied by the merchant.
  if (type === 'stats') content.items = Array.from({ length: 3 }, (_, index) => ({ value: '', label: `Add a label ${index + 1}` }))
  return content
}

export function websitePageExampleBlock(definition: WebsitePageBlockDefinition, variant: string | null): WebsitePageBlock {
  return {
    id: 'section-example', type: definition.type, schema_version: 1, visible: true, variant,
    content: websitePageStarterContent(definition), settings: clone(definition.defaults.settings),
  }
}

export function websitePageExampleCollections(block: WebsitePageBlock): Record<string, WebsitePageCollectionItem[]> {
  if (!block.type.endsWith('-list')) return {}
  const nouns: Record<string, string> = { 'product-list': 'Product', 'collection-list': 'Collection', 'service-list': 'Service', 'blog-post-list': 'Article' }
  const noun = nouns[block.type] ?? 'Item'
  return { [block.id]: Array.from({ length: 3 }, (_, index) => ({ id: index + 1, title: `${noun} title`, summary: 'Your published content appears here.', url: '#', image_url: null })) }
}
