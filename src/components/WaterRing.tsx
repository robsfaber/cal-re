import { ProgressRing } from './CalorieRing'
import { useWater } from '../lib/useWater'
import { useWaterGoal } from '../lib/useWaterGoal'

export function WaterRing() {
  const { totalOz } = useWater()
  const { goal } = useWaterGoal()

  return (
    <ProgressRing
      value={totalOz}
      goal={goal}
      unit="oz"
      direction="inverted"
    />
  )
}