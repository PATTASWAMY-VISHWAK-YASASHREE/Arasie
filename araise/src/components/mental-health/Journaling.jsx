import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore } from "../../store/userStore"

export default function Journaling({ onBack }) {
  const [journalNote, setJournalNote] = useState('')
  const [isWriting, setIsWriting] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [expandedEntries, setExpandedEntries] = useState(new Set())
  const [selectedMood, setSelectedMood] = useState(null)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [moodSelectedToday, setMoodSelectedToday] = useState(false)
  const [journalWrittenToday, setJournalWrittenToday] = useState(false)
  const { 
    journalEntries, 
    updateMentalHealthProgress, 
    logMentalHealthEntry,
    saveJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    loadJournalEntries
  } = useUserStore()

  // Auto-create today's entry if it doesn't exist
  const createTodaysEntry = () => {
    const today = new Date()
    const todayEntry = {
      id: Date.now(),
      content: "Today's reflection...", // Placeholder content
      date: today.toISOString(),
      mood: 'neutral',
      isAutoCreated: true // Flag to identify auto-created entries
    }
    return todayEntry
  }

  // Load journal entries from database on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        await loadJournalEntries()
        
        // Check if today's entry exists after loading
        const today = new Date()
        const todaysEntry = journalEntries.find(entry => 
          new Date(entry.date).toDateString() === today.toDateString()
        )
        
        if (todaysEntry) {
          // Check if mood was selected today
          if (todaysEntry.mood && todaysEntry.mood !== 'neutral') {
            setMoodSelectedToday(true)
            setSelectedMood(todaysEntry.mood)
          }
          
          // Check if journal was written today (not just auto-created)
          if (todaysEntry.content && 
              todaysEntry.content !== "Today's reflection..." && 
              !todaysEntry.isAutoCreated) {
            setJournalWrittenToday(true)
          }
        } else {
          // Auto-create today's entry if it doesn't exist
          const todaysEntry = createTodaysEntry()
          await saveJournalEntry(todaysEntry)
        }
      } catch (error) {
        console.error('Error loading journal entries:', error)
      }
    }
    
    loadEntries()
  }, [journalEntries.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleJournalSave = async () => {
    if (journalNote.trim()) {
      try {
        const newEntry = {
          id: Date.now(),
          content: journalNote.trim(),
          date: new Date().toISOString(),
          mood: selectedMood || 'neutral',
          isAutoCreated: false
        }
        
        await saveJournalEntry(newEntry)
        logMentalHealthEntry(selectedMood || 'neutral', journalNote.trim())
        
        // Give progress based on what's been completed today
        if (!journalWrittenToday) {
          // First journal entry of the day gets 100% (or 75% if mood already selected)
          const progressToGive = moodSelectedToday ? 75 : 100
          updateMentalHealthProgress(progressToGive)
          setJournalWrittenToday(true)
        } else {
          // Additional entries get 25%
          updateMentalHealthProgress(25)
        }
        
        setJournalNote('')
        setIsWriting(false)
      } catch (error) {
        console.error('Error saving journal entry:', error)
      }
    }
  }

  const handleAppendToToday = async () => {
    if (journalNote.trim() && journalEntries.length > 0 && formatDate(journalEntries[0].date) === 'Today') {
      try {
        // Append to today's existing entry
        const todaysEntry = journalEntries[0]
        const updatedContent = todaysEntry.content + '\n\n' + journalNote.trim()
        
        await updateJournalEntry(todaysEntry.id, updatedContent)
        logMentalHealthEntry(selectedMood || 'neutral', journalNote.trim())
        
        // Only give progress if this is the first real content added today
        if (todaysEntry.isAutoCreated || todaysEntry.content === "Today's reflection...") {
          const progressToGive = moodSelectedToday ? 75 : 100
          updateMentalHealthProgress(progressToGive)
          setJournalWrittenToday(true)
        } else {
          updateMentalHealthProgress(25) // 25% for adding more thoughts
        }
        setJournalNote('')
        setIsWriting(false)
      } catch (error) {
        console.error('Error appending to journal entry:', error)
      }
    } else {
      // Create new entry if no today's entry exists
      await handleJournalSave()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const diffTime = Math.abs(today - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
  }

  const getEntryIcon = (index) => {
    return (
      <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    )
  }

  const handleEditEntry = (entry) => {
    setEditingEntry(entry.id)
    setEditContent(entry.content)
  }

  const handleSaveEdit = async (entryId) => {
    if (editContent.trim()) {
      try {
        await updateJournalEntry(entryId, editContent.trim())
        setEditingEntry(null)
        setEditContent('')
      } catch (error) {
        console.error('Error updating journal entry:', error)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setEditContent('')
  }

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await deleteJournalEntry(entryId)
      } catch (error) {
        console.error('Error deleting journal entry:', error)
      }
    }
  }

  const handleSaveAsNewEntry = async () => {
    // Save today's entry content as a new separate entry
    if (journalEntries.length > 0 && formatDate(journalEntries[0].date) === 'Today') {
      const todaysEntry = journalEntries[0]
      if (todaysEntry.content && todaysEntry.content !== "Today's reflection...") {
        try {
          const newEntry = {
            id: Date.now(),
            content: todaysEntry.content,
            date: new Date().toISOString(),
            mood: selectedMood || 'neutral'
          }
          
          await saveJournalEntry(newEntry)
          logMentalHealthEntry(selectedMood || 'neutral', todaysEntry.content)
          updateMentalHealthProgress(25) // 25% for saving additional entry
        } catch (error) {
          console.error('Error saving new journal entry:', error)
        }
      }
    }
  }

  const handleMoodSelect = async (mood) => {
    if (moodSelectedToday) return // Don't allow multiple mood selections per day
    
    setSelectedMood(mood)
    setMoodSelectedToday(true)
    setShowMoodSelector(false)
    
    // Give 25% progress for mood reaction (only once per day)
    logMentalHealthEntry(mood, '')
    updateMentalHealthProgress(25)
    
    // Update today's entry with the selected mood if it exists
    if (journalEntries.length > 0 && formatDate(journalEntries[0].date) === 'Today') {
      try {
        const todaysEntry = journalEntries[0]
        // Update the entry with the new mood
        const updatedContent = todaysEntry.content
        await updateJournalEntry(todaysEntry.id, updatedContent)
      } catch (error) {
        console.error('Error updating mood:', error)
      }
    }
  }

  const moods = [
    { emoji: '😊', name: 'happy', color: 'text-yellow-400' },
    { emoji: '😐', name: 'neutral', color: 'text-gray-400' },
    { emoji: '😔', name: 'sad', color: 'text-blue-400' },
    { emoji: '😰', name: 'anxious', color: 'text-purple-400' },
    { emoji: '😡', name: 'angry', color: 'text-red-400' }
  ]

  const MoodSelector = () => (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-ar-white mb-3">How are you feeling today?</h4>
      <div className="flex gap-3 justify-center">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodSelect(mood.name)}
            className={`text-2xl p-3 rounded-xl transition-all hover:scale-110 ${
              selectedMood === mood.name 
                ? 'bg-purple-600/20 ring-2 ring-purple-500' 
                : 'hover:bg-ar-gray-700/50'
            }`}
            title={mood.name}
          >
            {mood.emoji}
          </button>
        ))}
      </div>
      {selectedMood && (
        <p className="text-center text-sm text-ar-gray-400 mt-2">
          Feeling {selectedMood} today
        </p>
      )}
    </div>
  )

  const toggleExpanded = (entryId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const TruncatedText = ({ content, entryId, maxLength = 200 }) => {
    const isExpanded = expandedEntries.has(entryId)
    const shouldTruncate = content.length > maxLength
    
    if (!shouldTruncate) {
      return (
        <p className="text-ar-gray-300 text-sm leading-relaxed break-words overflow-wrap-anywhere max-w-full">
          {content}
        </p>
      )
    }
    
    const truncatedText = content.slice(0, maxLength) + '...'
    
    return (
      <div className="w-full max-w-full">
        <motion.div
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : 'auto'
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="overflow-hidden max-w-full"
        >
          <p className="text-ar-gray-300 text-sm leading-relaxed mb-2 break-words overflow-wrap-anywhere whitespace-pre-wrap max-w-full">
            {isExpanded ? content : truncatedText}
          </p>
        </motion.div>
        <button
          onClick={() => toggleExpanded(entryId)}
          className="text-purple-400 hover:text-purple-300 text-xs transition-colors inline-flex items-center gap-1 mt-1"
        >
          {isExpanded ? (
            <>
              Read less
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              Read more
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pt-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-hagrid font-light text-ar-white flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            My Journal
          </h1>
        </div>
        <button className="text-ar-gray-400 hover:text-white transition-colors p-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </motion.div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {/* Today's Entry / New Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mt-1">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-ar-white mb-2">Today</h3>
                
                {/* Mood Selector - Only show once per day */}
                {!moodSelectedToday && !isWriting && (
                  <MoodSelector />
                )}
                
                {!isWriting && journalEntries.length > 0 && 
                 formatDate(journalEntries[0].date) === 'Today' ? (
                  // Show today's entry if it exists
                  <div>
                    {editingEntry === journalEntries[0].id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-32 bg-ar-gray-800/50 border border-ar-gray-700 rounded-lg p-4 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none text-sm mb-4"
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSaveEdit(journalEntries[0].id)}
                            disabled={!editContent.trim()}
                            className="bg-purple-600 hover:bg-purple-500 disabled:bg-ar-gray-700 disabled:text-ar-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-ar-gray-400 hover:text-white transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <TruncatedText 
                            content={journalEntries[0].content} 
                            entryId={journalEntries[0].id}
                            maxLength={150}
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            onClick={() => setIsWriting(true)}
                            className="text-ar-gray-400 text-sm hover:text-purple-400 active:text-purple-400 transition-colors"
                          >
                            Add more thoughts...
                          </button>
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveAsNewEntry}
                              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Save
                            </button>
                            <button
                              onClick={() => handleEditEntry(journalEntries[0])}
                              className="text-ar-gray-400 text-sm hover:text-blue-400 active:text-blue-400 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(journalEntries[0].id)}
                              className="text-ar-gray-400 text-sm hover:text-red-400 active:text-red-400 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Show writing interface
                  <div>
                    {!isWriting ? (
                      <div>
                        <p className="text-ar-gray-400 text-sm mb-4">
                          Today you felt anxious, but practiced breathing and gratitude.
                        </p>
                        <button
                          onClick={() => setIsWriting(true)}
                          className="text-ar-gray-400 text-sm hover:text-purple-400 transition-colors bg-ar-gray-800/50 px-4 py-3 rounded-lg w-full text-left"
                        >
                          Add your notes...
                        </button>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={journalNote}
                          onChange={(e) => setJournalNote(e.target.value)}
                          placeholder="How are you feeling today? What's on your mind?"
                          className="w-full h-32 bg-ar-gray-800/50 border border-ar-gray-700 rounded-lg p-4 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={
                              journalEntries.length > 0 && formatDate(journalEntries[0].date) === 'Today' 
                                ? handleAppendToToday 
                                : handleJournalSave
                            }
                            disabled={!journalNote.trim()}
                            className="bg-purple-600 hover:bg-purple-500 disabled:bg-ar-gray-700 disabled:text-ar-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            {journalEntries.length > 0 && formatDate(journalEntries[0].date) === 'Today' 
                              ? 'Add to Today' 
                              : 'Save Entry'
                            }
                          </button>
                          <button
                            onClick={() => {
                              setIsWriting(false)
                              setJournalNote('')
                            }}
                            className="text-ar-gray-400 hover:text-white transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Past Entries */}
        <AnimatePresence>
          {journalEntries.map((entry, index) => {
            const isToday = formatDate(entry.date) === 'Today'
            if (isToday && index === 0) return null // Skip today's entry as it's shown above
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 group md:hover:bg-ar-gray-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getEntryIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-ar-white flex-1 flex items-center gap-2">
                        {formatDate(entry.date)}
                        {entry.mood && entry.mood !== 'neutral' && (
                          <span className="text-lg">
                            {moods.find(m => m.name === entry.mood)?.emoji || '😐'}
                          </span>
                        )}
                        {entry.lastModified && (
                          <span className="text-xs text-ar-gray-500 ml-2">(edited)</span>
                        )}
                      </h3>
                      {/* Always visible on mobile, hover on desktop */}
                      <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="text-ar-gray-400 hover:text-blue-400 active:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-500/10 active:bg-blue-500/20"
                          title="Edit entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-ar-gray-400 hover:text-red-400 active:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 active:bg-red-500/20"
                          title="Delete entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {editingEntry === entry.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-32 bg-ar-gray-800/50 border border-ar-gray-700 rounded-lg p-4 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none text-sm mb-4"
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSaveEdit(entry.id)}
                            disabled={!editContent.trim()}
                            className="bg-purple-600 hover:bg-purple-500 disabled:bg-ar-gray-700 disabled:text-ar-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-ar-gray-400 hover:text-white transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <TruncatedText 
                        content={entry.content} 
                        entryId={entry.id}
                        maxLength={200}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty State */}
        {journalEntries.length === 0 && !isWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-ar-white mb-2">Start Your Journal</h3>
            <p className="text-ar-gray-400 text-sm mb-6">
              Begin documenting your thoughts, feelings, and daily reflections.
            </p>
            <button
              onClick={() => setIsWriting(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Write First Entry
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}