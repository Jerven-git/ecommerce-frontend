declare global {
  interface Window {
    Pusher?: any
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let echoPromise: Promise<any | null> | null = null

  const getEcho = () => {
    if (!config.public.reverbAppKey) {
      console.warn('[Realtime] No Reverb app key configured, skipping Echo initialization')
      return Promise.resolve(null)
    }

    if (!echoPromise) {
      echoPromise = Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]).then(([{ default: Echo }, { default: Pusher }]) => {
        window.Pusher = Pusher

        return new Echo({
          broadcaster: 'reverb',
          key: config.public.reverbAppKey,
          wsHost: config.public.reverbHost,
          wsPort: Number(config.public.reverbPort),
          wssPort: Number(config.public.reverbPort),
          forceTLS: config.public.reverbScheme === 'https',
          enabledTransports: ['ws', 'wss'],
          disableStats: true,
        })
      })
    }

    return echoPromise
  }

  return {
    provide: {
      getEcho,
    },
  }
})
