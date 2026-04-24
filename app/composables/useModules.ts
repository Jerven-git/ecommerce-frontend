import type { ModuleKey } from '~/composables/useSiteConfig'
import { DEFAULT_MODULES_ENABLED } from '~/composables/useSiteConfig'

/**
 * Path prefixes owned by each module. The first match wins.
 * `/cart`, `/checkout`, `/product/*`, `/backorder/*`, `/payment/*`, etc. all
 * belong to the Shop module — disabling Shop hides the whole commerce flow.
 *
 * Order matters: list longer/more specific prefixes before shorter ones if
 * they could overlap. Currently they don't.
 */
const MODULE_PREFIXES: Record<ModuleKey, string[]> = {
  shop: [
    '/shop',
    '/product',
    '/cart',
    '/checkout',
    '/favorites',
    '/order-success',
    '/tracking',
    '/backorder',
    '/payment',
  ],
  blog: ['/blog'],
  services: ['/services'],
  about: ['/about'],
  contact: ['/contact'],
}

export interface ModuleDescriptor {
  key: ModuleKey
  label: string
  description: string
}

/**
 * Ordered list for the admin Modules tab UI. Order here is also the order
 * toggles appear to the admin.
 */
export const MODULE_LIST: ModuleDescriptor[] = [
  { key: 'shop',     label: 'Shop',     description: 'Storefront, product pages, cart, checkout, order tracking, and the header cart icon.' },
  { key: 'blog',     label: 'Blog',     description: 'Blog landing page and individual post pages.' },
  { key: 'services', label: 'Services', description: 'The public /services page.' },
  { key: 'about',    label: 'About',    description: 'The public /about page.' },
  { key: 'contact',  label: 'Contact',  description: 'The public /contact page.' },
]

export function useModules() {
  const { siteConfig } = useSiteConfig()

  const modules = computed(() => siteConfig.value?.modules_enabled ?? DEFAULT_MODULES_ENABLED)

  function isEnabled(key: ModuleKey): boolean {
    return modules.value[key] !== false
  }

  /**
   * Returns the module that owns this route path, or null if the path isn't
   * gated by any module (admin pages, login, the homepage, etc.).
   */
  function moduleForPath(path: string): ModuleKey | null {
    const normalized = path.split('?')[0]!.split('#')[0] || '/'
    for (const key of Object.keys(MODULE_PREFIXES) as ModuleKey[]) {
      for (const prefix of MODULE_PREFIXES[key]) {
        if (normalized === prefix || normalized.startsWith(prefix + '/')) {
          return key
        }
      }
    }
    return null
  }

  /** True when the path either belongs to no module, or belongs to an enabled module. */
  function isPathEnabled(path: string): boolean {
    const key = moduleForPath(path)
    return key === null ? true : isEnabled(key)
  }

  return { modules, isEnabled, moduleForPath, isPathEnabled }
}
