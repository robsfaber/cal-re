import { ProgressRing } from './CalorieRing'
import { useEntries } from '../lib/useEntries'
import { useExercise } from '../lib/useExercise'
import { useUserProfile } from '../lib/useUserProfile'

export function BurnRing() {
  const { entries: foodEntries } = useEntries()
  const { entries: exerciseEntries } = useExercise()
  const { burnBonus } = useUserProfile()

  const totalConsumed = foodEntries.reduce((sum, entry) => {
    const cals = entry.foods?.calories_per_serving ?? 0
    return sum + cals * entry.servings
  }, 0)

  const totalBurned = exerciseEntries.reduce((sum, e) => sum + e.calories_burned, 0)
  const burnGoal = totalConsumed + burnBonus

  return (
    <ProgressRing
      value={totalBurned}
      goal={burnGoal}
      unit="cal burned"
      direction="inverted"
    />
  )
}