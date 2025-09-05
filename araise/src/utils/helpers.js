// Date and time utilities
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: new Date().getFullYear() !== new Date(dateString).getFullYear() ? 'numeric' : undefined
  })
}

export function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export function isToday(dateString) {
  const today = new Date().toISOString().slice(0, 10)
  const date = new Date(dateString).toISOString().slice(0, 10)
  return today === date
}

export function getDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

// Local storage utilities
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
    return false
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return defaultValue
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
    return false
  }
}

// Number utilities
export function formatNumber(num, decimals = 0) {
  return Number(num).toFixed(decimals)
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function percentage(value, total) {
  return total > 0 ? Math.min((value / total) * 100, 100) : 0
}

// Animation utilities
export function createStaggerChildren(delayBetween = 0.1) {
  return {
    visible: {
      transition: {
        staggerChildren: delayBetween
      }
    }
  }
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

// Validation utilities
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidNumber(value, min = -Infinity, max = Infinity) {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

// Debounce utility
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Device detection
export function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function isAndroid() {
  return /Android/.test(navigator.userAgent)
}

// Color utilities
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Random utilities
export function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
