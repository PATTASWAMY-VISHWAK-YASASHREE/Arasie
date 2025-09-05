import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import Navigation from "./components/Navigation"
import Dashboard from "./pages/Dashboard"
import Workout from "./pages/Workout"
import Water from "./pages/Water"
import Diet from "./pages/Diet"
import { useUserStore } from "./store/userStore"

function App() {
  const resetDaily = useUserStore(state => state.resetDaily)
  
  // Reset daily progress on app start
  useEffect(() => {
    resetDaily()
  }, [resetDaily])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-ar-black">
        <Navigation />
        
        {/* Main content area with proper spacing for navigation */}
        <main className="flex-1 md:ml-64 mb-16 md:mb-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workout/*" element={<Workout />} />
              <Route path="/water" element={<Water />} />
              <Route path="/diet" element={<Diet />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
