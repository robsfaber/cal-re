import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'
import { WaterGoalContext } from './waterGoalContextObject'

const DEFAULT_GOAL_OZ = 64

export function WaterGoalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [goal, setGoalState] = useState<number>(DEFAULT_GOAL_OZ)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadGoal = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('user_profile')
        .select('daily_water_goal_oz')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Failed to load water goal:', error)
        setLoading(false)
        return
      }

      if (data?.daily_water_goal_oz) {
        setGoalState(data.daily_water_goal_oz)
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
        daily_water_goal_oz: newGoal,
      })

    if (error) {
      console.error('Failed to save water goal:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <WaterGoalContext.Provider value={{ goal, setGoal, loading }}>
      {children}
    </WaterGoalContext.Provider>
  )
}