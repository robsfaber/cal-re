import type { ActivityLevel, Sex } from './userProfileContextObject'

export type TdeeInputs = {
  weight_kg: number
  height_cm: number
  age: number
  sex: Sex
  activity_level: ActivityLevel
}

// Mifflin-St Jeor formula for Basal Metabolic Rate (BMR).
// Returns calories burned per day at complete rest.
function calculateBmr({ weight_kg, height_cm, age, sex }: Omit<TdeeInputs, 'activity_level'>): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age

  if (sex === 'male') return base + 5
  if (sex === 'female') return base - 161
  // For 'other', use the midpoint of the male/female adjustment.
  // This is what most fitness apps do; no formal Mifflin-St Jeor value for non-binary.
  return base - 78
}

// Activity multipliers from standard nutrition science.
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calculateTdee(inputs: TdeeInputs): number {
  const bmr = calculateBmr(inputs)
  const multiplier = ACTIVITY_MULTIPLIERS[inputs.activity_level]
  return Math.round(bmr * multiplier)
}

// Calculate suggested daily calorie goal based on TDEE and a target deficit.
// For weight loss, the typical target deficit is 500 cal/day = ~1 lb/week.
export function calculateSuggestedGoal(tdee: number, deficitTarget: number = 500): number {
  return Math.max(tdee - deficitTarget, 1200) // never recommend below 1200 cal
}

// Compute age in years from a birth_date string (ISO format YYYY-MM-DD).
export function ageFromBirthDate(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Convert pounds to kilograms (US users will input lb, we store kg)
export function lbToKg(lb: number): number {
  return lb / 2.20462
}

// Convert kilograms back to pounds for display
export function kgToLb(kg: number): number {
  return kg * 2.20462
}

// Convert inches to centimeters
export function inToCm(inches: number): number {
  return inches * 2.54
}

// Convert centimeters back to inches
export function cmToIn(cm: number): number {
  return cm / 2.54
}

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'light', label: 'Lightly active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Very active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Extremely active', description: 'Hard daily exercise + physical job' },
]