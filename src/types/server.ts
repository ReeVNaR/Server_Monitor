export type ServerStatus = 'up' | 'degraded' | 'down' | 'checking'

export type ProtocolType = 'https' | 'http' | 'tcp' | 'ping'

export interface HealthCheckRecord {
  timestamp: number
  status: ServerStatus
  latencyMs: number
  statusCode?: number
  message?: string
}

export interface ServerResourceMetrics {
  cpuUsage: number // 0 - 100
  memoryUsage: number // 0 - 100
  diskUsage: number // 0 - 100
}

export interface MonitoredServer {
  id: string
  name: string
  host: string
  port?: number
  protocol: ProtocolType
  endpointPath?: string // e.g. /healthz or /api/ping
  category: 'Production' | 'Staging' | 'Database' | 'Core API' | 'Internal'
  status: ServerStatus
  latency: number // current response time in ms
  uptime24h: number // e.g. 99.9%
  lastChecked: number | null
  checkIntervalSec: number // polling interval in seconds (e.g. 15, 30, 60)
  autoCheck: boolean
  history: HealthCheckRecord[] // recent 20-30 health checks for trendlines
  metrics?: ServerResourceMetrics
  notes?: string
}

export interface FleetStats {
  total: number
  up: number
  degraded: number
  down: number
  avgLatency: number
  overallUptime: number
}
