import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import {
  EntriesContext,
  type ManualEntryParams,
  type UsdaEntryParams,
  type ExistingFoodEntryParams,
} from './entriesContextObject'
import type { MealEntry, Food } from './types'

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

  // Helper: create a meal_entry row + reconcile optimistic state
  const logMealEntry = async (
    food: Food,
    servings: number,
    optimisticId: string
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' }

    const { data: entryData, error: entryError } = await supabase
      .from('meal_entries')
      .insert({
        user_id: user.id,
        food_id: food.id,
        servings,
      })
      .select('*, foods(*)')
      .single()

    if (entryError || !entryData) {
      setEntries((current) => current.filter((e) => e.id !== optimisticId))
      return { error: entryError?.message ?? 'Failed to log entry' }
    }

    setEntries((current) =>
      current.map((e) => (e.id === optimisticId ? entryData : e))
    )

    return { error: null }
  }

  const addManualEntry = async ({ name, calories, servings }: ManualEntryParams) => {
    if (!user) return { error: 'Not signed in' }

    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const optimisticEntry: MealEntry = {
      id: tempId,
      user_id: user.id,
      food_id: tempId,
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
        archived: false,
        created_at: now,
      },
    }

    setEntries((current) => [optimisticEntry, ...current])

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
      setEntries((current) => current.filter((e) => e.id !== tempId))
      return { error: foodError?.message ?? 'Failed to create food' }
    }

    return logMealEntry(foodData, servings, tempId)
  }

  const addUsdaEntry = async ({ food: usdaFood, servings }: UsdaEntryParams) => {
    if (!user) return { error: 'Not signed in' }

    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()
    const displayName = usdaFood.brand
      ? `${usdaFood.name} (${usdaFood.brand})`
      : usdaFood.name

    const optimisticEntry: MealEntry = {
      id: tempId,
      user_id: user.id,
      food_id: tempId,
      servings,
      meal_type: null,
      consumed_at: now,
      created_at: now,
      foods: {
        id: tempId,
        user_id: user.id,
        name: displayName,
        brand: usdaFood.brand,
        serving_size: usdaFood.servingSize,
        serving_unit: usdaFood.servingUnit,
        calories_per_serving: usdaFood.calories,
        protein_g: usdaFood.protein,
        carbs_g: usdaFood.carbs,
        fat_g: usdaFood.fat,
        usda_fdc_id: String(usdaFood.fdcId),
        archived: false,
        created_at: now,
      },
    }

    setEntries((current) => [optimisticEntry, ...current])

    // Check cache: has this USDA food been logged before by anyone?
    const { data: existingFood, error: lookupError } = await supabase
      .from('foods')
      .select('*')
      .eq('usda_fdc_id', String(usdaFood.fdcId))
      .is('user_id', null)
      .maybeSingle()

    if (lookupError) {
      setEntries((current) => current.filter((e) => e.id !== tempId))
      return { error: lookupError.message }
    }

    let foodToUse: Food

    if (existingFood) {
      foodToUse = existingFood
    } else {
      const { data: newFood, error: insertError } = await supabase
        .from('foods')
        .insert({
          user_id: null,
          name: displayName,
          brand: usdaFood.brand,
          serving_size: usdaFood.servingSize,
          serving_unit: usdaFood.servingUnit,
          calories_per_serving: usdaFood.calories,
          protein_g: usdaFood.protein,
          carbs_g: usdaFood.carbs,
          fat_g: usdaFood.fat,
          usda_fdc_id: String(usdaFood.fdcId),
        })
        .select()
        .single()

      if (insertError || !newFood) {
        setEntries((current) => current.filter((e) => e.id !== tempId))
        return { error: insertError?.message ?? 'Failed to cache USDA food' }
      }

      foodToUse = newFood
    }

    return logMealEntry(foodToUse, servings, tempId)
  }

  const addEntryForExistingFood = async ({ foodId, servings }: ExistingFoodEntryParams) => {
    if (!user) return { error: 'Not signed in' }

    // Fetch the food row so we can build an optimistic entry with its data
    const { data: foodData, error: foodError } = await supabase
      .from('foods')
      .select('*')
      .eq('id', foodId)
      .single()

    if (foodError || !foodData) {
      return { error: foodError?.message ?? 'Food not found' }
    }

    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const optimisticEntry: MealEntry = {
      id: tempId,
      user_id: user.id,
      food_id: foodData.id,
      servings,
      meal_type: null,
      consumed_at: now,
      created_at: now,
      foods: foodData,
    }

    setEntries((current) => [optimisticEntry, ...current])

    return logMealEntry(foodData, servings, tempId)
  }

  const removeEntry = async (entryId: string) => {
    const previousEntries = entries
    setEntries((current) => current.filter((e) => e.id !== entryId))

    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      setEntries(previousEntries)
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <EntriesContext.Provider
      value={{
        entries,
        initialLoading,
        error,
        addManualEntry,
        addUsdaEntry,
        addEntryForExistingFood,
        removeEntry,
      }}
    >
      {children}
    </EntriesContext.Provider>
  )
}