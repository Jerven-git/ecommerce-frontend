// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed, defineComponent, reactive, ref, resolveComponent, watchEffect } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WebsitePageRenderer from '~/components/storefront/page/WebsitePageRenderer.vue'
import type { WebsitePageBlock, WebsitePageDocument } from '~/types/websitePage'

const NuxtLinkStub = defineComponent({
  props: { to: { type: String, default: '' } },
  template: '<a :href="to"><slot /></a>',
})

function block(type: WebsitePageBlock['type'], variant: string, content: Record<string, any> = {}, settings: Record<string, any> = {}): WebsitePageBlock {
  return {
    id: `${type}-${variant}`,
    type,
    schema_version: 1,
    visible: true,
    variant,
    content,
    settings,
  }
}

function document(blocks: WebsitePageBlock[]): WebsitePageDocument {
  return {
    blocks,
    seo: { title: null, description: null, noindex: false, og_image_media_id: null },
    localized_content: {},
  }
}

describe('WebsitePageRenderer layout parity', () => {
  beforeEach(() => {
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('reactive', reactive)
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('resolveComponent', resolveComponent)
    vi.stubGlobal('watchEffect', watchEffect)
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: vi.fn() }))
    vi.stubGlobal('useRecaptcha', () => ({ execute: vi.fn() }))
    vi.stubGlobal('useSiteConfig', () => ({ siteConfig: ref({ currency_code: 'USD' }) }))
  })

  it('renders non-default manual and connected layouts as distinct structures', () => {
    const blocks = [
      block('hero', 'split', { heading: 'Hero' }),
      block('rich-text', 'wide', { body: 'Long text' }, { alignment: 'center' }),
      block('image-text', 'stacked', { heading: 'Story', action: { label: '', link: '' } }),
      block('features', 'cards', { heading: 'Features', items: [{ title: 'Fast', description: 'Quick setup' }] }, { columns: 2 }),
      block('stats', 'band', { heading: 'Facts', items: [{ value: '24', label: 'Locations' }] }, { columns: 2 }),
      block('gallery', 'carousel', { heading: 'Gallery', items: [] }, { columns: 3 }),
      block('faq', 'list', { heading: 'Questions', items: [{ question: 'When?', answer: 'Today.' }] }),
      block('cta', 'split', { heading: 'Ready?', action: { label: 'Contact', link: '/contact' } }),
      block('contact-form', 'split', { heading: 'Contact' }, { fields: ['name', 'email', 'phone', 'message'] }),
      block('product-list', 'list', { heading: 'Products' }),
    ]

    const wrapper = mount(WebsitePageRenderer, {
      props: {
        title: 'Custom page',
        document: document(blocks),
        collections: {
          'product-list-list': [{ id: 1, title: 'Product', summary: 'Description', url: '/product/1', image_url: null, price: 20 }],
        },
      },
      global: {
        components: { NuxtLink: NuxtLinkStub },
        stubs: { Icon: true },
      },
    })

    expect(wrapper.get('[data-section="hero"]').find('.lg\\:grid-cols-2').exists()).toBe(true)
    expect(wrapper.get('[data-section="rich-text"] > div').classes()).toEqual(expect.arrayContaining(['max-w-6xl', 'text-center']))
    expect(wrapper.get('[data-section="image-text"] > div').classes()).toContain('max-w-4xl')
    expect(wrapper.get('[data-section="features"] .grid').classes()).toContain('gap-5')
    expect(wrapper.get('[data-section="stats"]').classes()).toContain('text-white')
    expect(wrapper.get('[data-section="gallery"] > div > div').classes()).toContain('snap-mandatory')
    expect(wrapper.get('[data-section="faq"]').find('details').exists()).toBe(false)
    expect(wrapper.get('[data-section="cta"] > div').classes()).toContain('lg:flex')
    expect(wrapper.get('[data-section="contact-form"] input[type="tel"]').exists()).toBe(true)
    expect(wrapper.get('[data-section="product-list"] a').classes()).toContain('grid')
  })

  it('renders saved section appearance in both the editor and public page', () => {
    const styled = block('image-text', 'image-right', { heading: 'Merchant heading' }, {
      design: { background: '#f4e7d3', text_color: '#17201d', padding_top: 40, padding_bottom: 56, corner_radius: 16, alignment: 'right', width: 'wide' },
    })
    for (const preview of [false, true]) {
      const wrapper = mount(WebsitePageRenderer, {
        props: { title: 'Styled page', document: document([styled]), preview },
        global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
      })
      const section = wrapper.get('[data-page-block]')
      expect((section.element as HTMLElement).style.backgroundColor).toBe('#f4e7d3')
      expect((section.element as HTMLElement).style.paddingTop).toBe('40px')
      expect(section.attributes('data-custom-alignment')).toBe('true')
      expect(section.text()).toContain('Merchant heading')
      expect(section.text().includes('Add your image')).toBe(preview)
    }
  })

  it('keeps required contact fields when an older document has an empty field list', () => {
    const wrapper = mount(WebsitePageRenderer, {
      props: {
        title: 'Contact',
        document: document([block('contact-form', 'compact', { heading: 'Contact' }, { fields: [] })]),
      },
      global: {
        components: { NuxtLink: NuxtLinkStub },
        stubs: { Icon: true },
      },
    })

    expect(wrapper.get('input[autocomplete="name"]').exists()).toBe(true)
    expect(wrapper.get('input[autocomplete="email"]').exists()).toBe(true)
    expect(wrapper.get('textarea').exists()).toBe(true)
  })
})
