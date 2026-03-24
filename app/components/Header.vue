<template>
  <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center shrink-0">
          <img
            v-if="siteConfig?.logo_url"
            :src="siteConfig.logo_url"
            :alt="siteConfig.site_name"
            class="h-9 w-auto object-contain"
          />
          <span
            v-else
            class="text-xl font-bold tracking-tight"
            :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }"
          >
            {{ siteConfig?.site_name || 'Store' }}
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-0.5">
          <NuxtLink
            to="/"
            class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            active-class="!text-primary-600 !bg-primary-50 hover:!bg-primary-50"
          >Home</NuxtLink>
          <NuxtLink
            to="/shop"
            class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            active-class="!text-primary-600 !bg-primary-50 hover:!bg-primary-50"
          >Shop</NuxtLink>
          <NuxtLink
            to="/about"
            class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            active-class="!text-primary-600 !bg-primary-50 hover:!bg-primary-50"
          >About</NuxtLink>
          <NuxtLink
            to="/contact"
            class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            active-class="!text-primary-600 !bg-primary-50 hover:!bg-primary-50"
          >Contact</NuxtLink>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-1.5">

          <!-- Admin pill (desktop) -->
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </NuxtLink>

          <!-- Cart -->
          <NuxtLink
            to="/cart"
            class="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
            >
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <!-- Mobile hamburger / close -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
          <nav class="flex flex-col gap-0.5">
            <NuxtLink
              to="/"
              class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              active-class="!text-primary-600 !bg-primary-50"
              @click="mobileMenuOpen = false"
            >Home</NuxtLink>
            <NuxtLink
              to="/shop"
              class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              active-class="!text-primary-600 !bg-primary-50"
              @click="mobileMenuOpen = false"
            >Shop</NuxtLink>
            <NuxtLink
              to="/about"
              class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              active-class="!text-primary-600 !bg-primary-50"
              @click="mobileMenuOpen = false"
            >About</NuxtLink>
            <NuxtLink
              to="/contact"
              class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              active-class="!text-primary-600 !bg-primary-50"
              @click="mobileMenuOpen = false"
            >Contact</NuxtLink>
            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin"
              class="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              @click="mobileMenuOpen = false"
            >Admin</NuxtLink>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const authStore = useAuthStore()
const { siteConfig } = useSiteConfig()
const mobileMenuOpen = ref(false)
</script>
