import { useNavigate } from 'react-router-dom'

type MiniDoorProps = {
  onClick?: () => void
}

export function MiniDoor({ onClick }: MiniDoorProps) {
  const navigate = useNavigate()
  const handleClick = onClick ?? (() => navigate('/main'))
  return (
    <button type="button" className="miniDoor" onClick={handleClick} aria-label="Ir al jardín">
      <span className="miniDoor__shape" aria-hidden="true" />
    </button>
  )
}

