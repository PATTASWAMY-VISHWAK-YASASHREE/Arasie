import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import Navigation from "./components/Navigation"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import Workout from "./pages/Workout"
import Water from "./pages/Water"
import Diet from "./pages/Diet"
import MentalHealth from "./pages/MentalHealth"
import Focus from "./pages/Focus"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Welcome from "./pages/Welcome"
import { useUserStore } from "./store/userStore"
import { AuthProvider, useAuth } from "./contexts/AuthContext"

function AppContent() {
  const resetDaily = useUserStore(state => state.resetDaily)
  const isAuthenticated = useUserStore(state => state.isAuthenticated)
  const setUser = useUserStore(state => state.setUser)
  const logout = useUserStore(state => state.logout)
  const initializeAuth = useUserStore(state => state.initializeAuth)
  const { currentUser, loading } = useAuth()
  
  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // Sync Firebase auth state with Zustand store
  useEffect(() => {
    const syncUser = async () => {
      if (currentUser) {
        await setUser(currentUser)
      } else {
        logout()
      }
    }
    
    if (!loading) {
      syncUser()
    }
  }, [currentUser, loading, setUser, logout])
  
  // Reset daily progress on app start (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      resetDaily()
    }
  }, [resetDaily, isAuthenticated])

  // Show loading screen while Firebase initializes
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ar-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-ar-black">
        {/* Show navigation only when authenticated */}
        {isAuthenticated && <Navigation />}
        
        {/* Main content area with conditional spacing */}
        <main className={`flex-1 ${isAuthenticated ? 'md:ml-64 pb-24 md:pb-0 pt-20 md:pt-0 p-4 md:p-6 lg:p-8' : ''}`}>
          <div className={`${isAuthenticated ? 'max-w-7xl mx-auto' : 'w-full'}`}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Welcome />
              } />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              } />
              <Route path="/signup" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/workout/*" element={
                <ProtectedRoute>
                  <Workout />
                </ProtectedRoute>
              } />
              <Route path="/water" element={
                <ProtectedRoute>
                  <Water />
                </ProtectedRoute>
              } />
              <Route path="/diet" element={
                <ProtectedRoute>
                  <Diet />
                </ProtectedRoute>
              } />
              <Route path="/mental-health" element={
                <ProtectedRoute>
                  <MentalHealth />
                </ProtectedRoute>
              } />
              <Route path="/focus" element={
                <ProtectedRoute>
                  <Focus />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
