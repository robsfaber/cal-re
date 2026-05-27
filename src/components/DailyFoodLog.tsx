import { useDailyGoal } from '../lib/useDailyGoal'
import { useEntries } from '../lib/useEntries'
import { CalorieRing } from './CalorieRing'
import { GoalInput } from './GoalInput'

export function DailyFoodLog() {
  const { goal } = useDailyGoal()
  const { entries, initialLoading, error, removeEntry } = useEntries()

  if (initialLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-sm">Loading today's entries...</p>
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

  const totalCalories = entries.reduce((sum, entry) => {
    const cals = entry.foods?.calories_per_serving ?? 0
    return sum + cals * entry.servings
  }, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Today</h2>
        <GoalInput />
      </div>

      <div className="flex justify-center mb-6">
        <CalorieRing value={totalCalories} goal={goal} unit="cal" />
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Nothing logged yet today.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {entries.map((entry) => {
            const food = entry.foods
            const totalCals = food ? food.calories_per_serving * entry.servings : 0
            const consumed = new Date(entry.consumed_at)
            const timeString = consumed.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })

            return (
              <li key={entry.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{food?.name ?? 'Unknown food'}</p>
                  <p className="text-sm text-gray-500">
                    {entry.servings} serving{entry.servings !== 1 ? 's' : ''} · {timeString}
                  </p>
                  {food && (food.protein_g !== null || food.carbs_g !== null || food.fat_g !== null) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {food.protein_g !== null && (
                        <span>{Math.round(food.protein_g * entry.servings)}g P</span>
                      )}
                      {food.protein_g !== null && (food.carbs_g !== null || food.fat_g !== null) && (
                        <span className="mx-1">·</span>
                      )}
                      {food.carbs_g !== null && (
                        <span>{Math.round(food.carbs_g * entry.servings)}g C</span>
                      )}
                      {food.carbs_g !== null && food.fat_g !== null && (
                        <span className="mx-1">·</span>
                      )}
                      {food.fat_g !== null && (
                        <span>{Math.round(food.fat_g * entry.servings)}g F</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-gray-900 whitespace-nowrap">{Math.round(totalCals)} cal</p>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Delete ${food?.name ?? 'entry'}`}
                    className="text-gray-400 hover:text-red-600 transition p-1 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}