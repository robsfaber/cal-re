import { createContext } from 'react'
import type { MealEntry } from './types'

export type EntriesContextValue = {
  entries: MealEntry[]
  initialLoading: boolean
  error: string | null
  addEntry: (params: AddEntryParams) => Promise<{ error: string | null }>
  removeEntry: (entryId: string) => Promise<{ error: string | null }>
}

export type AddEntryParams = {
  name: string
  calories: number
  servings: number
}

export const EntriesContext = createContext<EntriesContextValue | undefined>(undefined)