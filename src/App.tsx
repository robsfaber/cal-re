import { Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { Auth } from './components/Auth'
import { TabBar } from './components/TabBar'
import { Daily } from './pages/Daily'
import { Diary } from './pages/Diary'
import { MyFoods } from './pages/MyFoods'
import { Settings } from './pages/Settings'

function App() {
  const { user, loading } = useAuth()

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calorie Tracker</h1>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Daily />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/foods" element={<MyFoods />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      <TabBar />
    </div>
  )
}

export default App