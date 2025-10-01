import { motion } from "framer-motion"
import { Utensils, ChevronDown, ChevronUp, Clock } from "lucide-react"

export default function DietHistoryBox({ activities, isExpanded, onToggle }) {
  const totalCalories = activities.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
  
  const getMealsByType = () => {
    const grouped = {}
    mealTypes.forEach(type => {
      grouped[type] = activities.filter(meal => 
        meal.type?.toLowerCase() === type || 
        meal.name?.toLowerCase().includes(type)
      )
    })
    // Add ungrouped meals
    grouped.other = activities.filter(meal => 
      !mealTypes.some(type => 
        meal.type?.toLowerCase() === type || 
        meal.name?.toLowerCase().includes(type)
      )
    )
    return grouped
  }

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
      other: '🍽️'
    }
    return icons[type] || '🍽️'
  }

  const groupedMeals = getMealsByType()

  return (
    <motion.div
      layout
      className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-ar-gray-800/40 transition-colors"
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Utensils className="text-orange-400" size={24} />
          </div>
          <div>
            <h3 className="text-ar-white font-medium">Diet</h3>
            <p className="text-ar-gray-400 text-sm">
              {totalCalories} calories • {activities.length} {activities.length === 1 ? 'meal' : 'meals'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ar-gray-300 text-sm">
            {Object.values(groupedMeals).filter(meals => meals.length > 0).length} meal types
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(groupedMeals)
          .filter(([_, meals]) => meals.length > 0)
          .slice(0, 4)
          .map(([type, meals]) => (
            <div key={type} className="bg-ar-gray-800/30 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getMealTypeIcon(type)}</span>
                <span className="text-ar-white text-sm capitalize">{type}</span>
              </div>
              <p className="text-ar-gray-400 text-xs">
                {meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)} cal
              </p>
            </div>
          ))}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-ar-gray-700 pt-4"
        >
          <h4 className="text-ar-white font-medium mb-3">Meal Details</h4>
          {activities.length === 0 ? (
            <p className="text-ar-gray-400 text-sm">No meals recorded</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {Object.entries(groupedMeals)
                .filter(([_, meals]) => meals.length > 0)
                .map(([type, meals]) => (
                  <div key={type} className="space-y-2">
                    <h5 className="text-ar-gray-300 text-sm font-medium capitalize flex items-center gap-2">
                      <span>{getMealTypeIcon(type)}</span>
                      {type}
                    </h5>
                    {meals
                      .sort((a, b) => new Date(a.time) - new Date(b.time))
                      .map((meal, index) => (
                        <div
                          key={meal.id || index}
                          className="flex items-center justify-between p-3 bg-ar-gray-800/30 rounded-lg ml-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-ar-white text-sm font-medium">
                                {meal.name || 'Unnamed meal'}
                              </span>
                              <span className="text-orange-400 text-sm">
                                {meal.calories || 0} kcal
                              </span>
                            </div>
                            {meal.macros && (
                              <div className="flex gap-3 text-xs text-ar-gray-400">
                                {meal.macros.protein && <span>P: {meal.macros.protein}g</span>}
                                {meal.macros.carbs && <span>C: {meal.macros.carbs}g</span>}
                                {meal.macros.fat && <span>F: {meal.macros.fat}g</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-ar-gray-400 text-sm">
                            <Clock size={14} />
                            {formatTime(meal.time)}
                          </div>
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