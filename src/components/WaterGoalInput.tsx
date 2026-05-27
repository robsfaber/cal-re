import { useState, type FormEvent } from 'react'
import { useWaterGoal } from '../lib/useWaterGoal'

export function WaterGoalInput() {
  const { goal, setGoal } = useWaterGoal()
  const [draftValue, setDraftValue] = useState<string | null>(null)

  const isEditing = draftValue !== null

  const startEditing = () => {
    setDraftValue(String(goal))
  }

  const cancelEditing = () => {
    setDraftValue(null)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (draftValue === null) return

    const parsed = Number(draftValue)
    if (Number.isFinite(parsed) && parsed > 0) {
      await setGoal(parsed)
    }
    setDraftValue(null)
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          autoFocus
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={cancelEditing}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={startEditing}
      className="text-sm text-gray-500 hover:text-gray-700 underline decoration-dotted"
    >
      Goal: {goal} oz · edit
    </button>
  )
}