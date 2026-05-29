import { createContext } from 'react'

export type WeightEntry = {
  id: string
  user_id: string
  weight_kg: number
  recorded_on: string // YYYY-MM-DD
  created_at: string
}

export type WeightContextValue = {
  entries: WeightEntry[]
  currentWeightKg: number | null
  loading: boolean
  error: string | null
  logWeight: (weightKg: number) => Promise<{ error: string | null }>
}

export const WeightContext = createContext<WeightContextValue | undefined>(undefined)