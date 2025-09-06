import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useUserStore(state => state.isAuthenticated)
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
