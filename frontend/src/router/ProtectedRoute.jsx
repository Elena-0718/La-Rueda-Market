import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../features/auth/authStorage'

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute