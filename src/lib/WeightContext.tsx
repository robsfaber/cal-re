import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import { WeightContext, type WeightEntry } from './weightContextObject'

export function WeightProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchEntries = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_on', { ascending: false })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setEntries(data ?? [])
      setLoading(false)
    }

    fetchEntries()
  }, [user])

  const currentWeightKg = entries.length > 0 ? entries[0].weight_kg : null

  const logWeight = async (weightKg: number) => {
    if (!user) return { error: 'Not signed in' }

    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    // Optimistic: replace today's entry if it exists, else prepend
    const existingTodayIdx = entries.findIndex((e) => e.recorded_on === today)

    const optimisticEntry: WeightEntry = {
      id: tempId,
      user_id: user.id,
      weight_kg: weightKg,
      recorded_on: today,
      created_at: now,
    }

    if (existingTodayIdx >= 0) {
      setEntries((current) =>
        current.map((e, i) => (i === existingTodayIdx ? optimisticEntry : e))
      )
    } else {
      setEntries((current) => [optimisticEntry, ...current])
    }

    // Upsert to DB — the unique constraint on (user_id, recorded_on) ensures
    // we update today's existing entry rather than create a duplicate.
    const { data, error } = await supabase
      .from('weight_entries')
      .upsert(
        {
          user_id: user.id,
          weight_kg: weightKg,
          recorded_on: today,
        },
        { onConflict: 'user_id,recorded_on' }
      )
      .select()
      .single()

    if (error || !data) {
      // Roll back optimistic update — refetch from DB to restore truth
      const { data: fresh } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_on', { ascending: false })

      setEntries(fresh ?? [])
      return { error: error?.message ?? 'Failed to log weight' }
    }

    // Replace optimistic entry with real one
    setEntries((current) =>
      current.map((e) => (e.id === tempId ? data : e))
    )

    return { error: null }
  }

  return (
    <WeightContext.Provider value={{ entries, currentWeightKg, loading, error, logWeight }}>
      {children}
    </WeightContext.Provider>
  )
}