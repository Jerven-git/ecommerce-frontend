// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
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

  it('switches statistics between cards and a band while retaining values and appearance', async () => {
    const statistics = block('stats', 'grid', {
      heading: 'Our figures',
      items: [{ value: '12', label: 'Locations' }, { value: '8', label: 'Teams' }, { value: '20', label: 'Projects' }],
    }, { columns: 4, design: { background: '#123456', text_color: '#ffffff' } })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Statistics', document: document([statistics]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    expect(wrapper.findAll('.stats-item')).toHaveLength(3)
    expect(wrapper.get('dl').classes()).toContain('lg:grid-cols-3')
    expect(wrapper.get('.stats-item').classes()).toContain('rounded-xl')
    expect(wrapper.find('.stats-band-layout').exists()).toBe(false)

    await wrapper.setProps({ document: document([{ ...statistics, variant: 'band' }]) })
    expect(wrapper.find('.stats-band-layout').exists()).toBe(true)
    expect(wrapper.findAll('.stats-band-item')).toHaveLength(3)
    expect(wrapper.get('.stats-item').classes()).not.toContain('rounded-xl')
    expect(wrapper.findAll('dd').map(item => item.text())).toEqual(['12', '8', '20'])
    expect(wrapper.findAll('dt').map(item => item.text())).toEqual(['Locations', 'Teams', 'Projects'])
    expect((wrapper.get('[data-section="stats"]').element as HTMLElement).style.backgroundColor).toBe('#123456')
    await wrapper.setProps({ document: document([{ ...statistics, content: { items: [{ value: 0, label: 'Zero' }, { value: '', label: 'Pending' }] } }]) })
    expect(wrapper.findAll('dd').map(item => item.text())).toEqual(['0'])
    await wrapper.setProps({ preview: true })
    expect(wrapper.findAll('dd').map(item => item.text())).toEqual(['0', '—'])
    expect(wrapper.get('.stats-value--placeholder').attributes('aria-label')).toBe('Add your value')
    wrapper.unmount()
  })

  it('switches all feature layouts without losing links, icons or merchant content', async () => {
    const features = block('features', 'grid', {
      heading: 'Services', subtitle: 'How we help',
      items: [{ title: 'Planning', description: 'Plan your project.', link: '/planning', icon: 'heroicons:map' }, { title: 'Delivery', description: 'Deliver your project.', link: null }],
    }, { columns: 4, design: { background: '#edf3f8', text_color: '#123456' } })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Features', document: document([features]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['grid', 'cards', 'list']) {
      await wrapper.setProps({ document: document([{ ...features, variant }]) })
      expect(wrapper.get('[data-section="features"]').attributes('data-layout')).toBe(variant)
      expect(wrapper.findAll('.feature-item')).toHaveLength(2)
      expect(wrapper.get('a[href="/planning"]').text()).toContain('Planning')
      expect(wrapper.findAll('icon-stub[name="heroicons:map"]')).toHaveLength(1)
      expect(wrapper.findAll('.feature-arrow')).toHaveLength(1)
      expect(wrapper.text()).toContain('Deliver your project.')
      expect((wrapper.get('[data-section="features"]').element as HTMLElement).style.backgroundColor).toBe('#edf3f8')
      const classes = wrapper.get('.feature-items').classes()
      expect(classes).toContain(variant === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2')
      expect(wrapper.get('.feature-item').classes().includes('rounded-xl')).toBe(variant === 'cards')
    }
    wrapper.unmount()
  })

  it('preserves gallery images and captions across variants and omits unavailable public media', async () => {
    const gallery = block('gallery', 'grid', { heading: 'Our work', items: [
      { media_id: 1, alt: 'Merchant description', caption: 'Landscape' },
      { media_id: 2, alt: '', caption: 'Portrait' },
      { media_id: 999, alt: '', caption: 'Unavailable' },
    ] }, { columns: 4 })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Gallery', document: document([gallery]), media: {
        1: { id: 1, url: '/landscape.jpg', alt: 'Landscape fallback' },
        2: { id: 2, url: '/portrait.jpg', alt: 'Portrait fallback' },
      } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['grid', 'masonry', 'carousel']) {
      await wrapper.setProps({ document: document([{ ...gallery, variant }]) })
      expect(wrapper.findAll('figure')).toHaveLength(2)
      expect(wrapper.findAll('figcaption').map(item => item.text())).toEqual(['Landscape', 'Portrait'])
      expect(wrapper.get('img[src="/landscape.jpg"]').attributes('alt')).toBe('Merchant description')
      expect(wrapper.get('img[src="/portrait.jpg"]').attributes('alt')).toBe('Portrait fallback')
      expect(wrapper.get('.gallery-track').attributes('tabindex')).toBe(variant === 'carousel' ? '0' : undefined)
      if (variant === 'masonry') expect(wrapper.get('img').classes()).toContain('h-auto')
    }
    await wrapper.setProps({ preview: true })
    expect(wrapper.findAll('figure')).toHaveLength(3)
    expect(wrapper.find('.gallery-placeholder').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders distinct CTA surfaces and keeps the configured action and colors', async () => {
    const cta = block('cta', 'band', { heading: 'Contact us', body: 'Tell us about your project.', action: { label: 'Start a conversation', link: '/contact' } }, { background_color: '#eef4fd', text_color: '#17201d' })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'CTA', document: document([cta]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['band', 'card', 'split']) {
      await wrapper.setProps({ document: document([{ ...cta, variant }]) })
      expect(wrapper.get('.cta-action').attributes('href')).toBe('/contact')
      expect(wrapper.get('.cta-action').text()).toBe('Start a conversation')
      const surface = wrapper.get(variant === 'band' ? '[data-section="cta"]' : '.cta-surface').element as HTMLElement
      expect(surface.style.backgroundColor).toBe('#eef4fd')
      expect(surface.style.getPropertyValue('--cta-text')).toBe('#17201d')
      expect(wrapper.get('.cta-surface').classes().includes('rounded-2xl')).toBe(variant !== 'band')
      expect(wrapper.get('.cta-surface').classes().includes('lg:flex')).toBe(variant === 'split')
    }
    await wrapper.setProps({ document: document([{ ...cta, content: { ...cta.content, action: { label: '', link: '' } } }]) })
    expect(wrapper.find('.cta-action').exists()).toBe(false)
    wrapper.unmount()
  })

  it('preserves connected product records, prices and destinations across all product variants', async () => {
    const products = block('product-list', 'grid', { heading: 'Products' }, { source: 'selected', item_ids: [4, 8], limit: 2 })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Products', document: document([products]), collections: {
        [products.id]: [
          { id: 4, title: 'First product', summary: 'Product details', url: '/product/4', image_url: '/product.jpg', price: 0 },
          { id: 8, title: 'Second product', summary: null, url: '/product/8', image_url: null, price: null },
        ],
      } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['grid', 'carousel', 'feature']) {
      await wrapper.setProps({ document: document([{ ...products, variant }]) })
      expect(wrapper.findAll('.connected-item')).toHaveLength(2)
      expect(wrapper.get('a[href="/product/4"]').text()).toContain('First product')
      expect(wrapper.get('a[href="/product/8"]').text()).toContain('No image')
      expect(wrapper.findAll('.connected-price')).toHaveLength(1)
      expect(wrapper.get('.connected-price').text()).toContain('0.00')
      expect(wrapper.get('img').classes()).toContain('object-contain')
      expect(wrapper.get('.connected-items').attributes('tabindex')).toBe(variant === 'carousel' ? '0' : undefined)
      expect(wrapper.find('.product-feature').exists()).toBe(variant === 'feature')
    }
    await wrapper.setProps({ collections: {} })
    expect(wrapper.text()).toContain('No published products are available')
    expect(wrapper.find('a').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders collection tiles and overlay cards with real links, content and missing-image states', async () => {
    const section = block('collection-list', 'grid', { heading: 'Collections' }, { source: 'selected', item_ids: [2, 7] })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Collections', document: document([section]), collections: {
        [section.id]: [
          { id: 2, title: 'First collection', summary: 'Collection details', url: '/collection/first', image_url: '/collection.jpg' },
          { id: 7, title: 'Second collection', summary: null, url: '/collection/second', image_url: null },
        ],
      } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['grid', 'cards']) {
      await wrapper.setProps({ document: document([{ ...section, variant }]) })
      expect(wrapper.findAll('.collection-link')).toHaveLength(2)
      expect(wrapper.get('.collection-items').classes()).toContain('sm:grid-cols-2')
      expect(wrapper.get('a[href="/collection/first"]').text()).toContain('First collection')
      expect(wrapper.get('img').attributes('src')).toBe('/collection.jpg')
      expect(wrapper.get('img').attributes('alt')).toBe('First collection')
      expect(wrapper.get('a[href="/collection/second"]').text()).toContain('No image')
      expect(wrapper.find('.collection-scrim').exists()).toBe(variant === 'cards')
      expect(wrapper.get('.collection-link').classes().includes('collection-card')).toBe(variant === 'cards')
    }
    await wrapper.setProps({ collections: {} })
    expect(wrapper.text()).toContain('No published collections are available')
    expect(wrapper.find('a').exists()).toBe(false)
    wrapper.unmount()
  })

  it('preserves service records, destinations and optional prices in Grid, List and Feature', async () => {
    const services = block('service-list', 'grid', { heading: 'Services' }, { source: 'selected', item_ids: [3, 9] })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Services', document: document([services]), collections: {
        [services.id]: [
          { id: 3, title: 'Planning', summary: 'Plan your project.', url: '/service/planning', image_url: '/planning.jpg', price: 0 },
          { id: 9, title: 'Delivery', summary: null, url: '/service/delivery', image_url: null, price: null },
        ],
      } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const [variant, className] of [['grid', 'service-card'], ['list', 'service-row'], ['feature', 'service-feature']]) {
      await wrapper.setProps({ document: document([{ ...services, variant }]) })
      expect(wrapper.findAll('.service-link')).toHaveLength(2)
      expect(wrapper.get('.service-link').classes()).toContain(className)
      expect(wrapper.get('a[href="/service/planning"]').text()).toContain('Plan your project.')
      expect(wrapper.get('img').attributes('alt')).toBe('Planning')
      expect(wrapper.get('a[href="/service/delivery"]').text()).toContain('No image')
      expect(wrapper.findAll('.service-price')).toHaveLength(1)
      expect(wrapper.get('.service-price').text()).toContain('0.00')
    }
    await wrapper.setProps({ collections: {} })
    expect(wrapper.text()).toContain('No published services are available')
    expect(wrapper.find('a').exists()).toBe(false)
    wrapper.unmount()
  })

  it('preserves blog records and destinations across editorial layouts without inventing metadata', async () => {
    const posts = block('blog-post-list', 'grid', { heading: 'Journal' }, { source: 'selected', item_ids: [2, 5] })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Journal', document: document([posts]), collections: {
        [posts.id]: [
          { id: 2, title: 'First article', summary: 'Article summary.', url: '/blog/first', image_url: '/article.jpg' },
          { id: 5, title: 'Second article', summary: null, url: '/blog/second', image_url: null },
        ],
      } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const [variant, className] of [['grid', 'blog-grid'], ['list', 'blog-list'], ['feature', 'blog-feature']]) {
      await wrapper.setProps({ document: document([{ ...posts, variant }]) })
      expect(wrapper.get('.blog-items').classes()).toContain(className)
      expect(wrapper.findAll('.blog-link')).toHaveLength(2)
      expect(wrapper.get('a[href="/blog/first"]').text()).toContain('Article summary.')
      expect(wrapper.get('a[href="/blog/second"]').text()).toContain('No image')
      expect(wrapper.get('img').attributes('alt')).toBe('First article')
      expect(wrapper.find('time').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('min read')
    }
    await wrapper.setProps({ collections: {} })
    expect(wrapper.text()).toContain('No published blog posts are available')
    expect(wrapper.find('a').exists()).toBe(false)
    wrapper.unmount()
  })

  it('blocks contact submissions in preview without calling reCAPTCHA or the API', async () => {
    const api = vi.fn()
    const captcha = vi.fn()
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: api }))
    vi.stubGlobal('useRecaptcha', () => ({ execute: captcha }))
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Contact', document: document([block('contact-form', 'compact', { heading: 'Contact' })]), preview: true },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toBe('Forms are disabled in preview.')
    expect(api).not.toHaveBeenCalled()
    expect(captcha).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('submits contact details once while busy and announces the configured success message', async () => {
    let finish: (() => void) | undefined
    const api = vi.fn(() => new Promise(resolve => { finish = () => resolve({}) }))
    const captcha = vi.fn().mockResolvedValue('captcha-token')
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: api }))
    vi.stubGlobal('useRecaptcha', () => ({ execute: captcha }))
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Contact', document: document([block('contact-form', 'split', { heading: 'Contact', success_message: 'Thank you for your message.' }, { fields: ['phone'] })]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    await wrapper.get('input[autocomplete="name"]').setValue('Alex')
    await wrapper.get('input[type="email"]').setValue('alex@example.test')
    await wrapper.get('input[type="tel"]').setValue('12345678')
    await wrapper.get('textarea').setValue('Project details')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('form').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    expect(api).toHaveBeenCalledTimes(1)
    expect(captcha).toHaveBeenCalledWith('contact_form')
    expect(api).toHaveBeenCalledWith('/contact', { method: 'POST', body: {
      name: 'Alex', email: 'alex@example.test', phone: '12345678', subject: 'Website page enquiry', message: 'Project details', recaptcha_token: 'captcha-token',
    } })
    finish?.()
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toContain('Thank you for your message.')
    wrapper.unmount()
  })

  it('retains contact input after a failure and permits a successful retry', async () => {
    const api = vi.fn().mockRejectedValueOnce({ status: 429 }).mockResolvedValue({})
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: api }))
    vi.stubGlobal('useRecaptcha', () => ({ execute: vi.fn().mockResolvedValue('token') }))
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Contact', document: document([block('contact-form', 'compact', { heading: 'Contact' })]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    await wrapper.get('textarea').setValue('Keep my message')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Too many messages')
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('Keep my message')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders FAQ answers as expandable panels or visible question-and-answer rows', async () => {
    const faq = block('faq', 'accordion', { heading: 'Questions', subtitle: 'Helpful details', items: [
      { question: 'How does it work?', answer: 'First answer.\nSecond paragraph.' },
      { question: 'What happens next?', answer: 'Another answer.' },
    ] }, { design: { background: '#f3f0e7', text_color: '#17201d' } })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'FAQ', document: document([faq]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    expect(wrapper.findAll('details')).toHaveLength(2)
    expect(wrapper.findAll('details[open]')).toHaveLength(0)
    expect(wrapper.get('summary').text()).toContain('How does it work?')
    expect(wrapper.get('.faq-answer').text()).toContain('Second paragraph.')
    await wrapper.setProps({ preview: true })
    expect(wrapper.findAll('details[open]')).toHaveLength(1)
    await wrapper.setProps({ document: document([{ ...faq, variant: 'list' }]) })
    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.findAll('dt').map(item => item.text())).toEqual(['How does it work?', 'What happens next?'])
    expect(wrapper.findAll('dd')).toHaveLength(2)
    expect(wrapper.get('dd').text()).toContain('Second paragraph.')
    expect((wrapper.get('[data-section="faq"]').element as HTMLElement).style.backgroundColor).toBe('#f3f0e7')
    wrapper.unmount()
  })

  it('preserves image/text media, alt text and actions in all three layouts', async () => {
    const story = block('image-text', 'image-left', { eyebrow: 'About us', heading: 'Our story', body: 'First paragraph.\nSecond paragraph.', action: { label: 'Learn more', link: '/about' } }, { media_id: 6, image_alt: 'Merchant image description' })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Story', document: document([story]), media: { 6: { id: 6, url: '/story.jpg', alt: 'Media fallback' } } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['image-left', 'image-right', 'stacked']) {
      await wrapper.setProps({ document: document([{ ...story, variant }]) })
      expect(wrapper.get('img').attributes('src')).toBe('/story.jpg')
      expect(wrapper.get('img').attributes('alt')).toBe('Merchant image description')
      expect(wrapper.get('img').classes()).toContain('object-contain')
      expect(wrapper.get('a[href="/about"]').text()).toContain('Learn more')
      expect(wrapper.text()).toContain('Second paragraph.')
      expect(wrapper.get('.image-text-media').classes().includes('lg:order-2')).toBe(variant === 'image-right')
    }
    await wrapper.setProps({ media: {} })
    expect(wrapper.find('.image-text-media').exists()).toBe(false)
    expect(wrapper.text()).toContain('Our story')
    await wrapper.setProps({ preview: true })
    expect(wrapper.text()).toContain('Add your image')
    wrapper.unmount()
  })

  it('preserves Hero media, both actions and saved appearance across all layouts', async () => {
    const hero = block('hero', 'centered', {
      eyebrow: 'Welcome', heading: 'Your next chapter', body: 'Merchant copy.',
      primary_action: { label: 'Explore', link: '/shop' }, secondary_action: { label: 'Our story', link: '/about' },
    }, { media_id: 3, overlay_opacity: 65, overlay_color: '#17201d', design: { background: '#f3f0e7', text_color: '#17201d', width: 'narrow' } })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Hero', document: document([hero]), media: { 3: { id: 3, url: '/hero.jpg', alt: 'Merchant image' } } },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['centered', 'split', 'media-left', 'media-right']) {
      await wrapper.setProps({ document: document([{ ...hero, variant }]) })
      expect(wrapper.get('h1').text()).toBe('Your next chapter')
      expect(wrapper.get('img').attributes('alt')).toBe('Merchant image')
      expect(wrapper.get('a[href="/shop"]').classes()).toContain('hero-button--primary')
      expect(wrapper.get('a[href="/about"]').classes()).toContain('hero-button--secondary')
      expect((wrapper.get('[data-section="hero"]').element as HTMLElement).style.getPropertyValue('--hero-background')).toBe('#f3f0e7')
      expect(wrapper.find('.hero-split-frame').exists()).toBe(variant === 'split')
      if (variant !== 'centered') expect(wrapper.get('img').classes()).toContain('object-contain')
    }
    await wrapper.setProps({ media: {} })
    expect(wrapper.find('.hero-media').exists()).toBe(false)
    expect(wrapper.text()).toContain('Merchant copy.')
    await wrapper.setProps({ preview: true })
    expect(wrapper.text()).toContain('Add your image')
    wrapper.unmount()
  })

  it('preserves Rich text paragraphs and literal markup while adapting reading layouts', async () => {
    const text = block('rich-text', 'prose', { body: 'First line.\r\nSecond line.\r\n\r\n<img src=x onerror=alert(1)>\n\nFinal paragraph.' }, { alignment: 'left' })
    const wrapper = mount(WebsitePageRenderer, {
      props: { title: 'Text', document: document([text]) },
      global: { components: { NuxtLink: NuxtLinkStub }, stubs: { Icon: true } },
    })
    for (const variant of ['prose', 'narrow', 'wide']) {
      await wrapper.setProps({ document: document([{ ...text, variant }]) })
      expect(wrapper.findAll('.rich-text-paragraph')).toHaveLength(3)
      expect(wrapper.get('p').text()).toContain('Second line.')
      expect(wrapper.text()).toContain('<img src=x onerror=alert(1)>')
      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.get('.rich-text-reading').attributes('data-reading-columns')).toBe(String(variant === 'wide'))
    }
    await wrapper.setProps({ document: document([{ ...text, variant: 'wide', settings: { alignment: 'center' } }]) })
    expect(wrapper.get('.rich-text-reading').classes()).toContain('text-center')
    expect(wrapper.get('.rich-text-reading').attributes('data-reading-columns')).toBe('false')
    wrapper.unmount()
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
