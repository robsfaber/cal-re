import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import { DailyGoalContext } from './dailyGoalContextObject'

const DEFAULT_GOAL = 2000

export function DailyGoalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [goal, setGoalState] = useState<number>(DEFAULT_GOAL)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  if (!user) return

  const loadGoal = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('user_profile')
      .select('daily_calorie_goal')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Failed to load goal:', error)
      setLoading(false)
      return
    }

    if (data?.daily_calorie_goal) {
      setGoalState(data.daily_calorie_goal)
    }
    setLoading(false)
  }

  loadGoal()
}, [user])

  const setGoal = async (newGoal: number) => {
    if (!user) return { error: 'Not signed in' }

    setGoalState(newGoal)

    const { error } = await supabase
      .from('user_profile')
      .upsert({
        user_id: user.id,
        daily_calorie_goal: newGoal,
      })

    if (error) {
      console.error('Failed to save goal:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <DailyGoalContext.Provider value={{ goal, setGoal, loading }}>
      {children}
    </DailyGoalContext.Provider>
  )
}