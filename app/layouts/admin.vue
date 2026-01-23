<template>
  <!-- Fixed-height shell so ONLY main content scrolls -->
  <div class="h-screen bg-gray-100 flex overflow-hidden">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar (collapsible desktop + drawer mobile) -->
    <aside
      class="z-50 border-r shadow-sm transition-all duration-200 ease-in-out
             fixed lg:sticky top-0 h-screen overflow-hidden"
      style="background-color: #161833;"
      :class="[
        // Mobile slide in/out
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',

        // Desktop width collapse (removes the blank space)
        sidebarOpen ? 'w-80 opacity-100 pointer-events-auto' : 'w-80 lg:w-0 lg:opacity-0 lg:pointer-events-none'
      ]"
    >
      <!-- Sidebar header -->
      <div class="h-16 px-5 flex items-center justify-between border-b border-white/10">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <p class="font-bold text-white leading-tight">Admin</p>
            <p class="text-xs text-white/70 leading-tight">Dashboard</p>
          </div>
        </div>

        <!-- Collapse button (desktop + mobile) -->
        <button
          class="p-2 rounded-md hover:bg-white/10 text-white"
          @click="toggleSidebar"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <!-- Chevron Left -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Sidebar scroll area (hidden scrollbar but scrollable) -->
      <div class="sidebar-scroll h-[calc(100vh-4rem)] overflow-y-auto p-5 space-y-6">
        <!-- Quick Actions -->
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <nav class="space-y-2">
            <!-- Dashboard -->
            <NuxtLink
              to="/admin"
              class="block p-3 rounded-lg transition-colors"
              :class="linkClass('/admin')"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                </svg>
                <div>
                  <h3 class="font-semibold text-white">Dashboard</h3>
                  <p class="text-sm text-white/70">Overview & stats</p>
                </div>
              </div>
            </NuxtLink>

            <!-- Products -->
            <NuxtLink
              to="/admin/products"
              class="block p-3 rounded-lg transition-colors"
              :class="linkClass('/admin/products')"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div>
                  <h3 class="font-semibold text-white">Manage Products</h3>
                  <p class="text-sm text-white/70">Add, edit, or remove products</p>
                </div>
              </div>
            </NuxtLink>

            <!-- Orders -->
            <NuxtLink
              to="/admin/orders"
              class="block p-3 rounded-lg transition-colors"
              :class="linkClass('/admin/orders')"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 class="font-semibold text-white">View Orders</h3>
                  <p class="text-sm text-white/70">Manage customer orders</p>
                </div>
              </div>
            </NuxtLink>

            <!-- Settings -->
            <NuxtLink
              to="/admin/settings"
              class="block p-3 rounded-lg transition-colors"
              :class="linkClass('/admin/settings')"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 class="font-semibold text-white">Site Settings</h3>
                  <p class="text-sm text-white/70">Customize your store appearance</p>
                </div>
              </div>
            </NuxtLink>

            <!-- Discounts -->
            <NuxtLink
              to="/admin/discounts"
              class="block p-3 rounded-lg transition-colors"
              :class="linkClass('/admin/discounts')"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 class="font-semibold text-white">Discount Codes</h3>
                  <p class="text-sm text-white/70">Manage discount codes</p>
                </div>
              </div>
            </NuxtLink>

            <!-- Shipping -->
            <NuxtLink
              to="/admin/shipping"
              class="block p-3 rounded-lg transition-colors"
              :class="linkClass('/admin/shipping')"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <div>
                  <h3 class="font-semibold text-white">Shipping Settings</h3>
                  <p class="text-sm text-white/70">Configure shipping zones and rates</p>
                </div>
              </div>
            </NuxtLink>
          </nav>

          <div class="mt-4 pt-4 border-t border-white/10">
            <NuxtLink
              to="/"
              class="block w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              @click="closeSidebarOnMobile"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/90 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h4m10-11v10a1 1 0 01-1 1h-4m-6 0h6" />
                </svg>
                <span class="font-medium text-white">View Store</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Account -->
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 class="text-lg font-bold mb-3 text-white">Account</h2>

          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm text-white/70">Logged in as</p>
              <p class="font-semibold text-white">{{ authStore.user?.name || 'Admin' }}</p>
              <p class="text-sm text-white/70">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-white/10">
            <button
              @click="handleLogout"
              class="w-full p-3 bg-red-500/10 hover:bg-red-500/15 rounded-lg transition-colors text-left"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="font-medium text-red-200">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main column (header sticky + ONLY this area scrolls) -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- Sticky header -->
      <header class="bg-white border-b shadow-sm sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Toggle (all sizes, so you can reopen after desktop collapse) -->
            <button
              class="p-2 rounded-md hover:bg-gray-100"
              @click="toggleSidebar"
              aria-label="Toggle sidebar"
              :title="sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              {{ pageTitle }}
            </h1>
          </div>

          <div class="hidden sm:flex items-center space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">View Store</NuxtLink>
          </div>
        </div>
      </header>

      <!-- Scrollable main content ONLY -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep scrolling */
.sidebar-scroll {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}
.sidebar-scroll::-webkit-scrollbar {
  width: 0px; /* Chrome/Safari */
  height: 0px;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const route = useRoute()

// default is CLOSED
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

/**
 * ✅ Only close sidebar when clicking nav links on MOBILE.
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
  if (route.path.startsWith('/admin/orders')) return 'Orders'
  if (route.path.startsWith('/admin/settings')) return 'Settings'
  if (route.path.startsWith('/admin/discounts')) return 'Discount Codes'
  if (route.path.startsWith('/admin/shipping')) return 'Shipping'
  return 'Admin'
})

const linkClass = (path: string) => {
  // Dashboard active only on exact /admin
  const isDashboard = path === '/admin'
  const isActive = isDashboard
    ? (route.path === '/admin' || route.path === '/admin/')
    : (route.path === path || route.path.startsWith(path + '/'))

  const active = 'bg-white/15 ring-1 ring-white/20 text-white'
  const inactive = 'bg-white/5 hover:bg-white/10 text-white'

  return isActive ? active : inactive
}
</script>
