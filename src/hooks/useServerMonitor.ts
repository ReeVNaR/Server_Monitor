import { useState, useEffect, useCallback, useMemo } from 'react'
import type { MonitoredServer, FleetStats, ServerStatus } from '../types/server'
import { loadStoredServers, saveServers, clearAllStoredServers } from '../services/storage'
import { executeHealthCheck } from '../services/healthChecker'

const DEMO_IDS = new Set([
  'srv-prod-api',
  'srv-auth-cluster',
  'srv-db-master',
  'srv-redis-cache',
  'srv-stage-app',
  'srv-01',
  'srv-02',
  'srv-03',
  'srv-04',
])

export function useServerMonitor() {
  const [servers, setServers] = useState<MonitoredServer[]>(loadStoredServers)
  const [isAutoPollEnabled, setIsAutoPollEnabled] = useState(true)
  const [isCheckingAll, setIsCheckingAll] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)

  // React HMR state scrubber: forcibly purge any demo/sample servers left in browser memory
  useEffect(() => {
    setServers((prev) =>
      prev.filter(
        (s) => !DEMO_IDS.has(s.id) && !s.id.startsWith('mock-') && !s.name.includes('PostgreSQL Primary')
      )
    )
  }, [])

  // Save changes to localStorage
  useEffect(() => {
    saveServers(servers)
  }, [servers])

  // Single server health check
  const checkSingleServer = useCallback(async (id: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'checking' as ServerStatus } : s))
    )

    const target = servers.find((s) => s.id === id)
    if (!target) return

    const result = await executeHealthCheck(target)

    setServers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s

        const updatedHistory = [...(s.history || []), result].slice(-30)
        const upCount = updatedHistory.filter((h) => h.status === 'up' || h.status === 'degraded').length
        const newUptime =
          updatedHistory.length > 0
            ? Math.round((upCount / updatedHistory.length) * 1000) / 10
            : result.status === 'down'
            ? 0
            : 100

        return {
          ...s,
          status: result.status,
          latency: result.latencyMs,
          lastChecked: result.timestamp,
          uptime24h: newUptime,
          history: updatedHistory,
        }
      })
    )
  }, [servers])

  // Check all servers
  const checkAllServers = useCallback(async () => {
    if (isCheckingAll || servers.length === 0) return
    setIsCheckingAll(true)

    setServers((prev) => prev.map((s) => ({ ...s, status: 'checking' as ServerStatus })))

    const promises = servers.map(async (server) => {
      const result = await executeHealthCheck(server)
      return { id: server.id, result }
    })

    const results = await Promise.all(promises)

    setServers((prev) =>
      prev.map((s) => {
        const item = results.find((r) => r.id === s.id)
        if (!item) return s

        const result = item.result
        const updatedHistory = [...(s.history || []), result].slice(-30)
        const upCount = updatedHistory.filter((h) => h.status === 'up' || h.status === 'degraded').length
        const newUptime =
          updatedHistory.length > 0
            ? Math.round((upCount / updatedHistory.length) * 1000) / 10
            : result.status === 'down'
            ? 0
            : 100

        return {
          ...s,
          status: result.status,
          latency: result.latencyMs,
          lastChecked: result.timestamp,
          uptime24h: newUptime,
          history: updatedHistory,
        }
      })
    )

    setIsCheckingAll(false)
  }, [servers, isCheckingAll])

  // Periodic automatic health check ticker
  useEffect(() => {
    if (!isAutoPollEnabled || servers.length === 0) return

    const interval = setInterval(() => {
      const now = Date.now()
      servers.forEach((s) => {
        if (!s.autoCheck) return
        const timeSinceLast = s.lastChecked ? now - s.lastChecked : Infinity
        const intervalMs = (s.checkIntervalSec || 30) * 1000
        if (timeSinceLast >= intervalMs) {
          checkSingleServer(s.id)
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPollEnabled, servers, checkSingleServer])

  // Add Server (strictly from user input)
  const addServer = useCallback(
    (newServerData: Omit<MonitoredServer, 'id' | 'status' | 'latency' | 'uptime24h' | 'lastChecked' | 'history'>) => {
      const newServer: MonitoredServer = {
        ...newServerData,
        id: `srv-${Date.now()}`,
        status: 'checking',
        latency: 0,
        uptime24h: 100,
        lastChecked: null,
        history: [],
      }

      setServers((prev) => [newServer, ...prev])

      // Immediately execute the first real health check
      executeHealthCheck(newServer).then((result) => {
        setServers((prev) =>
          prev.map((s) =>
            s.id === newServer.id
              ? {
                  ...s,
                  status: result.status,
                  latency: result.latencyMs,
                  lastChecked: result.timestamp,
                  uptime24h: result.status === 'down' ? 0 : 100,
                  history: [result],
                }
              : s
          )
        )
      })
    },
    []
  )

  // Delete Server
  const deleteServer = useCallback(
    (id: string) => {
      setServers((prev) => prev.filter((s) => s.id !== id))
      if (selectedServerId === id) {
        setSelectedServerId(null)
      }
    },
    [selectedServerId]
  )

  // Clear all servers
  const clearAll = useCallback(() => {
    setServers([])
    setSelectedServerId(null)
    clearAllStoredServers()
  }, [])

  // Update Server
  const updateServer = useCallback((id: string, updates: Partial<MonitoredServer>) => {
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  // Fleet stats computation
  const stats: FleetStats = useMemo(() => {
    const total = servers.length
    if (total === 0) {
      return {
        total: 0,
        up: 0,
        degraded: 0,
        down: 0,
        avgLatency: 0,
        overallUptime: 100,
      }
    }

    const up = servers.filter((s) => s.status === 'up').length
    const degraded = servers.filter((s) => s.status === 'degraded').length
    const down = servers.filter((s) => s.status === 'down').length

    const activeLatencies = servers.filter((s) => s.status !== 'down' && s.latency > 0).map((s) => s.latency)
    const avgLatency =
      activeLatencies.length > 0
        ? Math.round(activeLatencies.reduce((a, b) => a + b, 0) / activeLatencies.length)
        : 0

    const overallUptime =
      total > 0
        ? Math.round((servers.reduce((acc, curr) => acc + (curr.uptime24h ?? 100), 0) / total) * 10) / 10
        : 100

    return { total, up, degraded, down, avgLatency, overallUptime }
  }, [servers])

  const selectedServer = useMemo(
    () => servers.find((s) => s.id === selectedServerId) || null,
    [servers, selectedServerId]
  )

  return {
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
  }
}
