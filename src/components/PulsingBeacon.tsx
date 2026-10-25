import type { ServerStatus } from '../types/server'

interface PulsingBeaconProps {
  status: ServerStatus
  size?: 'sm' | 'md' | 'lg'
}

export function PulsingBeacon({ status, size = 'md' }: PulsingBeaconProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  const ringSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  if (status === 'up') {
    return (
      <span className="relative flex items-center justify-center">
        {/* Outer expanding ripple 1 */}
        <span
          className={`absolute rounded-full bg-emerald-400 opacity-60 animate-ping duration-1000 ${ringSizes[size]}`}
          style={{ animationDuration: '2.4s' }}
        />
        {/* Outer expanding ripple 2 (delayed) */}
        <span
          className={`absolute rounded-full bg-emerald-500 opacity-40 animate-ping duration-1000 ${ringSizes[size]}`}
          style={{ animationDuration: '2.4s', animationDelay: '0.8s' }}
        />
        {/* Solid core with glowing breathing shadow */}
        <span
          className={`relative inline-flex rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399,0_0_24px_rgba(52,211,153,0.4)] animate-pulse ${sizeClasses[size]}`}
          style={{ animationDuration: '1.8s' }}
        />
      </span>
    )
  }

  if (status === 'degraded') {
    return (
      <span className="relative flex items-center justify-center">
        <span
          className={`absolute rounded-full bg-amber-400 opacity-70 animate-ping ${ringSizes[size]}`}
          style={{ animationDuration: '1.6s' }}
        />
        <span
          className={`relative inline-flex rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24,0_0_20px_rgba(251,191,36,0.5)] animate-pulse ${sizeClasses[size]}`}
          style={{ animationDuration: '1.2s' }}
        />
      </span>
    )
  }

  if (status === 'down') {
    return (
      <span className="relative flex items-center justify-center">
        <span
          className={`absolute rounded-full bg-rose-500 opacity-75 animate-ping ${ringSizes[size]}`}
          style={{ animationDuration: '1.2s' }}
        />
        <span
          className={`relative inline-flex rounded-full bg-rose-500 shadow-[0_0_14px_#f43f5e,0_0_25px_rgba(244,63,94,0.6)] ${sizeClasses[size]}`}
        />
      </span>
    )
  }

  // Checking state
  return (
    <span className="relative flex items-center justify-center">
      <span
        className={`absolute rounded-full border-2 border-indigo-400 border-t-transparent animate-spin ${ringSizes[size]}`}
      />
      <span className={`relative inline-flex rounded-full bg-indigo-400/60 ${sizeClasses[size]}`} />
    </span>
  )
}
