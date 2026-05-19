const guestPages = ['/admin/login', '/admin/forgot-password', '/admin/reset-password', '/admin/verify-2fa']

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    await authStore.checkAuth()

    if (!authStore.isAdmin && to.path.startsWith('/admin') && !guestPages.includes(to.path)) {
        return navigateTo('/admin/login')
    }

    if (authStore.isAdmin && to.path === '/admin/login') {
        return navigateTo(authStore.isSuperAdmin ? '/super-admin' : '/admin')
    }

    // Super admins do not have a store and must not see the store-admin shell
    // (it would render the default store's theme). They live under /super-admin.
    // While impersonating, the session user is the impersonated admin
    // (isSuperAdmin === false), so this branch is naturally skipped.
    if (
        authStore.isSuperAdmin
        && !authStore.isImpersonating
        && to.path.startsWith('/admin')
        && !guestPages.includes(to.path)
    ) {
        return navigateTo('/super-admin')
    }
})