declare module '#app' {
    interface NuxtApp {
        $apiFetch: typeof $fetch
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $apiFetch: typeof $fetch
    }
}

declare global {
    interface Window {
        grecaptcha: {
            ready(cb: () => void): void
            execute(siteKey: string, options: { action: string }): Promise<string>
        }
    }
}

export {}