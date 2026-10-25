import { Server, Zap } from 'lucide-react'
import type { FleetStats } from '../types/server'
import { PulsingBeacon } from './PulsingBeacon'

interface StatsOverviewProps {
  stats: FleetStats
  isLandscape?: boolean
}

export function StatsOverview({ stats, isLandscape = false }: StatsOverviewProps) {
  const hasServers = stats.total > 0

  const getSystemStatus = () => {
    if (!hasServers) return 'up'
    if (stats.down > 0) return 'down'
    if (stats.degraded > 0) return 'degraded'
    return 'up'
  }

  return (
    <div className={`space-y-3 ${isLandscape ? 'w-full' : 'px-4'}`}>
      {/* Primary Liquid Glass Status Card */}
      <div className="p-4.5 rounded-3xl glass-panel glass-panel-glow relative overflow-hidden">
        {/* Animated background light refraction */}
        <div
          className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-700 ${
            !hasServers
              ? 'bg-indigo-600/30'
              : stats.down > 0
              ? 'bg-rose-600/50'
              : stats.degraded > 0
              ? 'bg-amber-600/50'
              : 'bg-emerald-500/50'
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Dynamic Pulsing Beacon Container */}
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all ${
                !hasServers
                  ? 'bg-white/5 border-white/10'
                  : stats.down > 0
                  ? 'bg-rose-500/15 border-rose-500/30'
                  : stats.degraded > 0
                  ? 'bg-amber-500/15 border-amber-500/30'
                  : 'bg-emerald-500/15 border-emerald-500/30'
              }`}
            >
              <PulsingBeacon status={getSystemStatus()} size="lg" />
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Infrastructure Health
              </span>
              <span
                className={`text-sm sm:text-base font-bold tracking-tight ${
                  !hasServers
                    ? 'text-slate-300'
                    : stats.down > 0
                    ? 'text-rose-400'
                    : stats.degraded > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {!hasServers
                  ? 'Awaiting Target Nodes'
                  : stats.down > 0
                  ? `${stats.down} Service Unreachable`
                  : stats.degraded > 0
                  ? `${stats.degraded} Experiencing Latency`
                  : 'All Systems Operational'}
              </span>
            </div>
          </div>

          <div className="flex items-center sm:text-right gap-6 sm:gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {hasServers ? `${stats.overallUptime}%` : '—'}
              </span>
              <span className="text-[10px] text-slate-400 block">24h Uptime</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tracking-tight">
                {hasServers && stats.avgLatency > 0 ? `${stats.avgLatency}ms` : '—'}
              </span>
              <span className="text-[10px] text-slate-400 block">Avg Response</span>
            </div>
          </div>
        </div>

        {/* Liquid Progress Bar */}
        <div className="mt-3.5 w-full bg-white/5 rounded-full h-1.5 overflow-hidden p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              hasServers
                ? stats.overallUptime >= 99
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : stats.overallUptime >= 95
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                  : 'bg-gradient-to-r from-rose-600 to-red-400 shadow-[0_0_12px_rgba(225,29,72,0.7)]'
                : 'bg-slate-700'
            }`}
            style={{ width: hasServers ? `${Math.min(100, stats.overallUptime)}%` : '0%' }}
          />
        </div>
      </div>

      {/* Metric Cards (Grid adjusts for Landscape vs Mobile) */}
      <div className={`grid gap-3 ${isLandscape ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {/* Card 1: Total Nodes */}
        <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Monitored</span>
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Server className="h-3 w-3" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{stats.total}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{stats.up} online</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
            {stats.degraded > 0 && <span className="text-amber-400">{stats.degraded} slow</span>}
            {stats.down > 0 && <span className="text-rose-400">{stats.down} down</span>}
            {!hasServers && <span className="text-slate-500">None added</span>}
          </div>
        </div>

        {/* Card 2: Avg Response Time */}
        <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Avg Ping</span>
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="h-3 w-3" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white">
              {hasServers && stats.avgLatency > 0 ? stats.avgLatency : '—'}
            </span>
            <span className="text-xs font-mono text-slate-400">ms</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            {!hasServers
              ? 'No active nodes'
              : stats.avgLatency === 0
              ? 'Measuring...'
              : stats.avgLatency < 60
              ? '⚡ Super Fast'
              : stats.avgLatency < 180
              ? 'Normal Response'
              : '⚠️ High Latency'}
          </div>
        </div>

        {/* Extra Card 3 for Landscape: Online Nodes */}
        {isLandscape && (
          <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Healthy Fleet</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">{stats.up}</span>
              <span className="text-xs text-slate-400">nodes</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Zero errors reported</div>
          </div>
        )}

        {/* Extra Card 4 for Landscape: Target Availability */}
        {isLandscape && (
          <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">SLA Target</span>
              <span className="text-[10px] font-mono text-indigo-300">99.9%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{stats.overallUptime}%</span>
              <span className="text-xs text-emerald-400">achieved</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Rolling 24-hour window</div>
          </div>
        )}
      </div>
    </div>
  )
}
