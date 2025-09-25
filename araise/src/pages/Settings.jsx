import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2,
  HelpCircle,
  Mail,
  MessageSquare,
  Activity,
  Heart,
  Droplets,
  Brain,
  Dumbbell,
  Clock
} from "lucide-react"
import { useUserStore } from "../store/userStore"
import useSettingsStore from "../store/settingsStore"
import notificationService from "../services/NotificationService"
import { useNavigate } from "react-router-dom"

export default function Settings() {
  const navigate = useNavigate()
  const { name, logout } = useUserStore()
  const {
    notifications,
    preferences,
    privacy,
    updateNotificationSetting,
    updatePreference,
    updatePrivacySetting,
    exportData,
    initializeSettings
  } = useSettingsStore()
  
  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState('default')

  // Check notification permission on mount
  useEffect(() => {
    if (notificationService.isSupported()) {
      setNotificationPermission(notificationService.getPermissionStatus())
    }
    // Initialize settings
    initializeSettings()
  }, [initializeSettings])

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission()
    setNotificationPermission(notificationService.getPermissionStatus())
    
    if (granted) {
      // Show success notification
      notificationService.showNotification('ARAISE Notifications Enabled!', {
        body: 'You\'ll now receive wellness reminders and updates.',
        icon: '/favicon.ico'
      })
      // Enable push notifications in settings
      updateNotificationSetting('push', true)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }



  const settingsCategories = [
    {
      title: "Account",
      icon: User,
      items: [
        {
          label: "Profile",
          description: "Manage your personal information",
          action: () => navigate('/profile'),
          showArrow: true
        },
        {
          label: "Privacy & Security",
          description: "Control your data and security settings",
          icon: Shield,
          action: () => navigate('/settings/privacy'),
          showArrow: true
        }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          label: "Push Notifications",
          description: notificationPermission === 'granted' ? 'Enabled' : 'Tap to enable',
          icon: Bell,
          toggle: notificationPermission === 'granted',
          value: notifications.push && notificationPermission === 'granted',
          onChange: (value) => {
            if (notificationPermission !== 'granted') {
              requestNotificationPermission()
            } else {
              updateNotificationSetting('push', value)
            }
          },
          special: notificationPermission !== 'granted' ? 'permission' : null
        }
      ]
    },
    {
      title: "Notification Categories",
      icon: Activity,
      items: [
        {
          label: "Workout Reminders",
          description: "Exercise and fitness notifications",
          icon: Dumbbell,
          toggle: true,
          value: notifications.workout,
          onChange: (value) => updateNotificationSetting('workout', value)
        },
        {
          label: "Water Reminders",
          description: "Hydration tracking alerts",
          icon: Droplets,
          toggle: true,
          value: notifications.water,
          onChange: (value) => updateNotificationSetting('water', value)
        },
        {
          label: "Meditation Reminders",
          description: "Mindfulness and meditation prompts",
          icon: Brain,
          toggle: true,
          value: notifications.meditation,
          onChange: (value) => updateNotificationSetting('meditation', value)
        },
        {
          label: "Focus Sessions",
          description: "Productivity and focus alerts",
          icon: Clock,
          toggle: true,
          value: notifications.focus,
          onChange: (value) => updateNotificationSetting('focus', value)
        },
        {
          label: "Achievements",
          description: "Milestone and achievement notifications",
          icon: Heart,
          toggle: true,
          value: notifications.achievements,
          onChange: (value) => updateNotificationSetting('achievements', value)
        }
      ]
    },
    {
      title: "Data & Storage",
      icon: Smartphone,
      items: [
        {
          label: "Language",
          description: "English (US)",
          icon: Globe,
          showArrow: true,
          action: () => navigate('/settings/language')
        },
        {
          label: "Data Usage",
          description: preferences.dataUsage === 'wifi-only' ? 'Wi-Fi Only' : 'Always',
          showArrow: true,
          action: () => navigate('/settings/data')
        },
        {
          label: "Offline Mode",
          description: "Use app without internet connection",
          toggle: true,
          value: preferences.offlineMode,
          onChange: (value) => updatePreference('offlineMode', value)
        },
        {
          label: "Clear Cache",
          description: "Free up storage space",
          icon: Trash2,
          showArrow: false,
          action: () => {
            // Clear cache logic
            alert('Cache cleared successfully!')
          }
        }
      ]
    },
    {
      title: "Privacy",
      icon: Shield,
      items: [
        {
          label: "Profile Visibility",
          description: privacy.profileVisibility === 'public' ? 'Public' : 
                      privacy.profileVisibility === 'friends' ? 'Friends Only' : 'Private',
          icon: privacy.profileVisibility === 'private' ? EyeOff : Eye,
          showArrow: true,
          action: () => navigate('/settings/privacy')
        },
        {
          label: "Share Progress",
          description: "Allow others to see your wellness journey",
          toggle: true,
          value: privacy.shareProgress,
          onChange: (value) => updatePrivacySetting('shareProgress', value)
        },
        {
          label: "Location Services",
          description: "Use location for personalized features",
          toggle: true,
          value: privacy.locationServices,
          onChange: (value) => updatePrivacySetting('locationServices', value)
        },
        {
          label: "Analytics",
          description: "Help improve the app with usage data",
          toggle: true,
          value: privacy.allowAnalytics,
          onChange: (value) => updatePrivacySetting('allowAnalytics', value)
        }
      ]
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        {
          label: "Help Center",
          description: "Get answers to common questions",
          icon: HelpCircle,
          showArrow: true,
          action: () => window.open('https://help.araise.app', '_blank')
        },
        {
          label: "Contact Support",
          description: "Get help from our team",
          icon: Mail,
          showArrow: true,
          action: () => navigate('/support')
        },
        {
          label: "Send Feedback",
          description: "Share your thoughts and suggestions",
          icon: MessageSquare,
          showArrow: true,
          action: () => navigate('/feedback')
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-ar-black overflow-x-hidden">
      {/* Mobile-first container with proper alignment */}
      <div className="w-full max-w-full px-3 pt-4 pb-32 mx-auto sm:max-w-2xl sm:px-4 lg:max-w-4xl lg:px-6 lg:pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5 sticky top-0 bg-ar-black/95 backdrop-blur-md z-20 py-3 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 text-ar-gray-400 hover:text-white transition-colors touch-manipulation"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-poppins font-bold text-ar-white">Settings</h1>
            <p className="text-xs text-ar-gray-400 mt-0.5 hidden sm:block">Customize your ARAISE experience</p>
          </div>
        </motion.div>

        {/* Settings Categories */}
        <div className="space-y-3 w-full">
          {settingsCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.05 }}
              className="glass-card rounded-lg p-3 w-full box-border"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 bg-ar-blue/20 rounded-md flex-shrink-0">
                  <category.icon size={16} className="text-ar-blue" />
                </div>
                <h2 className="text-base font-poppins font-semibold text-ar-white">
                  {category.title}
                </h2>
              </div>

              {/* Category Items */}
              <div className="space-y-1.5 w-full">
                {category.items.map((item) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center justify-between p-3 bg-ar-gray-800/50 rounded-md hover:bg-ar-gray-800/70 transition-colors cursor-pointer touch-manipulation min-h-[60px] w-full box-border"
                    onClick={item.action}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                      {item.icon && (
                        <div className="p-1.5 bg-ar-gray-700 rounded-md flex-shrink-0">
                          <item.icon size={14} className="text-ar-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-poppins font-medium text-ar-white text-sm truncate leading-tight">
                          {item.label}
                        </h3>
                        <p className={`text-xs mt-1 leading-tight ${
                          item.special === 'permission' && notificationPermission !== 'granted'
                            ? 'text-orange-400'
                            : 'text-ar-gray-400'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.toggle && (
                        <motion.button
                          className={`relative w-10 h-6 rounded-full transition-colors touch-manipulation ${
                            item.value ? 'bg-ar-blue' : 'bg-ar-gray-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            item.onChange(!item.value)
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{
                              x: item.value ? 20 : 4
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      )}
                      {item.showArrow && (
                        <ChevronRight size={16} className="text-ar-gray-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Logout Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-lg p-3 w-full box-border"
          >
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md text-red-400 hover:text-red-300 transition-colors touch-manipulation min-h-[52px]"
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <LogOut size={18} />
              <span className="font-poppins font-medium text-sm">Sign Out</span>
            </motion.button>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-4"
          >
            <p className="text-ar-gray-500 text-xs">
              ARAISE v1.0.0
            </p>
            <p className="text-ar-gray-600 text-xs mt-0.5">
              Your wellness companion
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}