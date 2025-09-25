import { NavLink, useNavigate } from "react-router-dom"
import { Home, Dumbbell, Utensils, Flame, User, Settings, LogOut, ChevronDown, Heart, Brain } from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore } from "../store/userStore"
import { useAuth } from "../contexts/AuthContext"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/diet", label: "Diet", icon: Utensils },
  { to: "/mental-health", label: "Mental Health", icon: Heart },
  { to: "/focus", label: "Focus", icon: Brain },
]

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])
  
  return matches
}

export default function Navigation() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { name, level } = useUserStore()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      setShowProfileMenu(false)
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Header */}
        <nav className="fixed top-0 left-0 w-full backdrop-blur-xl bg-black/80 px-4 py-3 z-50 shadow-2xl border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Flame size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              </div>
              <span className="font-hurion font-bold text-xl text-white tracking-tight">
                Araise
              </span>
            </div>

            {/* Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="relative group"
              >
                {/* Liquid Metal Avatar with Landing Page Theme */}
                <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-600 to-zinc-500 opacity-80 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <User size={20} className="text-white drop-shadow-lg" />
                  </div>
                  {/* Liquid glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Subtle indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-zinc-900 transition-transform duration-300 ${
                  showProfileMenu ? 'scale-110' : 'scale-100'
                }`}>
                  <ChevronDown 
                    size={10} 
                    className={`text-white absolute top-0.5 left-0.5 transition-transform duration-300 ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </button>

              {/* Enhanced Profile Dropdown with Landing Page Theme */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.90 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.90 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      duration: 0.3 
                    }}
                    className="absolute right-0 top-full mt-3 w-56 backdrop-blur-xl bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-700/95 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center border border-white/10">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-hagrid font-light text-sm">{name}</p>
                          <p className="text-zinc-400 font-hagrid font-light text-xs">Level {level}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => {
                          navigate('/settings')
                          setShowProfileMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-400/30 transition-all duration-300">
                          <Settings size={16} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-hagrid font-light">Settings</span>
                      </button>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/20 group-hover:border-red-400/30 transition-all duration-300">
                          <LogOut size={16} className="text-red-400" />
                        </div>
                        <span className="text-sm font-hagrid font-light">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation - Spread Design */}
        <nav className="fixed bottom-0 left-0 right-0 w-full backdrop-blur-xl bg-black/80 border-t border-white/10 shadow-2xl z-[9999]">
          <div className="flex items-center justify-between px-4 py-2">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex-1 flex justify-center"
                >
                  {({ isActive }) => (
                    <div className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-blue-500/30 text-white shadow-lg shadow-blue-500/20 scale-105 backdrop-blur-sm border border-blue-400/40"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}>
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="drop-shadow-sm" />
                      <span className={`text-xs font-medium leading-tight text-center ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}>
                        {item.label === "Mental Health" ? (
                          <div className="flex flex-col">
                            <span>Mental</span>
                            <span>Health</span>
                          </div>
                        ) : item.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </>
    )
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col py-8 z-50 shadow-2xl">
      {/* Logo/Brand */}
      <motion.div 
        className="mb-12 flex items-center gap-3 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
          <Flame size={24} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </div>
        <span className="font-hurion font-bold text-2xl text-white tracking-tight">
          Araise
        </span>
      </motion.div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-3 px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <NavLink to={item.to}>
                {({ isActive }) => (
                  <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? "bg-blue-500/30 text-white shadow-lg shadow-blue-500/20 backdrop-blur-sm border border-blue-400/40"
                      : "text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-lg"
                  }`}>
                    {/* Icon */}
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-300 drop-shadow-sm" />
                    
                    {/* Label */}
                    <span className="font-medium text-base transition-all duration-300">
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-sm" />
                    )}
                  </div>
                )}
              </NavLink>
            </motion.div>
          )
        })}
      </div>

      {/* Footer/User Avatar section */}
      <motion.div 
        className="px-6 py-4 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
          >
            {/* Liquid Metal Avatar matching Landing Page */}
            <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-lg group-hover:shadow-xl flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-600 to-zinc-500 opacity-80 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <User size={22} className="text-white drop-shadow-lg" />
              </div>
              {/* Liquid glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-hagrid font-light text-white text-left">{name}</p>
              <p className="text-xs text-gray-400 font-hagrid font-light text-left">Level {level}</p>
            </div>
            
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform duration-300 ${
                showProfileMenu ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Desktop Profile Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.90 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.90 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.3 
                }}
                className="absolute bottom-full left-4 right-4 mb-3 backdrop-blur-xl bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-700/95 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
              >
                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => {
                      navigate('/settings')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-400/30 transition-all duration-300">
                      <Settings size={16} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-hagrid font-light">Settings</span>
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/20 group-hover:border-red-400/30 transition-all duration-300">
                      <LogOut size={16} className="text-red-400" />
                    </div>
                    <span className="text-sm font-hagrid font-light">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </nav>
  )
}
