import { createContext } from 'react'
import type { MealEntry } from './types'
import type { UsdaFood } from './usda'

export type EntriesContextValue = {
  entries: MealEntry[]
  initialLoading: boolean
  error: string | null
  addManualEntry: (params: ManualEntryParams) => Promise<{ error: string | null }>
  addUsdaEntry: (params: UsdaEntryParams) => Promise<{ error: string | null }>
  removeEntry: (entryId: string) => Promise<{ error: string | null }>
}

export type ManualEntryParams = {
  name: string
  calories: number
  servings: number
}

export type UsdaEntryParams = {
  food: UsdaFood
  servings: number
}

export const EntriesContext = createContext<EntriesContextValue | undefined>(undefined)