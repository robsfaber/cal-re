import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import {
  UserProfileContext,
  type UserProfile,
} from './userProfileContextObject'

const DEFAULT_CALORIE_GOAL = 2000
const DEFAULT_BURN_BONUS = 500

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Failed to load profile:', error)
        setLoading(false)
        return
      }

      setProfile(data ?? null)
      setLoading(false)
    }

    loadProfile()
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not signed in' }

    // Optimistic update — apply locally first
    setProfile((current) => ({
      ...(current ?? { user_id: user.id }),
      ...updates,
    } as UserProfile))

    const { error } = await supabase
      .from('user_profile')
      .upsert({
        user_id: user.id,
        ...updates,
      })

    if (error) {
      console.error('Failed to update profile:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  const calorieGoal = profile?.daily_calorie_goal ?? DEFAULT_CALORIE_GOAL
  const burnBonus = profile?.burn_bonus ?? DEFAULT_BURN_BONUS

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, calorieGoal, burnBonus, updateProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}