import { useContext } from 'react'
import { ExerciseContext } from './exerciseContextObject'

export function useExercise() {
  const context = useContext(ExerciseContext)
  if (context === undefined) {
    throw new Error('useExercise must be used within an ExerciseProvider')
  }
  return context
}