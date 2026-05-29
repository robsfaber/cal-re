import { useState, type FormEvent } from 'react'
import { useMyFoods, type CustomFoodInput } from '../lib/useMyFoods'
import { useEntries } from '../lib/useEntries'
import type { Food } from '../lib/types'

export function MyFoods() {
  const { foods, loading, error, addFood, updateFood, deleteFood } = useMyFoods()
  const { addEntryForExistingFood } = useEntries()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null)

  const showMessage = (message: string) => {
    setConfirmMessage(message)
    setTimeout(() => setConfirmMessage(null), 2000)
  }

  const handleQuickLog = async (food: Food) => {
  setActionError(null)
  const { error } = await addEntryForExistingFood({
    foodId: food.id,
    servings: 1,
  })
  if (error) {
    setActionError(error)
  } else {
    showMessage(`Logged ${food.name}`)
  }
}

  const handleDelete = async (food: Food) => {
  const confirmed = window.confirm(`Remove "${food.name}" from your saved foods?`)
  if (!confirmed) return

  setActionError(null)
  const { error } = await deleteFood(food.id)
  if (error) {
    setActionError(error)
  }
}

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-sm">Loading your foods...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {confirmMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow-lg z-20">
          {confirmMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">My Foods</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sm text-blue-600 hover:text-blue-800 underline decoration-dotted"
            >
              + Add food
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Save foods you eat often for one-tap logging.
        </p>

        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {actionError}
          </div>
        )}

        {showAddForm && (
          <AddFoodCatalogForm
            onCancel={() => setShowAddForm(false)}
            onSubmit={async (input) => {
              const { error } = await addFood(input)
              if (error) {
                setActionError(error)
              } else {
                setShowAddForm(false)
                showMessage(`Added ${input.name}`)
              }
            }}
          />
        )}

        {foods.length === 0 && !showAddForm ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No saved foods yet. Click "+ Add food" to create one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {foods.map((food) => (
              <li key={food.id} className="py-3">
                {editingId === food.id ? (
                  <EditFoodForm
                    food={food}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (updates) => {
                      const { error } = await updateFood(food.id, updates)
                      if (error) {
                        setActionError(error)
                      } else {
                        setEditingId(null)
                        showMessage(`Updated ${food.name}`)
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(food.calories_per_serving)} cal
                        {food.brand ? ` · ${food.brand}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickLog(food)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Log
                      </button>
                      <button
                        onClick={() => setEditingId(food.id)}
                        className="text-gray-400 hover:text-gray-700 transition p-1"
                        aria-label={`Edit ${food.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(food)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        aria-label={`Delete ${food.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Inline form component for adding a new custom food to the catalog
function AddFoodCatalogForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (input: CustomFoodInput) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({
      name,
      brand: null,
      calories_per_serving: Number(calories),
      protein_g: protein ? Number(protein) : null,
      carbs_g: carbs ? Number(carbs) : null,
      fat_g: fat ? Number(fat) : null,
    })
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Food name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Mom's lasagna"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Calories per serving</label>
        <input
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

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Protein (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="—"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Carbs (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="—"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fat (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="—"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Inline edit form for an existing food
function EditFoodForm({
  food,
  onCancel,
  onSubmit,
}: {
  food: Food
  onCancel: () => void
  onSubmit: (updates: Partial<CustomFoodInput>) => Promise<void>
}) {
  const [name, setName] = useState(food.name)
  const [calories, setCalories] = useState(String(food.calories_per_serving))
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({
      name,
      calories_per_serving: Number(calories),
    })
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-gray-50 rounded-md space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
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
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}