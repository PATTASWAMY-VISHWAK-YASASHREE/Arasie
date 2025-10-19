import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Camera, 
  Edit3, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone,
  Save,
  ArrowLeft,
  Trophy,
  Target,
  Flame,
  Activity,
  Award,
  TrendingUp,
  Clock,
  Droplets,
  Brain,
  Dumbbell,
  Shield,
  Crown,
  CheckCircle,
  Lock,
  Globe,
  Users
} from "lucide-react"
import { useUserStore } from "../store/userStore"
import useSettingsStore from "../store/settingsStore"
import { useNavigate } from "react-router-dom"

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { 
    name, 
    email, 
    level, 
    streakCount, 
    updateName,
    getStreakStats 
  } = useUserStore()
  
  const { privacy, updatePrivacySetting } = useSettingsStore()

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'stats', 'achievements', 'privacy'
  
  const [profileData, setProfileData] = useState({
    name: name || 'User',
    email: email || 'user@example.com',
    phone: '',
    location: '',
    bio: 'Focused on wellness and personal growth through ARAISE.',
    joinDate: 'January 2024',
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoal: 'general-wellness',
    profilePicture: null
  })



  const streakStats = getStreakStats()
  
  const detailedStats = [
    {
      category: "Overall Progress",
      stats: [
        {
          label: "Current Level",
          value: level,
          icon: Trophy,
          color: "text-yellow-400",
          bg: "bg-yellow-400/20",
          description: "Wellness Warrior"
        },
        {
          label: "Day Streak",
          value: streakCount,
          icon: Flame,
          color: "text-orange-400",
          bg: "bg-orange-400/20",
          description: "Consecutive days"
        },
        {
          label: "Total Days",
          value: streakStats.totalCompletedDays,
          icon: Target,
          color: "text-green-400",
          bg: "bg-green-400/20",
          description: "Days completed"
        },
        {
          label: "This Week",
          value: `${streakStats.thisWeek}/7`,
          icon: Activity,
          color: "text-blue-400",
          bg: "bg-blue-400/20",
          description: "Weekly progress"
        }
      ]
    },
    {
      category: "Activity Breakdown",
      stats: [
        {
          label: "Workouts",
          value: 45,
          icon: Dumbbell,
          color: "text-red-400",
          bg: "bg-red-400/20",
          description: "Sessions completed"
        },
        {
          label: "Meditation",
          value: 32,
          icon: Brain,
          color: "text-purple-400",
          bg: "bg-purple-400/20",
          description: "Minutes practiced"
        },
        {
          label: "Water Goals",
          value: 28,
          icon: Droplets,
          color: "text-cyan-400",
          bg: "bg-cyan-400/20",
          description: "Days achieved"
        },
        {
          label: "Focus Time",
          value: 156,
          icon: Clock,
          color: "text-indigo-400",
          bg: "bg-indigo-400/20",
          description: "Hours focused"
        }
      ]
    }
  ]

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first workout",
      icon: Dumbbell,
      earned: true,
      earnedDate: "2024-01-15",
      rarity: "common"
    },
    {
      id: 2,
      title: "Hydration Hero",
      description: "Reach water goal for 7 days straight",
      icon: Droplets,
      earned: true,
      earnedDate: "2024-01-22",
      rarity: "uncommon"
    },
    {
      id: 3,
      title: "Mindful Master",
      description: "Complete 30 meditation sessions",
      icon: Brain,
      earned: true,
      earnedDate: "2024-02-10",
      rarity: "rare"
    },
    {
      id: 4,
      title: "Focus Champion",
      description: "Complete 100 hours of focus time",
      icon: Clock,
      earned: false,
      progress: 75,
      rarity: "epic"
    },
    {
      id: 5,
      title: "Wellness Warrior",
      description: "Maintain 30-day streak",
      icon: Crown,
      earned: false,
      progress: 60,
      rarity: "legendary"
    }
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-400/20'
      case 'uncommon': return 'text-green-400 bg-green-400/20'
      case 'rare': return 'text-blue-400 bg-blue-400/20'
      case 'epic': return 'text-purple-400 bg-purple-400/20'
      case 'legendary': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const handleSave = () => {
    updateName(profileData.name)
    setIsEditing(false)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }



  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-ar-black">
      {/* Mobile-first responsive container */}
      <div className="profile-mobile w-full px-4 pt-4 pb-32 mx-auto max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-6xl sm:px-6 lg:px-8 lg:pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 gap-3 sticky top-0 bg-ar-black/95 backdrop-blur-md z-20 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-ar-blue" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-poppins font-bold text-ar-white">Profile</h1>
              <p className="text-sm text-ar-gray-400 mt-1 hidden sm:block">Manage your personal information</p>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <motion.button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 min-h-[40px] ${
                isEditing 
                  ? 'bg-ar-blue hover:bg-ar-blue-light text-white' 
                  : 'bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
              <span className="font-poppins font-medium text-sm">
                {isEditing ? 'Save' : 'Edit'}
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tab-nav flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg whitespace-nowrap transition-colors touch-manipulation flex-shrink-0 min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-ar-blue text-white'
                  : 'bg-ar-gray-800 text-ar-gray-400 hover:text-white hover:bg-ar-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon size={16} />
              <span className="font-poppins font-medium text-sm">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6"
              >
                {/* Profile Picture */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-ar-blue to-ar-blue-light rounded-full flex items-center justify-center overflow-hidden">
                      {profileData.profilePicture ? (
                        <img 
                          src={profileData.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-ar-blue rounded-full text-white hover:bg-ar-blue-light transition-colors touch-manipulation"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Camera size={16} />
                      </motion.button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-poppins font-bold text-ar-white">
                      {profileData.name}
                    </h2>
                    <p className="text-ar-gray-400 mt-1">Level {level} Wellness Warrior</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-400">Active</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ar-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          disabled={!isEditing}
                          className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl pl-10 pr-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ar-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Add phone number"
                          className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl pl-10 pr-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ar-gray-400" />
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Add location"
                          className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl pl-10 pr-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                        disabled={!isEditing}
                        className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                        Fitness Goal
                      </label>
                      <select
                        value={profileData.fitnessGoal}
                        onChange={(e) => setProfileData({...profileData, fitnessGoal: e.target.value})}
                        disabled={!isEditing}
                        className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white focus:border-ar-blue focus:outline-none disabled:opacity-50"
                      >
                        <option value="weight-loss">Weight Loss</option>
                        <option value="muscle-gain">Muscle Gain</option>
                        <option value="general-wellness">General Wellness</option>
                        <option value="endurance">Endurance</option>
                        <option value="strength">Strength</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-ar-gray-400 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-6"
              >
                <h3 className="text-lg font-poppins font-semibold text-ar-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  {detailedStats[0].stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`p-2 rounded-lg ${stat.bg} flex-shrink-0`}>
                        <stat.icon size={16} className={stat.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ar-gray-400">{stat.label}</p>
                        <p className={`font-poppins font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6"
              >
                <h3 className="text-base md:text-lg font-poppins font-semibold text-ar-white mb-3 md:mb-4">
                  Account Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-ar-gray-400 md:w-4 md:h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-ar-gray-400">Joined</p>
                      <p className="text-ar-white font-medium text-sm md:text-base">{profileData.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Crown size={14} className="text-ar-gray-400 md:w-4 md:h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-ar-gray-400">Account Type</p>
                      <p className="text-ar-white font-medium text-sm md:text-base">Premium</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {detailedStats.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <h3 className="text-xl font-poppins font-semibold text-ar-white mb-6">
                  {category.category}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {category.stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-ar-gray-800/50 rounded-xl p-4 text-center"
                    >
                      <div className={`inline-flex p-3 rounded-lg ${stat.bg} mb-3`}>
                        <stat.icon size={20} className={stat.color} />
                      </div>
                      <p className={`text-2xl font-poppins font-bold ${stat.color} mb-1`}>
                        {stat.value}
                      </p>
                      <p className="text-sm text-ar-gray-400 mb-1">{stat.label}</p>
                      <p className="text-xs text-ar-gray-500">{stat.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-xl md:rounded-2xl p-4 md:p-6 ${
                  achievement.earned ? 'border border-ar-blue/30' : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`p-2 md:p-3 rounded-lg ${getRarityColor(achievement.rarity)} flex-shrink-0`}>
                    <achievement.icon size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-poppins font-semibold text-ar-white text-sm md:text-base truncate">
                        {achievement.title}
                      </h3>
                      {achievement.earned && (
                        <CheckCircle size={14} className="text-green-400 flex-shrink-0 md:w-4 md:h-4" />
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-ar-gray-400 mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                    
                    {achievement.earned ? (
                      <p className="text-xs text-ar-gray-500">
                        Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                      </p>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs text-ar-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-ar-gray-700 rounded-full h-1.5 md:h-2">
                          <motion.div
                            className="bg-ar-blue h-1.5 md:h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                            transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="text-xl font-poppins font-semibold text-ar-white mb-6">
                Privacy Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ar-gray-400 mb-3">
                    Profile Visibility
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'public', label: 'Public', icon: Globe },
                      { value: 'friends', label: 'Friends', icon: Users },
                      { value: 'private', label: 'Private', icon: Lock }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => updatePrivacySetting('profileVisibility', option.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors touch-manipulation ${
                          privacy.profileVisibility === option.value
                            ? 'bg-ar-blue text-white'
                            : 'bg-ar-gray-800 text-ar-gray-400 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <option.icon size={20} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {[
                    { key: 'showEmail', label: 'Show Email Address', description: 'Allow others to see your email' },
                    { key: 'showPhone', label: 'Show Phone Number', description: 'Display phone in profile' },
                    { key: 'showLocation', label: 'Show Location', description: 'Display your location' },
                    { key: 'showStats', label: 'Show Statistics', description: 'Display your progress stats' },
                    { key: 'showAchievements', label: 'Show Achievements', description: 'Display earned achievements' },
                    { key: 'allowMessages', label: 'Allow Messages', description: 'Let others send you messages' },
                    { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Display when you\'re active' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 md:p-4 bg-ar-gray-800/50 rounded-lg md:rounded-xl">
                      <div className="flex-1 min-w-0 pr-3">
                        <h4 className="font-poppins font-medium text-ar-white text-sm md:text-base">
                          {setting.label}
                        </h4>
                        <p className="text-xs md:text-sm text-ar-gray-400 mt-1 line-clamp-2">
                          {setting.description}
                        </p>
                      </div>
                      <motion.button
                        className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full transition-colors touch-manipulation flex-shrink-0 ${
                          privacy[setting.key] ? 'bg-ar-blue' : 'bg-ar-gray-600'
                        }`}
                        onClick={() => updatePrivacySetting(setting.key, !privacy[setting.key])}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 md:top-1 md:w-4 md:h-4 bg-white rounded-full"
                          animate={{
                            x: privacy[setting.key] ? 20 : 4
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}