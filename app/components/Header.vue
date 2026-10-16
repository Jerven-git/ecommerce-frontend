<template>
  <header
    :class="[
      isFullBleedPage ? 'fixed w-full' : 'sticky',
      'top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
      isTransparent
        ? 'bg-transparent border-b border-transparent'
        : isScrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-900/10 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)]'
          : 'bg-white/70 backdrop-blur-xl border-b border-gray-900/[0.06]'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300"
        :class="isScrolled && !isTransparent ? 'h-14' : 'h-16'"
      >

        <!-- Logo -->
        <NuxtLink
          :to="marketingHome"
          class="flex min-h-11 items-center shrink-0 justify-self-start rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          :aria-label="isApexMarketing ? 'DATABASY home' : undefined"
          :class="isApexMarketing
            ? (isTransparent ? 'focus-visible:outline-[var(--apex-focus-on-dark)]' : 'focus-visible:outline-[var(--apex-focus-on-light)]')
            : 'focus-visible:outline-primary-500'"
        >
          <img
            v-if="!isApexMarketing && siteConfig?.logo_url"
            :src="siteConfig.logo_url"
            :alt="siteConfig.logo_alt_text || siteConfig.site_name"
            :style="{ height: logoHeight + 'px' }"
            class="w-auto object-contain"
          />
          <span
            v-else-if="isApexMarketing"
            class="apex-header__brand"
          >DATABASY</span>
          <span
            v-else
            class="text-xl font-bold tracking-tight transition-colors duration-300"
            :style="{ color: headerLogoColor }"
          >
            {{ siteConfig?.site_name || 'Store' }}
          </span>
        </NuxtLink>

        <!-- Desktop nav (centered) — storefront vs marketing -->
        <nav v-if="isApexMarketing" class="hidden lg:flex items-center gap-7 justify-self-center">
          <a
            v-for="link in marketingLinks"
            :key="link.to"
            :href="link.to"
            class="nav-link rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            :class="isTransparent
              ? 'text-white/85 hover:text-white focus-visible:outline-[var(--apex-focus-on-dark)]'
              : 'text-gray-700 hover:text-gray-950 focus-visible:outline-[var(--apex-focus-on-light)]'"
          >{{ link.label }}</a>
        </nav>
        <nav v-else class="hidden lg:flex items-center gap-7 justify-self-center">
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
                class="nav-link inline-flex items-center gap-1"
                :class="[
                  isTransparent ? 'text-white/85 hover:text-white' : 'text-gray-700 hover:text-gray-950',
                  (isLinkActive(link.to) || openDropdown === link.to) ? 'nav-link-active ' + (isTransparent ? 'text-white' : 'text-gray-950') : '',
                ]"
                aria-haspopup="true"
                :aria-expanded="openDropdown === link.to"
                @focus="openMenu(link.to)"
              >
                {{ link.label }}
                <Icon name="heroicons:chevron-down" class="w-3.5 h-3.5 transition-transform duration-200" :class="openDropdown === link.to ? 'rotate-180' : ''" aria-hidden="true" />
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
              class="nav-link"
              :class="[
                isTransparent ? 'text-white/85 hover:text-white' : 'text-gray-700 hover:text-gray-950',
                isLinkActive(link.to) ? 'nav-link-active ' + (isTransparent ? 'text-white' : 'text-gray-950') : '',
              ]"
            >{{ link.label }}</NuxtLink>
          </template>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-2 justify-self-end col-start-3 -mr-2 md:mr-0">

          <!-- Apex marketing: account actions -->
          <template v-if="isApexMarketing">
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/admin"
              class="hidden lg:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              :class="isTransparent
                ? 'border-white/40 text-white/85 hover:text-white hover:bg-white/10 focus-visible:outline-[var(--apex-focus-on-dark)]'
                : 'border-gray-900/10 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-[var(--apex-focus-on-light)]'"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Dashboard
            </NuxtLink>
            <NuxtLink
              v-else
              to="/admin/login"
              class="hidden lg:inline-flex items-center rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              :class="isTransparent
                ? 'text-white/85 hover:text-white focus-visible:outline-[var(--apex-focus-on-dark)]'
                : 'text-gray-600 hover:text-gray-900 focus-visible:outline-[var(--apex-focus-on-light)]'"
            >Login</NuxtLink>
            <NuxtLink
              :to="authStore.isAuthenticated ? '/admin' : '/register'"
              class="hidden lg:inline-flex items-center rounded-xl bg-[var(--apex-action)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              :class="isTransparent
                ? 'hover:bg-[var(--apex-action-hover)] focus-visible:outline-[var(--apex-focus-on-dark)]'
                : 'hover:bg-[var(--apex-action-hover)] focus-visible:outline-[var(--apex-focus-on-light)]'"
            >{{ authStore.isAuthenticated ? 'Open dashboard' : 'Create your store' }}</NuxtLink>
          </template>

          <template v-else>
          <StorefrontLocalePicker class="hidden lg:block" :transparent="isTransparent" />
          <!-- Admin pill (desktop) -->
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="hidden lg:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            :class="isTransparent ? 'border-white/25 text-white/85 hover:text-white hover:bg-white/10' : 'border-primary-600/25 bg-primary-600/[0.06] text-primary-700 hover:bg-primary-600/[0.12]'"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <Icon name="heroicons:cog-6-tooth" class="w-3.5 h-3.5" aria-hidden="true" />
            Admin
          </NuxtLink>

          <!-- Shop action cluster -->
          <div
            class="flex items-center gap-1"
          >
          <!-- Favorites (hidden when the favorites feature is off site-wide) -->
          <NuxtLink
            v-if="favoritesEnabled"
            to="/favorites"
            class="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            aria-label="Favorites"
          >
            <Icon name="heroicons:heart" class="w-[18px] h-[18px]" aria-hidden="true" />
            <span
              v-if="favoritesStore.count > 0"
              class="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
            >
              {{ favoritesStore.count }}
            </span>
          </NuxtLink>

          <!-- Cart (hidden when Shop module is disabled) -->
          <NuxtLink
            v-if="isEnabled('shop')"
            to="/cart"
            class="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            :class="isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'"
            aria-label="Cart"
          >
            <span class="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
              <img v-if="siteConfig?.cart_icon_url" :src="siteConfig.cart_icon_url" alt="" class="block h-5 w-5 object-contain" />
              <Icon name="heroicons:shopping-cart" v-else class="h-5 w-5" />
            </span>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-primary-600 text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
              :style="{ color: 'var(--on-primary, #fff)' }"
            >
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>
          </div>

          <!-- Header CTA (desktop) -->
          <NuxtLink
            v-if="headerCta?.enabled && headerCta.label && headerCta.link"
            :to="headerCta.link"
            class="hidden lg:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            :class="isTransparent
              ? 'bg-white text-gray-900 hover:bg-white/90'
              : 'bg-primary-600 hover:bg-primary-700 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.4)]'"
            :style="isTransparent ? {} : { color: 'var(--on-primary, #fff)' }"
          >{{ headerCta.label }}</NuxtLink>
          </template>

          <!-- Mobile hamburger -->
          <button
            ref="mobileMenuTrigger"
            type="button"
            @click="mobileMenuOpen = true"
            class="lg:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            :class="[
              isTransparent ? 'border-white/20 text-white/85 hover:bg-white/10' : 'border-gray-900/10 bg-white/70 text-gray-900 shadow-sm hover:bg-gray-50',
              isApexMarketing
                ? (isTransparent ? 'focus-visible:outline-[var(--apex-focus-on-dark)]' : 'focus-visible:outline-[var(--apex-focus-on-light)]')
                : 'focus-visible:outline-primary-500',
            ]"
            aria-label="Open menu"
            aria-controls="mobile-menu-dialog"
            :aria-expanded="mobileMenuOpen"
          >
            <Icon name="heroicons:bars-3" class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Mobile drawer (right side) -->
      <Teleport to="body">
        <Transition
          enter-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="motion-safe:transition motion-safe:duration-150 motion-safe:ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="mobileMenuOpen"
            class="lg:hidden fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm"
            aria-hidden="true"
            @click="closeMobile"
          />
        </Transition>
        <Transition
          enter-active-class="motion-safe:transition motion-safe:duration-250 motion-safe:ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="mobileMenuOpen"
            id="mobile-menu-dialog"
            ref="mobileMenuDialog"
            tabindex="-1"
            class="lg:hidden fixed top-0 right-0 z-[61] h-full w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <!-- Drawer header -->
            <div class="flex items-center justify-between pl-5 pr-3 h-16 border-b border-gray-900/[0.08] shrink-0">
              <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Menu</p>
                <p class="text-base font-bold tracking-tight text-gray-900 truncate">
                  {{ siteConfig?.site_name || 'Store' }}
                </p>
              </div>
              <button
                ref="mobileMenuCloseButton"
                type="button"
                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                :class="isApexMarketing ? 'focus-visible:outline-[var(--apex-focus-on-light)]' : 'focus-visible:outline-primary-500'"
                aria-label="Close menu"
                @click="closeMobile"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <!-- Drawer nav -->
            <nav v-if="isApexMarketing" class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
              <a v-for="link in marketingLinks" :key="link.to" :href="link.to" class="flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apex-focus-on-light)]" @click="closeMobile">{{ link.label }}</a>
              <div class="mt-4 pt-4 border-t border-gray-900/[0.08] flex flex-col gap-2">
                <NuxtLink v-if="authStore.isAuthenticated" to="/admin" class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--apex-action)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--apex-action-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apex-focus-on-light)]" @click="closeMobile">Dashboard</NuxtLink>
                <template v-else>
                  <NuxtLink to="/admin/login" class="flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apex-focus-on-light)]" @click="closeMobile">Login</NuxtLink>
                  <NuxtLink to="/register" class="flex min-h-11 items-center justify-center rounded-xl bg-[var(--apex-action)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--apex-action-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apex-focus-on-light)]" @click="closeMobile">Create your store</NuxtLink>
                </template>
                <a v-if="!authStore.isAuthenticated" href="#pricing" class="inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--apex-action)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apex-focus-on-light)]" @click="closeMobile">View plans</a>
              </div>
            </nav>
            <nav v-else class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
              <div class="mb-2 flex items-center justify-between border-b border-gray-900/[0.08] px-3 pb-3">
                <span class="text-xs font-semibold text-gray-500">Language</span>
                <StorefrontLocalePicker />
              </div>
              <template v-for="link in navLinks" :key="link.to">
                <!-- Accordion item with categories (Shop) -->
                <div v-if="link.categories && link.categories.length">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    :aria-expanded="mobileShopOpen"
                    @click="mobileShopOpen = !mobileShopOpen"
                  >
                    <span>{{ link.label }}</span>
                    <Icon name="heroicons:chevron-down" class="w-4 h-4 transition-transform duration-200" :class="mobileShopOpen ? 'rotate-180' : ''" aria-hidden="true" />
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
                        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
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
                  class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  active-class="!text-primary-600 !bg-primary-50"
                  @click="closeMobile"
                >{{ link.label }}</NuxtLink>
              </template>
              <div v-if="authStore.isAdmin" class="mt-2 pt-3 border-t border-gray-900/[0.08]">
                <NuxtLink
                  to="/admin"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary-700 bg-primary-600/[0.07] hover:bg-primary-600/[0.12] transition-colors"
                  @click="closeMobile"
                >
                  <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600/[0.12] shrink-0">
                    <Icon name="heroicons:cog-6-tooth" class="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <span class="min-w-0 flex-1">Admin dashboard</span>
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                </NuxtLink>
              </div>
            </nav>
          </aside>
        </Transition>
      </Teleport>
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
const mobileMenuTrigger = ref<HTMLButtonElement | null>(null)
const mobileMenuDialog = ref<HTMLElement | null>(null)
const mobileMenuCloseButton = ref<HTMLButtonElement | null>(null)
let previouslyFocusedElement: HTMLElement | null = null
let previousBodyOverflow = ''
let appRootWasInert = false

const favoritesEnabled = computed(() => siteConfig.value?.favorites_enabled ?? false)
const headerCta = computed(() => siteConfig.value?.header_cta ?? null)
const logoHeight = computed(() => siteConfig.value?.logo_size || 36)

const isApexMarketing = computed(() => siteConfig.value?.is_storefront_host === false)
const marketingLinks = [
  { label: 'Product', to: '#product' },
  { label: 'Use cases', to: '#use-cases' },
  { label: 'Pricing', to: '#pricing' },
  { label: 'FAQ', to: '#faq' },
] as const
const marketingHome = computed(() => (authStore.isAuthenticated ? '/admin' : '/'))

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
  siteConfig.value?.is_storefront_host === true
    ? $apiFetch<{ data: any[] }>('/categories', { method: 'GET' })
        .then(r => (r?.data ?? []).map(mapCategory))
        .catch(() => [] as NavCategory[])
    : Promise.resolve([] as NavCategory[]),
  {
    // Site config can resolve after this shared header mounts. Refetch only when
    // that resolution confirms a real storefront; Apex keeps the empty result.
    watch: [() => siteConfig.value?.is_storefront_host],
  },
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

// Active-state matching: Home only on exact `/`, everything else on its own
// section (so `/shop/…` keeps Shop lit but `/` doesn't light every link).
function isLinkActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}

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

// Apex marketing uses a light page header. Storefront pages retain their
// tenant-configured full-bleed behaviour.
const BANNER_PATHS = new Set(['/', '/about', '/contact', '/blog', '/services'])
const isBannerPage = computed(() => BANNER_PATHS.has(route.path))
const isFullBleedPage = computed(() =>
  !isApexMarketing.value && isBannerPage.value && (siteConfig.value?.hero_full_bleed ?? false)
)
const scrollY = ref(0)
const isTransparent = computed(() =>
  isFullBleedPage.value && scrollY.value < 50 && !mobileMenuOpen.value
)
const PLATFORM_PRIMARY_COLOR = '#3B6EC2'
const headerLogoColor = computed(() => {
  if (isTransparent.value) return '#fff'
  if (isApexMarketing.value) return PLATFORM_PRIMARY_COLOR
  return siteConfig.value?.theme?.primary_color || PLATFORM_PRIMARY_COLOR
})
// Once the page has scrolled a little, condense the solid bar and add elevation.
const isScrolled = computed(() => scrollY.value > 8)

function onScroll() {
  scrollY.value = window.scrollY
}

// Close menus on route change.
watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
  mobileShopOpen.value = false
  openDropdown.value = null
})

// Keep focus inside the modal drawer, then return it to the opener.
watch(mobileMenuOpen, async (open) => {
  if (!import.meta.client) return

  const appRoot = document.querySelector<HTMLElement>('#__nuxt')
  if (open) {
    previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : mobileMenuTrigger.value
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (appRoot) {
      appRootWasInert = appRoot.inert
      appRoot.inert = true
    }
    await nextTick()
    mobileMenuCloseButton.value?.focus()
    return
  }

  document.body.style.overflow = previousBodyOverflow
  if (appRoot && !appRootWasInert) appRoot.inert = false
  await nextTick()
  if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus()
  previouslyFocusedElement = null
})

function onKeydown(e: KeyboardEvent) {
  if (!mobileMenuOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeMobile()
    return
  }
  if (e.key !== 'Tab' || !mobileMenuDialog.value) return

  const focusable = Array.from(mobileMenuDialog.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter(element => !element.hasAttribute('hidden'))
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!first || !last) {
    e.preventDefault()
    mobileMenuDialog.value.focus()
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  } else if (!mobileMenuDialog.value.contains(document.activeElement)) {
    e.preventDefault()
    first.focus()
  }
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) {
    document.body.style.overflow = previousBodyOverflow
    const appRoot = document.querySelector<HTMLElement>('#__nuxt')
    if (appRoot && !appRootWasInert) appRoot.inert = false
  }
})
</script>

<style scoped>
.apex-header__brand { color: var(--apex-text); font-family: 'Space Grotesk', var(--font-heading); font-size: 1.6rem; font-weight: 700; line-height: 1; letter-spacing: -0.04em; }
.apex-header__brand-dot { color: #6d28d9; }

/* Editorial nav item: text with a center-out underline that grows on hover and
   stays drawn for the active section. Colour follows the text (currentColor),
   so it works in both the solid and transparent (over-hero) header states. */
.nav-link {
  position: relative;
  padding: 0.5rem 0.15rem;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: -0.005em;
  transition: color 0.2s ease;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0.15rem;
  right: 0.15rem;
  bottom: 0.15rem;
  height: 1.5px;
  border-radius: 9999px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-link:hover::after,
.nav-link-active::after {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::after {
    transition: none;
  }
}
</style>
