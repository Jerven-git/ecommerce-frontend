interface ModelChangedPayload {
  model: string
  id: number | string
  action: 'created' | 'updated' | 'deleted'
  data: Record<string, any>
  timestamp: string
}

interface DeploymentPayload {
  version: string
  timestamp: string
}

interface RealtimeCallbacks {
  onModelChanged?: (data: ModelChangedPayload) => void
  onDeployment?: (data: DeploymentPayload) => void
}

export function useRealtime(callbacks?: RealtimeCallbacks) {
  const { $getEcho, $apiFetch } = useNuxtApp() as {
    $getEcho: () => Promise<any | null>
    $apiFetch: typeof $fetch
  }
  const realtimeStore = useRealtimeStore()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()

  let echo: any = null
  let channel: any = null
  let connection: any = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let stopRouteWatch: (() => void) | null = null
  let connectPromise: Promise<void> | null = null
  let started = false
  let disposed = false

  const excludedRoutePrefixes = [
    '/admin/login',
    '/admin/verify-2fa',
    '/super-admin/login',
    '/register',
    '/subscribe',
  ]

  const shouldSkipRealtime = (path: string) => excludedRoutePrefixes.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`),
  )

  const handleConnected = () => realtimeStore.setConnected(true)
  const handleDisconnected = () => realtimeStore.setConnected(false)

  async function connect() {
    if (started || connectPromise || disposed) return
    started = true

    connectPromise = (async () => {
      echo = await $getEcho()

      if (disposed) {
        echo?.disconnect()
        echo = null
        return
      }

      if (!echo) {
        console.warn('[Realtime] Echo not available, using version polling only')
        startVersionPolling()
        return
      }

      channel = echo.channel('ssu.updates')

      channel.listen('.model.changed', (data: ModelChangedPayload) => {
        callbacks?.onModelChanged?.(data)
      })

      channel.listen('.deployment.new', (data: DeploymentPayload) => {
        realtimeStore.checkVersion(data.version)
        callbacks?.onDeployment?.(data)
      })

      connection = echo.connector?.pusher?.connection
      if (connection) {
        connection.bind('connected', handleConnected)
        connection.bind('disconnected', handleDisconnected)
        connection.bind('unavailable', handleDisconnected)
        connection.bind('failed', handleDisconnected)

        if (connection.state === 'connected') {
          handleConnected()
        }
      }

      startVersionPolling()
    })().catch((error) => {
      started = false
      realtimeStore.setConnected(false)
      console.warn('[Realtime] Echo initialization failed, using version polling only', error)
      startVersionPolling()
    }).finally(() => {
      connectPromise = null
    })

    await connectPromise
  }

  function startVersionPolling() {
    if (pollTimer) return

    pollTimer = setInterval(async () => {
      try {
        const res = await $apiFetch<{ version: string }>('/version', {
          baseURL: `${runtimeConfig.public.apiBase || ''}/api`,
        })
        realtimeStore.checkVersion(res.version)
      } catch {
        // silent fail - version polling is best-effort
      }
    }, 60_000)
  }

  function disconnect() {
    disposed = true
    stopRouteWatch?.()
    stopRouteWatch = null

    if (connection) {
      connection.unbind('connected', handleConnected)
      connection.unbind('disconnected', handleDisconnected)
      connection.unbind('unavailable', handleDisconnected)
      connection.unbind('failed', handleDisconnected)
      connection = null
    }

    if (echo) {
      echo.leave('ssu.updates')
      echo.disconnect()
      echo = null
      channel = null
    }

    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    realtimeStore.setConnected(false)
  }

  if (import.meta.client) {
    onMounted(() => {
      stopRouteWatch = watch(
        () => route.path,
        (path) => {
          if (!started && !shouldSkipRealtime(path)) {
            void connect()
          }
        },
        { immediate: true },
      )
    })

    onUnmounted(() => {
      disconnect()
    })
  }

  return { connect, disconnect }
}
