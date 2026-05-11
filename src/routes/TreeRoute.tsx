import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { MiniDoor } from '../components/MiniDoor'
import { getFirebaseClients } from '../lib/firebase'
import { ASSETS, FLOWER_HEX_COLORS, type FlowerColor } from '../lib/assets'

const COLOR_OPTIONS: { id: FlowerColor; hex: string }[] = [
  { id: 'amarilla', hex: '#F7F4C5' },
  { id: 'rosa', hex: '#FF70D6' },
  { id: 'morada', hex: '#B88CF7' },
  { id: 'verdeOscura', hex: '#35D3B7' },
  { id: 'naranja', hex: '#FFD2C7' },
  { id: 'azul', hex: '#55D7FF' },
]

type ViewState = 'trunk' | 'auth' | 'rising' | 'tree'
type AuthMode = 'login' | 'register'

type Flower = {
  id: string
  color: FlowerColor
  tema: string
  nota: string
  createdAt: Date
}

function nameToEmail(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${slug}@reencuentro.app`
}

export function TreeRoute() {
  const navigate = useNavigate()
  const firebase = getFirebaseClients()

  const [viewState, setViewState] = useState<ViewState>('trunk')
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const [color, setColor] = useState<FlowerColor>('rosa')
  const [tema, setTema] = useState('')
  const [nota, setNota] = useState('')
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null)

  useEffect(() => {
    if (!firebase) return
    const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        loadFlowers(currentUser.uid)
        if (viewState !== 'tree' && viewState !== 'rising') {
          setViewState('tree')
        }
      }
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase])

  const loadFlowers = async (userId: string) => {
    if (!firebase) return
    try {
      const flowersRef = collection(firebase.db, 'flowers')
      const q = query(flowersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const loaded: Flower[] = snapshot.docs.map((d) => {
        const data = d.data() as { color: FlowerColor; tema: string; nota: string; createdAt?: { toDate(): Date } }
        return {
          id: d.id,
          color: data.color,
          tema: data.tema,
          nota: data.nota,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        }
      })
      setFlowers(loaded)
    } catch (error) {
      console.log('[v0] Error loading flowers:', error)
    }
  }

  const handleTrunkClick = () => {
    if (user) {
      triggerRiseAnimation()
    } else {
      setViewState('auth')
    }
  }

  const triggerRiseAnimation = () => {
    setViewState('rising')
    setTimeout(() => setViewState('tree'), 1600)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!firebase) {
      setAuthError('Firebase no está configurado. Verifica las variables de entorno.')
      return
    }

    if (!name.trim()) {
      setAuthError('Escribe un nombre')
      return
    }
    if (password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    const email = nameToEmail(name)

    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(firebase.auth, email, password)
      } else {
        await signInWithEmailAndPassword(firebase.auth, email, password)
      }
      triggerRiseAnimation()
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      const code = err.code ?? ''
      if (code === 'auth/email-already-in-use') {
        setAuthError('Ese nombre ya está en uso')
      } else if (code === 'auth/weak-password') {
        setAuthError('La contraseña debe tener al menos 6 caracteres')
      } else if (
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential'
      ) {
        setAuthError('Nombre o contraseña incorrectos')
      } else if (code === 'auth/network-request-failed') {
        setAuthError('Error de red. Revisa tu conexión.')
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Activa Email/Password en Firebase Console')
      } else {
        setAuthError(err.message ?? 'Error de autenticación')
        console.log('[v0] Auth error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlantFlower = async () => {
    if (!firebase || !user) return
    try {
      const flowersRef = collection(firebase.db, 'flowers')
      const docRef = await addDoc(flowersRef, {
        userId: user.uid,
        color,
        tema,
        nota,
        createdAt: serverTimestamp(),
      })
      const newFlower: Flower = {
        id: docRef.id,
        color,
        tema,
        nota,
        createdAt: new Date(),
      }
      setFlowers((prev) => [newFlower, ...prev])
      setMenuOpen(false)
      setTema('')
      setNota('')
    } catch (error) {
      console.log('[v0] Error planting flower:', error)
    }
  }

  // Trunk-only view (image 1)
  if (viewState === 'trunk') {
    return (
      <div className="trunkScene">
        <button
          type="button"
          className="trunkScene__trunkButton"
          onClick={handleTrunkClick}
          aria-label="Abrir el árbol"
        >
          <img
            className="trunkScene__trunkImg"
            src={ASSETS.tree.base}
            alt="Tronco del árbol"
            decoding="async"
            fetchPriority="high"
          />
        </button>
        <MiniDoor onClick={() => navigate('/main')} />
      </div>
    )
  }

  // Auth form over trunk (image 2)
  if (viewState === 'auth') {
    return (
      <div className="trunkScene">
        <img
          className="trunkScene__trunkImg"
          src={ASSETS.tree.base}
          alt="Tronco del árbol"
          decoding="async"
        />

        <div className="authOverlay">
          <form className="authSheet" onSubmit={handleAuth}>
            <h2 className="authTitle">
              {authMode === 'register' ? 'Crea tu árbol' : 'Entra a tu árbol'}
            </h2>
            <p className="authSubtitle">Rellena los datos y cultiva tus pensamientos</p>

            <div className="authField">
              <label className="authLabel" htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                className="authInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe aquí"
                autoComplete="username"
                required
              />
            </div>

            <div className="authField">
              <label className="authLabel" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="authInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escribe aquí"
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={6}
              />
            </div>

            {authError && <p className="authError">{authError}</p>}

            <div className="authActions">
              <button
                type="button"
                className="authButton authButton--ghost"
                onClick={() => setViewState('trunk')}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button type="submit" className="authButton authButton--primary" disabled={isLoading}>
                {isLoading ? '...' : 'Plantar'}
              </button>
            </div>

            <button
              type="button"
              className="authSwitch"
              onClick={() => {
                setAuthError('')
                setAuthMode(authMode === 'register' ? 'login' : 'register')
              }}
            >
              {authMode === 'register'
                ? '¿Ya tienes un árbol? Entra aquí'
                : '¿No tienes un árbol? Créalo aquí'}
            </button>
          </form>
        </div>

        <MiniDoor onClick={() => navigate('/main')} />
      </div>
    )
  }

  // Rising animation OR Full tree view
  const isRising = viewState === 'rising'

  return (
    <div className={`treeFullView ${isRising ? 'treeFullView--rising' : ''}`}>
      {!isRising && (
        <div className="treeHud">
          <button type="button" className="newFlowerButton" onClick={() => setMenuOpen(true)}>
            Nueva flor
          </button>
        </div>
      )}

      <div className="treeFullView__imgWrapper">
        <img
          className="treeFullView__img"
          src={ASSETS.tree.base}
          alt="Árbol"
          decoding="async"
          fetchPriority="high"
        />

        {!isRising && (
          <div className="treeFlowers">
            {flowers.map((flower, index) => (
              <button
                key={flower.id}
                type="button"
                className="treeFlower"
                style={{
                  left: `${28 + (index % 5) * 11}%`,
                  top: `${18 + Math.floor(index / 5) * 14}%`,
                }}
                onClick={() => setSelectedFlower(flower)}
                aria-label={`Flor ${flower.tema || flower.color}`}
              >
                <img src={ASSETS.tree.flor[flower.color]} alt="" className="treeFlower__img" />
              </button>
            ))}
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
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
      )}

      {selectedFlower && (
        <div
          className="flowerInterior"
          style={{
            background: `linear-gradient(180deg, ${FLOWER_HEX_COLORS[selectedFlower.color]} 0%, #FFFDE7 100%)`,
          }}
          onClick={() => setSelectedFlower(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="flowerInterior__content" onClick={(e) => e.stopPropagation()}>
            <div className="flowerInterior__header">
              <img
                src={ASSETS.tree.flor[selectedFlower.color]}
                alt=""
                className="flowerInterior__icon"
              />
              <h2 className="flowerInterior__title">{selectedFlower.tema || 'Mi flor'}</h2>
            </div>

            <div className="flowerInterior__info">
              <div className="flowerInterior__infoRow">
                <span className="flowerInterior__label">Empezó</span>
                <span className="flowerInterior__value">
                  {selectedFlower.createdAt.toLocaleDateString('es-ES', {
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
              onClick={() => setSelectedFlower(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <MiniDoor onClick={() => navigate('/main')} />
    </div>
  )
}
