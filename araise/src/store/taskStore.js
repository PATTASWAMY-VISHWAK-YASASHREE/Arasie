import { create } from 'zustand'
import { useXpStore } from './xpStore'

const persistKey = 'focus:tasks'

function loadInitialState() {
  try {
    const raw = localStorage.getItem(persistKey)
    if (!raw) return { tasks: [], reminders: [] }
    const parsed = JSON.parse(raw)
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    }
  } catch {
    return { tasks: [], reminders: [] }
  }
}

function saveState(state) {
  try {
    localStorage.setItem(persistKey, JSON.stringify({ tasks: state.tasks, reminders: state.reminders }))
  } catch {}
}

export const useTaskStore = create((set, get) => ({
  ...loadInitialState(),

  addTask: (title, category = 'work', opts = {}) => {
    const state = get()
    const today = (opts.date || new Date().toISOString().slice(0, 10))
    const maxOrder = Math.max(
      -1,
      ...state.tasks
        .filter(t => t.date === today && (!t.startAt || !t.endAt))
        .map(t => typeof t.order === 'number' ? t.order : -1)
    )
    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      category,
      createdAt: Date.now(),
      // time-blocked fields
      date: opts.date || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      startAt: opts.startAt || null, // epoch ms
      endAt: opts.endAt || null, // epoch ms
      tag: opts.tag || category, // alias for UI tags
      focusMode: Boolean(opts.focusMode),
      focusDuration: opts.focusDuration || 25, // minutes
      breakDuration: (typeof opts.breakDuration === 'number') ? opts.breakDuration : 5, // minutes (allow 0)
      // recurrence
      repeat: opts.repeat || 'none', // 'none' | 'daily' | 'weekly'
      repeatUntil: opts.repeatUntil || null, // YYYY-MM-DD string
      exceptions: Array.isArray(opts.exceptions) ? opts.exceptions : [], // dates YYYY-MM-DD to skip
      order: (typeof opts.order === 'number') ? opts.order : maxOrder + 1,
    }
    set((state) => {
      const next = { ...state, tasks: [newTask, ...state.tasks] }
      saveState(next)
      return next
    })
  },

  toggleTask: (id) => {
    const { awardXp } = useXpStore.getState()
    set((state) => {
      let awarded = 0
      const tasks = state.tasks.map(t => {
        if (t.id !== id) return t
        const newDone = !t.done
        if (newDone) {
          awarded = t.focusMode ? 20 : 10
        }
        return { ...t, done: newDone }
      })
      // Award XP after computing new state
      if (awarded > 0 && typeof awardXp === 'function') {
        awardXp(awarded)
      }
      const next = { ...state, tasks }
      saveState(next)
      return next
    })
  },

  updateTask: (id, updates) => {
    set((state) => {
      const tasks = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      const next = { ...state, tasks }
      saveState(next)
      return next
    })
  },

  removeTask: (id) => {
    set((state) => {
      const next = { ...state, tasks: state.tasks.filter(t => t.id !== id) }
      saveState(next)
      return next
    })
  },

  reorderUnscheduled: (dateStr, sourceId, targetId) => {
    set((state) => {
      const tasks = [...state.tasks]
      const a = tasks.find(t => t.id === sourceId)
      const b = tasks.find(t => t.id === targetId)
      if (!a || !b) return state
      if (a.date !== dateStr || b.date !== dateStr) return state
      if ((a.startAt && a.endAt) || (b.startAt && b.endAt)) return state
      const temp = a.order ?? 0
      a.order = b.order ?? 0
      b.order = temp
      const next = { ...state, tasks }
      saveState(next)
      return next
    })
  },

  // Generate day view including recurring instances without mutating tasks
  getTasksForDate: (dateStr) => {
    const state = get()
    const result = []
    for (const t of state.tasks) {
      // Skip exceptions on this date
      const isException = (t.exceptions || []).includes(dateStr)
      if (isException) continue

      if ((t.repeat || 'none') === 'none') {
        if (t.date === dateStr) result.push(t)
        continue
      }

      const untilOk = !t.repeatUntil || dateStr <= t.repeatUntil
      if (!untilOk) continue

      // Determine if this date qualifies
      if (t.repeat === 'daily') {
        // Any date on/after original date until repeatUntil
        if (dateStr >= t.date) {
          result.push({ ...t, date: dateStr })
        }
      } else if (t.repeat === 'weekly') {
        if (dateStr >= t.date) {
          const base = new Date(t.date + 'T00:00:00')
          const target = new Date(dateStr + 'T00:00:00')
          const sameWeekday = base.getDay() === target.getDay()
          if (sameWeekday) {
            result.push({ ...t, date: dateStr })
          }
        }
      }
    }
    return result
  },

  // Delete one occurrence (adds exception date)
  deleteOccurrence: (taskId, dateStr) => {
    set((state) => {
      const tasks = state.tasks.map(t => t.id === taskId ? { ...t, exceptions: Array.from(new Set([...(t.exceptions||[]), dateStr])) } : t)
      const next = { ...state, tasks }
      saveState(next)
      return next
    })
  },

  // Delete entire series or single non-repeating task
  deleteSeries: (taskId) => {
    set((state) => {
      const next = { ...state, tasks: state.tasks.filter(t => t.id !== taskId) }
      saveState(next)
      return next
    })
  },

  // Shift a single (non-recurring or base) task's start/end by minutes
  shiftTask: (taskId, minutes) => {
    set((state) => {
      const tasks = state.tasks.map(t => t.id === taskId ? {
        ...t,
        startAt: typeof t.startAt === 'number' ? t.startAt + minutes * 60000 : t.startAt,
        endAt: typeof t.endAt === 'number' ? t.endAt + minutes * 60000 : t.endAt,
      } : t)
      const next = { ...state, tasks }
      saveState(next)
      return next
    })
  },

  // Resize task by adjusting endAt by minutes
  resizeTask: (taskId, minutesDelta) => {
    set((state) => {
      const tasks = state.tasks.map(t => t.id === taskId ? {
        ...t,
        endAt: typeof t.endAt === 'number' ? Math.max(t.startAt + 5 * 60000, t.endAt + minutesDelta * 60000) : t.endAt,
      } : t)
      const next = { ...state, tasks }
      saveState(next)
      return next
    })
  },

  clearDone: () => {
    set((state) => {
      const next = { ...state, tasks: state.tasks.filter(t => !t.done) }
      saveState(next)
      return next
    })
  },

  // Reminders
  addReminder: (title, atEpochMs) => {
    const reminder = { id: crypto.randomUUID(), title, at: atEpochMs, snoozed: false, done: false }
    set((state) => {
      const next = { ...state, reminders: [reminder, ...state.reminders] }
      saveState(next)
      return next
    })
  },

  snoozeReminder: (id, minutes = 5) => {
    set((state) => {
      const reminders = state.reminders.map(r => r.id === id ? { ...r, at: r.at + minutes * 60 * 1000, snoozed: true } : r)
      const next = { ...state, reminders }
      saveState(next)
      return next
    })
  },

  completeReminder: (id) => {
    set((state) => {
      const reminders = state.reminders.map(r => r.id === id ? { ...r, done: true } : r)
      const next = { ...state, reminders }
      saveState(next)
      return next
    })
  },

  removeReminder: (id) => {
    set((state) => {
      const next = { ...state, reminders: state.reminders.filter(r => r.id !== id) }
      saveState(next)
      return next
    })
  },
}))


