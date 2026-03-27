import { defineStore } from 'pinia'

export const useRealtimeStore = defineStore('realtime', {
  state: () => ({
    connected: false,
    currentVersion: null as string | null,
    newVersionAvailable: false,
    latestVersion: null as string | null,
  }),

  actions: {
    setConnected(val: boolean) {
      this.connected = val
    },

    checkVersion(serverVersion: string) {
      if (!this.currentVersion) {
        this.currentVersion = serverVersion
        return
      }
      if (this.currentVersion !== serverVersion) {
        this.latestVersion = serverVersion
        this.newVersionAvailable = true
      }
    },

    reload() {
      window.location.reload()
    },
  },
})
