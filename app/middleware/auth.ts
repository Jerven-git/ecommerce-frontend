export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    await authStore.checkAuth()

    if (!authStore.isAdmin && to.path.startsWith('/admin') && to.path !== '/admin/login') {
        return navigateTo('/admin/login')
    }

    if (authStore.isAdmin && to.path === '/admin/login') {
        return navigateTo('/admin')
    }
})