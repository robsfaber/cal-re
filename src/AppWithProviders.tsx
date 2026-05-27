import App from './App'
import { DailyGoalProvider } from './lib/DailyGoalContext'
import { EntriesProvider } from './lib/EntriesContext'
import { ExerciseProvider } from './lib/ExerciseContext'
import { WaterGoalProvider } from './lib/WaterGoalContext'
import { WaterProvider } from './lib/WaterContext'
import { useAuth } from './lib/useAuth'

export function AppWithProviders() {
  const { user } = useAuth()
  const resetKey = user?.id ?? 'logged-out'

  return (
    <DailyGoalProvider key={resetKey}>
      <EntriesProvider key={resetKey}>
        <ExerciseProvider key={resetKey}>
          <WaterGoalProvider key={resetKey}>
            <WaterProvider key={resetKey}>
              <App />
            </WaterProvider>
          </WaterGoalProvider>
        </ExerciseProvider>
      </EntriesProvider>
    </DailyGoalProvider>
  )
}