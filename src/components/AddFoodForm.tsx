import { useRef, useState, type FormEvent } from 'react'
import { useEntries } from '../lib/useEntries'
import { FoodSearch, type FoodSearchHandle } from './FoodSearch'
import type { UsdaFood } from '../lib/usda'

export function AddFoodForm() {
  const { addManualEntry, addUsdaEntry } = useEntries()
  const searchRef = useRef<FoodSearchHandle>(null)
  const [showManual, setShowManual] = useState(false)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [servings, setServings] = useState('1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUsdaSelect = async (food: UsdaFood) => {
    // Reset the search immediately for a snappy feel — don't wait for the DB call
    searchRef.current?.reset()
    setError(null)

    const { error: addError } = await addUsdaEntry({ food, servings: 1 })
    if (addError) setError(addError)
  }

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: addError } = await addManualEntry({
      name,
      calories: Number(calories),
      servings: Number(servings),
    })

    if (addError) {
      setError(addError)
      setSubmitting(false)
      return
    }

    setName('')
    setCalories('')
    setServings('1')
    setSubmitting(false)
    setShowManual(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add food</h2>

      <FoodSearch ref={searchRef} onSelect={handleUsdaSelect} />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        {showManual ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Add custom food</h3>
              <button
                type="button"
                onClick={() => setShowManual(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

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
                placeholder="e.g. Mom's lasagna"
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
                  placeholder="500"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Adding...' : 'Add custom food'}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="text-sm text-gray-600 hover:text-gray-800 underline decoration-dotted"
          >
            + Add custom food
          </button>
        )}
      </div>
    </div>
  )
}