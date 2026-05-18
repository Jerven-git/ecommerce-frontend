<template>
  <!-- Admin Guide -->
  <AdminGuide ref="guideRef" />

  <!-- Fixed-height shell so ONLY main content scrolls -->
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Floating open tab (only when sidebar is closed) -->
    <button
      v-if="!sidebarOpen"
      class="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 shadow-md rounded-r-xl py-5 px-1.5 hover:bg-gray-50 transition-colors"
      @click="toggleSidebar"
      aria-label="Open sidebar"
      title="Open sidebar"
    >
      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Sidebar -->
    <aside
      class="z-50 border-r border-gray-100 transition-all duration-200 ease-in-out
             fixed lg:sticky top-0 h-screen overflow-hidden bg-white flex flex-col"
      :class="[
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarOpen ? 'w-64 opacity-100 pointer-events-auto' : 'w-64 lg:w-0 lg:opacity-0 lg:pointer-events-none'
      ]"
    >
      <!-- Sidebar header -->
      <div class="h-16 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <NuxtLink to="/admin" class="flex items-center gap-2.5" @click="closeSidebarOnMobile">
          <img src="~/assets/css/svg/databasy.svg" alt="Databasy" class="h-8 w-auto shrink-0" />
          <div>
            <p class="text-sm font-bold text-gray-900 leading-tight">Admin Panel</p>
            <p class="text-xs text-gray-400 leading-tight">Store Manager</p>
          </div>
        </NuxtLink>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          @click="toggleSidebar"
          aria-label="Collapse sidebar"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Sidebar scroll area -->
      <div class="sidebar-scroll flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        <!-- Navigation -->
        <nav data-guide="sidebar-nav" class="space-y-0.5">
          <p class="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>

          <NuxtLink
            to="/admin"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
            <span class="font-medium">Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/products"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/products')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="font-medium">Products</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/categories"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/categories')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="font-medium">Categories</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/posts"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/posts')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span class="font-medium">Blog Posts</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/post-categories"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/post-categories')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h10M4 18h10" />
            </svg>
            <span class="font-medium">Blog Categories</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/services"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/services')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="font-medium">Services</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/service-categories"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/service-categories')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span class="font-medium">Service Categories</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/orders"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/orders')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Orders</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/backorders"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/backorders')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">Backorders</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/discounts"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/discounts')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="font-medium">Discounts</span>
          </NuxtLink>

          <NuxtLink
            v-if="isEnabled('commissions')"
            to="/admin/commissions"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/commissions')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span class="font-medium">Commissions</span>
          </NuxtLink>

          <NuxtLink
            v-if="isEnabled('gift_cards')"
            to="/admin/gift-cards"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/gift-cards')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span class="font-medium">Gift Cards</span>
          </NuxtLink>
        </nav>

        <!-- Settings group -->
        <nav data-guide="sidebar-settings" class="space-y-0.5">
          <p class="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>

          <NuxtLink
            v-if="authStore.isSuperAdmin"
            to="/admin/users"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/users')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m10-11a3 3 0 11-6 0 3 3 0 016 0zm-8 0a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Admin Users</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/settings"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/settings')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Site Settings</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/shipping"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/shipping')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <span class="font-medium">Shipping</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/tax-settings"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/tax-settings')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="font-medium">Tax</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/tax-report"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/tax-report')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Tax Report</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/payment-settings"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="linkClass('/admin/payment-settings')"
            @click="closeSidebarOnMobile"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="font-medium">Payments</span>
          </NuxtLink>
        </nav>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- View Store + Account (bottom) -->
        <div class="space-y-1 pb-2">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            @click="closeSidebarOnMobile"
            target="_blank"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span class="font-medium">View Store</span>
          </NuxtLink>

          <!-- Account row -->
          <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50">
            <div class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-primary-600">
                {{ (authStore.user?.name || 'A').charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-900 truncate">{{ authStore.user?.name || 'Admin' }}</p>
              <p class="text-xs text-gray-400 truncate">{{ authStore.user?.email }}</p>
            </div>
            <button
              @click="handleLogout"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Logout"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- Sticky header -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <h1 class="text-lg font-bold text-gray-900 truncate">{{ pageTitle }}</h1>
          <div class="flex items-center gap-3 shrink-0">
            <button
              @click="guideRef?.startGuide()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              title="Replay the admin guide"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Guide
            </button>
            <NuxtLink
              to="/"
              class="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
              target="_blank"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Store
            </NuxtLink>
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

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const { isEnabled } = useModules()
const guideRef = ref<{ startGuide: () => void } | null>(null)

// default is CLOSED
const sidebarOpen = ref(
  typeof window !== 'undefined'
    ? localStorage.getItem('sidebarOpen') !== 'false'
    : true
)

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

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/')
}

const pageTitle = computed(() => {
  if (route.path === '/admin') return 'Admin Dashboard'
  if (route.path.startsWith('/admin/products')) return 'Products'
  if (route.path.startsWith('/admin/post-categories')) return 'Blog Categories'
  if (route.path.startsWith('/admin/posts')) return 'Blog Posts'
  if (route.path.startsWith('/admin/backorders')) return 'Backorders'
  if (route.path.startsWith('/admin/orders')) return 'Orders'
  if (route.path.startsWith('/admin/users')) return 'Admin Users'
  if (route.path.startsWith('/admin/settings')) return 'Settings'
  if (route.path.startsWith('/admin/discounts')) return 'Discount Codes'
  if (route.path.startsWith('/admin/commissions')) return 'Commissions'
  if (route.path.startsWith('/admin/gift-cards')) return 'Gift Cards'
  if (route.path.startsWith('/admin/shipping')) return 'Shipping'
  return 'Admin'
})

const linkClass = (path: string) => {
  const isDashboard = path === '/admin'
  const isActive = isDashboard
    ? (route.path === '/admin' || route.path === '/admin/')
    : (route.path === path || route.path.startsWith(path + '/'))

  const active = 'bg-primary-50 ring-1 ring-primary-200 text-primary-800'
  const inactive = 'bg-white hover:bg-gray-100 text-gray-700'

  return isActive ? active : inactive
}
</script>

<style scoped>
/* Hide scrollbar but keep scrolling */
.sidebar-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar-scroll::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
</style>
