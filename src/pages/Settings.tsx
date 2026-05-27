import { useAuth } from '../lib/useAuth'

export function Settings() {
  const { user, signOut } = useAuth()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Email:</span>{' '}
            <span className="text-gray-900">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Sign out
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Preferences</h2>
        <p className="text-gray-500 text-sm">
          More settings coming soon — daily goals, units (oz / ml, kg / lb), and more.
        </p>
      </div>
    </div>
  )
}