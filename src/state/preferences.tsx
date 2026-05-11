import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { type ChairId } from '../lib/assets'
import { getFirebaseClients } from '../lib/firebase'
import { getOrCreateLocalId, readJson, writeJson } from '../lib/storage'
import { useTimeBasedBackgroundUrl } from '../lib/timeBackground'

export type Preferences = {
  chair: ChairId
}

type PreferencesContextValue = {
  preferences: Preferences
  setChair: (id: ChairId) => void
  cycleChair: () => void
}

const DEFAULT_PREFERENCES: Preferences = {
  chair: '1',
}

const STORAGE_KEY = 'digital-garden.preferences.v1'
const DEVICE_ID_KEY = 'digital-garden.deviceId.v1'

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function isValidPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<Preferences>
  const chairOk = v.chair === '1' || v.chair === '2' || v.chair === '3'
  return Boolean(chairOk)
}

async function persistToFirestore(prefs: Preferences): Promise<void> {
  const clients = getFirebaseClients()
  if (!clients) return
  const deviceId = getOrCreateLocalId(DEVICE_ID_KEY)
  await setDoc(doc(clients.db, 'preferences', deviceId), prefs, { merge: true })
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const persistTimer = useRef<number | null>(null)

  useEffect(() => {
    const stored = readJson<unknown>(STORAGE_KEY)
    if (isValidPreferences(stored)) {
      setPreferences(stored)
      return
    }
    if (stored && typeof stored === 'object') {
      const legacy = stored as Partial<{ chair: ChairId }>
      if (legacy.chair === '1' || legacy.chair === '2' || legacy.chair === '3') {
        setPreferences({ chair: legacy.chair })
      }
    }
  }, [])

  useEffect(() => {
    writeJson(STORAGE_KEY, preferences)
    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      void persistToFirestore(preferences)
    }, 400)
  }, [preferences])

  const setChair = useCallback((id: ChairId) => {
    setPreferences((p) => ({ ...p, chair: id }))
  }, [])

  const cycleChair = useCallback(() => {
    setPreferences((p) => {
      const next: ChairId = p.chair === '1' ? '2' : p.chair === '2' ? '3' : '1'
      return { ...p, chair: next }
    })
  }, [])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      setChair,
      cycleChair,
    }),
    [preferences, setChair, cycleChair],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return ctx
}

export function useBackgroundUrl(): string {
  return useTimeBasedBackgroundUrl()
}

