import type { MonitoredServer } from '../types/server'

// Clean versioned storage key for user's own servers only
const STORAGE_KEY = 'server_monitor_fleet_v3'

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

export function loadStoredServers(): MonitoredServer[] {
  try {
    // Purge all legacy demo keys
    localStorage.removeItem('server_monitor_nodes_v1')
    localStorage.removeItem('server_monitor_user_nodes_v1')

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    // Ensure absolutely no demo or mock server IDs can ever load
    return parsed.filter(
      (s: MonitoredServer) => !DEMO_IDS.has(s.id) && !s.id.startsWith('mock-') && !s.name.includes('PostgreSQL Primary')
    )
  } catch (e) {
    console.error('Failed to parse stored servers', e)
    return []
  }
}

export function saveServers(servers: MonitoredServer[]): void {
  try {
    // Only save user-created servers
    const cleanList = servers.filter(
      (s) => !DEMO_IDS.has(s.id) && !s.id.startsWith('mock-') && !s.name.includes('PostgreSQL Primary')
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList))
  } catch (e) {
    console.error('Failed to save servers to local storage', e)
  }
}

export function clearAllStoredServers(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('server_monitor_nodes_v1')
    localStorage.removeItem('server_monitor_user_nodes_v1')
  } catch (e) {
    console.error('Failed to clear stored servers', e)
  }
}
