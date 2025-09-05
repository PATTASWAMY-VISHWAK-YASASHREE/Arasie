import { NavLink } from "react-router-dom"
import { Home, Dumbbell, Droplet, Utensils, Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/water", label: "Water", icon: Droplet },
  { to: "/diet", label: "Diet", icon: Utensils },
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
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 w-full bg-ar-darker/95 backdrop-blur-lg border-t border-ar-gray-800 flex justify-around py-3 z-50 shadow-lg">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
            >
              {({ isActive }) => (
                <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 min-w-0 ${
                  isActive
                    ? "bg-ar-blue text-ar-white shadow-button-hover scale-105"
                    : "text-ar-gray-400 hover:text-ar-blue-light hover:bg-ar-gray-800/50"
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-ar-darker/95 backdrop-blur-xl border-r border-ar-gray-800 flex flex-col py-8 z-50 shadow-xl">
      {/* Logo/Brand */}
      <motion.div 
        className="mb-12 flex items-center gap-3 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flame size={32} className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        <span className="font-poppins font-bold text-2xl text-ar-white">
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
                      ? "bg-ar-blue text-ar-white shadow-card-hover border border-ar-blue/20"
                      : "text-ar-gray-400 hover:text-ar-blue-light hover:bg-ar-gray-800/50 hover:shadow-card"
                  }`}>
                    {/* Icon */}
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-300" />
                    
                    {/* Label */}
                    <span className="font-medium text-base transition-all duration-300">
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 bg-ar-white rounded-full" />
                    )}
                  </div>
                )}
              </NavLink>
            </motion.div>
          )
        })}
      </div>

      {/* Footer/User section */}
      <motion.div 
        className="px-6 py-4 border-t border-ar-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="text-xs text-ar-gray-500 text-center">
          <p className="font-medium text-ar-gray-300">Stay Consistent 💪</p>
          <p className="opacity-75 mt-1">Version 1.0</p>
        </div>
      </motion.div>
    </nav>
  )
}
