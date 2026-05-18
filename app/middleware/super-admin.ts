export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  await authStore.checkAuth()

  if (!authStore.isSuperAdmin) {
    return navigateTo('/admin')
  }
})
