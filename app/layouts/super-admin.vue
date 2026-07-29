<template>
  <div
    class="admin-shell super-admin-shell min-h-screen bg-admin-canvas text-admin-text md:flex"
    :class="themeClass"
  >
    <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-admin-border bg-admin-surface px-4 md:hidden">
      <NuxtLink to="/super-admin" class="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-admin-accent text-admin-on-accent shadow-sm" aria-hidden="true">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" />
          </svg>
        </span>
        <span class="text-sm font-semibold">Super Admin</span>
      </NuxtLink>
      <div class="flex items-center gap-1">
        <AdminThemeToggle />
        <button
          type="button"
          class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
          :aria-expanded="navOpen"
          aria-controls="super-admin-navigation"
          :aria-label="navOpen ? 'Close navigation' : 'Open navigation'"
          @click="navOpen = !navOpen"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path v-if="navOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>

    <aside
      id="super-admin-navigation"
      class="shrink-0 border-b border-admin-border bg-admin-surface md:flex md:min-h-screen md:w-64 md:flex-col md:border-b-0 md:border-r"
      :class="navOpen ? 'flex flex-col' : 'hidden'"
    >
      <!-- Brand -->
      <div class="hidden h-16 items-center border-b border-admin-border px-5 md:flex">
        <NuxtLink to="/super-admin" class="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-1">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-admin-accent shadow-sm">
            <svg class="h-5 w-5 text-admin-on-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" />
            </svg>
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-admin-text">Super Admin</p>
            <p class="text-xs text-admin-muted">Platform operator</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-1"
          :class="isActive(item.path)
            ? 'bg-admin-accent-soft text-admin-accent-strong font-semibold'
            : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          <span
            class="w-5 h-5 inline-flex shrink-0 [&_svg]:w-5 [&_svg]:h-5 transition-colors"
            :class="isActive(item.path) ? 'text-admin-accent' : 'text-admin-muted group-hover:text-admin-text'"
            aria-hidden="true"
            v-html="item.icon"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="space-y-1 border-t border-admin-border px-3 py-4">
        <div class="flex items-center gap-2 px-3 py-1.5 text-xs text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-success"></span>
          Operational
        </div>
        <AdminThemeToggle show-label block />
        <button
          class="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-xs text-admin-muted transition-colors hover:bg-admin-danger-soft hover:text-admin-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-1"
          @click="handleLogout"
        >
          Log out
        </button>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col">
      <SuperAdminImpersonationBanner />
      <div class="flex-1 p-4 sm:p-6 md:p-8">
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
const navOpen = ref(false)
const { themeClass } = useAdminAppearance({ syncBody: true })

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

watch(() => route.path, () => {
  navOpen.value = false
})
</script>
