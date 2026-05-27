import { useContext } from 'react'
import { WaterGoalContext } from './waterGoalContextObject'

export function useWaterGoal() {
  const context = useContext(WaterGoalContext)
  if (context === undefined) {
    throw new Error('useWaterGoal must be used within a WaterGoalProvider')
  }
  return context
}