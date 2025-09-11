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
        'ar-violet': '#8B5CF6',
        'ar-dark-gray': '#2D2D2D',
        'ar-gray': '#9CA3AF',
        
        // Status colors
        'ar-success': '#10B981',
        'ar-warning': '#F59E0B',
        'ar-error': '#EF4444',
        'ar-info': '#3B82F6',

        // Design System Colors (for UI components)
        background: '#0A0A0A',
        foreground: '#FFFFFF',
        card: '#121212',
        'card-foreground': '#FFFFFF',
        popover: '#121212',
        'popover-foreground': '#FFFFFF',
        primary: '#FFFFFF',
        'primary-foreground': '#0A0A0A',
        secondary: '#2D2D2D',
        'secondary-foreground': '#FFFFFF',
        muted: '#2D2D2D',
        'muted-foreground': '#9CA3AF',
        accent: '#3A3A3A',
        'accent-foreground': '#FFFFFF',
        destructive: '#EF4444',
        'destructive-foreground': '#FFFFFF',
        border: '#2D2D2D',
        input: '#2D2D2D',
        ring: '#3B82F6',
      },
      boxShadow: {
        'glass': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'button-hover': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-orange': '0 0 20px rgba(245, 158, 11, 0.5)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        hurion: ['Playfair Display', 'serif'], // Using Playfair Display as Hurion alternative
        hagrid: ['Roboto', 'system-ui', 'sans-serif'], // Using Roboto as Hagrid alternative
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
        'liquid-flow': 'liquidFlow 4s ease-in-out infinite',
        'liquid-flow-reverse': 'liquidFlowReverse 3s ease-in-out infinite',
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
        liquidFlow: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg) brightness(1) contrast(1.2)'
          },
          '25%': { 
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(10deg) brightness(1.1) contrast(1.3)'
          },
          '50%': { 
            backgroundPosition: '200% 50%',
            filter: 'hue-rotate(0deg) brightness(1.2) contrast(1.4)'
          },
          '75%': { 
            backgroundPosition: '300% 50%',
            filter: 'hue-rotate(-10deg) brightness(1.1) contrast(1.3)'
          }
        },
        liquidFlowReverse: {
          '0%, 100%': { 
            backgroundPosition: '200% 50%',
            filter: 'hue-rotate(0deg) brightness(1.1) contrast(1.3)'
          },
          '25%': { 
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(-15deg) brightness(1.2) contrast(1.4)'
          },
          '50%': { 
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg) brightness(1.3) contrast(1.5)'
          },
          '75%': { 
            backgroundPosition: '150% 50%',
            filter: 'hue-rotate(15deg) brightness(1.2) contrast(1.4)'
          }
        }
      },
    },
  },
  plugins: [],
}
