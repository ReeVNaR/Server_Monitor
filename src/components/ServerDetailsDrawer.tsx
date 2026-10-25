import { X, RefreshCw, AlertTriangle, XCircle } from 'lucide-react'
import type { MonitoredServer } from '../types/server'
import { LatencySparkline } from './LatencySparkline'

interface ServerDetailsDrawerProps {
  server: MonitoredServer | null
  onClose: () => void
  onCheck: (id: string) => void
  onToggleAutoCheck: (id: string, enabled: boolean) => void
}

export function ServerDetailsDrawer({
  server,
  onClose,
  onCheck,
  onToggleAutoCheck,
}: ServerDetailsDrawerProps) {
  if (!server) return null

  const isChecking = server.status === 'checking'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md glass-sheet sm:rounded-3xl rounded-t-[32px] p-6 max-h-[88vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4" />

        {/* Sheet Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {server.protocol}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                {server.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{server.name}</h2>
            <p className="text-xs font-mono text-slate-400 truncate mt-0.5 max-w-[280px]">
              {server.host}
              {server.port ? `:${server.port}` : ''}
              {server.endpointPath || ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCheck(server.id)}
              disabled={isChecking}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition cursor-pointer active:scale-95 disabled:opacity-40"
              title="Ping node now"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Status</span>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              {server.status === 'up' && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              )}
              {server.status === 'degraded' && (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Slow
                </span>
              )}
              {server.status === 'down' && (
                <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Offline
                </span>
              )}
              {server.status === 'checking' && (
                <span className="text-xs font-bold text-indigo-400">Pinging</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Latency</span>
            <div className="mt-1 text-sm font-bold font-mono text-white">
              {server.status === 'down' ? (
                <span className="text-rose-400">Timeout</span>
              ) : (
                `${server.latency} ms`
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">24h Uptime</span>
            <div className="mt-1 text-sm font-bold font-mono text-emerald-400">
              {server.uptime24h}%
            </div>
          </div>
        </div>

        {/* Sparkline Visual */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
            <span>Latency Trend</span>
            <span className="text-[10px] text-slate-500 font-mono">Last 16 checks</span>
          </div>
          <LatencySparkline history={server.history} height={32} />
        </div>

        {/* Live Logs Stream */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Recent Health Telemetry Logs</span>
            <span className="text-[10px] font-mono text-slate-500">
              {server.history?.length || 0} checks
            </span>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/5 divide-y divide-white/5 overflow-hidden">
            {(!server.history || server.history.length === 0) && (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                Awaiting first response data...
              </div>
            )}
            {server.history &&
              [...server.history]
                .reverse()
                .slice(0, 8)
                .map((log, i) => (
                  <div key={i} className="p-2.5 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          log.status === 'up'
                            ? 'bg-emerald-400'
                            : log.status === 'degraded'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-mono text-[11px] text-slate-300">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {log.message || 'OK'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      {log.statusCode && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {log.statusCode}
                        </span>
                      )}
                      <span
                        className={`font-bold ${
                          log.status === 'down'
                            ? 'text-rose-400'
                            : log.status === 'degraded'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {log.status === 'down' ? 'Err' : `${log.latencyMs}ms`}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Configuration Details & Polling Switch */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-300 font-semibold block">Background Poller</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Every {server.checkIntervalSec}s
            </span>
          </div>

          <button
            onClick={() => onToggleAutoCheck(server.id, !server.autoCheck)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              server.autoCheck
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border border-white/5'
            }`}
          >
            {server.autoCheck ? 'Enabled' : 'Paused'}
          </button>
        </div>
      </div>
    </div>
  )
}
