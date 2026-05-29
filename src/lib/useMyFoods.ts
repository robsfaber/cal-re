import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import type { Food } from './types'

export type CustomFoodInput = {
  name: string
  brand: string | null
  calories_per_serving: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export function useMyFoods() {
  const { user } = useAuth()
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setFoods(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    // This effect fetches data from Supabase on mount and whenever the user
    // changes. The lint rule targets the "syncing React state from other React
    // state" anti-pattern, which doesn't apply here — we're loading from an
    // external data source, which is exactly what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  const addFood = async (input: CustomFoodInput): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' }

    const { data, error } = await supabase
      .from('foods')
      .insert({
        user_id: user.id,
        name: input.name.trim(),
        brand: input.brand,
        serving_size: 1,
        serving_unit: 'serving',
        calories_per_serving: input.calories_per_serving,
        protein_g: input.protein_g,
        carbs_g: input.carbs_g,
        fat_g: input.fat_g,
      })
      .select()
      .single()

    if (error || !data) {
      return { error: error?.message ?? 'Failed to add food' }
    }

    setFoods((current) => [data, ...current])
    return { error: null }
  }

  const updateFood = async (
    id: string,
    updates: Partial<CustomFoodInput>
  ): Promise<{ error: string | null }> => {
    const previous = foods

    // Optimistic update
    setFoods((current) =>
      current.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )

    const { error } = await supabase.from('foods').update(updates).eq('id', id)

    if (error) {
      setFoods(previous)
      return { error: error.message }
    }

    return { error: null }
  }

  const deleteFood = async (id: string): Promise<{ error: string | null }> => {
    const previous = foods

    // Optimistic: remove from the list immediately
    setFoods((current) => current.filter((f) => f.id !== id))

    // Soft delete: mark as archived. The row stays in the database so existing
    // meal_entries that reference it remain valid.
    const { error } = await supabase
      .from('foods')
      .update({ archived: true })
      .eq('id', id)

    if (error) {
      setFoods(previous)
      return { error: error.message }
    }

    return { error: null }
  }

  return { foods, loading, error, addFood, updateFood, deleteFood, refresh }
}