import { Activity, RefreshCw, Power, Plus, Trash2, Search, X } from 'lucide-react'

interface LandscapeHeaderProps {
  onCheckAll: () => void
  isCheckingAll: boolean
  isAutoPollEnabled: boolean
  onToggleAutoPoll: () => void
  onClearAll: () => void
  onOpenAddModal: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  serversCount: number
}

export function LandscapeHeader({
  onCheckAll,
  isCheckingAll,
  isAutoPollEnabled,
  onToggleAutoPoll,
  onClearAll,
  onOpenAddModal,
  searchQuery,
  onSearchChange,
  serversCount,
}: LandscapeHeaderProps) {
  return (
    <header className="glass-panel rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Brand & Live status beacon */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <div className="h-full w-full rounded-[15px] bg-[#070b19] flex items-center justify-center">
            <Activity className="h-5 w-5 text-indigo-300" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">
              ServerPulse
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              LANDSCAPE PRO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {serversCount} {serversCount === 1 ? 'node active' : 'nodes active'} • Real-time Infrastructure Telemetry
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="relative w-full md:w-72">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter hosts, names, IPs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
        {/* Auto poll switch */}
        <button
          onClick={onToggleAutoPoll}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer ${
            isAutoPollEnabled
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-slate-400 border border-white/5'
          }`}
          title={isAutoPollEnabled ? 'Pause polling' : 'Resume polling'}
        >
          <Power className="h-3.5 w-3.5" />
          <span>{isAutoPollEnabled ? 'Auto-Poll' : 'Paused'}</span>
        </button>

        {/* Check All */}
        <button
          onClick={onCheckAll}
          disabled={isCheckingAll || serversCount === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isCheckingAll ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Ping Fleet</span>
        </button>

        {/* Clear All */}
        {serversCount > 0 && (
          <button
            onClick={onClearAll}
            className="p-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition cursor-pointer"
            title="Clear all nodes"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Add Server Button */}
        <button
          onClick={onOpenAddModal}
          className="glass-button-glow flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-bold text-xs shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Node</span>
        </button>
      </div>
    </header>
  )
}
