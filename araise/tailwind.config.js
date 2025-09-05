/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary dark theme colors
        'ar-black': '#0A0A0A',
        'ar-darker': '#121212',
        'ar-dark': '#1E1E1E',
        'ar-gray-900': '#252525',
        'ar-gray-800': '#2D2D2D',
        'ar-gray-700': '#3A3A3A',
        'ar-gray-600': '#4A4A4A',
        'ar-gray-500': '#6B7280',
        'ar-gray-400': '#9CA3AF',
        'ar-gray-300': '#D1D5DB',
        'ar-gray-200': '#E5E7EB',
        'ar-gray-100': '#F3F4F6',
        'ar-white': '#FFFFFF',
        
        // Professional accent colors
        'ar-blue': '#3B82F6',
        'ar-blue-light': '#60A5FA',
        'ar-blue-dark': '#2563EB',
        'ar-green': '#10B981',
        'ar-green-light': '#34D399',
        'ar-orange': '#F59E0B',
        'ar-red': '#EF4444',
        'ar-purple': '#8B5CF6',
        
        // Status colors
        'ar-success': '#10B981',
        'ar-warning': '#F59E0B',
        'ar-error': '#EF4444',
        'ar-info': '#3B82F6',
      },
      boxShadow: {
        'glass': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'button-hover': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
