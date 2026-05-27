import { useExercise } from '../lib/useExercise'
import { AddExerciseForm } from './AddExerciseForm'
import { BurnRing } from './BurnRing'

export function ExerciseLog() {
  const { entries, removeEntry } = useExercise()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Exercise</h2>

      <div className="flex justify-center mb-6">
        <BurnRing />
      </div>

      <div className="mb-6">
        <AddExerciseForm />
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No exercise logged today.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {entries.map((entry) => {
            const performed = new Date(entry.performed_at)
            const timeString = performed.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })

            return (
              <li key={entry.id} className="py-2 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{entry.description}</p>
                  <p className="text-xs text-gray-500">{timeString}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {Math.round(entry.calories_burned)} cal
                  </p>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Delete ${entry.description}`}
                    className="text-gray-400 hover:text-red-600 transition p-1 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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