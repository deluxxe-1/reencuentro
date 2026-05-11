import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scene } from '../components/Scene'
import { ASSETS } from '../lib/assets'
import { useBackgroundUrl } from '../state/preferences'

export function StartRoute() {
  const navigate = useNavigate()
  const backgroundUrl = useBackgroundUrl()

  useEffect(() => {
    const id = window.setTimeout(() => navigate('/main', { replace: true }), 2000)
    return () => window.clearTimeout(id)
  }, [navigate])

  return (
    <Scene backgroundUrl={backgroundUrl} showHills={false} showGround={false}>
      <img className="loadingArt" src={ASSETS.loading.start} alt="" decoding="async" fetchPriority="high" />
      <div className="loadingOverlay" aria-hidden="true" />
    </Scene>
  )
}

