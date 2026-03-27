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
  const { $echo, $apiFetch } = useNuxtApp() as {
    $echo: any
    $apiFetch: typeof $fetch
  }
  const realtimeStore = useRealtimeStore()

  let pollTimer: ReturnType<typeof setInterval> | null = null

  function connect() {
    if (!$echo) {
      console.warn('[Realtime] Echo not available, using polling only')
      startVersionPolling()
      return
    }

    const channel = $echo.channel('ssu.updates')

    channel.listen('.model.changed', (data: ModelChangedPayload) => {
      callbacks?.onModelChanged?.(data)
    })

    channel.listen('.deployment.new', (data: DeploymentPayload) => {
      realtimeStore.checkVersion(data.version)
      callbacks?.onDeployment?.(data)
    })

    realtimeStore.setConnected(true)
    startVersionPolling()
  }

  function startVersionPolling() {
    pollTimer = setInterval(async () => {
      try {
        const res = await $apiFetch<{ version: string }>('/version', {
          baseURL: useRuntimeConfig().public.apiBase as string + '/api',
        })
        realtimeStore.checkVersion(res.version)
      } catch {
        // silent fail - version polling is best-effort
      }
    }, 60_000)
  }

  function disconnect() {
    if ($echo) {
      $echo.leave('ssu.updates')
    }
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    realtimeStore.setConnected(false)
  }

  if (import.meta.client) {
    onMounted(() => {
      connect()
    })

    onUnmounted(() => {
      disconnect()
    })
  }

  return { connect, disconnect }
}
