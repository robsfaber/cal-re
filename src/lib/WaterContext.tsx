import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import { WaterContext, type WaterEntry } from './waterContextObject'

export function WaterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WaterEntry[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchEntries = async () => {
      setError(null)

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('water_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('consumed_at', startOfDay.toISOString())
        .order('consumed_at', { ascending: false })

      if (error) {
        setError(error.message)
        setInitialLoading(false)
        return
      }

      setEntries(data ?? [])
      setInitialLoading(false)
    }

    fetchEntries()
  }, [user])

  const totalOz = entries.reduce((sum, e) => sum + e.amount_oz, 0)

  const addWater = async (amountOz: number) => {
    if (!user) return { error: 'Not signed in' }

    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const optimisticEntry: WaterEntry = {
      id: tempId,
      user_id: user.id,
      amount_oz: amountOz,
      consumed_at: now,
    }

    setEntries((current) => [optimisticEntry, ...current])

    const { data, error } = await supabase
      .from('water_entries')
      .insert({
        user_id: user.id,
        amount_oz: amountOz,
      })
      .select()
      .single()

    if (error || !data) {
      setEntries((current) => current.filter((e) => e.id !== tempId))
      return { error: error?.message ?? 'Failed to log water' }
    }

    setEntries((current) => current.map((e) => (e.id === tempId ? data : e)))
    return { error: null }
  }

  const undoLastWater = async () => {
    if (entries.length === 0) return { error: null }

    const lastEntry = entries[0]
    const previous = entries

    setEntries((current) => current.slice(1))

    const { error } = await supabase
      .from('water_entries')
      .delete()
      .eq('id', lastEntry.id)

    if (error) {
      setEntries(previous)
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <WaterContext.Provider
      value={{ entries, totalOz, initialLoading, error, addWater, undoLastWater }}
    >
      {children}
    </WaterContext.Provider>
  )
}