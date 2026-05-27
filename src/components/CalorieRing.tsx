type ProgressRingProps = {
  value: number
  goal: number
  unit: string
  // 'inverted' flips the color scale: low value = bad (red), high = good (green)
  // 'normal' is the standard: low = good (green), high = bad (red)
  direction?: 'normal' | 'inverted'
  size?: number
}

export function CalorieRing(props: ProgressRingProps) {
  return <ProgressRing {...props} />
}

export function ProgressRing({
  value,
  goal,
  unit,
  direction = 'normal',
  size = 200,
}: ProgressRingProps) {
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Outer arc: how much of the goal has been reached, capped at 100%
  const baseRatio = goal > 0 ? Math.min(value / goal, 1) : 0
  const baseDashOffset = circumference * (1 - baseRatio)

  // Overflow arc: only visible when value > goal
  const overflow = Math.max(0, value - goal)
  // The overflow ring fills proportional to how much over goal we are
  // 100% overflow ring = 100% over goal (i.e. value = 2 * goal)
  const overflowRatio = goal > 0 ? Math.min(overflow / goal, 1) : 0

  // Color logic — based on percentage of goal achieved
  const percent = goal > 0 ? (value / goal) * 100 : 0
  let strokeColor: string

  if (direction === 'normal') {
    // Standard: green when low, red when high (food intake)
    strokeColor = '#10b981' // green-500
    if (percent >= 100) strokeColor = '#ef4444' // red-500
    else if (percent >= 85) strokeColor = '#f59e0b' // amber-500
    else if (percent >= 65) strokeColor = '#84cc16' // lime-500
  } else {
    // Inverted: red when low, green when high (calories burned)
    strokeColor = '#ef4444' // red-500
    if (percent >= 100) strokeColor = '#10b981' // green-500
    else if (percent >= 65) strokeColor = '#84cc16' // lime-500
    else if (percent >= 35) strokeColor = '#f59e0b' // amber-500
  }

  // Inset ring sits inside the outer ring with its own track
  const innerRadius = radius - strokeWidth - 4
  const innerCircumference = 2 * Math.PI * innerRadius
  const overflowInnerDashOffset = innerCircumference * (1 - overflowRatio)

  const showOverflow = value > goal
  const remaining = goal - value

  // Color for the overflow inner ring — uses the "alert" color of the direction
  // For normal (food): going over goal is bad, so the inner ring is deep red
  // For inverted (burn): going over goal is great, so the inner ring is deep green
  const overflowColor = direction === 'normal' ? '#dc2626' : '#059669' // red-600 / green-600

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Outer track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Outer progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={baseDashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
          />

          {showOverflow && (
            <>
              {/* Inner track (only when overflowing) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={innerRadius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                opacity="0.4"
              />
              {/* Inner overflow arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={innerRadius}
                fill="none"
                stroke={overflowColor}
                strokeWidth={strokeWidth}
                strokeDasharray={innerCircumference}
                strokeDashoffset={overflowInnerDashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </>
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <p className="text-4xl font-bold text-gray-900">{Math.round(value)}</p>
          <p className="text-sm text-gray-500">of {goal} {unit}</p>
          <p
            className={`text-xs mt-1 font-medium ${
              direction === 'normal'
                ? remaining < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
                : remaining > 0
                ? 'text-gray-600'
                : 'text-green-600'
            }`}
          >
            {direction === 'normal'
              ? remaining >= 0
                ? `${Math.round(remaining)} left`
                : `${Math.round(Math.abs(remaining))} over`
              : remaining > 0
              ? `${Math.round(remaining)} to go`
              : `${Math.round(Math.abs(remaining))} extra`}
          </p>
        </div>
      </div>
    </div>
  )
}