import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { searchUsdaFoods, type UsdaFood } from '../lib/usda'

export type FoodSearchHandle = {
  reset: () => void
  focus: () => void
}

type FoodSearchProps = {
  onSelect: (food: UsdaFood) => void
  ref?: Ref<FoodSearchHandle>
}

export function FoodSearch({ onSelect, ref }: FoodSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UsdaFood[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      setQuery('')
      setResults([])
      setError(null)
      setHasSearched(false)
      // Keep focus in the input after a reset so the user can type the next entry
      inputRef.current?.focus()
    },
    focus: () => {
      inputRef.current?.focus()
    },
  }), [])

  const trimmed = query.trim()
  const isQueryValid = trimmed.length >= 3

  useEffect(() => {
    if (!isQueryValid) return

    let active = true

    const timeoutId = setTimeout(async () => {
      if (!active) return

      setSearching(true)

      try {
        const foods = await searchUsdaFoods(trimmed)
        if (!active) return
        setResults(foods)
        setError(null)
        setHasSearched(true)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        if (active) setSearching(false)
      }
    }, 350)

    return () => {
      active = false
      clearTimeout(timeoutId)
    }
  }, [trimmed, isQueryValid])

  const showResults = isQueryValid && results.length > 0
  const showEmptyMessage = isQueryValid && hasSearched && !searching && results.length === 0 && !error
  const showError = isQueryValid && error !== null && results.length === 0 && !searching

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods (e.g. banana, chicken breast)"
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {showError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {showEmptyMessage && (
        <p className="text-sm text-gray-500 text-center py-2">
          No foods found. Try a different search or add manually below.
        </p>
      )}

      {showResults && (
        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-80 overflow-y-auto">
          {results.map((food) => (
            <li key={food.fdcId}>
              <button
                onClick={() => onSelect(food)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{food.name}</p>
                  <p className="text-xs text-gray-500">
                    {food.brand ? `${food.brand} · ` : ''}
                    {food.servingSize} {food.servingUnit}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {Math.round(food.calories)} cal
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}