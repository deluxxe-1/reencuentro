import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { EstancoRoute } from './routes/EstancoRoute'
import { MainRoute } from './routes/MainRoute'
import { StartRoute } from './routes/StartRoute'
import { TreeRoute } from './routes/TreeRoute'

function App() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="routeFade">
      <Routes>
        <Route path="/" element={<StartRoute />} />
        <Route path="/main" element={<MainRoute />} />
        <Route path="/tree" element={<TreeRoute />} />
        <Route path="/estanco" element={<EstancoRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
