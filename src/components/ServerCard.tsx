import { useState } from 'react'
import { RefreshCw, ExternalLink, Trash2, Radio, Activity } from 'lucide-react'
import type { MonitoredServer } from '../types/server'
import { LatencySparkline } from './LatencySparkline'
import { PulsingBeacon } from './PulsingBeacon'

interface ServerCardProps {
  server: MonitoredServer
  onCheck: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function ServerCard({ server, onCheck, onSelect, onDelete }: ServerCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isChecking = server.status === 'checking'

  const formatLastChecked = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <div className="glass-panel glass-panel-glow rounded-3xl p-4.5 relative overflow-hidden transition-all duration-300">
      {/* Dynamic ambient color glow according to server status */}
      <div
        className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-700 ${
          server.status === 'up'
            ? 'bg-emerald-400'
            : server.status === 'degraded'
            ? 'bg-amber-400'
            : server.status === 'down'
            ? 'bg-rose-500'
            : 'bg-indigo-500'
        }`}
      />

      {/* Top Header: Pulsing Beacon, Name, Protocol */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Animated Pulsing Beacon */}
          <div className="flex-shrink-0 pt-0.5">
            <PulsingBeacon status={server.status} size="md" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              {server.name}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5" title={server.host}>
              {server.host}
              {server.port ? `:${server.port}` : ''}
              {server.endpointPath || ''}
            </p>
          </div>
        </div>

        {/* Protocol / Category Pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            {server.protocol}
          </span>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
            {server.category}
          </span>
        </div>
      </div>

      {/* Latency & Telemetry section */}
      <div className="mt-4 p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 shadow-inner">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
            <Activity className="h-3 w-3 text-indigo-400" /> Response Time
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-xl font-bold font-mono tracking-tight ${
                server.status === 'down'
                  ? 'text-rose-400'
                  : server.status === 'degraded'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {server.status === 'down' ? 'Timeout' : server.latency}
            </span>
            {server.status !== 'down' && (
              <span className="text-xs font-mono text-slate-400">ms</span>
            )}
          </div>
        </div>

        {/* Sparkline Visual */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-slate-400 mb-1 font-mono">Last 16 checks</span>
          <LatencySparkline history={server.history} height={22} />
        </div>
      </div>

      {/* Footer Controls & Ping Trigger */}
      <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Radio className="h-3 w-3 text-indigo-400" />
          {formatLastChecked(server.lastChecked)}
        </span>

        <div className="flex items-center gap-2">
          {/* Quick Ping Button */}
          <button
            onClick={() => onCheck(server.id)}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition cursor-pointer active:scale-95 disabled:opacity-40"
            title="Ping node now"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Ping</span>
          </button>

          {/* Inspect Details */}
          <button
            onClick={() => onSelect(server.id)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
            title="Inspect health telemetry"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          {/* Delete Button */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(server.id)}
                className="px-2.5 py-1 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer transition"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-xl bg-white/5 text-slate-400 text-[11px] cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer active:scale-95"
              title="Delete node"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
