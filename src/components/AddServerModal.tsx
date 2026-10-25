import { useState } from 'react'
import { X, Plus, Server, Sparkles } from 'lucide-react'
import type { MonitoredServer, ProtocolType } from '../types/server'

interface AddServerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (
    server: Omit<
      MonitoredServer,
      'id' | 'status' | 'latency' | 'uptime24h' | 'lastChecked' | 'history'
    >
  ) => void
}

export function AddServerModal({ isOpen, onClose, onAdd }: AddServerModalProps) {
  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState<string>('')
  const [protocol, setProtocol] = useState<ProtocolType>('https')
  const [endpointPath, setEndpointPath] = useState('')
  const [category, setCategory] = useState<MonitoredServer['category']>('Production')
  const [checkIntervalSec, setCheckIntervalSec] = useState<number>(15)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [autoDetectedMessage, setAutoDetectedMessage] = useState<string | null>(null)

  if (!isOpen) return null

  /**
   * Auto-Detect URL / Host details on input paste or typing
   */
  const handleHostChange = (val: string) => {
    setHost(val)
    const trimmed = val.trim()
    if (!trimmed) {
      setAutoDetectedMessage(null)
      return
    }

    try {
      // Check if user pasted a full URL
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const parsed = new URL(trimmed)
        const proto: ProtocolType = parsed.protocol.startsWith('https') ? 'https' : 'http'
        setProtocol(proto)
        setHost(parsed.hostname)

        if (parsed.port) {
          setPort(parsed.port)
        } else if (proto === 'https') {
          setPort('443')
        } else if (proto === 'http') {
          setPort('80')
        }

        if (parsed.pathname && parsed.pathname !== '/') {
          setEndpointPath(parsed.pathname)
        }

        // Auto suggest name if empty
        if (!name) {
          setName(parsed.hostname.replace(/^www\./, ''))
        }

        setAutoDetectedMessage(`Auto-detected: ${proto.toUpperCase()} • ${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`)
      } else if (trimmed.includes(':') && !trimmed.startsWith('http')) {
        // e.g. 192.168.1.50:8080 or host.com:5432
        const [cleanHost, potentialPort] = trimmed.split(':')
        const portNum = parseInt(potentialPort, 10)
        if (!isNaN(portNum)) {
          setPort(String(portNum))
          setHost(cleanHost)
          if (portNum === 443) setProtocol('https')
          else if (portNum === 80) setProtocol('http')
          else setProtocol('tcp')

          if (!name) setName(cleanHost)
          setAutoDetectedMessage(`Auto-detected: Port ${portNum} • Host ${cleanHost}`)
        }
      }
    } catch {
      // Ignore URL parse errors while user is actively typing
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide a server display name')
      return
    }
    if (!host.trim()) {
      setError('Please enter a host or URL (e.g. api.example.com)')
      return
    }

    onAdd({
      name: name.trim(),
      host: host.trim(),
      port: port ? parseInt(port, 10) : undefined,
      protocol,
      endpointPath: endpointPath.trim() || undefined,
      category,
      checkIntervalSec,
      autoCheck: true,
      notes: notes.trim() || undefined,
    })

    // Reset and close
    setName('')
    setHost('')
    setPort('')
    setEndpointPath('')
    setNotes('')
    setError('')
    setAutoDetectedMessage(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md glass-sheet sm:rounded-3xl rounded-t-[32px] p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4 sm:hidden" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <Server className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Add Server Node</h2>
              <p className="text-[11px] text-slate-400">Endpoint & health check configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sheet Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Host / URL Input with Auto-Detection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Host / IP / URL *
              </label>
              <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Auto-detects on paste
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. https://api.mycloud.com:8443/healthz"
              value={host}
              onChange={(e) => handleHostChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
              required
            />
            {autoDetectedMessage && (
              <div className="mt-1.5 px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <Sparkles className="h-3 w-3 flex-shrink-0" />
                <span>{autoDetectedMessage}</span>
              </div>
            )}
          </div>

          {/* Server Display Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Node Display Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Primary Cloud Gateway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
              required
            />
          </div>

          {/* Protocol Selection Pills */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Protocol
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['https', 'http', 'tcp', 'ping'] as const).map((proto) => (
                <button
                  type="button"
                  key={proto}
                  onClick={() => setProtocol(proto)}
                  className={`py-2 rounded-xl text-xs font-mono uppercase transition cursor-pointer ${
                    protocol === proto
                      ? 'glass-pill-active text-white font-bold'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>

          {/* Port & Path */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Port
              </label>
              <input
                type="number"
                placeholder="e.g. 443"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Path
              </label>
              <input
                type="text"
                placeholder="e.g. /healthz"
                value={endpointPath}
                onChange={(e) => setEndpointPath(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Group Category */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category Group
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['Production', 'Core API', 'Database', 'Staging', 'Internal'] as const).map(
                (cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                      category === cat
                        ? 'bg-indigo-600/40 border border-indigo-400/60 text-white font-semibold'
                        : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Check Interval */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Polling Interval
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 30, 60].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setCheckIntervalSec(sec)}
                  className={`py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                    checkIntervalSec === sec
                      ? 'bg-indigo-600/40 border border-indigo-400/60 text-white font-bold'
                      : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="glass-button-glow w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm shadow-xl cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Start Monitoring Node</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
