import { ASSETS } from '../lib/assets'
import { MiniDoor } from './MiniDoor'

type SceneProps = {
  backgroundUrl: string
  showHills?: boolean
  showGround?: boolean
  showClouds?: boolean
  showDoorToMain?: boolean
  children?: React.ReactNode
}

export function Scene({
  backgroundUrl,
  showHills = true,
  showGround = false,
  showClouds = true,
  showDoorToMain = false,
  children,
}: SceneProps) {
  return (
    <div className="scene" style={{ backgroundImage: `url("${backgroundUrl}")` }}>
      {showClouds ? (
        <>
          <img
            className="scene__cloud scene__cloud--1"
            src={ASSETS.clouds.nube1}
            alt=""
            decoding="async"
            loading="eager"
          />
          <img
            className="scene__cloud scene__cloud--2"
            src={ASSETS.clouds.nube2}
            alt=""
            decoding="async"
            loading="eager"
          />
        </>
      ) : null}

      {showGround ? <div className="scene__ground" /> : null}
      {showHills ? (
        <img
          className={showGround ? 'scene__hills scene__hills--lifted' : 'scene__hills'}
          src={ASSETS.main.hills}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      ) : null}

      <div className="scene__content">{children}</div>
      {showDoorToMain ? <MiniDoor /> : null}
    </div>
  )
}

