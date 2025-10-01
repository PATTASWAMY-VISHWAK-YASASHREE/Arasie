import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useUserStore } from "../store/userStore"
import { useNavigate } from "react-router-dom"

// Import focus components directly
import TaskCreation from "../components/focus/TaskCreation.jsx"
import LiveSession from "../components/focus/LiveSession.jsx"
import CompletionFlow from "../components/focus/CompletionFlow.jsx"
import FocusGoalCard from "../components/focus/FocusGoalCard.jsx"
import AddTaskModal from "../components/focus/AddTaskModal.jsx"
import TimeBlockedList from "../components/focus/TimeBlockedList.jsx"
import MinimalStatsRow from "../components/focus/MinimalStatsRow.jsx"
import FocusSessionsCard from "../components/focus/FocusSessionsCard.jsx"
import notificationService from "../services/NotificationService"

import { useXpStore } from "../store/xpStore"

export default function Focus() {
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard', 'create', 'session', 'complete'
  const [currentSession, setCurrentSession] = useState(null)
  const [dashboardRefresh, setDashboardRefresh] = useState(0) // Trigger dashboard refresh
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [completionMeta, setCompletionMeta] = useState({ xpGained: 0, leveledUp: false })
  const [stickyTimer, setStickyTimer] = useState({ 
    visible: false, 
    remaining: 0, 
    isPaused: false, 
    mode: 'Pomodoro', 
    taskName: '',
    cycles: 1,
    currentCycle: 1,
    breakDuration: 5,
    completedBreaks: 0
  })
  const [nextSuggestion, setNextSuggestion] = useState(null)
  
  const navigate = useNavigate()
  const { 
    logFocusSession, 
    updateFocusProgress, 
    focusLogs = [], 
    saveFocusTask, 
    updateFocusTaskProgress, 
    addFocusTaskReflection,
    focusTasks = []
  } = useUserStore()

  const { xp, level, streakDays, awardXp, touchStreak } = useXpStore()

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
        name: task.title,
        duration: task.focusDuration || 25,
        breakDuration: task.breakDuration || 5,
        cycles: task.cycles || 1,
        breakType: 'pomodoro',
        taskId: task.id
      }
    }
    
    // Reset progress tracking for new session
    setLastProgressUpdate(0)
    setCurrentSession(sessionData)
    setActiveView('session')
    // Show sticky bar while in session
    const sessionMode = type === 'custom' ? `Custom (${sessionData.duration}min)` : 'Pomodoro'
    setStickyTimer({ 
      visible: true, 
      remaining: sessionData.duration * 60, 
      isPaused: false, 
      mode: sessionMode, 
      taskName: sessionData.name,
      cycles: sessionData.cycles || 1,
      breakDuration: sessionData.breakDuration || 5
    })
  }

  // Suggest starting the next scheduled task when its start time is near
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const today = new Date().toISOString().slice(0, 10)
      const upcoming = (focusTasks || [])
        .filter(t => t.date === today && t.startTime && t.endTime)
        .filter(t => {
          const startAt = new Date(`${t.date}T${t.startTime}:00`).getTime()
          return startAt >= now && (startAt - now) <= 5 * 60 * 1000
        })
        .sort((a,b) => a.startAt - b.startAt)[0]
      if (upcoming && !stickyTimer.visible) {
        setNextSuggestion(upcoming)
        // Fire browser notification if permitted
        if (notificationService.isSupported()) {
          notificationService.requestPermission().then(() => {
            notificationService.showNotification('Upcoming Focus Task', {
              body: `${upcoming.title} starts at ${new Date(upcoming.startAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
              tag: 'focus-upcoming',
            })
          })
        }
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [focusTasks, stickyTimer.visible])

  // Track cycle progress during focus sessions
  useEffect(() => {
    if (!stickyTimer.visible || !currentSession) return

    const interval = setInterval(() => {
      if (stickyTimer.isPaused) return

      const totalSessionTime = (currentSession.duration + currentSession.breakDuration) * 60 // in seconds
      const elapsed = (currentSession.duration * 60) - stickyTimer.remaining
      const currentCycle = Math.floor(elapsed / totalSessionTime) + 1
      const completedBreaks = Math.max(0, currentCycle - 1)

      setStickyTimer(prev => ({
        ...prev,
        currentCycle: Math.min(currentCycle, currentSession.cycles || 1),
        completedBreaks: Math.min(completedBreaks, (currentSession.cycles || 1) - 1)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [stickyTimer.visible, stickyTimer.isPaused, currentSession, stickyTimer.remaining])

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
    
                // If session completed and linked to a task, mark task done in local task store
                if (sessionResult.completed && currentSession?.taskId) {
                  try {
                    // Mark the focus task as completed by updating its progress
                    await updateFocusTaskProgress(currentSession.taskId, sessionResult.duration)
                  } catch (err) {
                    console.error('Failed to auto-complete task after session:', err)
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
      // Award XP: 1 XP per focused minute (streak logic handled automatically)
      if (sessionResult.duration > 0) {
        const prevLevel = useXpStore.getState().level
        awardXp(sessionResult.duration)
        const nextLevel = useXpStore.getState().level
        setCompletionMeta({ xpGained: sessionResult.duration, leveledUp: nextLevel > prevLevel })
      }
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
    setStickyTimer(prev => ({ ...prev, visible: false }))
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

  // Handle focus session card events
  const handleFocusSessionStart = (sessionData) => {
    // Set up session data for LiveSession component
    const sessionConfig = {
      name: sessionData.name,
      duration: sessionData.duration,
      breakDuration: sessionData.breakDuration || 0,
      cycles: sessionData.cycles || 1,
      breakType: 'pomodoro',
      taskId: null // No specific task for these sessions
    }
    
    // Reset progress tracking for new session
    setLastProgressUpdate(0)
    setCurrentSession(sessionConfig)
    setActiveView('session')
  }

  const handleFocusSessionEnd = (sessionResult) => {
    // Handle session completion
    if (sessionResult.completed) {
      // Award XP based on session duration
      const totalMinutes = sessionResult.duration
      const xpEarned = Math.round(totalMinutes / 5) // 5 minutes = 1 XP base
      const boostedXp = totalMinutes >= 60 ? Math.round(xpEarned * 1.2) : xpEarned // 20% boost for sessions 60+ min
      
      awardXp(boostedXp)
      
      // Log the completed session
      if (typeof logFocusSession === 'function') {
        logFocusSession(totalMinutes, sessionResult.name || 'Focus Session', true)
      }
      
      // Update focus progress
      if (typeof updateFocusProgress === 'function') {
        const today = new Date().toISOString().slice(0, 10)
        
        // Get today's focus log sessions
        const todaysFocusLogSessions = focusLogs.filter(log => 
          log.time && log.time.slice(0, 10) === today
        )
        const focusLogMinutes = todaysFocusLogSessions.reduce((total, session) => total + session.duration, 0)
        
        // Get today's completed tasks
        const todaysCompletedTasks = focusTasks.filter(task => 
          task.date === today && task.status === 'completed'
        )
        const taskMinutes = todaysCompletedTasks.reduce((total, task) => {
          if (task.startTime && task.endTime) {
            const startAt = new Date(`${task.date}T${task.startTime}:00`).getTime()
            const endAt = new Date(`${task.date}T${task.endTime}:00`).getTime()
            return total + Math.max(0, Math.round((endAt - startAt) / 60000))
          }
          return total + (task.focusDuration || 25)
        }, 0)
        
        // Add current session minutes
        const totalMinutes = focusLogMinutes + taskMinutes + totalMinutes
        updateFocusProgress(Math.min((totalMinutes / 60) * 100, 100))
      }
      
      // Show completion flow
      setCompletionMeta({ xpGained: boostedXp, leveledUp: false })
      setActiveView('complete')
    } else {
      // Session ended without completion
      handleReturnToDashboard()
    }
  }

  // Calculate total focused time today (including completed tasks)
  const getTotalFocusedToday = () => {
    const today = new Date().toISOString().slice(0, 10)
    
    // Get focus log sessions (pomodoro sessions)
    const todaysSessions = focusLogs.filter(log => 
      log.time && log.time.slice(0, 10) === today && log.completed
    )
    const focusLogMinutes = todaysSessions.reduce((total, session) => total + session.duration, 0)
    
    // Get completed tasks with focus mode (custom focus sessions)
    const todaysCompletedTasks = focusTasks.filter(task => 
      task.date === today && task.status === 'completed'
    )
    const taskMinutes = todaysCompletedTasks.reduce((total, task) => {
      if (task.startTime && task.endTime) {
        const startAt = new Date(`${task.date}T${task.startTime}:00`).getTime()
        const endAt = new Date(`${task.date}T${task.endTime}:00`).getTime()
        return total + Math.max(0, Math.round((endAt - startAt) / 60000))
      }
      return total + (task.focusDuration || 25) // fallback to focus duration
    }, 0)
    
    return focusLogMinutes + taskMinutes
  }

  const calculatePlannedForToday = (allTasks) => {
    const today = new Date().toISOString().slice(0, 10)
    return (allTasks || [])
      .filter(t => t.date === today && t.startTime && t.endTime)
      .reduce((m, t) => {
        const startAt = new Date(`${t.date}T${t.startTime}:00`).getTime()
        const endAt = new Date(`${t.date}T${t.endTime}:00`).getTime()
        return m + Math.max(0, Math.round((endAt - startAt) / 60000))
      }, 0)
  }

  return (
    <AnimatePresence mode="wait">
      {activeView === 'dashboard' && (
        <div className="px-3 py-4 space-y-3 md:space-y-6 md:px-4 md:py-6 max-w-5xl mx-auto">
          {nextSuggestion && (
            <div className="glass-card p-3 rounded-lg border border-ar-gray-700/60 flex items-center justify-between">
              <div className="text-sm text-ar-white">
                Upcoming: <span className="font-medium">{nextSuggestion.title}</span> starts at {new Date(nextSuggestion.startAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { handleStartSession('pomodoro', { name: nextSuggestion.title }); setNextSuggestion(null) }} className="px-3 py-2 rounded bg-ar-blue text-white text-sm">Start Now</button>
                <button onClick={() => setNextSuggestion(null)} className="px-3 py-2 rounded bg-ar-gray-700 text-ar-gray-200 text-sm">Dismiss</button>
              </div>
            </div>
          )}
          <FocusGoalCard
            quote="Win the next block of time."
            plannedMinutes={calculatePlannedForToday(focusTasks)}
            completedMinutes={getTotalFocusedToday()}
            xp={xp}
            nextLevelXp={(useXpStore.getState().level) * 100}
            streakDays={streakDays}
          />

          <MinimalStatsRow focusLogs={focusLogs} streakDays={streakDays} tasks={focusTasks} />

          <FocusSessionsCard 
            onStartSession={handleFocusSessionStart}
            onEndSession={handleFocusSessionEnd}
          />

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => navigate('/focus/calendar')} className="flex-1 bg-ar-gray-800/60 border border-ar-gray-700 rounded-lg p-2 md:p-3 text-ar-white text-sm md:text-base font-medium touch-manipulation">📆 View Schedule➤</button>
            <button onClick={() => setIsAddOpen(true)} className="flex-1 bg-ar-blue text-white rounded-lg p-2 md:p-3 text-sm md:text-base font-medium touch-manipulation">➕ Add New Task</button>
          </div>

          <TimeBlockedList onStart={(task) => handleStartSession('custom', task)} />

          {/* Modals */}
          <AddTaskModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
          {/* Calendar modal removed in favor of inline calendar (keeping import for now if used elsewhere) */}
        </div>
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
          xpGained={completionMeta.xpGained}
          leveledUp={completionMeta.leveledUp}
          onReturnToDashboard={handleReturnToDashboard}
          onAddReflection={handleAddReflection}
          totalFocusedToday={getTotalFocusedToday()}
        />
      )}
      

    </AnimatePresence>
  )
}
