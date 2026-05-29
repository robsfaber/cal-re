import { createContext } from 'react'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type Sex = 'male' | 'female' | 'non-binary' | 'other'

export type UserProfile = {
  user_id: string
  display_name: string | null
  height_cm: number | null
  sex: Sex | null
  birth_date: string | null
  activity_level: ActivityLevel | null
  daily_calorie_goal: number | null
  daily_water_goal_oz: number | null
  burn_bonus: number | null
}

export type UserProfileContextValue = {
  profile: UserProfile | null
  loading: boolean
  // Convenience getters for commonly-used fields with sensible defaults
  calorieGoal: number
  burnBonus: number
  // Update any subset of profile fields
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>
}

export const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined)