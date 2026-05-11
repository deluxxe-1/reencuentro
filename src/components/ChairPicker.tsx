import { ASSETS } from '../lib/assets'
import { usePreferences } from '../state/preferences'

export function ChairPicker() {
  const { preferences, cycleChair } = usePreferences()
  const chairUrl = ASSETS.main.chairs[preferences.chair]

  return (
    <div className="chair">
      <button type="button" className="chair__imageButton" onClick={cycleChair} aria-label="Cambiar silla">
        <img className="chair__image" src={chairUrl} alt="Silla" decoding="async" fetchPriority="high" />
      </button>
    </div>
  )
}

