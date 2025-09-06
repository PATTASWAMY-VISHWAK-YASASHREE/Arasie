import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import Navigation from "./components/Navigation"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import Workout from "./pages/Workout"
import Water from "./pages/Water"
import Diet from "./pages/Diet"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Welcome from "./pages/Welcome"
import { useUserStore } from "./store/userStore"

function App() {
  const resetDaily = useUserStore(state => state.resetDaily)
  const isAuthenticated = useUserStore(state => state.isAuthenticated)
  
  // Reset daily progress on app start
  useEffect(() => {
    resetDaily()
  }, [resetDaily])

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
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
