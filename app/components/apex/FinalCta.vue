<template>
  <section class="relative overflow-hidden bg-gray-900 py-16 lg:py-20">
    <div class="absolute inset-0 bg-gradient-to-br from-[#6898ED]/20 via-transparent to-transparent" />
    <div class="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
      <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to launch your store?</h2>
      <p class="mt-4 text-gray-300">Create your account, pick a plan, and open the dashboard in minutes.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <NuxtLink :to="isAuthenticated ? '/admin' : '/register'" class="inline-flex items-center rounded-full bg-[var(--apex-action)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--apex-action-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-dark)]">Get Started</NuxtLink>
        <NuxtLink to="/admin/login" class="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apex-focus-on-dark)]">Login</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isAuthenticated: boolean
}>()
</script>
