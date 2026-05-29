import { useContext } from 'react'
import { WeightContext } from './weightContextObject'

export function useWeight() {
  const context = useContext(WeightContext)
  if (context === undefined) {
    throw new Error('useWeight must be used within a WeightProvider')
  }
  return context
}