import { useEffect, useMemo, useRef, useState } from 'react'
import { Scene } from '../components/Scene'
import { ASSETS, FLOWER_HEX_COLORS, type FlowerColor } from '../lib/assets'
import { addFlower, getFlowers, type Flower } from '../lib/flowers'
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion'
import { useBackgroundUrl } from '../state/preferences'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const COLOR_OPTIONS: { id: FlowerColor; hex: string }[] = [
  { id: 'amarilla', hex: '#F7F4C5' },
  { id: 'rosa', hex: '#FF70D6' },
  { id: 'morada', hex: '#B88CF7' },
  { id: 'verdeOscura', hex: '#35D3B7' },
  { id: 'naranja', hex: '#FFD2C7' },
  { id: 'azul', hex: '#55D7FF' },
]

export function TreeRoute() {
  const backgroundUrl = useBackgroundUrl()
  const reducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [color, setColor] = useState<FlowerColor>('rosa')
  const [tema, setTema] = useState('')
  const [nota, setNota] = useState('')
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    setFlowers(getFlowers())
  }, [])

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

  const handlePlantFlower = () => {
    const newFlower = addFlower({ color, tema, nota })
    setFlowers((prev) => [...prev, newFlower])
    setMenuOpen(false)
    setTema('')
    setNota('')
  }

  const handleFlowerClick = (flower: Flower) => {
    setSelectedFlower(flower)
  }

  const closeFlowerView = () => {
    setSelectedFlower(null)
  }

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
        
        {/* Render planted flowers on the tree */}
        <div className="treeFlowers" style={{ opacity: progress }}>
          {flowers.map((flower, index) => (
            <button
              key={flower.id}
              type="button"
              className="treeFlower"
              style={{
                left: `${30 + (index % 5) * 10}%`,
                top: `${20 + Math.floor(index / 5) * 15}%`,
              }}
              onClick={() => handleFlowerClick(flower)}
              aria-label={`Flor ${flower.tema || flower.color}`}
            >
              <img
                src={ASSETS.tree.flor[flower.color]}
                alt=""
                className="treeFlower__img"
              />
            </button>
          ))}
        </div>
      </div>

      {/* New Flower Modal */}
      {menuOpen ? (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Planta una nueva flor">
          <div className="modalSheet">
            <h2 className="modalTitle">Planta una nueva flor</h2>

            <div className="modalSection">
              <div className="modalLabel">Color</div>
              <div className="colorRow" role="group" aria-label="Color">
                {COLOR_OPTIONS.map((c) => (
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
              <input
                className="modalInput"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Escribe aquí"
              />
            </div>

            <div className="modalSection">
              <textarea
                className="modalTextarea"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe tu nota aquí..."
              />
            </div>

            <div className="modalActions">
              <button type="button" className="modalButton" onClick={() => setMenuOpen(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="modalButton modalButton--primary"
                onClick={handlePlantFlower}
              >
                Plantar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Flower Interior View */}
      {selectedFlower ? (
        <div
          className="flowerInterior"
          style={{ background: `linear-gradient(180deg, ${FLOWER_HEX_COLORS[selectedFlower.color]} 0%, #FFFDE7 100%)` }}
          onClick={closeFlowerView}
          role="dialog"
          aria-modal="true"
          aria-label={`Interior de flor ${selectedFlower.tema}`}
        >
          <div className="flowerInterior__content" onClick={(e) => e.stopPropagation()}>
            <div className="flowerInterior__header">
              <img src={ASSETS.tree.flor[selectedFlower.color]} alt="" className="flowerInterior__icon" />
              <h2 className="flowerInterior__title">{selectedFlower.tema || 'Mi flor'}</h2>
            </div>
            
            <div className="flowerInterior__info">
              <div className="flowerInterior__infoRow">
                <span className="flowerInterior__label">Empezó</span>
                <span className="flowerInterior__value">
                  {new Date(selectedFlower.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>

            {selectedFlower.nota && (
              <div className="flowerInterior__card">
                <p className="flowerInterior__nota">{selectedFlower.nota}</p>
              </div>
            )}

            <button
              type="button"
              className="flowerInterior__close"
              onClick={closeFlowerView}
              aria-label="Cerrar"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </Scene>
  )
}
