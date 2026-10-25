import { useState, useEffect } from 'react'
import { Activity, RefreshCw, Power, Trash2, Wifi, BatteryCharging } from 'lucide-react'

interface MobileHeaderProps {
  onCheckAll: () => void
  isCheckingAll: boolean
  isAutoPollEnabled: boolean
  onToggleAutoPoll: () => void
  onClearAll: () => void
  serversCount: number
}

export function MobileHeader({
  onCheckAll,
  isCheckingAll,
  isAutoPollEnabled,
  onToggleAutoPoll,
  onClearAll,
  serversCount,
}: MobileHeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="sticky top-0 z-40 w-full pt-1.5 pb-2">
      {/* Native Mobile Status Bar simulation */}
      <div className="flex items-center justify-between px-6 py-1 text-[11px] font-semibold text-slate-400/90 tracking-tight">
        <span>{time || '12:00'}</span>
        {/* Dynamic Island / Pill notch */}
        <div className="h-4.5 px-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shadow-inner">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAutoPollEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isAutoPollEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
          </span>
          <span className="text-[9px] font-mono tracking-wider uppercase text-slate-300">
            {isAutoPollEnabled ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Wifi className="h-3 w-3" />
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Main Glass Header Bar */}
      <div className="mx-4 mt-1.5 px-4 py-2.5 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-[0_0_15px_rgba(168,85,247,0.35)]">
              <div className="h-full w-full rounded-[11px] bg-[#070b19] flex items-center justify-center">
                <Activity className="h-4.5 w-4.5 text-indigo-300" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">ServerPulse</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {serversCount} {serversCount === 1 ? 'node active' : 'nodes active'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Auto poll toggle */}
          <button
            onClick={onToggleAutoPoll}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isAutoPollEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border border-white/5'
            }`}
            title={isAutoPollEnabled ? 'Pause background polling' : 'Resume polling'}
          >
            <Power className="h-3.5 w-3.5" />
          </button>

          {/* Quick Check All */}
          <button
            onClick={onCheckAll}
            disabled={isCheckingAll || serversCount === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition cursor-pointer disabled:opacity-40"
            title="Check all servers"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCheckingAll ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Clear All */}
          {serversCount > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition cursor-pointer"
              title="Clear all servers"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
