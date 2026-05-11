export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function getOrCreateLocalId(key: string): string {
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `anon_${Math.random().toString(16).slice(2)}_${Date.now()}`
  try {
    localStorage.setItem(key, id)
  } catch {
    return id
  }
  return id
}

