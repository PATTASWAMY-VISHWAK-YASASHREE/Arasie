import { motion } from "framer-motion"
import { Heart, ChevronDown, ChevronUp, Clock, MessageCircle, BookOpen, Headphones } from "lucide-react"

export default function MentalWellnessHistoryBox({ activities, isExpanded, onToggle }) {
  const totalActivities = activities.length

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getActivityIcon = (type) => {
    const icons = {
      breathing: '🫁',
      meditation: '🧘',
      sound_healing: '🎵',
      journal: '📝',
      chat: '💬',
      coping_tool: '🛠️',
      default: '💚'
    }
    return icons[type] || icons.default
  }

  const getActivityName = (activity) => {
    if (activity.type === 'breathing') return `${activity.activity} (Breathing Exercise)`
    if (activity.type === 'meditation') return `${activity.activity} (Meditation)`
    if (activity.type === 'sound_healing') return `${activity.activity} (Sound Therapy)`
    if (activity.type === 'journal') return `Journal Entry: ${activity.title || 'Untitled'}`
    if (activity.type === 'chat') return `AI Assistant Chat`
    if (activity.type === 'coping_tool') return `${activity.activity} (Coping Tool)`
    return activity.activity || activity.type || 'Mental Wellness Activity'
  }

  const getActivityDescription = (activity) => {
    if (activity.type === 'journal' && activity.content) {
      return activity.content.length > 100 
        ? `${activity.content.substring(0, 100)}...` 
        : activity.content
    }
    if (activity.type === 'chat' && activity.summary) {
      return activity.summary
    }
    if (activity.duration) {
      return `Duration: ${formatDuration(activity.duration)}`
    }
    return null
  }

  // Group activities by type
  const groupedActivities = activities.reduce((groups, activity) => {
    const type = activity.type || 'other'
    if (!groups[type]) groups[type] = []
    groups[type].push(activity)
    return groups
  }, {})

  const activityTypeNames = {
    breathing: 'Breathing Exercises',
    meditation: 'Meditation',
    sound_healing: 'Sound Therapy',
    journal: 'Journal Entries',
    chat: 'AI Assistant Chats',
    coping_tool: 'Coping Tools',
    other: 'Other Activities'
  }

  return (
    <motion.div
      layout
      className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-ar-gray-800/40 transition-colors"
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/20">
            <Heart className="text-pink-400" size={24} />
          </div>
          <div>
            <h3 className="text-ar-white font-medium">Mental Wellness</h3>
            <p className="text-ar-gray-400 text-sm">
              {totalActivities} {totalActivities === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ar-gray-300 text-sm">
            {Object.keys(groupedActivities).length} types
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Summary Cards */}
      {totalActivities > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(groupedActivities)
            .slice(0, 4)
            .map(([type, typeActivities]) => (
              <div key={type} className="bg-ar-gray-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getActivityIcon(type)}</span>
                  <span className="text-ar-white text-sm">
                    {activityTypeNames[type] || type}
                  </span>
                </div>
                <p className="text-ar-gray-400 text-xs">
                  {typeActivities.length} {typeActivities.length === 1 ? 'session' : 'sessions'}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-ar-gray-700 pt-4"
        >
          <h4 className="text-ar-white font-medium mb-3">Mental Wellness Activities</h4>
          {activities.length === 0 ? (
            <p className="text-ar-gray-400 text-sm">No mental wellness activities recorded</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {Object.entries(groupedActivities).map(([type, typeActivities]) => (
                <div key={type} className="space-y-2">
                  <h5 className="text-ar-gray-300 text-sm font-medium flex items-center gap-2">
                    <span>{getActivityIcon(type)}</span>
                    {activityTypeNames[type] || type}
                  </h5>
                  {typeActivities
                    .sort((a, b) => new Date(a.time) - new Date(b.time))
                    .map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="p-3 bg-ar-gray-800/30 rounded-lg ml-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-ar-white text-sm font-medium">
                                {getActivityName(activity)}
                              </span>
                            </div>
                            {getActivityDescription(activity) && (
                              <p className="text-ar-gray-400 text-xs mb-2">
                                {getActivityDescription(activity)}
                              </p>
                            )}
                            {activity.mood && (
                              <div className="flex items-center gap-2 text-xs text-ar-gray-400">
                                <span>Mood: {activity.mood}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-ar-gray-400 text-sm">
                            <Clock size={14} />
                            {formatTime(activity.time)}
                          </div>
                        </div>
                        
                        {/* Additional details based on activity type */}
                        {activity.type === 'sound_healing' && activity.soundType && (
                          <div className="flex items-center gap-2 text-xs text-pink-400">
                            <Headphones size={12} />
                            <span>Sound: {activity.soundType}</span>
                          </div>
                        )}
                        
                        {activity.type === 'chat' && activity.topics && (
                          <div className="flex items-center gap-2 text-xs text-pink-400">
                            <MessageCircle size={12} />
                            <span>Topics: {activity.topics.join(', ')}</span>
                          </div>
                        )}
                        
                        {activity.type === 'journal' && activity.wordCount && (
                          <div className="flex items-center gap-2 text-xs text-pink-400">
                            <BookOpen size={12} />
                            <span>{activity.wordCount} words</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}