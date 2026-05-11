import { useEffect, useState } from 'react'
import { ASSETS, type BackgroundId } from './assets'

export function backgroundForHour(hour: number): BackgroundId {
  if (hour >= 6 && hour < 17) return 'mañana'
  if (hour >= 17 && hour < 20) return 'atardecer'
  return 'noche'
}

function currentBackground(): BackgroundId {
  return backgroundForHour(new Date().getHours())
}

export function useTimeBasedBackgroundId(): BackgroundId {
  const [bg, setBg] = useState<BackgroundId>(() => currentBackground())

  useEffect(() => {
    const update = () => setBg(currentBackground())
    update()

    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return bg
}

export function useTimeBasedBackgroundUrl(): string {
  const id = useTimeBasedBackgroundId()
  return ASSETS.backgrounds[id]
}

