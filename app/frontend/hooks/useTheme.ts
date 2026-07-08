import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'zen-theme'

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  return stored ?? 'dark'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemPreference() : mode
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode)
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(getStoredMode()))

  // Apply theme to document and sync resolved state
  useEffect(() => {
    const actual = resolveTheme(mode)
    setResolved(actual)
    document.documentElement.setAttribute('data-theme', actual)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolved(getSystemPreference())
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  const toggle = useCallback(() => {
    setMode(prev => {
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'system'
      return 'dark'
    })
  }, [])

  return { mode, resolved, setMode, toggle }
}
