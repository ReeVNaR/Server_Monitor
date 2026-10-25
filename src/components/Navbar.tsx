import { Activity, RefreshCw, Plus, Power, Trash2 } from 'lucide-react'

interface NavbarProps {
  onCheckAll: () => void
  isCheckingAll: boolean
  isAutoPollEnabled: boolean
  onToggleAutoPoll: () => void
  onOpenAddModal: () => void
  onClearAll?: () => void
  serversCount?: number
}

export function Navbar({
  onCheckAll,
  isCheckingAll,
  isAutoPollEnabled,
  onToggleAutoPoll,
  onOpenAddModal,
  onClearAll,
  serversCount = 0,
}: NavbarProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                ServerMonitor
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-server health & uptime telemetry
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auto-check switch */}
          {serversCount > 0 && (
            <button
              onClick={onToggleAutoPoll}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isAutoPollEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
              }`}
              title="Toggle automated background polling"
            >
              <Power className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {isAutoPollEnabled ? 'Auto-Polling Active' : 'Auto-Polling Paused'}
              </span>
            </button>
          )}

          {/* Check All Button */}
          {serversCount > 0 && (
            <button
              onClick={onCheckAll}
              disabled={isCheckingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              title="Trigger an immediate health check on all servers"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCheckingAll ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Check All</span>
            </button>
          )}

          {/* Clear All Button */}
          {serversCount > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-400 text-xs transition cursor-pointer"
              title="Clear all servers"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}

          {/* Add Server Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Server</span>
          </button>
        </div>
      </div>
    </header>
  )
}
