import { Scene } from '../components/Scene'
import { ASSETS } from '../lib/assets'
import { useBackgroundUrl } from '../state/preferences'

export function EstancoRoute() {
  const backgroundUrl = useBackgroundUrl()

  return (
    <Scene backgroundUrl={backgroundUrl} showHills={false} showDoorToMain>
      <div className="estancoView" aria-label="Estanco">
        <img className="estancoView__base" src={ASSETS.estanco.base} alt="Estanco" decoding="async" fetchPriority="high" />
        <img
          className="estancoView__piedra"
          src={ASSETS.estanco.piedra}
          alt=""
          decoding="async"
          loading="lazy"
        />
      </div>
    </Scene>
  )
}

