import { useNavigate } from "react-router-dom"
import InlineFocusCalendar from "../components/focus/InlineFocusCalendar.jsx"

export default function FocusCalendar() {
  const navigate = useNavigate()

  const handleStart = ({ task, mode }) => {
    // Navigate back to focus page and let it start session via state or simply go back
    navigate('/focus', { replace: false })
    // Session start is handled on the Focus page via user interaction
  }

  return (
    <div className="min-h-screen bg-ar-black">
      <div className="max-w-5xl mx-auto px-3 py-4 md:px-4 md:py-6 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded bg-ar-gray-800 text-ar-gray-200 border border-ar-gray-700">Back</button>
          <h1 className="text-ar-white text-xl font-hagrid font-light">Focus Calendar</h1>
          <div />
        </div>

        <InlineFocusCalendar onStart={handleStart} />
      </div>
    </div>
  )
}


