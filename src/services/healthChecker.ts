import type { MonitoredServer, HealthCheckRecord, ServerStatus } from '../types/server'

/**
 * Executes a REAL network reachability check against a user-configured server.
 * Uses real high-resolution timers and handles both CORS-enabled and non-CORS endpoints.
 */
export async function executeHealthCheck(server: MonitoredServer): Promise<HealthCheckRecord> {
  const startTime = performance.now()

  // Format destination URL
  let targetUrl = server.host.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    const defaultProto = server.protocol === 'http' ? 'http://' : 'https://'
    targetUrl = `${defaultProto}${targetUrl}`
  }

  // Append port if specified and not already in host
  if (server.port && !targetUrl.match(/:\d+$/) && !targetUrl.match(/:\d+\//)) {
    try {
      const urlObj = new URL(targetUrl)
      urlObj.port = String(server.port)
      targetUrl = urlObj.toString()
    } catch {
      targetUrl = `${targetUrl}:${server.port}`
    }
  }

  // Append path if specified
  if (server.endpointPath) {
    const cleanPath = server.endpointPath.startsWith('/') ? server.endpointPath : `/${server.endpointPath}`
    if (!targetUrl.endsWith(cleanPath)) {
      targetUrl = `${targetUrl.replace(/\/$/, '')}${cleanPath}`
    }
  }

  const controller = new AbortController()
  const timeoutMs = 7000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let statusCode: number | undefined

    try {
      // First try standard fetch (captures true HTTP status code when CORS permits)
      const response = await fetch(targetUrl, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      statusCode = response.status
    } catch (corsErr: unknown) {
      if (controller.signal.aborted) {
        throw corsErr
      }

      // Retry with mode 'no-cors' to test raw network reachability when cross-origin headers are absent
      const noCorsResponse = await fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      statusCode = noCorsResponse.status || 200
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime))

    let status: ServerStatus = 'up'
    if (statusCode && statusCode >= 500) {
      status = 'down'
    } else if (latencyMs > 1000) {
      status = 'degraded'
    }

    return {
      timestamp: Date.now(),
      status,
      latencyMs,
      statusCode,
      message:
        status === 'down'
          ? `HTTP ${statusCode} Server Error`
          : status === 'degraded'
          ? `High latency (${latencyMs}ms)`
          : `Online (${latencyMs}ms)`,
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const isTimeout = controller.signal.aborted

    return {
      timestamp: Date.now(),
      status: 'down',
      latencyMs: 0,
      statusCode: isTimeout ? 408 : 503,
      message: isTimeout
        ? 'Connection timed out (>7s)'
        : err instanceof Error && err.name === 'AbortError'
        ? 'Request timed out'
        : 'Host unreachable or connection refused',
    }
  }
}
