import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore } from "../../store/userStore"

export default function Journaling({ onBack }) {
  const [journalNote, setJournalNote] = useState('')
  const [isWriting, setIsWriting] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [expandedEntries, setExpandedEntries] = useState(new Set())
  const [selectedMood, setSelectedMood] = useState('neutral')
  const [moodSelectedToday, setMoodSelectedToday] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { 
    journalEntries, 
    updateMentalHealthProgress, 
    logMentalHealthEntry,
    saveJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    loadJournalEntries
  } = useUserStore()

  // Load journal entries from database on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadJournalEntries()
      } catch (error) {
        console.error('Error loading journal entries:', error)
        setError('Failed to load journal entries. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadEntries()
  }, []) // Only run once on mount

  // Check if mood was selected today whenever journalEntries changes
  useEffect(() => {
    if (journalEntries.length > 0) {
      const today = new Date()
      const todaysEntry = journalEntries.find(entry => 
        new Date(entry.date).toDateString() === today.toDateString()
      )
      
      if (todaysEntry && todaysEntry.mood && todaysEntry.mood !== 'neutral') {
        setMoodSelectedToday(true)
        setSelectedMood(todaysEntry.mood)
      }
    }
  }, [journalEntries])

  const handleJournalSave = async () => {
    if (!journalNote.trim()) return
    
    try {
      setError(null)
      const newEntry = {
        id: Date.now(),
        content: journalNote.trim(),
        date: new Date().toISOString(),
        mood: selectedMood,
      }
      
      await saveJournalEntry(newEntry)
      logMentalHealthEntry(selectedMood, journalNote.trim())
      
      // Give 25% progress for journal entry
      updateMentalHealthProgress(25)
      
      setJournalNote('')
      setIsWriting(false)
    } catch (error) {
      console.error('Error saving journal entry:', error)
      setError('Failed to save journal entry. Please try again.')
    }
  }

  const getTodaysEntry = () => {
    const today = new Date()
    return journalEntries.find(entry => 
      new Date(entry.date).toDateString() === today.toDateString()
    )
  }

  const handleAppendToToday = async () => {
    if (!journalNote.trim()) return
    
    const todaysEntry = getTodaysEntry()
    
    if (todaysEntry) {
      try {
        setError(null)
        const updatedContent = todaysEntry.content + '\n\n' + journalNote.trim()
        await updateJournalEntry(todaysEntry.id, updatedContent)
        logMentalHealthEntry(selectedMood, journalNote.trim())
        updateMentalHealthProgress(10) // 10% for adding more thoughts
        setJournalNote('')
        setIsWriting(false)
      } catch (error) {
        console.error('Error appending to journal entry:', error)
        setError('Failed to update journal entry. Please try again.')
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

  const getEntryIcon = () => {
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
    if (!editContent.trim()) return
    
    try {
      setError(null)
      await updateJournalEntry(entryId, editContent.trim())
      setEditingEntry(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating journal entry:', error)
      setError('Failed to update journal entry. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setEditContent('')
  }

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return
    
    try {
      setError(null)
      await deleteJournalEntry(entryId)
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      setError('Failed to delete journal entry. Please try again.')
    }
  }



  const handleMoodSelect = async (mood) => {
    if (moodSelectedToday) return // Don't allow multiple mood selections per day
    
    try {
      setError(null)
      setSelectedMood(mood)
      setMoodSelectedToday(true)
      
      // Give 15% progress for mood selection (only once per day)
      logMentalHealthEntry(mood, '')
      updateMentalHealthProgress(15)
    } catch (error) {
      console.error('Error selecting mood:', error)
      setError('Failed to save mood. Please try again.')
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
    <div className="mb-6">
      <h4 className="text-sm font-medium text-ar-white mb-3 text-center">How are you feeling today?</h4>
      <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodSelect(mood.name)}
            disabled={moodSelectedToday}
            className={`text-xl sm:text-2xl p-2 sm:p-3 rounded-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        <p className="text-center text-sm text-ar-gray-400 mt-3">
          Feeling {selectedMood} today {moodSelectedToday && '✓'}
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

  const TruncatedText = ({ content, entryId, maxLength = 100 }) => {
    const isExpanded = expandedEntries.has(entryId)
    const shouldTruncate = content.length > maxLength
    
    if (!shouldTruncate) {
      return (
        <div className="w-full overflow-x-hidden">
          <p className="text-ar-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-all">
            {content}
          </p>
        </div>
      )
    }
    
    // Find a good break point near the maxLength (prefer word boundaries)
    let truncateAt = maxLength
    if (!isExpanded) {
      const spaceIndex = content.lastIndexOf(' ', maxLength)
      if (spaceIndex > maxLength * 0.8) { // Only use word boundary if it's not too far back
        truncateAt = spaceIndex
      }
    }
    
    const truncatedText = content.slice(0, truncateAt).trim() + '...'
    
    return (
      <div className="w-full overflow-x-hidden">
        <div className="overflow-x-hidden">
          <p className="text-ar-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-all">
            {isExpanded ? content : truncatedText}
          </p>
        </div>
        <button
          onClick={() => toggleExpanded(entryId)}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors inline-flex items-center gap-1 mt-2 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg"
        >
          {isExpanded ? (
            <>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Read less
            </>
          ) : (
            <>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Read more
            </>
          )}
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pt-6 pb-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 sm:pt-6 pb-8 px-4 sm:px-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="text-ar-gray-400 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back
          </button>
          <h1 className="text-xl sm:text-2xl font-hagrid font-light text-ar-white flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            My Journal
          </h1>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Mood Selector - Show if not selected today */}
      {!moodSelectedToday && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 sm:p-6 mb-6"
        >
          <MoodSelector />
        </motion.div>
      )}

      {/* New Entry Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden mb-6"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-ar-white mb-3 sm:mb-4">Write Today's Entry</h3>
              
              {!isWriting ? (
                <button
                  onClick={() => setIsWriting(true)}
                  className="text-ar-gray-400 text-sm hover:text-purple-400 transition-colors bg-ar-gray-800/50 px-4 py-3 rounded-lg w-full text-left"
                >
                  How are you feeling today? What's on your mind?
                </button>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    placeholder="How are you feeling today? What's on your mind?"
                    className="w-full h-32 sm:h-40 bg-ar-gray-800/50 border border-ar-gray-700 rounded-lg p-4 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none text-sm break-words overflow-wrap-anywhere"
                    autoFocus
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={getTodaysEntry() ? handleAppendToToday : handleJournalSave}
                      disabled={!journalNote.trim()}
                      className="bg-purple-600 hover:bg-purple-500 disabled:bg-ar-gray-700 disabled:text-ar-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      {getTodaysEntry() ? 'Add to Today\'s Entry' : 'Save Entry'}
                    </button>
                    <button
                      onClick={() => {
                        setIsWriting(false)
                        setJournalNote('')
                      }}
                      className="text-ar-gray-400 hover:text-white transition-colors text-sm px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Journal Entries List */}
      <div className="space-y-4">

        {/* Past Entries */}
        <AnimatePresence>
          {journalEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <h2 className="text-lg font-medium text-ar-white mb-4 px-2">Past Entries</h2>
            </motion.div>
          )}
          
          {journalEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-4 sm:p-6 group hover:bg-ar-gray-800/30 transition-colors overflow-x-hidden"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-1 flex-shrink-0">
                  {getEntryIcon()}
                </div>
                <div className="flex-1 min-w-0 overflow-x-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-medium text-ar-white">
                        {formatDate(entry.date)}
                      </h3>
                      {entry.mood && entry.mood !== 'neutral' && (
                        <span className="text-lg">
                          {moods.find(m => m.name === entry.mood)?.emoji || '😐'}
                        </span>
                      )}
                      {entry.lastModified && (
                        <span className="text-xs text-ar-gray-500">(edited)</span>
                      )}
                    </div>
                    
                    {/* Action buttons - always visible on mobile, hover on desktop */}
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-ar-gray-400 hover:text-blue-400 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-blue-500/10"
                        title="Edit entry"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-ar-gray-400 hover:text-red-400 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10"
                        title="Delete entry"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {editingEntry === entry.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-32 sm:h-40 bg-ar-gray-800/50 border border-ar-gray-700 rounded-lg p-4 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none text-sm break-words overflow-wrap-anywhere"
                        autoFocus
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          disabled={!editContent.trim()}
                          className="bg-purple-600 hover:bg-purple-500 disabled:bg-ar-gray-700 disabled:text-ar-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-ar-gray-400 hover:text-white transition-colors text-sm px-4 py-2"
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
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {journalEntries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-ar-white mb-2">Start Your Journal</h3>
            <p className="text-ar-gray-400 text-sm mb-6 px-4">
              Begin documenting your thoughts, feelings, and daily reflections.
            </p>
            <button
              onClick={() => setIsWriting(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl transition-colors text-sm font-medium"
            >
              Write First Entry
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}