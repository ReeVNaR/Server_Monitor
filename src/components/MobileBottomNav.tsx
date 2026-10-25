import { Plus, RefreshCw, Search } from 'lucide-react'

interface MobileBottomNavProps {
  onOpenAddModal: () => void
  onCheckAll: () => void
  isCheckingAll: boolean
  isSearchVisible: boolean
  onToggleSearch: () => void
  activeFilterCount: number
}

export function MobileBottomNav({
  onOpenAddModal,
  onCheckAll,
  isCheckingAll,
  isSearchVisible,
  onToggleSearch,
  activeFilterCount,
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="glass-dock rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl pointer-events-auto">
        {/* Search Toggle with active filter indicator */}
        <button
          onClick={onToggleSearch}
          className={`relative p-2.5 rounded-full transition cursor-pointer active:scale-90 ${
            isSearchVisible
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Search & filters"
        >
          <Search className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]" />
          )}
        </button>

        {/* Fleet Status Indicator */}
        <div className="h-4 w-[1px] bg-white/10" />

        {/* Center Prominent Add Button with Liquid Glow */}
        <button
          onClick={onOpenAddModal}
          className="glass-button-glow h-11 px-4.5 rounded-full flex items-center gap-2 text-white font-semibold text-xs shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Node</span>
        </button>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Check All Button */}
        <button
          onClick={onCheckAll}
          disabled={isCheckingAll}
          className="p-2.5 rounded-full text-slate-300 hover:text-white transition cursor-pointer active:scale-90 disabled:opacity-40"
          title="Refresh / Check all nodes"
        >
          <RefreshCw className={`h-4 w-4 ${isCheckingAll ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </div>
  )
}
