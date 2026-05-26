import { createContext } from 'react'

export type DailyGoalContextValue = {
  goal: number
  setGoal: (newGoal: number) => Promise<{ error: string | null }>
  loading: boolean
}

export const DailyGoalContext = createContext<DailyGoalContextValue | undefined>(undefined)