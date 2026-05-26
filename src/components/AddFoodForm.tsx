import { useState, type FormEvent } from 'react'
import { useEntries } from '../lib/useEntries'

export function AddFoodForm() {
  const { addEntry } = useEntries()
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [servings, setServings] = useState('1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setSubmitting(true)
    setError(null)

    const { error: addError } = await addEntry({
      name,
      calories: Number(calories),
      servings: Number(servings),
    })

    if (addError) {
      setError(addError)
      setSubmitting(false)
      return
    }

    // Reset the form
    setName('')
    setCalories('')
    setServings('1')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add food</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Food name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Banana"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
            Calories
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            step="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            placeholder="105"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min="0.1"
            step="0.1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
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
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Adding...' : 'Add entry'}
      </button>
    </form>
  )
}