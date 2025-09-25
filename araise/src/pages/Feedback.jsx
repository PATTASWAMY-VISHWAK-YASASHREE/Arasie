import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Star,
  Bug,
  Lightbulb,
  Heart,
  Loader2
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../store/userStore"
import emailjs from "@emailjs/browser"

export default function Feedback() {
  const navigate = useNavigate()
  const { name, email } = useUserStore()

  const [feedbackData, setFeedbackData] = useState({
    type: "general",
    subject: "",
    message: "",
    rating: 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const feedbackTypes = [
    { id: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/20" },
    { id: "bug", label: "Bug Report", icon: Bug, color: "text-red-400", bg: "bg-red-400/20" },
    { id: "feature", label: "Feature Request", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/20" },
    { id: "compliment", label: "Compliment", icon: Heart, color: "text-pink-400", bg: "bg-pink-400/20" }
  ]

  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const FEEDBACK_TO_EMAIL = import.meta.env.VITE_FEEDBACK_TO_EMAIL || "arasie096@gmail.com"

  useEffect(() => {
    if (PUBLIC_KEY) {
      emailjs.init(PUBLIC_KEY)
    } else {
      console.warn("EmailJS public key is missing. Set VITE_EMAILJS_PUBLIC_KEY in your .env file.")
    }
  }, [PUBLIC_KEY])

  const validate = () => {
    if (!feedbackData.message.trim()) return "Please enter your message."
    if (feedbackData.subject.trim().length < 3) return "Subject must be at least 3 characters."
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return "Email service is not configured."
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg("")
    const validation = validate()
    if (validation) {
      setErrorMsg(validation)
      return
    }

    setIsSubmitting(true)
    try {
      const selectedType = feedbackTypes.find(t => t.id === feedbackData.type)
      const templateParams = {
        // Recipient (include multiple keys to match template variable name)
        to: FEEDBACK_TO_EMAIL,
        to_email: FEEDBACK_TO_EMAIL,
        toEmail: FEEDBACK_TO_EMAIL,
        recipient: FEEDBACK_TO_EMAIL,
        to_address: FEEDBACK_TO_EMAIL,
        to_name: "ARAISE Team",
        // Sender/user info
        from_name: name || "Anonymous",
        from_email: email || "no-reply@araise.app",
        reply_to: email || "no-reply@araise.app",
        user_name: name || "Anonymous",
        user_email: email || "",
        // Content
        subject: `ARAISE Feedback: ${feedbackData.subject || selectedType?.label}`,
        message: feedbackData.message,
        rating: feedbackData.rating > 0 ? `${feedbackData.rating}/5` : "Not rated",
        type: selectedType?.label || "General"
      }

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)

      setIsSubmitted(true)
      setFeedbackData({ type: "general", subject: "", message: "", rating: 0 })
      setTimeout(() => setIsSubmitted(false), 2500)
    } catch (error) {
      const errorText = error?.text || error?.message || "Unknown error"
      console.error("Error sending feedback:", error)
      setErrorMsg(`There was an error sending your feedback. ${errorText}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ar-black">
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg"
        >
          Thank you for your feedback and support — we appreciate it!
        </motion.div>
      )}
      <div className="w-full max-w-full px-3 pt-4 pb-32 mx-auto sm:max-w-2xl sm:px-4 lg:max-w-3xl lg:px-6 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 text-ar-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-poppins font-bold text-ar-white">Send Feedback</h1>
            <p className="text-xs text-ar-gray-400 mt-0.5">We read every message and appreciate your input.</p>
          </div>
        </motion.div>

        <div className="glass-card rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {feedbackTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFeedbackData(prev => ({ ...prev, type: t.id }))}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                    feedbackData.type === t.id ? "border-ar-blue bg-ar-blue/10" : "border-ar-gray-700 bg-ar-gray-800/50"
                  }`}
                >
                  <t.icon size={14} className="text-ar-gray-300" />
                  <span className="text-xs text-ar-gray-200">{t.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-ar-gray-300 mb-1">Subject</label>
              <input
                type="text"
                value={feedbackData.subject}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white placeholder:text-ar-gray-500 focus:outline-none focus:ring-2 focus:ring-ar-blue"
                placeholder="Brief subject"
              />
            </div>

            <div>
              <label className="block text-sm text-ar-gray-300 mb-1">Message</label>
              <textarea
                rows={6}
                value={feedbackData.message}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white placeholder:text-ar-gray-500 focus:outline-none focus:ring-2 focus:ring-ar-blue"
                placeholder="Describe your feedback..."
              />
            </div>

            <div>
              <span className="block text-sm text-ar-gray-300 mb-1">Rating (optional)</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFeedbackData(prev => ({ ...prev, rating: r }))}
                    className="p-1"
                    aria-label={`Rate ${r}`}
                  >
                    <Star size={20} className={r <= feedbackData.rating ? "text-yellow-400" : "text-ar-gray-600"} />
                  </button>
                ))}
                {feedbackData.rating > 0 && (
                  <button
                    type="button"
                    className="ml-2 text-xs text-ar-gray-400 hover:text-ar-gray-300"
                    onClick={() => setFeedbackData(prev => ({ ...prev, rating: 0 }))}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-400 text-sm">{errorMsg}</div>
            )}
            {isSubmitted && (
              <div className="text-green-400 text-sm">Thanks! Your feedback has been sent.</div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-ar-blue hover:bg-ar-blue-light disabled:bg-ar-gray-600 disabled:cursor-not-allowed text-white font-poppins font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Feedback
                </>
              )}
            </motion.button>

            <div className="text-center text-ar-gray-500 text-xs">
              Your feedback will be sent to our team 
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}