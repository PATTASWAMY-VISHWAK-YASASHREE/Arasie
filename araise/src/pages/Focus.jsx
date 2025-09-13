import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { useUserStore } from "../store/userStore"

// Import focus components directly
import FocusDashboard from "../components/focus/FocusDashboard.jsx"
import TaskCreation from "../components/focus/TaskCreation.jsx"
import LiveSession from "../components/focus/LiveSession.jsx"
import CompletionFlow from "../components/focus/CompletionFlow.jsx"

export default function Focus() {
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard', 'create', 'session', 'complete'
  const [currentSession, setCurrentSession] = useState(null)
  const [dashboardRefresh, setDashboardRefresh] = useState(0) // Trigger dashboard refresh
  
  const { 
    logFocusSession, 
    updateFocusProgress, 
    focusLogs = [], 
    saveFocusTask, 
    updateFocusTaskProgress, 
    addFocusTaskReflection,
    focusTasks = []
  } = useUserStore()

  // Function to trigger dashboard refresh
  const refreshDashboard = () => {
    setDashboardRefresh(prev => prev + 1)
  }

  // Real-time progress update handler (throttled to avoid too many Firebase calls)
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0)

  // Handler functions for the new design
  const handleStartSession = (type, task = null) => {
    let sessionData
    
    if (type === 'pomodoro') {
      sessionData = {
        name: task?.name || 'Pomodoro Session',
        duration: 25, // minutes
        breakType: 'pomodoro',
        taskId: task?.id || null
      }
    } else if (type === 'custom' && task) {
      sessionData = {
        name: task.name,
        duration: task.planned - task.completed,
        breakType: task.breakType || 'pomodoro',
        taskId: task.id
      }
    }
    
    // Reset progress tracking for new session
    setLastProgressUpdate(0)
    setCurrentSession(sessionData)
    setActiveView('session')
  }

  const handleCreateCustom = () => {
    setActiveView('create')
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (typeof saveFocusTask === 'function') {
        const newTask = await saveFocusTask({
          name: taskData.name,
          planned: taskData.duration,
          breakType: taskData.breakType,
          customCycles: taskData.customCycles,
          repeat: taskData.repeat
        })
        
        // Set session data for immediate start
        setLastProgressUpdate(0) // Reset progress tracking
        setCurrentSession({
          ...taskData,
          taskId: newTask.id // Add task ID for progress tracking
        })
        setActiveView('session')
      } else {
        // Fallback to just starting the session
        setCurrentSession(taskData)
        setActiveView('session')
      }
    } catch (error) {
      console.error('Error saving custom task:', error)
      // Fallback to just starting the session
      setCurrentSession(taskData)
      setActiveView('session')
    }
  }

  const handleSessionComplete = async (sessionResult) => {
    // Only log to focusLogs if this is NOT a custom task (to avoid double counting)
    if (!currentSession?.taskId && typeof logFocusSession === 'function') {
      await logFocusSession(sessionResult.duration, sessionResult.task, sessionResult.completed)
    }
    
    // Update custom task progress if this was a custom task and any time was spent
    if (currentSession?.taskId && sessionResult.duration > 0 && typeof updateFocusTaskProgress === 'function') {
      try {
        await updateFocusTaskProgress(currentSession.taskId, sessionResult.duration)
      } catch (error) {
        console.error('Error updating task progress:', error)
      }
    }
    
    // Update focus progress (include both completed and partial sessions)
    if (typeof updateFocusProgress === 'function' && sessionResult.duration > 0) {
      const today = new Date().toISOString().slice(0, 10)
      
      // Get today's focus log sessions (pomodoro sessions only)
      const todaysFocusLogSessions = focusLogs.filter(log => 
        log.time && log.time.slice(0, 10) === today
      )
      const focusLogMinutes = todaysFocusLogSessions.reduce((total, session) => total + session.duration, 0)
      
      // Get today's completed tasks (custom tasks only)
      const todaysCompletedTasks = focusTasks.filter(task => 
        task.date === today && task.status === 'completed'
      )
      const taskMinutes = todaysCompletedTasks.reduce((total, task) => total + (task.completed || task.planned || 0), 0)
      
      // Add current session minutes (don't double count)
      let totalMinutes = focusLogMinutes + taskMinutes
      if (!currentSession?.taskId) {
        // This is a pomodoro session, add to focus log minutes
        totalMinutes += sessionResult.duration
      }
      // Custom task minutes are already included via updateFocusTaskProgress
      
      await updateFocusProgress(Math.min((totalMinutes / 60) * 100, 100)) // 60 min = 1h goal
    }
    
    // Only show completion flow if session was actually completed
    if (sessionResult.completed) {
      setActiveView('complete')
    } else {
      // For partial sessions, return to dashboard
      handleReturnToDashboard()
    }
  }

  const handleSessionEnd = () => {
    setCurrentSession(null)
    refreshDashboard() // Refresh dashboard data
    setActiveView('dashboard')
  }



  const handleReturnToDashboard = () => {
    setCurrentSession(null)
    refreshDashboard() // Refresh dashboard data
    setActiveView('dashboard')
  }

  const handleAddReflection = async (reflection) => {
    // Save reflection as completion description to the task
    if (currentSession?.taskId && reflection.trim() && typeof addFocusTaskReflection === 'function') {
      try {
        await addFocusTaskReflection(currentSession.taskId, reflection)
      } catch (error) {
        console.error('Error saving completion description:', error)
      }
    }
  }

  const handleProgressUpdate = async (taskId, minutesSpent) => {
    try {
      // Only update every minute to avoid too many Firebase calls
      if (minutesSpent > lastProgressUpdate) {
        const progressToAdd = minutesSpent - lastProgressUpdate
        
        if (progressToAdd > 0) {
          await updateFocusTaskProgress(taskId, progressToAdd)
          
          // Also update overall focus progress
          if (typeof updateFocusProgress === 'function') {
            const today = new Date().toISOString().slice(0, 10)
            
            // Get today's focus log sessions (pomodoro sessions only)
            const todaysFocusLogSessions = focusLogs.filter(log => 
              log.time && log.time.slice(0, 10) === today
            )
            const focusLogMinutes = todaysFocusLogSessions.reduce((total, session) => total + session.duration, 0)
            
            // Get today's completed tasks (custom tasks only) 
            const todaysCompletedTasks = focusTasks.filter(task => 
              task.date === today && task.status === 'completed'
            )
            const taskMinutes = todaysCompletedTasks.reduce((total, task) => total + (task.completed || task.planned || 0), 0)
            
            // Add current progress (this is a custom task session)
            const totalMinutes = focusLogMinutes + taskMinutes + progressToAdd
            await updateFocusProgress(Math.min((totalMinutes / 60) * 100, 100))
          }
          
          setLastProgressUpdate(minutesSpent)
        }
      }
    } catch (error) {
      console.error('Error updating real-time progress:', error)
    }
  }

  // Calculate total focused time today
  const getTotalFocusedToday = () => {
    const today = new Date().toISOString().slice(0, 10)
    const todaysSessions = focusLogs.filter(log => 
      log.time.slice(0, 10) === today && log.completed
    )
    return todaysSessions.reduce((total, session) => total + session.duration, 0)
  }

  return (
    <AnimatePresence mode="wait">
      {activeView === 'dashboard' && (
        <FocusDashboard
          onStartSession={handleStartSession}
          onCreateCustom={handleCreateCustom}
          refreshTrigger={dashboardRefresh}
        />
      )}
      
      {activeView === 'create' && (
        <TaskCreation
          onSave={handleSaveTask}
          onClose={() => {
            refreshDashboard() // Refresh dashboard when closing task creation
            setActiveView('dashboard')
          }}
        />
      )}
      
      {activeView === 'session' && currentSession && (
        <LiveSession
          sessionData={currentSession}
          onComplete={handleSessionComplete}
          onEnd={handleSessionEnd}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
      
      {activeView === 'complete' && currentSession && (
        <CompletionFlow
          sessionData={currentSession}
          onReturnToDashboard={handleReturnToDashboard}
          onAddReflection={handleAddReflection}
          totalFocusedToday={getTotalFocusedToday()}
        />
      )}
      

    </AnimatePresence>
  )
}
