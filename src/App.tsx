import { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  Server,
  Globe,
  Zap,
  Filter,
} from 'lucide-react'
import { useServerMonitor } from './hooks/useServerMonitor'
import { MobileHeader } from './components/MobileHeader'
import { LandscapeHeader } from './components/LandscapeHeader'
import { StatsOverview } from './components/StatsOverview'
import { ServerCard } from './components/ServerCard'
import { MobileBottomNav } from './components/MobileBottomNav'
import { AddServerModal } from './components/AddServerModal'
import { ServerDetailsDrawer } from './components/ServerDetailsDrawer'

/**
 * Hook to automatically detect orientation and device viewport.
 * - Mobile View: Portrait orientation or screen width < 768px
 * - Landscape View: Landscape orientation or widescreen width >= 768px
 */
function useAutoViewportDetection() {
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 768 || window.innerWidth > window.innerHeight
  })

  useEffect(() => {
    const handleDetection = () => {
      // Landscape if wide screen (>= 768px) OR device orientation is landscape
      const isWide = window.innerWidth >= 768
      const isOrientationLandscape =
        window.matchMedia && window.matchMedia('(orientation: landscape)').matches
      const isLandscapeRatio = window.innerWidth > window.innerHeight

      setIsLandscape(isWide || (isOrientationLandscape && isLandscapeRatio))
    }

    handleDetection()
    window.addEventListener('resize', handleDetection)

    // Listen to device orientation changes
    let mql: MediaQueryList | null = null
    if (window.matchMedia) {
      mql = window.matchMedia('(orientation: landscape)')
      if (mql.addEventListener) {
        mql.addEventListener('change', handleDetection)
      } else {
        // Fallback for older browsers
        mql.addListener(handleDetection)
      }
    }

    return () => {
      window.removeEventListener('resize', handleDetection)
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', handleDetection)
        } else {
          mql.removeListener(handleDetection)
        }
      }
    }
  }, [])

  return isLandscape
}

export default function App() {
  const {
    servers,
    stats,
    isAutoPollEnabled,
    setIsAutoPollEnabled,
    isCheckingAll,
    checkSingleServer,
    checkAllServers,
    addServer,
    updateServer,
    deleteServer,
    clearAll,
    selectedServer,
    setSelectedServerId,
  } = useServerMonitor()

  // Automatic Viewport & Orientation Detection
  const isLandscape = useAutoViewportDetection()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'degraded' | 'down'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Categories
  const categories = useMemo(() => {
    const set = new Set(servers.map((s) => s.category))
    return ['all', ...Array.from(set)]
  }, [servers])

  // Filtered servers
  const filteredServers = useMemo(() => {
    return servers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.host.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter
      const matchesCategory = categoryFilter === 'all' ? true : s.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [servers, searchQuery, statusFilter, categoryFilter])

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Liquid Glass Ambient Mesh Spheres */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-[350px] sm:w-[540px] h-[350px] sm:h-[540px] rounded-full bg-gradient-to-tr from-indigo-600/30 via-blue-600/20 to-cyan-500/20 blur-[110px] sm:blur-[150px] animate-fluid-1" />
        <div className="absolute top-[35%] right-[-10%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-gradient-to-br from-purple-600/30 via-fuchsia-600/20 to-pink-500/20 blur-[110px] sm:blur-[150px] animate-fluid-2" />
        <div className="absolute bottom-[-10%] left-[15%] w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-gradient-to-tr from-emerald-600/25 via-teal-600/20 to-indigo-600/20 blur-[100px] sm:blur-[140px] animate-fluid-3" />
      </div>

      {/* ========================================================= */}
      {/* 1. AUTO-DETECTED MOBILE VIEW (Portrait / Mobile Viewport) */}
      {/* ========================================================= */}
      {!isLandscape ? (
        <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col pb-28 pt-1 transition-all duration-300">
          {/* Mobile Top Header with Dynamic Island Simulation */}
          <MobileHeader
            onCheckAll={checkAllServers}
            isCheckingAll={isCheckingAll}
            isAutoPollEnabled={isAutoPollEnabled}
            onToggleAutoPoll={() => setIsAutoPollEnabled(!isAutoPollEnabled)}
            onClearAll={clearAll}
            serversCount={servers.length}
          />

          {/* Liquid Glass Stats Overview */}
          <div className="mt-2">
            <StatsOverview stats={stats} isLandscape={false} />
          </div>

          {/* Expandable Mobile Search & Filter Glass Drawer */}
          {isSearchVisible && (
            <div className="px-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3.5 rounded-3xl glass-panel space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search node name, host, or IP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>

                {/* Status Filter Chips */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {(['all', 'up', 'degraded', 'down'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition cursor-pointer flex-shrink-0 ${
                        statusFilter === status
                          ? 'bg-indigo-600/40 border border-indigo-400/60 text-white font-bold'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Category Filter Chips */}
                {categories.length > 2 && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategoryFilter(c)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] transition cursor-pointer flex-shrink-0 ${
                          categoryFilter === c
                            ? 'bg-purple-600/40 border border-purple-400/60 text-white font-semibold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {c === 'all' ? 'All Groups' : c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Server Fleet List */}
          <div className="px-4 mt-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monitored Fleet
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {filteredServers.length} {filteredServers.length === 1 ? 'node' : 'nodes'}
              </span>
            </div>

            {servers.length === 0 ? (
              <div className="p-8 rounded-3xl glass-panel text-center my-6 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                  <Server className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  No Servers Configured
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Add your server URL or IP address. Real-time background pings will measure latency and uptime.
                </p>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="glass-button-glow mt-5 px-5 py-2.5 rounded-full inline-flex items-center gap-2 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Server</span>
                </button>

                <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <Globe className="h-3.5 w-3.5 text-indigo-400 mb-1" />
                    <span className="text-[11px] font-bold text-white block">Real Endpoints</span>
                    <span className="text-[9px] text-slate-400">Auto-detected URLs & Ports</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <Zap className="h-3.5 w-3.5 text-emerald-400 mb-1" />
                    <span className="text-[11px] font-bold text-white block">Real Latency</span>
                    <span className="text-[9px] text-slate-400">Sub-ms timer resolution</span>
                  </div>
                </div>
              </div>
            ) : filteredServers.length === 0 ? (
              <div className="p-8 rounded-3xl glass-panel text-center my-4">
                <p className="text-xs text-slate-400">No nodes match your current search or filter</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}
                  className="mt-2 text-xs text-indigo-400 font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServers.map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    onCheck={checkSingleServer}
                    onSelect={(id) => setSelectedServerId(id)}
                    onDelete={deleteServer}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating Mobile Bottom Navigation Dock */}
          <MobileBottomNav
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onCheckAll={checkAllServers}
            isCheckingAll={isCheckingAll}
            isSearchVisible={isSearchVisible}
            onToggleSearch={() => setIsSearchVisible(!isSearchVisible)}
            activeFilterCount={statusFilter !== 'all' || categoryFilter !== 'all' ? 1 : 0}
          />
        </div>
      ) : (
        /* ============================================================ */
        /* 2. AUTO-DETECTED LANDSCAPE VIEW (Widescreen / Desktop Dashboard) */
        /* ============================================================ */
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300">
          {/* Landscape Widescreen Liquid Glass Header */}
          <LandscapeHeader
            onCheckAll={checkAllServers}
            isCheckingAll={isCheckingAll}
            isAutoPollEnabled={isAutoPollEnabled}
            onToggleAutoPoll={() => setIsAutoPollEnabled(!isAutoPollEnabled)}
            onClearAll={clearAll}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            serversCount={servers.length}
          />

          {/* Landscape Stats Overview (Expanded 4-Column Grid) */}
          <div className="mb-6">
            <StatsOverview stats={stats} isLandscape={true} />
          </div>

          {/* Filter Pills Bar for Landscape */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl glass-panel">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 px-2">
                <Filter className="h-3.5 w-3.5 text-indigo-400" /> Status:
              </span>
              <div className="flex gap-1.5">
                {(['all', 'up', 'degraded', 'down'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${
                      statusFilter === status
                        ? 'bg-indigo-600/40 border border-indigo-400/60 text-white font-bold shadow-sm'
                        : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold px-2">Group:</span>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                      categoryFilter === c
                        ? 'bg-purple-600/40 border border-purple-400/60 text-white font-semibold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c === 'all' ? 'All Groups' : c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Landscape Multi-Column Server Grid */}
          {servers.length === 0 ? (
            <div className="p-16 rounded-3xl glass-panel text-center my-6 border border-white/10 shadow-2xl">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                <Server className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                No Servers in Fleet
              </h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Configure your server IP addresses or web endpoints to begin continuous live health and latency monitoring.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="glass-button-glow mt-6 px-6 py-3 rounded-2xl inline-flex items-center gap-2 text-white text-sm font-bold shadow-xl cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Server Node</span>
              </button>
            </div>
          ) : filteredServers.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel text-center">
              <p className="text-sm text-slate-400">No nodes match your active filters</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-white/5 text-indigo-300 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onCheck={checkSingleServer}
                  onSelect={(id) => setSelectedServerId(id)}
                  onDelete={deleteServer}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Server Modal / Bottom Sheet */}
      <AddServerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addServer}
      />

      {/* Server Telemetry Details Modal / Bottom Sheet */}
      <ServerDetailsDrawer
        server={selectedServer}
        onClose={() => setSelectedServerId(null)}
        onCheck={checkSingleServer}
        onToggleAutoCheck={(id, enabled) => updateServer(id, { autoCheck: enabled })}
      />
    </div>
  )
}
