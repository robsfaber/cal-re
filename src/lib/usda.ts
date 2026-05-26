const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
} as const

export type UsdaFood = {
  fdcId: number
  name: string
  brand: string | null
  servingSize: number
  servingUnit: string
  calories: number
  protein: number | null
  carbs: number | null
  fat: number | null
  dataType: string
}

type RawUsdaNutrient = {
  nutrientId: number
  value: number
}

type RawUsdaFood = {
  fdcId: number
  description: string
  brandName?: string
  brandOwner?: string
  servingSize?: number
  servingSizeUnit?: string
  householdServingFullText?: string
  foodNutrients: RawUsdaNutrient[]
  dataType: string
}

type RawUsdaSearchResponse = {
  foods: RawUsdaFood[]
}

function getNutrient(food: RawUsdaFood, nutrientId: number): number | null {
  const nutrient = food.foodNutrients.find((n) => n.nutrientId === nutrientId)
  return nutrient?.value ?? null
}

function normalizeFood(raw: RawUsdaFood): UsdaFood {
  const servingSize = raw.servingSize ?? 100
  const servingUnit = raw.servingSizeUnit ?? raw.householdServingFullText ?? 'g'

  return {
    fdcId: raw.fdcId,
    name: raw.description,
    brand: raw.brandName ?? raw.brandOwner ?? null,
    servingSize,
    servingUnit,
    calories: getNutrient(raw, NUTRIENT_IDS.calories) ?? 0,
    protein: getNutrient(raw, NUTRIENT_IDS.protein),
    carbs: getNutrient(raw, NUTRIENT_IDS.carbs),
    fat: getNutrient(raw, NUTRIENT_IDS.fat),
    dataType: raw.dataType,
  }
}

// Lower score = higher priority in results
function relevanceScore(food: UsdaFood, query: string): number {
  const name = food.name.toLowerCase()
  const q = query.toLowerCase().trim()
  let score = 0

  // Data type bias
  if (food.dataType === 'Survey (FNDDS)') score += 0
  else if (food.dataType === 'SR Legacy') score += 10
  else if (food.dataType === 'Branded') score += 100
  else score += 200

  // Strong boost for name starting with query
  if (name.startsWith(q)) score -= 50
  else if (name.includes(` ${q} `) || name.includes(`${q},`) || name.includes(`,${q}`)) score -= 25

  // Boost for "default" descriptors — the plain/unprepared version of a food
  const defaultDescriptors = [', raw', ', plain', ', unsweetened', ', unprepared', ', whole']
  if (defaultDescriptors.some((d) => name.includes(d))) score -= 15

  // Penalty for ALL-CAPS names (branded junk)
  const letterCount = name.replace(/[^a-z]/gi, '').length
  const upperCount = food.name.replace(/[^A-Z]/g, '').length
  if (letterCount > 0 && upperCount / letterCount > 0.7) score += 30

  // Penalty for very long names
  score += Math.floor(food.name.length / 20)

  return score
}

export async function searchUsdaFoods(query: string): Promise<UsdaFood[]> {
  const apiKey = import.meta.env.VITE_USDA_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_USDA_API_KEY')
  }

  const trimmed = query.trim()
  if (trimmed.length === 0) return []

  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search')
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('query', trimmed)
  url.searchParams.set('pageSize', '50')
//   url.searchParams.append('dataType', 'Survey (FNDDS)')
//   url.searchParams.append('dataType', 'SR Legacy')
//   url.searchParams.append('dataType', 'Branded')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`)
  }

  const data: RawUsdaSearchResponse = await response.json()

  return data.foods
    .map(normalizeFood)
    .filter((f) => f.calories > 0)
    .sort((a, b) => relevanceScore(a, trimmed) - relevanceScore(b, trimmed))
    .slice(0, 25)
}