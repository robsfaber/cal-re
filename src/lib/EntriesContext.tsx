import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import { EntriesContext, type AddEntryParams } from './entriesContextObject'
import type { MealEntry } from './types'

export function EntriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<MealEntry[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchEntries = async () => {
      setError(null)

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('meal_entries')
        .select('*, foods(*)')
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

  const addEntry = async ({ name, calories, servings }: AddEntryParams) => {
    if (!user) return { error: 'Not signed in' }

    // Build an optimistic entry with a temporary ID
    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const optimisticEntry: MealEntry = {
      id: tempId,
      user_id: user.id,
      food_id: tempId, // placeholder; real food_id comes after the DB insert
      servings,
      meal_type: null,
      consumed_at: now,
      created_at: now,
      foods: {
        id: tempId,
        user_id: user.id,
        name: name.trim(),
        brand: null,
        serving_size: 1,
        serving_unit: 'serving',
        calories_per_serving: calories,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        usda_fdc_id: null,
        created_at: now,
      },
    }

    // Add it to the UI immediately — newest first
    setEntries((current) => [optimisticEntry, ...current])

    // Now do the actual DB work in the background
    const { data: foodData, error: foodError } = await supabase
      .from('foods')
      .insert({
        user_id: user.id,
        name: name.trim(),
        serving_size: 1,
        serving_unit: 'serving',
        calories_per_serving: calories,
      })
      .select()
      .single()

    if (foodError || !foodData) {
      // Roll back the optimistic entry
      setEntries((current) => current.filter((e) => e.id !== tempId))
      return { error: foodError?.message ?? 'Failed to create food' }
    }

    const { data: entryData, error: entryError } = await supabase
      .from('meal_entries')
      .insert({
        user_id: user.id,
        food_id: foodData.id,
        servings,
      })
      .select('*, foods(*)')
      .single()

    if (entryError || !entryData) {
      // Roll back the optimistic entry
      setEntries((current) => current.filter((e) => e.id !== tempId))
      return { error: entryError?.message ?? 'Failed to log entry' }
    }

    // Replace the optimistic entry with the real one from the database
    setEntries((current) =>
      current.map((e) => (e.id === tempId ? entryData : e))
    )

    return { error: null }
  }

  const removeEntry = async (entryId: string) => {
    // Snapshot current state in case we need to roll back
    const previousEntries = entries

    // Optimistically remove from the UI
    setEntries((current) => current.filter((e) => e.id !== entryId))

    // Delete from the database in the background.
    // RLS prevents deleting other users' entries, so no need to filter by user_id.
    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      // Roll back — restore the entry
      setEntries(previousEntries)
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <EntriesContext.Provider value={{ entries, initialLoading, error, addEntry, removeEntry }}>
      {children}
    </EntriesContext.Provider>
  )
}