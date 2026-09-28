<template>
  <div class="admin-shell super-admin-shell min-h-screen bg-admin-canvas text-admin-text md:flex" :class="themeClass">
    <!-- Mobile header -->
    <header class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-admin-border bg-admin-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-admin-surface/80 md:hidden">
      <NuxtLink to="/super-admin" class="flex items-center gap-2.5 rounded-xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent text-admin-on-accent shadow-sm" aria-hidden="true">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" /></svg>
        </span>
        <span class="text-sm font-semibold tracking-tight">Super Admin</span>
      </NuxtLink>
      <div class="flex items-center gap-1">
        <AdminThemeToggle />
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
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
      class="shrink-0 border-admin-border bg-admin-surface md:flex md:min-h-screen md:w-[272px] md:flex-col md:border-r"
      :class="navOpen ? 'flex flex-col border-b' : 'hidden'"
    >
      <!-- Brand -->
      <div class="hidden h-[64px] shrink-0 items-center gap-3 border-b border-admin-border px-5 md:flex">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-admin-accent text-admin-on-accent shadow-sm">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17 9 21l3-2 3 2-.75-4M3 4h18l-2 13H5L3 4Z" /></svg>
        </div>
        <div class="min-w-0 leading-tight">
          <p class="text-[13px] font-semibold tracking-tight text-admin-text">SSU Platform</p>
          <p class="text-[11px] font-medium text-admin-muted">Super Admin · Control Room</p>
        </div>
        <span class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-admin-success/20 bg-admin-success-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-admin-success" title="Platform operational">
          <span class="h-1.5 w-1.5 rounded-full bg-admin-success animate-pulse" aria-hidden="true" />
          Live
        </span>
      </div>

      <!-- Quick context -->
      <div class="mx-3 mt-3 hidden rounded-2xl border border-admin-border bg-admin-soft/60 p-3 md:block">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">Signed in</p>
        <p class="mt-1 truncate text-sm font-semibold text-admin-text">{{ authStore.user?.name || 'Operator' }}</p>
        <p class="truncate text-xs text-admin-muted">{{ authStore.user?.email || 'super admin' }}</p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <NuxtLink to="/super-admin/stores" class="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-2 text-xs font-medium text-admin-text hover:bg-admin-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l2-3h14l2 3M3 7v13h18V7M3 7h18" /></svg>
            Stores
          </NuxtLink>
          <NuxtLink to="/super-admin/activity" class="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-2 text-xs font-medium text-admin-text hover:bg-admin-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Activity
          </NuxtLink>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4" aria-label="Super admin">
        <p class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Overview</p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in primaryNav"
            :key="item.path"
            :to="item.path"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            :class="isActive(item.path) ? 'bg-admin-accent text-admin-on-accent shadow-sm font-semibold' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors [&_svg]:h-[18px] [&_svg]:w-[18px]" :class="isActive(item.path) ? 'bg-white/15 text-white' : 'bg-admin-soft text-admin-muted group-hover:bg-admin-surface group-hover:text-admin-text'" v-html="item.icon" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <span v-if="item.badge" class="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">{{ item.badge }}</span>
          </NuxtLink>
        </div>

        <p class="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Directory</p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in dirNav"
            :key="item.path"
            :to="item.path"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            :class="isActive(item.path) ? 'bg-admin-accent-soft text-admin-accent-strong font-semibold border border-admin-accent/15' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px]" :class="isActive(item.path) ? 'bg-admin-accent text-white' : 'bg-admin-soft text-admin-muted group-hover:text-admin-text'" v-html="item.icon" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <svg v-if="!isActive(item.path)" class="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </NuxtLink>
        </div>

        <p class="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-admin-muted">Audit & Ops</p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in auditNav"
            :key="item.path"
            :to="item.path"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            :class="isActive(item.path) ? 'bg-admin-accent-soft text-admin-accent-strong font-semibold border border-admin-accent/15' : 'text-admin-muted hover:bg-admin-soft hover:text-admin-text font-medium'"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px]" :class="isActive(item.path) ? 'bg-admin-accent text-white' : 'bg-admin-soft text-admin-muted group-hover:text-admin-text'" v-html="item.icon" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t border-admin-border p-3">
        <div class="rounded-xl bg-admin-soft/70 px-3 py-2.5">
          <p class="text-xs font-semibold text-admin-text">Need to act as a merchant?</p>
          <p class="mt-0.5 text-xs leading-relaxed text-admin-muted">Impersonate a store admin to troubleshoot without sharing credentials.</p>
          <NuxtLink to="/super-admin/admins" class="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-admin-accent px-3 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
            Open admins
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </NuxtLink>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <AdminThemeToggle class="flex-1" show-label block />
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-3 text-xs font-medium text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            title="Log out of super admin"
            aria-label="Log out"
            @click="handleLogout"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Out
          </button>
        </div>
        <p class="mt-3 px-1 text-[11px] leading-relaxed text-admin-muted">SSU Platform · Multi-store control room</p>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col">
      <SuperAdminImpersonationBanner />
      <div class="flex-1">
        <div class="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8">
          <slot />
        </div>
      </div>
      <footer class="border-t border-admin-border bg-admin-surface/50 px-6 py-4">
        <div class="mx-auto flex max-w-[1280px] flex-col gap-2 text-xs text-admin-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© SSU Platform · Super Admin — scoped to platform operators only</span>
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
  await authStore.logout()
  router.push('/admin/login')
}

watch(() => route.path, () => { navOpen.value = false })
</script>
