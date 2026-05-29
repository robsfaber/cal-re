import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../lib/useAuth'
import { useUserProfile } from '../lib/useUserProfile'
import { useWeight } from '../lib/useWeight'
import {
  ACTIVITY_OPTIONS,
  ageFromBirthDate,
  calculateSuggestedGoal,
  calculateTdee,
  cmToIn,
  inToCm,
  kgToLb,
  lbToKg,
} from '../lib/tdee'
import type { ActivityLevel, Sex } from '../lib/userProfileContextObject'

export function Settings() {
  const { user, signOut } = useAuth()
  const { profile, calorieGoal, burnBonus, updateProfile, loading } = useUserProfile()
  const { currentWeightKg, logWeight } = useWeight()

  const [weightLb, setWeightLb] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightInRemainder, setHeightInRemainder] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState<Sex | ''>('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('')
  const [manualGoal, setManualGoal] = useState(String(calorieGoal))
  const [burnBonusInput, setBurnBonusInput] = useState(String(burnBonus))
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const parsedWeightKg = weightLb ? lbToKg(Number(weightLb)) : null
  const totalInches =
    heightFt || heightInRemainder
      ? Number(heightFt || 0) * 12 + Number(heightInRemainder || 0)
      : null
  const parsedHeightCm = totalInches !== null ? inToCm(totalInches) : null
  const parsedAge = birthDate ? ageFromBirthDate(birthDate) : null

  const canCalculate =
    parsedWeightKg !== null &&
    parsedHeightCm !== null &&
    parsedAge !== null &&
    sex !== '' &&
    activityLevel !== ''

  const tdee = canCalculate
    ? calculateTdee({
        weight_kg: parsedWeightKg!,
        height_cm: parsedHeightCm!,
        age: parsedAge!,
        sex: sex as Sex,
        activity_level: activityLevel as ActivityLevel,
      })
    : null

  const suggestedGoal = tdee !== null ? calculateSuggestedGoal(tdee, 500) : null

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!canCalculate) return

    setSaving(true)
    setSavedMessage(null)

    const { error: weightError } = await logWeight(parsedWeightKg!)
    if (weightError) {
      setSaving(false)
      return
    }

    const { error } = await updateProfile({
      height_cm: parsedHeightCm!,
      sex: sex as Sex,
      birth_date: birthDate,
      activity_level: activityLevel as ActivityLevel,
    })

    setSaving(false)

    if (!error) {
      setSavedMessage('Profile saved')
      setTimeout(() => setSavedMessage(null), 2000)
    }
  }

  const applySuggestedGoal = async () => {
    if (suggestedGoal === null) return
    await updateProfile({ daily_calorie_goal: suggestedGoal })
    setManualGoal(String(suggestedGoal))
  }

  const handleSaveGoal = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(manualGoal)
    if (!Number.isFinite(parsed) || parsed <= 0) return

    await updateProfile({ daily_calorie_goal: parsed })
    setSavedMessage('Calorie goal saved')
    setTimeout(() => setSavedMessage(null), 2000)
  }

  const handleSaveBurnBonus = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(burnBonusInput)
    if (!Number.isFinite(parsed) || parsed < 0) return

    await updateProfile({ burn_bonus: parsed })
    setSavedMessage('Burn bonus saved')
    setTimeout(() => setSavedMessage(null), 2000)
  }

  // Populate form fields once when profile/weight data loads from the database.
  // Uses a ref to ensure we only initialize once — not every time the data
  // changes, which would clobber user edits in progress.
  const hasInitialized = useRef(false)

  useEffect(() => {
  if (hasInitialized.current) return
  if (loading) return

  hasInitialized.current = true

  // This effect genuinely initializes local form state from external data
  // (Supabase). The lint rule targets the "syncing React state from other
  // React state" anti-pattern, which doesn't apply here.
  /* eslint-disable react-hooks/set-state-in-effect */
  if (currentWeightKg !== null) {
    setWeightLb(String(Math.round(kgToLb(currentWeightKg) * 10) / 10))
  }
  if (profile?.height_cm) {
    const totalIn = cmToIn(profile.height_cm)
    const ft = Math.floor(totalIn / 12)
    const remainder = Math.round((totalIn - ft * 12) * 2) / 2
    setHeightFt(String(ft))
    setHeightInRemainder(String(remainder))
  }
  if (profile?.birth_date) setBirthDate(profile.birth_date)
  if (profile?.sex) setSex(profile.sex)
  if (profile?.activity_level) setActivityLevel(profile.activity_level)
  /* eslint-enable react-hooks/set-state-in-effect */
}, [loading, profile, currentWeightKg])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {savedMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow-lg z-20">
          {savedMessage}
        </div>
      )}

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
        <h2 className="text-lg font-semibold text-gray-900 mb-2">About you</h2>
        <p className="text-sm text-gray-500 mb-4">
          Used to calculate your suggested daily calorie goal. Updating weight logs a new entry for today.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (lb)
              </label>
              <input
                id="weight"
                type="number"
                min="50"
                max="700"
                step="0.1"
                value={weightLb}
                onChange={(e) => setWeightLb(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="180"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="number"
                    min="3"
                    max="8"
                    step="1"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                    aria-label="Height feet"
                  />
                  <span className="text-sm text-gray-500">ft</span>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    step="0.5"
                    value={heightInRemainder}
                    onChange={(e) => setHeightInRemainder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9"
                    aria-label="Height inches"
                  />
                  <span className="text-sm text-gray-500">in</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                Birth date
              </label>
              <input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-1">
              Activity level
            </label>
            <select
              id="activity"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select...</option>
              {ACTIVITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          {canCalculate && tdee !== null && suggestedGoal !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
              <p className="text-sm text-gray-700">
                Estimated daily burn (TDEE):{' '}
                <span className="font-semibold">{tdee} cal</span>
              </p>
              <p className="text-sm text-gray-700">
                Suggested daily goal (for 500 cal deficit):{' '}
                <span className="font-semibold text-blue-700">{suggestedGoal} cal</span>
              </p>
              <button
                type="button"
                onClick={applySuggestedGoal}
                className="text-sm text-blue-700 hover:text-blue-900 underline decoration-dotted"
              >
                Apply this as my daily goal
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!canCalculate || saving}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Daily calorie goal</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your target calories per day. You can override the suggested value above.
        </p>

        <form onSubmit={handleSaveGoal} className="flex items-center gap-2">
          <input
            type="number"
            min="800"
            max="6000"
            step="1"
            value={manualGoal}
            onChange={(e) => setManualGoal(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">cal</span>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Burn bonus</h2>
        <p className="text-sm text-gray-500 mb-4">
          The deficit target above what you consume. Higher = faster weight loss but harder to hit.
          Default 500 is ~1 lb/week.
        </p>

        <form onSubmit={handleSaveBurnBonus} className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="2000"
            step="1"
            value={burnBonusInput}
            onChange={(e) => setBurnBonusInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-500">cal</span>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}