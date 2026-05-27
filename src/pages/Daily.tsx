import { AddFoodForm } from '../components/AddFoodForm'
import { DailyFoodLog } from '../components/DailyFoodLog'
import { ExerciseLog } from '../components/ExerciseLog'
import { WaterTracker } from '../components/WaterTracker'

export function Daily() {
  return (
    <div className="space-y-6">
      <AddFoodForm />
      <DailyFoodLog />
      <ExerciseLog />
      <WaterTracker />
    </div>
  )
}