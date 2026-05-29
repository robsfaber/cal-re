import { useUserProfile } from './useUserProfile'

// Compatibility shim for components that just need the calorie goal.
// New code should use useUserProfile directly.
export function useDailyGoal() {
  const { calorieGoal, updateProfile } = useUserProfile()

  return {
    goal: calorieGoal,
    setGoal: async (newGoal: number) => {
      return updateProfile({ daily_calorie_goal: newGoal })
    },
  }
}