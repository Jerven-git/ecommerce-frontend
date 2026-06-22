<template>
  <header
    :class="[
      isFullBleedPage ? 'fixed w-full' : 'sticky',
      'top-0 z-50 transition-all duration-300',
      isTransparent
        ? 'bg-transparent border-b border-transparent'
        : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center shrink-0">
          <img
            v-if="siteConfig?.logo_url"
            :src="siteConfig.logo_url"
            :alt="siteConfig.logo_alt_text || siteConfig.site_name"
            :style="{ height: logoHeight + 'px' }"
            class="w-auto object-contain"
          />
          <span
            v-else
            class="text-xl font-bold tracking-tight transition-colors duration-300"
            :style="{ color: isTransparent ? '#fff' : (siteConfig?.theme?.primary_color || '#6898ED') }"
          >
            {{ siteConfig?.site_name || 'Store' }}
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-0.5">
          <template v-for="link in navLinks" :key="link.to">
            <!-- Item with category dropdown (Shop) -->
            <div
              v-if="link.categories && link.categories.length"
              class="relative"
              @mouseenter="openMenu(link.to)"
              @mouseleave="scheduleClose"
            >
              <NuxtLink
                :to="link.to"
                class="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
                :active-class="isTransparent ? '!text-white !bg-white/15' : '!text-primary-600 !bg-primary-50 hover:!bg-primary-50'"
                aria-haspopup="true"
                :aria-expanded="openDropdown === link.to"
                @focus="openMenu(link.to)"
              >
                {{ link.label }}
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="openDropdown === link.to ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </NuxtLink>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="openDropdown === link.to"
                  class="absolute left-1/2 -translate-x-1/2 top-full pt-3"
                  @mouseenter="cancelClose"
                  @mouseleave="scheduleClose"
                >
                  <div
                    class="rounded-2xl bg-white shadow-xl shadow-gray-200/60 ring-1 ring-gray-900/5 p-4"
                    :class="link.categories.length > 1 ? 'w-[min(92vw,640px)]' : 'min-w-[240px]'"
                  >
                    <NuxtLink
                      :to="link.to"
                      class="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                      @click="closeNow"
                    >All {{ link.label }}</NuxtLink>
                    <div class="my-2 h-px bg-gray-100" />

                    <!-- Category grid: columns wrap as the list grows, with a
                         scroll cap so a very long taxonomy never overflows. -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 max-h-[65vh] overflow-y-auto pr-1">
                      <div v-for="cat in link.categories" :key="cat.id" class="min-w-0">
                        <NuxtLink
                          :to="categoryLink(cat)"
                          class="block px-2 py-1.5 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-600 transition-colors truncate"
                          @click="closeNow"
                        >{{ cat.name }}</NuxtLink>
                        <div v-if="cat.children.length" class="mt-0.5 flex flex-col">
                          <NuxtLink
                            v-for="sub in cat.children"
                            :key="sub.id"
                            :to="categoryLink(sub)"
                            class="block px-2 py-1 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors truncate"
                            @click="closeNow"
                          >{{ sub.name }}</NuxtLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Plain item -->
            <NuxtLink
              v-else
              :to="link.to"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
              :active-class="isTransparent ? '!text-white !bg-white/15' : '!text-primary-600 !bg-primary-50 hover:!bg-primary-50'"
            >{{ link.label }}</NuxtLink>
          </template>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-1.5">

          <!-- Admin pill (desktop) -->
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </NuxtLink>

          <!-- Favorites (hidden when the favorites feature is off site-wide) -->
          <NuxtLink
            v-if="favoritesEnabled"
            to="/favorites"
            class="relative p-2 rounded-lg transition-colors"
            :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            aria-label="Favorites"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span
              v-if="favoritesStore.count > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
            >
              {{ favoritesStore.count }}
            </span>
          </NuxtLink>

          <!-- Cart (hidden when Shop module is disabled) -->
          <NuxtLink
            v-if="isEnabled('shop')"
            to="/cart"
            class="relative p-2 rounded-lg transition-colors"
            :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <img v-if="siteConfig?.cart_icon_url" :src="siteConfig.cart_icon_url" alt="Cart" class="w-5 h-5 object-contain" />
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
            >
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <!-- Header CTA (desktop) -->
          <NuxtLink
            v-if="headerCta?.enabled && headerCta.label && headerCta.link"
            :to="headerCta.link"
            class="hidden md:inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors"
            :class="isTransparent
              ? 'bg-white text-gray-900 hover:bg-white/90'
              : 'bg-primary-600 text-white hover:bg-primary-700'"
          >{{ headerCta.label }}</NuxtLink>

          <!-- Mobile hamburger / close -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg transition-colors"
            :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 py-2">
          <nav class="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto">
            <template v-for="link in navLinks" :key="link.to">
              <!-- Accordion item with categories (Shop) -->
              <div v-if="link.categories && link.categories.length">
                <button
                  type="button"
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  :aria-expanded="mobileShopOpen"
                  @click="mobileShopOpen = !mobileShopOpen"
                >
                  <span>{{ link.label }}</span>
                  <svg class="w-4 h-4 transition-transform duration-200" :class="mobileShopOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div v-show="mobileShopOpen" class="ml-3 pl-3 border-l border-gray-100 flex flex-col">
                  <NuxtLink
                    :to="link.to"
                    class="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    @click="closeMobile"
                  >All {{ link.label }}</NuxtLink>
                  <template v-for="cat in link.categories" :key="cat.id">
                    <NuxtLink
                      :to="categoryLink(cat)"
                      class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      @click="closeMobile"
                    >{{ cat.name }}</NuxtLink>
                    <NuxtLink
                      v-for="sub in cat.children"
                      :key="sub.id"
                      :to="categoryLink(sub)"
                      class="pl-6 pr-3 py-1.5 rounded-lg text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      @click="closeMobile"
                    >{{ sub.name }}</NuxtLink>
                  </template>
                </div>
              </div>

              <!-- Plain item -->
              <NuxtLink
                v-else
                :to="link.to"
                class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                active-class="!text-primary-600 !bg-primary-50"
                @click="closeMobile"
              >{{ link.label }}</NuxtLink>
            </template>
            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin"
              class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              @click="closeMobile"
            >Admin</NuxtLink>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { $apiFetch } = useNuxtApp()
const cartStore = useCartStore()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const { siteConfig } = useSiteConfig()
const { isEnabled } = useModules()
const mobileMenuOpen = ref(false)
const mobileShopOpen = ref(false)

const favoritesEnabled = computed(() => siteConfig.value?.favorites_enabled ?? false)
const headerCta = computed(() => siteConfig.value?.header_cta ?? null)
const logoHeight = computed(() => siteConfig.value?.logo_size || 36)

// --- Shop dropdown: product categories with their direct subcategories ---
interface NavCategory {
  id: number
  name: string
  slug: string | null
  children: NavCategory[]
}

// Lazy + non-blocking: the dropdown is a progressive enhancement, so it never
// delays page render. Deduped/shared across navigation by key. The API returns
// nested categories (childrenRecursive flattened to `children`); we keep the
// top level plus one level of subcategories for the menu.
const { data: shopCategories } = useLazyAsyncData('header-shop-categories', () =>
  $apiFetch<{ data: any[] }>('/categories', { method: 'GET' })
    .then(r => (r?.data ?? []).map(mapCategory))
    .catch(() => [] as NavCategory[]),
)

function mapCategory(c: any): NavCategory {
  return {
    id: Number(c.id),
    name: c.name,
    slug: c.slug ?? null,
    children: Array.isArray(c.children) ? c.children.map(mapCategory) : [],
  }
}

function categoryLink(cat: NavCategory): string {
  return `/shop?category_id=${cat.id}`
}

interface NavItem {
  to: string
  label: string
  module: 'shop' | 'commissions' | 'gift_cards' | 'services' | 'blog' | 'about' | 'contact' | null
  hasDropdown?: boolean
}

const allNavLinks: NavItem[] = [
  { to: '/', label: 'Home', module: null },
  { to: '/shop', label: 'Shop', module: 'shop', hasDropdown: true },
  { to: '/commissions', label: 'Commissions', module: 'commissions' },
  { to: '/gift-cards', label: 'Gift Cards', module: 'gift_cards' },
  { to: '/services', label: 'Services', module: 'services' },
  { to: '/blog', label: 'Blog', module: 'blog' },
  { to: '/about', label: 'About', module: 'about' },
  { to: '/contact', label: 'Contact', module: 'contact' },
]

const navLinks = computed(() =>
  allNavLinks
    .filter(l => l.module === null || isEnabled(l.module))
    .map(l => ({
      ...l,
      categories: l.hasDropdown ? (shopCategories.value ?? []) : [],
    }))
)

// --- Desktop dropdown open/close with hover intent ---
const openDropdown = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined

function openMenu(key: string) {
  if (closeTimer) clearTimeout(closeTimer)
  openDropdown.value = key
}
function scheduleClose() {
  closeTimer = setTimeout(() => { openDropdown.value = null }, 120)
}
function cancelClose() {
  if (closeTimer) clearTimeout(closeTimer)
}
function closeNow() {
  openDropdown.value = null
}
function closeMobile() {
  mobileMenuOpen.value = false
}

// Full-bleed transparent header applies on every page that renders a top
// cover-image banner — Home (hero) plus About/Contact/Blog/Services — and
// only when the admin opted into the "image flows under header" setting.
// Pages without a banner (Shop, Cart, product/checkout) keep the normal
// solid sticky band so the header never floats over white content.
const BANNER_PATHS = new Set(['/', '/about', '/contact', '/blog', '/services'])
const isBannerPage = computed(() => BANNER_PATHS.has(route.path))
const isFullBleedPage = computed(() =>
  isBannerPage.value && (siteConfig.value?.hero_full_bleed ?? false)
)
const scrollY = ref(0)
const isTransparent = computed(() =>
  isFullBleedPage.value && scrollY.value < 50 && !mobileMenuOpen.value
)

function onScroll() {
  scrollY.value = window.scrollY
}

// Close menus on route change.
watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
  mobileShopOpen.value = false
  openDropdown.value = null
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
