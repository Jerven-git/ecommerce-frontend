export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const getCookie = (name: string) => {
        if (!process.client) return null
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(";").shift()
        return null
    }

    const apiFetch = $fetch.create({
        baseURL: `${config.public.apiBase}${config.public.apiPath}`,
        credentials: "include",

        // ✅ don't hardcode Content-Type here (it breaks FormData)
        headers: {
            Accept: "application/json",
        },

    onRequest({ options }) {
        // determine if this request is sending FormData
        const isFormData = options.body instanceof FormData

        const headers: Record<string, string> = {
        Accept: "application/json",
        }

        // ✅ only set JSON content-type when NOT FormData
        if (!isFormData) {
        headers["Content-Type"] = "application/json"
        }

        // Get XSRF token from cookie for CSRF protection (Sanctum)
        if (process.client) {
        const xsrfToken = getCookie("XSRF-TOKEN")
            if (xsrfToken) {
                headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken)
            }
        }

        // merge any headers caller might pass in
        options.headers = {
        ...(options.headers as any),
        ...headers,
        } as any
    },

    onResponseError({ response }) {
            if (response.status === 419) {
            console.error("CSRF token mismatch - token may have expired")
            } else if (response.status === 403 && (response._data as any)?.code === 'account_disabled') {
                if (process.client) {
                    const authStore = useAuthStore()
                    authStore.user = null
                    authStore.isAuthenticated = false
                    authStore.twoFactorRequired = false
                    authStore.twoFactorEmail = null
                    authStore.error = (response._data as any)?.message || 'Your account has been disabled.'
                    navigateTo('/admin/login')
                }
            } else if (response.status === 401) {
            console.error("Unauthorized - user may need to login again")
            // Session expired — clear auth state and redirect to login
            if (process.client) {
                const authStore = useAuthStore()
                if (authStore.isAuthenticated) {
                    authStore.user = null
                    authStore.isAuthenticated = false
                    authStore.twoFactorRequired = false
                    authStore.twoFactorEmail = null
                    navigateTo('/admin/login')
                }
            }
            } else {
            console.error("API Error:", response.status, response.statusText)
            }
        },
    })

    return {
        provide: {
            apiFetch,
        },
    }
})