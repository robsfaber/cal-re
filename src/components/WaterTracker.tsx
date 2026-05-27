import { useWater } from '../lib/useWater'
import { WaterRing } from './WaterRing'
import { WaterGoalInput } from './WaterGoalInput'

const QUICK_ADD_AMOUNTS = [8, 12, 16, 20] // common cup/bottle sizes in oz

export function WaterTracker() {
  const { entries, addWater, undoLastWater } = useWater()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
  <h2 className="text-lg font-semibold text-gray-900">Water</h2>
    <WaterGoalInput />
</div>

      <div className="flex justify-center mb-6">
        <WaterRing />
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {QUICK_ADD_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            className="py-2 px-2 bg-sky-100 text-sky-700 font-medium rounded-md hover:bg-sky-200 transition text-sm"
          >
            +{amount} oz
          </button>
        ))}
      </div>

      {entries.length > 0 && (
        <button
          onClick={undoLastWater}
          className="w-full text-sm text-gray-500 hover:text-gray-700 underline decoration-dotted"
        >
          Undo last (-{entries[0].amount_oz} oz)
        </button>
      )}
    </div>
  )
}