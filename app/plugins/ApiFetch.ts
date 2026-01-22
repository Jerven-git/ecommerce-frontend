export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();

    const getCookie = (name: string) => {
        if (!process.client) return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const apiFetch = $fetch.create({
        baseURL: `${config.public.apiBase}${config.public.apiPath}`,
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        onRequest({ options }) {
            if (process.client) {
                const headers: Record<string, string> = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };

                // Get XSRF token from cookie for CSRF protection
                const xsrfToken = getCookie('XSRF-TOKEN');
                if (xsrfToken) {
                    headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
                }

                (options as any).headers = headers;
            }
        },
        onResponseError({ response }) {
            if (response.status === 419) {
                console.error('CSRF token mismatch - token may have expired');
            } else if (response.status === 401) {
                console.error('Unauthorized - user may need to login again');
            } else {
                console.error('API Error:', response.status, response.statusText);
            }
        }
    });

    return {
        provide: {
            apiFetch
        }
    };
});