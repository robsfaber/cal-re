export type Food = {
  id: string
  user_id: string | null
  name: string
  brand: string | null
  serving_size: number
  serving_unit: string
  calories_per_serving: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  usda_fdc_id: string | null
  archived: boolean
  created_at: string
}

export type MealEntry = {
  id: string
  user_id: string
  food_id: string
  servings: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  consumed_at: string
  created_at: string
  // When we join with foods, we get this populated:
  foods?: Food
}