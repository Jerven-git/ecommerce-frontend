<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside class="w-64 shrink-0 bg-white border-r border-gray-200/70 flex flex-col">
      <!-- Brand -->
      <div class="h-16 px-5 flex items-center border-b border-gray-200/70">
        <NuxtLink to="/super-admin" class="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1">
          <div class="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm shadow-purple-600/30">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" />
            </svg>
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-gray-900">Super Admin</p>
            <p class="text-xs text-gray-500">Platform operator</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
          :class="isActive(item.path)
            ? 'bg-purple-50 text-purple-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'"
        >
          <span
            class="w-5 h-5 inline-flex shrink-0 [&_svg]:w-5 [&_svg]:h-5 transition-colors"
            :class="isActive(item.path) ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'"
            v-html="item.icon"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="px-3 py-4 border-t border-gray-200/70 space-y-1">
        <div class="px-3 py-1.5 flex items-center gap-2 text-xs text-gray-500">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Operational
        </div>
        <button
          class="block w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
          @click="handleLogout"
        >
          Log out
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0">
      <SuperAdminImpersonationBanner />
      <div class="flex-1 overflow-y-auto p-6 md:p-8">
        <slot />
      </div>
    </main>

    <!-- One toast host for every super-admin page. -->
    <AdminToast />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { path: '/super-admin', label: 'Dashboard', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
  { path: '/super-admin/stores', label: 'Stores', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l2-3h14l2 3M3 7v13h18V7M3 7h18"/></svg>' },
  { path: '/super-admin/admins', label: 'Admins', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 16a7 7 0 1114 0H5z"/></svg>' },
  { path: '/super-admin/activity', label: 'Activity log', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h6m-6 4h6m-6 4h6M4 4h.01M4 8h.01M4 12h.01M4 16h.01"/></svg>' },
]

const isActive = (path: string) => {
  if (path === '/super-admin') {
    return route.path === '/super-admin'
  }
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/admin/login')
}
</script>
