import { createContext } from 'react'

export type WaterGoalContextValue = {
  goal: number
  setGoal: (newGoal: number) => Promise<{ error: string | null }>
  loading: boolean
}

export const WaterGoalContext = createContext<WaterGoalContextValue | undefined>(undefined)