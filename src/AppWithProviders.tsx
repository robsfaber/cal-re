import App from './App'
import { DailyGoalProvider } from './lib/DailyGoalContext'
import { EntriesProvider } from './lib/EntriesContext'
import { useAuth } from './lib/useAuth'

export function AppWithProviders() {
  const { user } = useAuth()
  const resetKey = user?.id ?? 'logged-out'

  return (
    <DailyGoalProvider key={resetKey}>
      <EntriesProvider key={resetKey}>
        <App />
      </EntriesProvider>
    </DailyGoalProvider>
  )
}