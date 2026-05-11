import { useNavigate } from 'react-router-dom'

export function MiniDoor() {
  const navigate = useNavigate()
  return (
    <button type="button" className="miniDoor" onClick={() => navigate('/main')} aria-label="Ir al jardín">
      <span className="miniDoor__shape" aria-hidden="true" />
    </button>
  )
}

