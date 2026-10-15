<template>
  <AuthLogoutProgress :visible="loggingOut" />

  <!-- Guest pages (login, 2FA, password reset) render standalone without the admin shell -->
  <slot v-if="isGuestPage" />

  <!-- Subscription-gated stores: lock screen replaces the shell (UI sugar; the
       backend 402s are the actual enforcement). Super admins are exempt — their
       provisions flow must keep working regardless of any store's billing. -->
  <SubscriptionLock v-else-if="isStoreLocked" />

  <template v-else>
  <!-- Admin Guide -->
  <AdminGuide v-if="!isImmersiveEditor" ref="guideRef" />

  <!-- AI help assistant -->
  <AdminAssistant v-if="!isImmersiveEditor" />

  <!-- The website editor keeps the admin security boundary but owns the full viewport. -->
  <div
    v-if="isImmersiveEditor"
    data-admin-immersive-shell
    class="admin-immersive-shell admin-shell flex flex-col overflow-hidden bg-admin-canvas text-admin-text"
    :class="themeClass"
  >
    <SuperAdminImpersonationBanner />
    <main class="flex min-h-0 flex-1 overflow-hidden">
      <slot />
    </main>
  </div>

  <!-- Fixed-height shell so ONLY main content scrolls -->
  <template v-else>
    <SuperAdminImpersonationBanner />
    <div
      data-admin-standard-shell
      class="admin-shell h-screen flex overflow-hidden bg-admin-canvas text-admin-text"
      :class="themeClass"
      :style="{ '--admin-sidebar-offset': sidebarOpen ? '16rem' : '0rem' }"
    >
    <!-- Mobile scrim -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Navigation invitation (only when sidebar is closed) -->
    <button
      v-if="!sidebarOpen"
      class="admin-open-nav admin-focus fixed left-0 top-1/2 z-50 flex h-16 w-11 -translate-y-1/2 items-center justify-center
             bg-transparent text-admin-muted transition-colors hover:text-admin-accent-strong"
      @click="toggleSidebar"
      aria-controls="admin-navigation"
      aria-expanded="false"
      aria-label="Open navigation"
      title="Open navigation"
    >
      <span class="sr-only">Open navigation</span>
      <Icon name="heroicons:chevron-double-right" class="admin-open-nav__icon h-6 w-6 shrink-0" aria-hidden="true" />
    </button>

    <!-- Sidebar -->
    <aside
      id="admin-navigation"
      class="admin-sidebar ease-quint z-50 border-r border-admin-border
             fixed lg:sticky top-0 h-screen overflow-hidden flex flex-col"
      :class="[
        mounted ? 'transition-[transform,width,opacity] duration-200' : '',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarOpen ? 'w-64 opacity-100 pointer-events-auto' : 'w-64 lg:w-0 lg:opacity-0 lg:pointer-events-none'
      ]"
    >
      <!-- Sidebar header -->
      <div class="h-16 px-4 flex items-center justify-between border-b border-admin-border shrink-0">
        <NuxtLink to="/admin" class="admin-focus flex items-center gap-2.5 rounded-lg" @click="closeSidebarOnMobile">
          <img src="~/assets/css/svg/databasy.svg" alt="Databasy" class="h-8 w-auto shrink-0" />
          <div class="leading-tight">
            <p class="text-sm font-semibold text-admin-text">Admin Panel</p>
            <p class="text-xs text-admin-muted">Store Manager</p>
          </div>
        </NuxtLink>
        <button
          class="admin-focus tap-target w-8 h-8 flex items-center justify-center rounded-lg text-admin-muted
                 hover:text-admin-text hover:bg-admin-soft active:scale-95 transition"
          @click="toggleSidebar"
          aria-label="Collapse sidebar"
        >
          <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <!-- Sidebar scroll area -->
      <div class="sidebar-scroll flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-7">
        <!-- Day-to-day navigation -->
        <nav data-guide="sidebar-nav" aria-label="Main" class="flex flex-col gap-6">
          <div
            v-for="group in mainGroups"
            :key="group.heading"
            class="space-y-1"
          >
            <p class="px-3 mb-1.5 text-[11px] font-semibold text-admin-muted uppercase tracking-[0.04em]">{{ group.heading }}</p>
            <template v-for="item in group.items" :key="item.to">
              <NuxtLink
                v-if="!item.show || item.show()"
                :to="item.to"
                class="admin-nav-link admin-focus group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                :class="linkClass(item.to)"
                @click="closeSidebarOnMobile"
              >
                <Icon :name="item.icon" class="h-4 w-4 shrink-0 transition-colors" :class="iconClass(item)" aria-hidden="true" />
                <span class="min-w-0 truncate">{{ item.label }}</span>
              </NuxtLink>
            </template>
          </div>
        </nav>

        <!-- Settings & access -->
        <nav data-guide="sidebar-settings" aria-label="Settings and access" class="flex flex-col gap-6">
          <div
            v-for="group in settingsGroups"
            :key="group.heading"
            v-show="group.items.some(item => !item.show || item.show())"
            class="space-y-1"
          >
            <p class="px-3 mb-1.5 text-[11px] font-semibold text-admin-muted uppercase tracking-[0.04em]">{{ group.heading }}</p>
            <template v-for="item in group.items" :key="item.to">
              <NuxtLink
                v-if="!item.show || item.show()"
                :to="item.to"
                class="admin-nav-link admin-focus group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                :class="item.accent === 'purple' ? 'text-admin-accent-strong hover:bg-admin-accent-soft font-medium' : linkClass(item.to)"
                @click="closeSidebarOnMobile"
              >
                <Icon :name="item.icon" class="h-4 w-4 shrink-0 transition-colors" :class="iconClass(item)" aria-hidden="true" />
                <span class="min-w-0 truncate">{{ item.label }}</span>
              </NuxtLink>
            </template>
          </div>
        </nav>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- View Store + Account (bottom) -->
        <div class="space-y-1 pb-2">
          <AdminThemeToggle show-label block />

          <a
            :href="storeUrl"
            class="admin-nav-link admin-focus flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-admin-muted hover:bg-admin-soft hover:text-admin-text transition-colors"
            @click="closeSidebarOnMobile"
            target="_blank"
            rel="noopener"
          >
            <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4 shrink-0 text-admin-muted" aria-hidden="true" />
            <span>View Store</span>
          </a>

          <!-- Account row -->
          <div class="flex items-center gap-2.5 rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5">
            <div class="w-8 h-8 rounded-full bg-admin-accent-soft flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-admin-accent-strong">
                {{ (authStore.user?.name || 'A').charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-admin-text truncate">{{ authStore.user?.name || 'Admin' }}</p>
              <p class="text-xs text-admin-muted truncate">{{ authStore.user?.email }}</p>
            </div>
            <button
              @click="handleLogout"
              :disabled="loggingOut"
              class="admin-focus tap-target w-8 h-8 flex items-center justify-center rounded-lg text-admin-muted
                     hover:text-admin-danger hover:bg-admin-danger-soft active:scale-95 transition shrink-0 disabled:cursor-wait"
              :aria-label="loggingOut ? 'Signing out' : 'Log out'"
              :title="loggingOut ? 'Signing out' : 'Log out'"
            >
              <Icon name="heroicons:arrow-right-start-on-rectangle" class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- Sticky header -->
      <header class="sticky top-0 z-30 border-b border-admin-border bg-admin-surface">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <h1 class="text-base font-semibold text-admin-text truncate">{{ pageTitle }}</h1>
          <div class="flex items-center gap-2 shrink-0">
            <AdminThemeToggle />
            <button
              @click="guideRef?.startGuide()"
              class="admin-focus inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-admin-accent-soft px-3 py-2 text-xs font-semibold text-admin-accent-strong
                     transition-colors hover:bg-admin-soft"
              title="Replay the admin guide"
            >
              <Icon name="heroicons:question-mark-circle" class="w-3.5 h-3.5" aria-hidden="true" />
              Guide
            </button>
            <a
              :href="storeUrl"
              class="admin-focus hidden min-h-11 sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                     text-admin-muted hover:text-admin-text hover:bg-admin-soft transition-colors"
              target="_blank"
              rel="noopener"
            >
              <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5" aria-hidden="true" />
              View Store
            </a>
          </div>
        </div>
      </header>

      <!-- Scrollable main content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <slot />
        </div>
      </main>
    </div>
    </div>
  </template>
  </template>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const { isEnabled } = useModules()
const guideRef = ref<{ startGuide: () => void } | null>(null)
const { themeClass } = useAdminAppearance({ syncBody: true })
const { storeUrl } = useStorefrontUrl()

/**
 * Auth pages live under /admin/* (so admin.vue's middleware still runs) but
 * must never render inside the sidebar shell.
 */
const guestPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password', '/admin/verify-2fa']
const isGuestPage = computed(() => guestPaths.includes(route.path))
const isImmersiveEditor = computed(() => route.path === '/admin/website-editor')

/**
 * Gated stores see the subscription lock screen instead of the shell. Matches
 * the backend's middleware exemptions: super admins are never gated, and the
 * auth store's cached subscription fields drive the decision (kept in sync by
 * useSubscription's fetchState). Cancelled-but-within-period stays unlocked.
 * The subscription page itself is always reachable so gated users can upgrade.
 */
const isStoreLocked = computed(() => {
  if (authStore.isSuperAdmin || !authStore.isStoreGated) return false
  if (route.path === '/admin/subscription') return false
  return true
})

interface NavItem {
  to: string
  label: string
  /** Header title; defaults to `label` when omitted. */
  title?: string
  /** Heroicons name rendered beside the navigation label. */
  icon: string
  /** Optional visibility predicate (module flag / role gate). */
  show?: () => boolean
  /** Optional accent styling (e.g. the Super Admin link). */
  accent?: 'purple'
}

interface NavGroup {
  heading: string
  items: NavItem[]
}

// Day-to-day work — spotlighted by the guide as "Main menu".
const mainGroups: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: 'heroicons:home' },
    ],
  },
  {
    heading: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'heroicons:cube' },
      { to: '/admin/categories', label: 'Categories', icon: 'heroicons:tag' },
      { to: '/admin/services', label: 'Services', icon: 'heroicons:wrench-screwdriver' },
      { to: '/admin/service-categories', label: 'Service Categories', icon: 'heroicons:squares-2x2' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { to: '/admin/posts', label: 'Blog Posts', icon: 'heroicons:newspaper' },
      { to: '/admin/post-categories', label: 'Blog Categories', icon: 'heroicons:rectangle-stack' },
    ],
  },
  {
    heading: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: 'heroicons:clipboard-document-list' },
      { to: '/admin/backorders', label: 'Backorders', icon: 'heroicons:clock' },
      { to: '/admin/discounts', label: 'Discounts', title: 'Discount Codes', icon: 'heroicons:tag' },
      { to: '/admin/gift-cards', label: 'Gift Cards', show: () => isEnabled('gift_cards'), icon: 'heroicons:gift' },
      { to: '/admin/commissions', label: 'Commissions', show: () => isEnabled('commissions'), icon: 'heroicons:banknotes' },
    ],
  },
  {
    heading: 'Reports',
    items: [
      { to: '/admin/tax-report', label: 'Tax Report', icon: 'heroicons:chart-bar' },
    ],
  },
]

// Set-up-once configuration & access control — spotlighted as "Settings menu".
const settingsGroups: NavGroup[] = [
  {
    heading: 'Settings',
    items: [
      { to: '/admin/settings', label: 'Site Settings', title: 'Settings', icon: 'heroicons:cog-6-tooth' },
      { to: '/admin/shipping', label: 'Shipping', icon: 'heroicons:truck' },
      { to: '/admin/tax-settings', label: 'Tax', icon: 'heroicons:calculator' },
      { to: '/admin/payment-settings', label: 'Payments', icon: 'heroicons:credit-card' },
      { to: '/admin/subscription', label: 'Subscription', title: 'Subscription', icon: 'heroicons:rectangle-stack' },
    ],
  },
  {
    heading: 'Access',
    items: [
      { to: '/admin/users', label: 'Admin Users', show: () => authStore.isSuperAdmin, icon: 'heroicons:user-group' },
      { to: '/super-admin', label: 'Super Admin', show: () => authStore.isSuperAdmin, accent: 'purple', icon: 'heroicons:shield-check' },
    ],
  },
]

// Default is OPEN. Initialise to a stable value for SSR + first client render so
// hydration matches; the persisted preference is read in onMounted (client only).
const sidebarOpen = ref(true)
// Slide transitions are enabled only after first paint, so the shell arrives
// settled instead of animating on load (product UIs don't choreograph arrival).
const mounted = ref(false)
const loggingOut = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebarOpen', String(sidebarOpen.value))
  }
}

/**
 * Only close sidebar when clicking nav links on MOBILE.
 * On desktop, sidebar stays open unless user clicks the collapse button.
 */
const closeSidebarOnMobile = () => {
  if (typeof window === 'undefined') return
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

// Escape closes the drawer on mobile, matching the scrim tap.
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && sidebarOpen.value && window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  if (localStorage.getItem('sidebarOpen') === 'false') sidebarOpen.value = false
  window.addEventListener('keydown', onKeydown)
  requestAnimationFrame(() => { mounted.value = true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const handleLogout = async () => {
  if (loggingOut.value) return

  loggingOut.value = true
  try {
    await authStore.logout()
    await navigateTo('/')
  } catch {
    loggingOut.value = false
  }
}

const isActivePath = (path: string) => {
  if (path === '/admin') return route.path === '/admin' || route.path === '/admin/'
  return route.path === path || route.path.startsWith(path + '/')
}

// Header title is derived from the same nav data — no separate hardcoded map to
// drift out of sync. Most-specific match wins (e.g. /admin/products over /admin).
const allItems = [...mainGroups, ...settingsGroups].flatMap(g => g.items)

const pageTitle = computed(() => {
  const match = allItems.find(item => isActivePath(item.to))
  return match?.title ?? match?.label ?? 'Admin'
})

// Active is signalled by fill + weight + colour (never a side-stripe); hover
// stays neutral grey so colour consistently means "this is where you are".
const linkClass = (path: string) =>
  isActivePath(path)
    ? 'bg-admin-accent-soft text-admin-accent-strong font-semibold'
    : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'

const iconClass = (item: NavItem) => {
  if (item.accent === 'purple') return 'text-admin-accent'
  return isActivePath(item.to) ? 'text-admin-accent' : 'text-admin-muted group-hover:text-admin-text'
}
</script>

<style scoped>
.admin-immersive-shell {
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
}

/* Hide scrollbar but keep scrolling */
.sidebar-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar-scroll::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

/* Ease-out-quint — matches the curve used across the storefront (main.css). */
.ease-quint {
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Keep the rail quiet while tinting it with the primary colour from Appearance. */
.admin-sidebar {
  background-color: color-mix(in srgb, var(--admin-accent) 4%, var(--admin-surface));
}

/* Branded keyboard focus. Uses outline (not box-shadow) so it isn't clipped by
   the sidebar's overflow-hidden / scroll containers. */
.admin-focus:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 1px;
}

/* Expand small icon buttons to a 44px hit area without changing their visual
   size (WCAG 2.5.5 / touch ergonomics). */
.tap-target {
  position: relative;
}
.tap-target::after {
  content: '';
  position: absolute;
  inset: -8px;
}

/* Ensure nav rows meet the 44px touch minimum on coarse pointers. */
@media (pointer: coarse) {
  .admin-nav-link {
    min-height: 44px;
  }
}

.admin-open-nav {
  background: transparent;
}

.admin-open-nav:hover .admin-open-nav__icon,
.admin-open-nav:focus-visible .admin-open-nav__icon {
  animation: admin-nav-nudge 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes admin-nav-nudge {
  0% {
    transform: translateX(0);
  }
  45% {
    transform: translateX(0.3rem);
  }
  72% {
    transform: translateX(0.1rem);
  }
  100% {
    transform: translateX(0.2rem);
  }
}

/* Respect reduced motion: the sidebar snaps instead of sliding. */
@media (prefers-reduced-motion: reduce) {
  .ease-quint {
    transition: none !important;
  }
  .admin-open-nav {
    transform: translateY(-50%);
  }
  .admin-open-nav:hover .admin-open-nav__icon,
  .admin-open-nav:focus-visible .admin-open-nav__icon {
    animation: none;
  }
}
</style>
