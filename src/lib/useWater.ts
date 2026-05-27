import { useContext } from 'react'
import { WaterContext } from './waterContextObject'

export function useWater() {
  const context = useContext(WaterContext)
  if (context === undefined) {
    throw new Error('useWater must be used within a WaterProvider')
  }
  return context
}