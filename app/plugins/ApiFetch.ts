export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const incomingHeaders = import.meta.server
        ? useRequestHeaders(['host', 'cookie', 'x-forwarded-host', 'x-forwarded-proto'])
        : {}

    const getCookie = (name: string) => {
        if (!process.client) return null
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(";").shift()
        return null
    }

    const apiFetch = $fetch.create({
        baseURL: `${import.meta.server ? config.apiBase : (config.public.apiBase || '')}${config.public.apiPath}`,
        credentials: "include",

        // ✅ don't hardcode Content-Type here (it breaks FormData)
        headers: {
            Accept: "application/json",
        },

    onRequest({ options }) {
        // determine if this request is sending FormData
        const isFormData = options.body instanceof FormData

        const headers = new Headers(options.headers)
        headers.set("Accept", "application/json")

        // ✅ only set JSON content-type when NOT FormData
        if (!isFormData) {
        headers.set("Content-Type", "application/json")
        }

        // Get XSRF token from cookie for CSRF protection (Sanctum)
        if (process.client) {
            const xsrfToken = getCookie("XSRF-TOKEN")
            if (xsrfToken) {
                headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrfToken))
            }
        }

        // During SSR the API request travels over the internal Docker host, but
        // tenancy must still resolve from the visitor's original hostname.
        if (import.meta.server) {
            const forwardedHost = incomingHeaders['x-forwarded-host'] || incomingHeaders.host
            const forwardedProto = incomingHeaders['x-forwarded-proto']

            if (forwardedHost) {
                headers.set('host', forwardedHost)
                headers.set('x-forwarded-host', forwardedHost)
            }
            if (forwardedProto) headers.set('x-forwarded-proto', forwardedProto)
            if (incomingHeaders.cookie) headers.set('cookie', incomingHeaders.cookie)
        }

        options.headers = headers
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
