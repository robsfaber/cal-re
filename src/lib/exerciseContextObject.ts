import { createContext } from 'react'

export type ExerciseEntry = {
  id: string
  user_id: string
  description: string
  calories_burned: number
  performed_at: string
  created_at: string
}

export type ExerciseContextValue = {
  entries: ExerciseEntry[]
  initialLoading: boolean
  error: string | null
  addEntry: (params: AddExerciseParams) => Promise<{ error: string | null }>
  removeEntry: (entryId: string) => Promise<{ error: string | null }>
}

export type AddExerciseParams = {
  description: string
  caloriesBurned: number
}

export const ExerciseContext = createContext<ExerciseContextValue | undefined>(undefined)