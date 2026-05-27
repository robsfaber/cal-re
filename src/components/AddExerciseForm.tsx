import { useState, type FormEvent } from 'react'
import { useExercise } from '../lib/useExercise'

export function AddExerciseForm() {
  const { addEntry } = useExercise()
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: addError } = await addEntry({
      description,
      caloriesBurned: Number(calories),
    })

    if (addError) {
      setError(addError)
      setSubmitting(false)
      return
    }

    setDescription('')
    setCalories('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="e.g. Ran 3 miles"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            type="number"
            min="0"
            step="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            placeholder="Calories"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 px-4 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Adding...' : 'Log exercise'}
      </button>
    </form>
  )
}