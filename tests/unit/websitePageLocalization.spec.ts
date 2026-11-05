import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import type { WebsitePageDocument } from '../../app/types/websitePage'
import { applyWebsitePageLocale } from '../../app/utils/websitePageLocalization'

describe('applyWebsitePageLocale', () => {
  it.each([false, true])('merges translated text while preserving shared links and media (reactive: %s)', (useReactive) => {
    const document: WebsitePageDocument = {
      seo: { title: 'Default title', description: 'Default description', noindex: false, og_image_media_id: 9 },
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          schema_version: 1,
          visible: true,
          variant: 'centered',
          content: {
            heading: 'Default heading',
            primary_action: { label: 'Read more', link: '/guides/details' },
          },
          settings: { media_id: 7 },
        },
        {
          id: 'gallery-1',
          type: 'gallery',
          schema_version: 1,
          visible: true,
          variant: 'grid',
          content: {
            items: [{ media_id: 11, alt: 'Default alt', caption: 'Default caption' }],
          },
          settings: { columns: 3 },
        },
      ],
      localized_content: {
        fr: {
          seo: { title: 'Titre francais' },
          blocks: {
            'hero-1': { content: { heading: 'Titre', primary_action: { label: 'En savoir plus' } } },
            'gallery-1': { content: { items: [{ alt: 'Description francaise' }] } },
          },
        },
      },
    }

    const resolved = applyWebsitePageLocale(useReactive ? reactive(document) : document, 'fr')

    expect(resolved.seo).toMatchObject({ title: 'Titre francais', description: 'Default description', og_image_media_id: 9 })
    expect(resolved.blocks[0]?.content.primary_action).toEqual({ label: 'En savoir plus', link: '/guides/details' })
    expect(resolved.blocks[1]?.content.items[0]).toEqual({ media_id: 11, alt: 'Description francaise', caption: 'Default caption' })
    expect(document.blocks[0]?.content.primary_action.label).toBe('Read more')
    expect(document.blocks[1]?.content.items[0].alt).toBe('Default alt')
  })
})
