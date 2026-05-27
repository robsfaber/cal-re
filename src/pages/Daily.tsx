import { AddFoodForm } from '../components/AddFoodForm'
import { DailyFoodLog } from '../components/DailyFoodLog'
import { ExerciseLog } from '../components/ExerciseLog'

export function Daily() {
  return (
    <div className="space-y-6">
      <AddFoodForm />
      <DailyFoodLog />
      <ExerciseLog />
    </div>
  )
}