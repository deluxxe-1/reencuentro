import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from 'firebase/auth'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
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

type ViewState = 'trunk' | 'auth' | 'tree'
type AuthMode = 'login' | 'register'

type Flower = {
  id: string
  color: FlowerColor
  tema: string
  nota: string
  items: FlowerItem[]
  createdAt: Date
}

type FlowerItem = {
  type: 'youtube' | 'image' | 'text'
  content: string
}

export function TreeRoute() {
  const navigate = useNavigate()
  const firebase = getFirebaseClients()
  
  const [viewState, setViewState] = useState<ViewState>('trunk')
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [email, setEmail] = useState('')
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

  // Check auth state
  useEffect(() => {
    if (!firebase) return
    
    const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        setViewState('tree')
        loadFlowers(currentUser.uid)
      }
    })
    
    return () => unsubscribe()
  }, [firebase])

  const loadFlowers = async (userId: string) => {
    if (!firebase) return
    
    try {
      const flowersRef = collection(firebase.db, 'flowers')
      const q = query(flowersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const loadedFlowers: Flower[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Flower[]
      setFlowers(loadedFlowers)
    } catch (error) {
      console.log('[v0] Error loading flowers:', error)
    }
  }

  const handleTrunkClick = () => {
    if (user) {
      setViewState('tree')
    } else {
      setViewState('auth')
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebase) {
      setAuthError('Firebase no está configurado')
      return
    }
    
    setIsLoading(true)
    setAuthError('')
    
    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(firebase.auth, email, password)
      } else {
        await signInWithEmailAndPassword(firebase.auth, email, password)
      }
      setViewState('tree')
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      if (firebaseError.code === 'auth/email-already-in-use') {
        setAuthError('Este email ya está registrado')
      } else if (firebaseError.code === 'auth/weak-password') {
        setAuthError('La contraseña debe tener al menos 6 caracteres')
      } else if (firebaseError.code === 'auth/invalid-email') {
        setAuthError('Email inválido')
      } else if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
        setAuthError('Email o contraseña incorrectos')
      } else {
        setAuthError(firebaseError.message || 'Error de autenticación')
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
        items: [],
        createdAt: serverTimestamp(),
      })
      
      const newFlower: Flower = {
        id: docRef.id,
        color,
        tema,
        nota,
        items: [],
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

  // Trunk View with gradient background
  if (viewState === 'trunk') {
    return (
      <div className="trunkView" onClick={handleTrunkClick}>
        <img
          className="trunkView__img"
          src={ASSETS.tree.base}
          alt="Tronco del árbol"
          decoding="async"
          fetchPriority="high"
        />
        <MiniDoor onClick={() => navigate('/')} />
      </div>
    )
  }

  // Auth View
  if (viewState === 'auth') {
    return (
      <div className="trunkView">
        <img
          className="trunkView__img"
          src={ASSETS.tree.base}
          alt="Tronco del árbol"
          decoding="async"
        />
        
        <div className="authOverlay">
          <form className="authSheet" onSubmit={handleAuth}>
            <h2 className="authTitle">
              {authMode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión'}
            </h2>
            
            <div className="authField">
              <input
                type="email"
                className="authInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            
            <div className="authField">
              <input
                type="password"
                className="authInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                minLength={6}
              />
            </div>
            
            {authError && <p className="authError">{authError}</p>}
            
            <button type="submit" className="authButton" disabled={isLoading}>
              {isLoading ? 'Cargando...' : authMode === 'register' ? 'Registrarse' : 'Entrar'}
            </button>
            
            <button
              type="button"
              className="authSwitch"
              onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
            >
              {authMode === 'register' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </form>
        </div>
        
        <MiniDoor onClick={() => navigate('/')} />
      </div>
    )
  }

  // Tree View with flowers
  return (
    <div className="treeFullView">
      <div className="treeHud">
        <button type="button" className="newFlowerButton" onClick={() => setMenuOpen(true)}>
          Nueva flor
        </button>
      </div>

      <div className="treeView" aria-label="Vista del árbol">
        <img
          className="treeView__img treeView__img--centered"
          src={ASSETS.tree.base}
          alt="Árbol"
          decoding="async"
          fetchPriority="high"
        />
        
        {/* Render planted flowers on the tree */}
        <div className="treeFlowers">
          {flowers.map((flower, index) => (
            <button
              key={flower.id}
              type="button"
              className="treeFlower"
              style={{
                left: `${30 + (index % 5) * 10}%`,
                top: `${20 + Math.floor(index / 5) * 15}%`,
              }}
              onClick={() => setSelectedFlower(flower)}
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
      {menuOpen && (
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
      )}

      {/* Flower Interior View */}
      {selectedFlower && (
        <div
          className="flowerInterior"
          style={{ background: `linear-gradient(180deg, ${FLOWER_HEX_COLORS[selectedFlower.color]} 0%, #FFFDE7 100%)` }}
          onClick={() => setSelectedFlower(null)}
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
              aria-label="Cerrar"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <MiniDoor onClick={() => navigate('/')} />
    </div>
  )
}
