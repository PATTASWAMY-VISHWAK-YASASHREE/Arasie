import { useState } from "react"
import { motion } from "framer-motion"
import { Utensils, Plus, Camera, Clock, Target, Zap, TrendingUp } from "lucide-react"
import { useUserStore } from "../store/userStore"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function Diet() {
  const [showMealModal, setShowMealModal] = useState(false)
  const [showFoodScanModal, setShowFoodScanModal] = useState(false)
  const [mealForm, setMealForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  })

  const {
    dietCalories,
    meals,
    dietGoalMet,
    logMeal
  } = useUserStore()

  const dailyCalorieGoal = 2000 // Could be customizable
  const progressPercentage = Math.min((dietCalories / dailyCalorieGoal) * 100, 100)

  // Calculate macros totals
  const macros = meals.reduce((acc, meal) => {
    acc.protein += meal.protein || 0
    acc.carbs += meal.carbs || 0
    acc.fat += meal.fat || 0
    return acc
  }, { protein: 0, carbs: 0, fat: 0 })

  // Pie chart data for macros
  const macroData = [
    { name: 'Protein', value: macros.protein, color: '#3B82F6' },
    { name: 'Carbs', value: macros.carbs, color: '#10B981' },
    { name: 'Fat', value: macros.fat, color: '#F59E0B' }
  ]

  const handleMealSubmit = async () => {
    if (mealForm.name && mealForm.calories) {
      await logMeal({
        name: mealForm.name,
        calories: parseInt(mealForm.calories) || 0,
        protein: parseInt(mealForm.protein) || 0,
        carbs: parseInt(mealForm.carbs) || 0,
        fat: parseInt(mealForm.fat) || 0
      })
      setMealForm({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: ""
      })
      setShowMealModal(false)
    }
  }

  const mockFoodScan = async () => {
    const mockFoods = [
      { name: "Apple", calories: 95, protein: 0, carbs: 25, fat: 0 },
      { name: "Chicken Breast (100g)", calories: 231, protein: 31, carbs: 0, fat: 5 },
      { name: "Banana", calories: 89, protein: 1, carbs: 23, fat: 0 },
      { name: "Greek Yogurt", calories: 130, protein: 15, carbs: 9, fat: 0 },
      { name: "Avocado", calories: 234, protein: 3, carbs: 12, fat: 21 },
    ]
    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)]
    
    await logMeal(randomFood)
    setShowFoodScanModal(false)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMealIcon = (index) => {
    const icons = ['🍳', '🥗', '🍽️', '🍎', '🥤']
    return icons[index % icons.length]
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Diet Tracker</h1>
        <p className="text-ar-gray-400 text-lg">
          Fuel your body with the right nutrition
        </p>
      </motion.div>

      {/* Progress Section */}
      <div className="grid grid-cols-2 gap-3 md:gap-8">
        {/* Calorie Progress */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center">Calorie Intake</h2>
          
          <div className="text-center mb-4 md:mb-6">
            <div className="text-3xl md:text-4xl font-bold text-ar-white mb-2">
              {dietCalories}
            </div>
            <div className="text-ar-gray-400 text-sm md:text-base mb-2">
              of {dailyCalorieGoal} calories
            </div>
            <div className="text-ar-orange font-bold text-base md:text-xl">
              {Math.round(progressPercentage)}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-ar-gray-800 rounded-full h-2 md:h-4 mb-4 md:mb-6">
            <motion.div 
              className="bg-ar-orange h-2 md:h-4 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target size={14} className="text-ar-blue md:w-5 md:h-5" />
                <span className="font-bold text-xs md:text-base">Remaining</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-ar-blue">
                {Math.max(dailyCalorieGoal - dietCalories, 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Utensils size={14} className="text-ar-green md:w-5 md:h-5" />
                <span className="font-bold text-xs md:text-base">Meals</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-ar-green">
                {meals.length}/3
              </div>
            </div>
          </div>

          {/* Goal Status - removed from here */}
        </motion.div>

        {/* Macros Pie Chart */}
        <motion.div
          className="glass-card p-3 md:p-6 rounded-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-6 text-center">Macronutrients</h2>
          
          {macroData.some(macro => macro.value > 0) ? (
            <>
              <div className="h-40 md:h-56 mb-2 md:mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData.filter(macro => macro.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      className="md:inner-radius-40 md:outer-radius-90"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #3B82F6',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      formatter={(value, name) => [`${value}g`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-1 md:space-y-2">
                {macroData.map(macro => (
                  <div key={macro.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div 
                        className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                        style={{ backgroundColor: macro.color }}
                      />
                      <span className="text-ar-gray-400 text-xs md:text-base">{macro.name}</span>
                    </div>
                    <span className="font-bold text-xs md:text-base" style={{ color: macro.color }}>
                      {macro.value}g
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 md:py-8 text-ar-gray-400">
              <TrendingUp size={24} className="mx-auto mb-2 md:mb-4 opacity-50 md:w-12 md:h-12" />
              <p className="text-xs md:text-base">No macro data yet</p>
              <p className="text-xs md:text-sm">Start logging meals!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Goal Status - Full Width */}
      {dietGoalMet && (
        <motion.div
          className="bg-ar-green/20 border border-ar-green/50 rounded-xl p-3 md:p-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-ar-green font-bold text-sm md:text-base">
              🎯 Daily meal goal achieved!
            </div>
            <div className="text-ar-gray-400 text-xs md:text-sm">
              {meals.length} meals logged
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <button
          onClick={() => setShowMealModal(true)}
          className="glass-card p-4 md:p-6 rounded-2xl hover:border-ar-green/50 transition-all duration-300 hover:shadow-card-hover group"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-ar-green/20 rounded-xl group-hover:bg-ar-green/30 transition-colors">
              <Plus className="text-ar-green" size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold">Manual Entry</h3>
              <p className="text-ar-gray-400 text-sm md:text-base">Log your meal details</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowFoodScanModal(true)}
          className="glass-card p-4 md:p-6 rounded-2xl hover:border-ar-blue/50 transition-all duration-300 hover:shadow-card-hover group"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-ar-blue/20 rounded-xl group-hover:bg-ar-blue/30 transition-colors">
              <Camera className="text-ar-blue" size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold">Food Scan</h3>
              <p className="text-ar-gray-400 text-sm md:text-base">Quick nutrition lookup</p>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Meal Log */}
      <motion.div
        className="glass-card p-4 md:p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Today's Meals</h2>
        
        {meals.length === 0 ? (
          <div className="text-center py-8 text-ar-gray-400">
            <Utensils size={48} className="mx-auto mb-4 opacity-50" />
            <p>No meals logged today</p>
            <p className="text-sm">Start tracking your nutrition above!</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {meals.slice().reverse().map((meal, index) => (
              <motion.div
                key={meal.id}
                className="p-4 bg-ar-dark-gray/30 rounded-xl border border-ar-violet/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {getMealIcon(index)}
                    </div>
                    <div>
                      <h3 className="font-bold text-ar-white text-lg">
                        {meal.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-ar-gray mt-1">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(meal.time)}
                        </div>
                        <div className="text-ar-violet font-bold">
                          {meal.calories} cal
                        </div>
                      </div>
                      {(meal.protein > 0 || meal.carbs > 0 || meal.fat > 0) && (
                        <div className="flex gap-4 mt-2 text-xs">
                          {meal.protein > 0 && (
                            <span className="text-ar-blue">
                              {meal.protein}g protein
                            </span>
                          )}
                          {meal.carbs > 0 && (
                            <span className="text-ar-violet">
                              {meal.carbs}g carbs
                            </span>
                          )}
                          {meal.fat > 0 && (
                            <span className="text-red-400">
                              {meal.fat}g fat
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Manual Entry Modal */}
      {showMealModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-card p-6 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6">Add Meal</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meal name"
                value={mealForm.name}
                onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                className="w-full bg-ar-gray-800 border border-ar-blue/30 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:outline-none focus:border-ar-blue focus:shadow-card"
              />
              <input
                type="number"
                placeholder="Calories"
                value={mealForm.calories}
                onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                className="w-full bg-ar-gray-800 border border-ar-blue/30 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:outline-none focus:border-ar-blue focus:shadow-card"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={mealForm.protein}
                  onChange={(e) => setMealForm({...mealForm, protein: e.target.value})}
                  className="bg-ar-gray-800 border border-ar-blue/30 rounded-xl px-3 py-2 text-ar-white placeholder-ar-gray-400 focus:outline-none focus:border-ar-blue text-sm focus:shadow-card"
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  value={mealForm.carbs}
                  onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})}
                  className="bg-ar-gray-800 border border-ar-green/30 rounded-xl px-3 py-2 text-ar-white placeholder-ar-gray-400 focus:outline-none focus:border-ar-green text-sm focus:shadow-card"
                />
                <input
                  type="number"
                  placeholder="Fat (g)"
                  value={mealForm.fat}
                  onChange={(e) => setMealForm({...mealForm, fat: e.target.value})}
                  className="bg-ar-gray-800 border border-ar-orange/30 rounded-xl px-3 py-2 text-ar-white placeholder-ar-gray-400 focus:outline-none focus:border-ar-orange text-sm focus:shadow-card"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowMealModal(false)}
                className="flex-1 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white font-bold py-3 rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleMealSubmit}
                disabled={!mealForm.name || !mealForm.calories}
                className="flex-1 bg-ar-blue hover:bg-ar-blue-light disabled:bg-ar-gray-700 disabled:text-ar-gray-400 text-white font-bold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                Add Meal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Food Scan Modal */}
      {showFoodScanModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-card p-6 rounded-2xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Food Scanner</h2>
            
            <div className="text-center py-8">
              <Camera size={64} className="mx-auto mb-4 text-ar-blue" />
              <p className="text-ar-gray mb-6">
                This is a demo version. Click below to scan a random food item!
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFoodScanModal(false)}
                  className="flex-1 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white font-bold py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={mockFoodScan}
                  className="flex-1 bg-ar-blue hover:bg-ar-blue-light text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover"
                >
                  Scan Food
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
