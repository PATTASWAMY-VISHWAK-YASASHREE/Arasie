import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, name } = useUserStore()
  const { currentUser, loading } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)
  
  useEffect(() => {
    // Only mark auth as checked after Firebase has finished loading
    if (!loading) {
      setAuthChecked(true)
    }
  }, [loading])
  
  // Show loading while Firebase auth is initializing OR while we haven't checked auth
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ar-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Strict authentication check - must have all conditions met
  const hasValidAuth = currentUser && isAuthenticated && name && name !== 'Guest'
  
  if (!hasValidAuth) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
