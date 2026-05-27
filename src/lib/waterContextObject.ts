import { createContext } from 'react'

export type WaterEntry = {
  id: string
  user_id: string
  amount_oz: number
  consumed_at: string
}

export type WaterContextValue = {
  entries: WaterEntry[]
  totalOz: number
  initialLoading: boolean
  error: string | null
  addWater: (amountOz: number) => Promise<{ error: string | null }>
  undoLastWater: () => Promise<{ error: string | null }>
}

export const WaterContext = createContext<WaterContextValue | undefined>(undefined)