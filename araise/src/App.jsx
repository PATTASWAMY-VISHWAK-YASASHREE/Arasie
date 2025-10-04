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
import FocusCalendar from "./pages/FocusCalendar"
import History from "./pages/History"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Welcome from "./pages/Welcome"
import Feedback from "./pages/Feedback"
import { useUserStore } from "./store/userStore"
import { useXpStore } from "./store/xpStore"
import useSettingsStore from "./store/settingsStore"
import { AuthProvider, useAuth } from "./contexts/AuthContext"

function AppContent() {
  const resetDaily = useUserStore(state => state.resetDaily)
  const isAuthenticated = useUserStore(state => state.isAuthenticated)
  const isChatOpen = useUserStore(state => state.isChatOpen)
  const setUser = useUserStore(state => state.setUser)
  const logout = useUserStore(state => state.logout)
  const updateWaterGoal = useUserStore(state => state.updateWaterGoal)
  const checkAndResetDaily = useXpStore(state => state.checkAndResetDaily)
  const dailyFocusGoal = useUserStore(state => state.dailyFocusGoal)
  const { preferences } = useSettingsStore()
  const { currentUser, loading } = useAuth()

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

  // Reset daily XP on app start and check periodically
  useEffect(() => {
    if (isAuthenticated) {
      // Initial check when app loads
      checkAndResetDaily()

      // Check every hour for day changes
      const interval = setInterval(() => {
        checkAndResetDaily()
      }, 3600000) // Check every hour

      return () => clearInterval(interval)
    }
  }, [checkAndResetDaily, isAuthenticated])

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
        {/* Show navigation only when authenticated and chat is not open */}
        {isAuthenticated && !isChatOpen && <Navigation />}

        {/* Main content area with conditional spacing */}
        <main className={`flex-1 ${isAuthenticated && !isChatOpen ? 'md:ml-64 pb-24 md:pb-0 pt-20 md:pt-0 p-4 md:p-6 lg:p-8' : ''}`}>
          <div className={`${isAuthenticated && !isChatOpen ? 'max-w-7xl mx-auto' : 'w-full'}`}>
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
              <Route path="/focus/calendar" element={
                <ProtectedRoute>
                  <FocusCalendar />
                </ProtectedRoute>
              } />
              <Route path="/history/:date" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/feedback" element={
                <ProtectedRoute>
                  <Feedback />
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
