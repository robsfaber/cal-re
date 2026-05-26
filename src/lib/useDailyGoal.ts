import { useContext } from 'react'
import { DailyGoalContext } from './dailyGoalContextObject'

export function useDailyGoal() {
  const context = useContext(DailyGoalContext)
  if (context === undefined) {
    throw new Error('useDailyGoal must be used within a DailyGoalProvider')
  }
  return context
}