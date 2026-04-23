// Manages UI theme persistence and DOM application.
export const THEME_STORAGE_KEY = 'smartapply_theme'

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
}

const isValidTheme = (value) => value === THEMES.DARK || value === THEMES.LIGHT

const getStoredTheme = () => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isValidTheme(value) ? value : null
  } catch {
    return null
  }
}

export const getResolvedTheme = () => getStoredTheme() || THEMES.DARK

export const applyTheme = (theme) => {
  const nextTheme = isValidTheme(theme) ? theme : THEMES.DARK
  document.documentElement.setAttribute('data-theme', nextTheme)
  document.body?.setAttribute('data-theme', nextTheme)
  return nextTheme
}

export const initializeTheme = () => applyTheme(getResolvedTheme())

export const setThemePreference = (theme) => {
  const nextTheme = applyTheme(theme)
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  } catch {
    // Ignore storage failures (private mode, browser policy, etc.)
  }
  return nextTheme
}

export const toggleTheme = (currentTheme) =>
  setThemePreference(currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK)
