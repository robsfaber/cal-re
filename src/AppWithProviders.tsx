import App from './App'
import { UserProfileProvider } from './lib/UserProfileContext'
import { EntriesProvider } from './lib/EntriesContext'
import { ExerciseProvider } from './lib/ExerciseContext'
import { WaterGoalProvider } from './lib/WaterGoalContext'
import { WaterProvider } from './lib/WaterContext'
import { WeightProvider } from './lib/WeightContext'
import { useAuth } from './lib/useAuth'

export function AppWithProviders() {
  const { user } = useAuth()
  const resetKey = user?.id ?? 'logged-out'

  return (
    <UserProfileProvider key={resetKey}>
      <EntriesProvider key={resetKey}>
        <ExerciseProvider key={resetKey}>
          <WaterGoalProvider key={resetKey}>
            <WaterProvider key={resetKey}>
              <WeightProvider key={resetKey}>
                <App />
              </WeightProvider>
            </WaterProvider>
          </WaterGoalProvider>
        </ExerciseProvider>
      </EntriesProvider>
    </UserProfileProvider>
  )
}