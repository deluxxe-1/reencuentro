import { useCallback, useEffect, useRef, useState } from 'react'
import { Scene } from '../components/Scene'
import { ASSETS } from '../lib/assets'
import { useBackgroundUrl } from '../state/preferences'

type StoneState = 'idle' | 'writing' | 'draggable' | 'dragging' | 'splashing' | 'hidden'

export function EstancoRoute() {
  const backgroundUrl = useBackgroundUrl()
  const [stoneState, setStoneState] = useState<StoneState>('idle')
  const [text, setText] = useState('')
  const [stonePos, setStonePos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [splashPos, setSplashPos] = useState({ x: 0, y: 0 })
  const stoneRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when writing starts
  useEffect(() => {
    if (stoneState === 'writing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [stoneState])

  const handleStoneClick = () => {
    if (stoneState === 'idle') {
      setStoneState('writing')
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim()) {
      setStoneState('draggable')
    }
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (stoneState !== 'draggable') return

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      if (stoneRef.current) {
        const rect = stoneRef.current.getBoundingClientRect()
        setDragOffset({
          x: clientX - rect.left - rect.width / 2,
          y: clientY - rect.top - rect.height / 2,
        })
        setStonePos({
          x: clientX - dragOffset.x,
          y: clientY - dragOffset.y,
        })
      }
      setStoneState('dragging')
    },
    [stoneState, dragOffset]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (stoneState !== 'dragging') return

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      setStonePos({
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y,
      })
    },
    [stoneState, dragOffset]
  )

  const handleMouseUp = useCallback(() => {
    if (stoneState !== 'dragging') return

    // Check if dropped in water area (upper portion of screen)
    const waterZone = window.innerHeight * 0.65
    if (stonePos.y < waterZone) {
      setSplashPos({ x: stonePos.x, y: stonePos.y })
      setStoneState('splashing')
      setTimeout(() => {
        setStoneState('hidden')
        // Reset after animation
        setTimeout(() => {
          setStoneState('idle')
          setText('')
          setStonePos({ x: 0, y: 0 })
        }, 500)
      }, 800)
    } else {
      setStoneState('draggable')
    }
  }, [stoneState, stonePos])

  useEffect(() => {
    if (stoneState === 'dragging') {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove)
      window.addEventListener('touchend', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleMouseMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [stoneState, handleMouseMove, handleMouseUp])

  const isDragging = stoneState === 'dragging'
  const showStone = stoneState !== 'hidden' && stoneState !== 'splashing'
  const isInteractive = stoneState === 'draggable' || stoneState === 'dragging'

  return (
    <Scene backgroundUrl={backgroundUrl} showHills={false} showDoorToMain>
      <div className="estancoView" aria-label="Estanco">
        <img
          className="estancoView__base"
          src={ASSETS.estanco.base}
          alt="Estanco"
          decoding="async"
          fetchPriority="high"
        />

        {/* Text input above stone */}
        {stoneState === 'writing' && (
          <div className="estancoView__inputContainer">
            <input
              ref={inputRef}
              type="text"
              className="estancoView__input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Escribe lo que pesa y desaparecerá"
              aria-label="Escribe lo que te pesa"
            />
          </div>
        )}

        {/* Stone */}
        {showStone && (
          <div
            ref={stoneRef}
            className={`estancoView__piedraWrapper ${isInteractive ? 'estancoView__piedraWrapper--draggable' : ''} ${isDragging ? 'estancoView__piedraWrapper--dragging' : ''}`}
            style={
              isDragging
                ? {
                    position: 'fixed',
                    left: stonePos.x,
                    top: stonePos.y,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'grabbing',
                  }
                : undefined
            }
            onClick={handleStoneClick}
            onMouseDown={isInteractive ? handleMouseDown : undefined}
            onTouchStart={isInteractive ? handleMouseDown : undefined}
            role={stoneState === 'idle' ? 'button' : undefined}
            aria-label={stoneState === 'idle' ? 'Click para escribir' : undefined}
          >
            <img
              className="estancoView__piedra"
              src={ASSETS.estanco.piedra}
              alt=""
              decoding="async"
              loading="lazy"
            />
            {text && stoneState !== 'idle' && (
              <span className="estancoView__piedraText">{text}</span>
            )}
          </div>
        )}

        {/* Water splash animation */}
        {stoneState === 'splashing' && (
          <div
            className="estancoView__splash"
            style={{ left: splashPos.x, top: splashPos.y }}
          >
            <div className="estancoView__ripple estancoView__ripple--1" />
            <div className="estancoView__ripple estancoView__ripple--2" />
            <div className="estancoView__ripple estancoView__ripple--3" />
          </div>
        )}
      </div>
    </Scene>
  )
}
