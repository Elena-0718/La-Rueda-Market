import { Navigate } from 'react-router-dom'
import { getAuthUser, isAuthenticated } from '../features/auth/authStorage'

function AdminRoute({ children }) {
  const user = getAuthUser()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute