import { useEffect, useMemo, useRef, useState } from 'react'
import { Scene } from '../components/Scene'
import { ASSETS } from '../lib/assets'
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion'
import { useBackgroundUrl } from '../state/preferences'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function TreeRoute() {
  const backgroundUrl = useBackgroundUrl()
  const reducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [color, setColor] = useState<'amarilla' | 'rosa' | 'morada' | 'verdeOscura' | 'naranja' | 'azul'>('rosa')
  const [tema, setTema] = useState('')
  const [nota, setNota] = useState('')
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1)
      return
    }

    const durationMs = 1200
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / durationMs)
      setProgress(easeInOutCubic(t))
      if (t < 1) rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion])

  const transform = useMemo(() => {
    const startYvh = 80
    const endYvh = -50
    const startScale = 3.5
    const endScale = 1.4
    const y = startYvh + (endYvh - startYvh) * progress
    const s = startScale + (endScale - startScale) * progress
    return `translate3d(-50%, ${y}%, 0) scale(${s})`
  }, [progress])

  return (
    <Scene backgroundUrl={backgroundUrl} showHills={false} showDoorToMain>
      <div className="treeHud">
        <button type="button" className="newFlowerButton" onClick={() => setMenuOpen(true)}>
          Nueva flor
        </button>
      </div>

      <div className="treeView" aria-label="Vista del árbol">
        <img
          className="treeView__img"
          src={ASSETS.tree.base}
          alt="Árbol"
          decoding="async"
          fetchPriority="high"
          style={{ transform }}
        />
      </div>

      {menuOpen ? (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Planta una nueva flor">
          <div className="modalSheet">
            <h2 className="modalTitle">Planta una nueva flor</h2>

            <div className="modalSection">
              <div className="modalLabel">Color</div>
              <div className="colorRow" role="group" aria-label="Color">
                {(
                  [
                    { id: 'amarilla', hex: '#F7F4C5' },
                    { id: 'rosa', hex: '#FF70D6' },
                    { id: 'morada', hex: '#B88CF7' },
                    { id: 'verdeOscura', hex: '#35D3B7' },
                    { id: 'naranja', hex: '#FFD2C7' },
                    { id: 'azul', hex: '#55D7FF' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={c.id === color ? 'colorDot colorDot--active' : 'colorDot'}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setColor(c.id)}
                    aria-label={`Color ${c.id}`}
                    aria-pressed={c.id === color}
                  />
                ))}
              </div>
            </div>

            <div className="modalSection">
              <div className="modalLabel">¿Que tema representa?</div>
              <input className="modalInput" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Escribe aquí" />
            </div>

            <div className="modalSection">
              <textarea className="modalTextarea" value={nota} onChange={(e) => setNota(e.target.value)} />
            </div>

            <div className="modalActions">
              <button type="button" className="modalButton" onClick={() => setMenuOpen(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="modalButton modalButton--primary"
                onClick={() => {
                  void color
                  void tema
                  void nota
                  setMenuOpen(false)
                }}
              >
                Plantar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Scene>
  )
}

