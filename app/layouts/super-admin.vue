<template>
  <div class="admin-shell super-admin-shell min-h-screen bg-admin-canvas text-admin-text md:flex" :class="themeClass">
    <AuthLogoutProgress :visible="loggingOut" />

    <!-- Mobile header -->
    <header class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-admin-border bg-admin-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-admin-surface/80 md:hidden">
      <NuxtLink to="/super-admin" class="flex min-h-11 items-center gap-2.5 rounded-xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent text-admin-on-accent shadow-sm" aria-hidden="true">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" /></svg>
        </span>
        <span class="text-sm font-semibold tracking-tight">Super Admin</span>
      </NuxtLink>
      <div class="flex items-center gap-1">
        <AdminThemeToggle />
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
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
      class="shrink-0 border-admin-border bg-admin-surface md:sticky md:top-0 md:flex md:h-screen md:w-[224px] md:flex-col md:overflow-y-auto md:border-r"
      :class="navOpen ? 'flex flex-col border-b' : 'hidden'"
    >
      <!-- Brand -->
      <div class="hidden h-14 shrink-0 items-center gap-2.5 border-b border-admin-border px-4 md:flex">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-accent text-admin-on-accent">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" /></svg>
        </div>
        <div class="min-w-0 leading-tight">
          <p class="truncate text-xs font-semibold tracking-tight text-admin-text">DATABASY</p>
          <p class="text-[10px] font-medium text-admin-muted">Control room</p>
        </div>
        <span class="ml-auto inline-flex items-center gap-1 rounded-full bg-admin-success-soft px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-admin-success" title="Platform operational">
          <span class="h-1.5 w-1.5 rounded-full bg-admin-success animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          Live
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-2.5" aria-label="Super admin">
        <p class="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-admin-muted">Overview</p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in primaryNav"
            :key="item.path"
            :to="item.path"
            class="group flex min-h-10 items-center gap-2 rounded-lg px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            :class="isActive(item.path) ? 'bg-admin-accent text-admin-on-accent font-semibold' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors [&_svg]:h-4 [&_svg]:w-4" :class="isActive(item.path) ? 'bg-white/15 text-white' : 'text-admin-muted group-hover:text-admin-text'" v-html="item.icon" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <span v-if="item.badge" class="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{{ item.badge }}</span>
          </NuxtLink>
        </div>

        <p class="mb-1.5 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-admin-muted">Directory</p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in dirNav"
            :key="item.path"
            :to="item.path"
            class="group flex min-h-10 items-center gap-2 rounded-lg px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            :class="isActive(item.path) ? 'bg-admin-accent-soft text-admin-accent-strong font-semibold border border-admin-accent/15' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md [&_svg]:h-4 [&_svg]:w-4" :class="isActive(item.path) ? 'bg-admin-accent text-admin-on-accent' : 'text-admin-muted group-hover:text-admin-text'" v-html="item.icon" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <svg v-if="!isActive(item.path)" class="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </NuxtLink>
        </div>

        <p class="mb-1.5 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-admin-muted">Audit & Ops</p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in auditNav"
            :key="item.path"
            :to="item.path"
            class="group flex min-h-10 items-center gap-2 rounded-lg px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            :class="isActive(item.path) ? 'bg-admin-accent-soft text-admin-accent-strong font-semibold border border-admin-accent/15' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md [&_svg]:h-4 [&_svg]:w-4" :class="isActive(item.path) ? 'bg-admin-accent text-admin-on-accent' : 'text-admin-muted group-hover:text-admin-text'" v-html="item.icon" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t border-admin-border p-2.5">
        <div class="flex items-center gap-2.5 px-1.5 py-2">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-muted" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 16a7 7 0 0114 0H5z" /></svg>
          </span>
          <div class="min-w-0 leading-tight">
            <p class="truncate text-xs font-semibold text-admin-text">{{ authStore.user?.name || 'Operator' }}</p>
            <p class="truncate text-[10px] text-admin-muted">{{ authStore.user?.email || 'super admin' }}</p>
          </div>
        </div>
        <NuxtLink to="/super-admin/admins" class="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-[11px] font-medium text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" title="Impersonate a store admin without sharing credentials">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7h5m0 0v5m0-5-6 6M8 17H3m0 0v-5m0 5 6-6" /></svg>
          Merchant access
          <svg class="ml-auto h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </NuxtLink>
        <div class="mt-1 flex items-center gap-1">
          <AdminThemeToggle class="flex-1" show-label block />
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:cursor-wait"
            :disabled="loggingOut"
            :title="loggingOut ? 'Signing out' : 'Log out of super admin'"
            :aria-label="loggingOut ? 'Signing out' : 'Log out'"
            @click="handleLogout"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span class="sr-only">{{ loggingOut ? 'Signing out…' : 'Log out' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col">
      <SuperAdminImpersonationBanner />
      <div class="flex-1">
        <div class="super-admin-content mx-auto w-full max-w-[1440px] p-2.5 sm:p-4 lg:p-5">
          <slot />
        </div>
      </div>
      <footer class="border-t border-admin-border bg-admin-surface/50 px-4 py-2.5">
        <div class="mx-auto flex max-w-[1440px] flex-col gap-1 text-[11px] text-admin-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© DATABASY Platform · Super Admin — scoped to platform operators only</span>
          <span class="inline-flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-admin-success" aria-hidden="true" /> Data is live and authorized for your role
          </span>
        </div>
      </footer>
    </main>

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const navOpen = ref(false)
const loggingOut = ref(false)
const { themeClass } = useAdminAppearance({ syncBody: true })

const primaryNav = [
  { path: '/super-admin', label: 'Dashboard', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
]
const dirNav = [
  { path: '/super-admin/stores', label: 'Stores', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h6" /></svg>' },
  { path: '/super-admin/admins', label: 'Admins', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 16a7 7 0 1114 0H5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2 2 4-4" /></svg>' },
]
const auditNav = [
  { path: '/super-admin/activity', label: 'Activity log', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h6m-6 4h6m-6 4h6M4 4h.01M4 8h.01M4 12h.01M4 16h.01M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
]

const isActive = (path: string) => {
  if (path === '/super-admin') return route.path === '/super-admin'
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  if (loggingOut.value) return

  loggingOut.value = true
  try {
    await authStore.logout()
    await router.push('/admin/login')
  } catch {
    loggingOut.value = false
  }
}

watch(() => route.path, () => { navOpen.value = false })
</script>

<style scoped>
.super-admin-content {
  font-size: 0.875rem;
}

.super-admin-content :deep(h1) {
  font-size: 1.375rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.super-admin-content :deep(.admin-input),
.super-admin-content :deep(.admin-date-picker__trigger),
.super-admin-content :deep(.admin-filter-select__trigger) {
  min-height: 2.5rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}

.super-admin-content :deep(.admin-btn) {
  min-height: 2.5rem;
  border-radius: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.super-admin-content :deep(table th),
.super-admin-content :deep(table td) {
  padding: 0.625rem 0.75rem;
}

.super-admin-content :deep(table th) {
  font-size: 0.6875rem;
}

.super-admin-content :deep(table td) {
  font-size: 0.8125rem;
}
</style>
