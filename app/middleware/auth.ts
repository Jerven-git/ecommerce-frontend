const guestPages = ['/admin/login', '/admin/forgot-password', '/admin/reset-password', '/admin/verify-2fa']

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    await authStore.checkAuth()

    if (!authStore.isAdmin && to.path.startsWith('/admin') && !guestPages.includes(to.path)) {
        return navigateTo('/admin/login')
    }

    if (authStore.isAdmin && to.path === '/admin/login') {
        return navigateTo('/admin')
    }
})