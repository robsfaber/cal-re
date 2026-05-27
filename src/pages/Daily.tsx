import { AddFoodForm } from '../components/AddFoodForm'
import { DailyFoodLog } from '../components/DailyFoodLog'

export function Daily() {
  return (
    <div className="space-y-6">
      <AddFoodForm />
      <DailyFoodLog />
    </div>
  )
}