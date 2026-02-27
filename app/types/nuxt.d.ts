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

declare module 'philippines' {
    interface Region {
        name: string
        long: string
        key: string
    }
    interface Province {
        name: string
        region: string
        key: string
    }
    interface City {
        name: string
        province: string
        city: boolean
    }
    const data: {
        regions: Region[]
        provinces: Province[]
        cities: City[]
    }
    export default data
}

export {}