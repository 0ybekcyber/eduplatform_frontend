import { defineStore } from 'pinia'

const THEME_KEY = 'portal_theme_mode'

const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.toggle('theme-dark', theme === 'dark')
  root.classList.toggle('theme-light', theme !== 'dark')
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
}

if (typeof window !== 'undefined') {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light')
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem(THEME_KEY) || 'light'
  }),
  getters: {
    isDark: (state) => state.mode === 'dark'
  },
  actions: {
    initTheme() {
      applyTheme(this.mode)
    },
    setTheme(mode) {
      this.mode = mode === 'dark' ? 'dark' : 'light'
      localStorage.setItem(THEME_KEY, this.mode)
      applyTheme(this.mode)
    },
    toggleTheme() {
      this.setTheme(this.mode === 'dark' ? 'light' : 'dark')
    }
  }
})
