import { useAuth } from './lib/useAuth'
import { Auth } from './components/Auth'

function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Calorie Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">You're logged in. Food log goes here next.</p>
        </main>
      </div>
    </div>
  )
}

export default App