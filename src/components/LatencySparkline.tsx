import type { HealthCheckRecord } from '../types/server'

interface SparklineProps {
  history: HealthCheckRecord[]
  height?: number
}

export function LatencySparkline({ history, height = 28 }: SparklineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center text-xs text-slate-500 italic h-7">
        Awaiting telemetry...
      </div>
    )
  }

  // Take the last 16 points
  const points = history.slice(-16)
  const maxLatency = Math.max(50, ...points.map((p) => (p.status === 'down' ? 100 : p.latencyMs)))

  return (
    <div className="flex items-end gap-1 h-7">
      {points.map((pt, i) => {
        const isDown = pt.status === 'down'
        const isDegraded = pt.status === 'degraded'
        const barHeight = isDown ? height : Math.max(4, Math.round((pt.latencyMs / maxLatency) * height))

        let barColor = 'bg-emerald-500/80 hover:bg-emerald-400'
        if (isDown) barColor = 'bg-rose-500 hover:bg-rose-400'
        else if (isDegraded) barColor = 'bg-amber-400 hover:bg-amber-300'

        return (
          <div
            key={i}
            className={`w-1.5 rounded-sm transition-all duration-300 cursor-pointer ${barColor}`}
            style={{ height: `${barHeight}px` }}
            title={`${new Date(pt.timestamp).toLocaleTimeString()}: ${
              isDown ? 'DOWN' : `${pt.latencyMs}ms`
            } (${pt.status})`}
          />
        )
      })}
    </div>
  )
}
