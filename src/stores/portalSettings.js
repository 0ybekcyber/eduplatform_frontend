import { defineStore } from 'pinia'

const defaultSettings = {
  autoMarkNotifications: true,
  highlightAssignments: true,
  compactCards: false,
  showQuickInsights: true,
  accent: 'sun'
}

const getKey = (userId) => `portal_settings_${userId || 'guest'}`

export const usePortalSettingsStore = defineStore('portalSettings', {
  state: () => ({
    settings: { ...defaultSettings },
    loadedFor: null
  }),
  getters: {
    autoMarkNotifications: (state) => state.settings.autoMarkNotifications,
    highlightAssignments: (state) => state.settings.highlightAssignments,
    compactCards: (state) => state.settings.compactCards,
    showQuickInsights: (state) => state.settings.showQuickInsights,
    accent: (state) => state.settings.accent
  },
  actions: {
    load(userId) {
      this.loadedFor = userId || 'guest'
      try {
        const raw = localStorage.getItem(getKey(this.loadedFor))
        this.settings = { ...defaultSettings, ...(raw ? JSON.parse(raw) : {}) }
      } catch (e) {
        this.settings = { ...defaultSettings }
      }
    },
    save(userId) {
      const key = getKey(userId || this.loadedFor)
      localStorage.setItem(key, JSON.stringify(this.settings))
    },
    update(partial, userId) {
      this.settings = { ...this.settings, ...partial }
      this.save(userId)
    }
  }
})
