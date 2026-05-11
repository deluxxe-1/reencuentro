import { useNavigate } from 'react-router-dom'
import { ChairPicker } from '../components/ChairPicker'
import { Scene } from '../components/Scene'
import { TreeHotspot } from '../components/TreeHotspot'
import { useBackgroundUrl } from '../state/preferences'

export function MainRoute() {
  const navigate = useNavigate()
  const backgroundUrl = useBackgroundUrl()

  return (
    <Scene backgroundUrl={backgroundUrl} showHills>
      <div className="mainLayout">
        <div className="mainLayout__elementsWrapper">
          <div className="mainLayout__chair">
            <ChairPicker />
          </div>
          <div className="mainLayout__tree">
            <TreeHotspot onClick={() => navigate('/tree')} />
          </div>
        </div>

        <button type="button" className="mainLayout__arrowButton" onClick={() => navigate('/estanco')}>
          <div className="mainLayout__arrow" aria-hidden="true" />
        </button>
      </div>
    </Scene>
  )
}

