// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Steps from '~/components/storefront/home/HowItWorks.vue'
import Typography from '~/components/admin/WebsiteHowItWorksTypography.vue'
import { howItWorksAction, howItWorksDefaultAction, howItWorksTextSizes } from '~/utils/howItWorks'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
const config = () => ({ label: '', heading: 'Merchant process', subtitle: 'Merchant introduction', items: [{ title: 'Choose a product', description: 'Merchant supplied step' }] })
beforeEach(() => {
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('useSiteConfig', () => ({ siteConfig: ref({ theme_layout: { id: 'classic' }, modules_enabled: {} }) }))
  vi.stubGlobal('useScrollReveal', () => ({ revealRef: ref(null) }))
})
afterEach(() => vi.unstubAllGlobals())
describe('How it works presentation', () => {
  it('keeps legacy theme buttons and supports custom labels, links, and an off toggle', async () => {
    const wrapper = mount(Steps, { props: { config: config() }, global: { stubs: { Icon: true, NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } } })
    expect(wrapper.get('a').text()).toBe('Start shopping')
    await wrapper.setProps({ config: { ...config(), button: { enabled: true, label: 'Explore our range', link: '/shop?category_id=1' }, typography: { heading: 32, description: 13 } } })
    expect(wrapper.get('a').attributes('href')).toBe('/shop?category_id=1')
    expect(wrapper.get('a').text()).toBe('Explore our range')
    expect(wrapper.attributes('style')).toContain('--steps-heading-size: 32px')
    await wrapper.setProps({ config: { ...config(), button: { enabled: false, label: 'Saved label', link: '/shop' } } })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('.steps-action').exists()).toBe(false)
    wrapper.unmount()
  })
  it('bounds typography and rejects executable button destinations', () => {
    expect(howItWorksTextSizes()).toEqual({ heading: 28, subtitle: 15, step_title: 17, description: 14 })
    expect(howItWorksTextSizes({ heading: 999, subtitle: -1, description: NaN })).toMatchObject({ heading: 48, subtitle: 12, description: 14 })
    const fallback = { to: '/shop', label: 'Start shopping' }
    for (const link of ['javascript:alert(1)', '//example.test', '/\\example.test', 'data:text/html,test']) expect(howItWorksAction({ link }, fallback)).toBeNull()
    expect(howItWorksAction({}, fallback)).toEqual(fallback)
    expect(howItWorksDefaultAction({ theme_layout: { id: 'service-studio' }, modules_enabled: { contact: false } }).to).toBe('/services')
  })
  it('updates sizes live and resets them while preserving content and button settings', async () => {
    const draft = normalizeWebsiteEditorDraft({ homepage_steps: { ...config(), button: { enabled: false, label: 'Merchant label' } } } as any)
    const wrapper = mount(Typography, { props: { modelValue: draft } })
    await wrapper.get('input[aria-label="Heading size"]').setValue('40')
    const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof draft
    expect(next.homepage_steps.typography?.heading).toBe(40)
    expect(next.homepage_steps.button).toEqual(draft.homepage_steps.button)
    expect(next.homepage_steps.items).toEqual(draft.homepage_steps.items)
    await wrapper.setProps({ modelValue: next })
    await wrapper.get('button').trigger('click')
    const reset = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof draft
    expect(reset.homepage_steps.typography).toBeUndefined()
    expect(reset.homepage_steps.button).toEqual(draft.homepage_steps.button)
    wrapper.unmount()
  })
})
