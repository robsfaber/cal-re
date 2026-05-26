type CalorieRingProps = {
  consumed: number
  goal: number
}

export function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const size = 200
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Cap the visible fill at 100% even when over goal
  const ratio = goal > 0 ? Math.min(consumed / goal, 1) : 0
  const dashOffset = circumference * (1 - ratio)

  // Color shifts based on progress and overage
  const percent = goal > 0 ? (consumed / goal) * 100 : 0
  let strokeColor = '#10b981' // green-500
  if (percent >= 100) strokeColor = '#ef4444' // red-500
  else if (percent >= 85) strokeColor = '#f59e0b' // amber-500
  else if (percent >= 65) strokeColor = '#84cc16' // lime-500

  const remaining = goal - consumed

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-gray-900">{Math.round(consumed)}</p>
          <p className="text-sm text-gray-500">of {goal} cal</p>
          <p className={`text-xs mt-1 font-medium ${remaining < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {remaining >= 0
              ? `${Math.round(remaining)} left`
              : `${Math.round(Math.abs(remaining))} over`}
          </p>
        </div>
      </div>
    </div>
  )
}