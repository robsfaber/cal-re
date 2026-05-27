import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import {
  ExerciseContext,
  type ExerciseEntry,
  type AddExerciseParams,
} from './exerciseContextObject'

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ExerciseEntry[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchEntries = async () => {
      setError(null)

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('exercise_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('performed_at', startOfDay.toISOString())
        .order('performed_at', { ascending: false })

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

  const addEntry = async ({ description, caloriesBurned }: AddExerciseParams) => {
    if (!user) return { error: 'Not signed in' }

    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const optimisticEntry: ExerciseEntry = {
      id: tempId,
      user_id: user.id,
      description: description.trim(),
      calories_burned: caloriesBurned,
      performed_at: now,
      created_at: now,
    }

    setEntries((current) => [optimisticEntry, ...current])

    const { data, error } = await supabase
      .from('exercise_entries')
      .insert({
        user_id: user.id,
        description: description.trim(),
        calories_burned: caloriesBurned,
      })
      .select()
      .single()

    if (error || !data) {
      setEntries((current) => current.filter((e) => e.id !== tempId))
      return { error: error?.message ?? 'Failed to log exercise' }
    }

    setEntries((current) => current.map((e) => (e.id === tempId ? data : e)))
    return { error: null }
  }

  const removeEntry = async (entryId: string) => {
    const previous = entries
    setEntries((current) => current.filter((e) => e.id !== entryId))

    const { error } = await supabase.from('exercise_entries').delete().eq('id', entryId)

    if (error) {
      setEntries(previous)
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <ExerciseContext.Provider value={{ entries, initialLoading, error, addEntry, removeEntry }}>
      {children}
    </ExerciseContext.Provider>
  )
}