import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const TOKEN_KEY = 'oei_admin_token'
const API_BASE = 'http://localhost:8080'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DatasetVersion {
  version: string
  released_at: string
  exercise_count: number
  muscle_count?: number
  equipment_count?: number
  schema_version?: string
}

interface FacetItem {
  value: string
  count: number
}

interface Facets {
  categories?: FacetItem[]
  difficulties?: FacetItem[]
  movement_patterns?: FacetItem[]
}

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) {
      setError('Enter any value to continue.')
      return
    }
    try {
      localStorage.setItem(TOKEN_KEY, value.trim())
    } catch (_) {}
    onLogin(value.trim())
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-indigo-400 font-bold text-2xl tracking-tight mb-2">OEI Admin</div>
          <p className="text-slate-400 text-sm">Enter your admin token to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div>
            <label htmlFor="token" className="block text-slate-300 text-sm font-medium mb-1">
              Admin Token
            </label>
            <input
              id="token"
              type="password"
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              placeholder="Enter token"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              autoComplete="current-password"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" className="w-full btn-primary">
            Sign In
          </button>
        </form>
        <p className="text-slate-600 text-xs text-center mt-4">
          This is a UI gate only — not real authentication.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick action card
// ---------------------------------------------------------------------------
function ActionCard({ title, cmd, desc }: { title: string; cmd: string; desc: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="text-white text-sm font-semibold mb-1">{title}</div>
      <div className="text-slate-500 text-xs mb-3">{desc}</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-slate-900 text-emerald-400 text-xs px-3 py-2 rounded-lg font-mono truncate">
          {cmd}
        </code>
        <button
          onClick={copy}
          className="text-slate-400 hover:text-white transition-colors p-1"
          title="Copy command"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [version, setVersion] = useState<DatasetVersion | null>(null)
  const [facets, setFacets] = useState<Facets | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const [vRes, fRes] = await Promise.all([
        fetch(`${API_BASE}/v1/dataset-version`),
        fetch(`${API_BASE}/v1/facets`),
      ])
      if (vRes.ok) {
        const v = await vRes.json()
        setVersion(v)
      }
      if (fRes.ok) {
        const f = await fRes.json()
        setFacets(f)
      }
      if (!vRes.ok && !fRes.ok) {
        setApiError('Could not reach the API server. Make sure it is running on http://localhost:8080.')
      }
    } catch (_) {
      setApiError('Could not reach the API server. Make sure it is running on http://localhost:8080.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const categories = facets?.categories ?? []
  const maxCatCount = categories.length > 0 ? Math.max(...categories.map(c => c.count)) : 1

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-indigo-400 font-bold text-lg">OEI Admin</span>
            <span className="text-slate-500 text-sm ml-3">Dataset Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* API error banner */}
        {apiError && (
          <div className="mb-6 bg-yellow-950 border border-yellow-800 text-yellow-300 rounded-xl px-4 py-3 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <strong>API Unavailable:</strong> {apiError}
              <br />
              <span className="text-yellow-500">Start the API with: <code className="font-mono">docker compose up</code> or <code className="font-mono">cd api/server && mvn package && java -jar target/oei-api-1.0.0.jar</code></span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-500">Loading dataset statistics...</div>
          </div>
        ) : (
          <>
            {/* Dataset Health */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Dataset Health</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total Exercises"
                  value={version?.exercise_count ?? 866}
                  sub={`Version ${version?.version ?? '1.0.0'}`}
                />
                <StatCard
                  label="Muscle Groups"
                  value={version?.muscle_count ?? '75+'}
                  sub="Tracked muscles"
                />
                <StatCard
                  label="Equipment Items"
                  value={version?.equipment_count ?? '50+'}
                  sub="In equipment registry"
                />
                <StatCard
                  label="Categories"
                  value={categories.length > 0 ? categories.length : 15}
                  sub="Exercise categories"
                />
              </div>

              {/* Category bar chart */}
              {categories.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Exercises by Category</h3>
                  <div className="space-y-2">
                    {[...categories].sort((a, b) => b.count - a.count).map(({ value, count }) => (
                      <div key={value} className="flex items-center gap-3">
                        <div className="w-28 text-slate-400 text-xs text-right flex-shrink-0">{value}</div>
                        <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${(count / maxCatCount) * 100}%` }}
                          />
                        </div>
                        <div className="w-10 text-slate-300 text-xs">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {categories.length === 0 && !apiError && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-slate-500 text-sm text-center">
                  Category breakdown not available — API may be offline.
                </div>
              )}
            </section>

            {/* Media Registry */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Media Registry</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Assets" value="0" sub="In registry" />
                <StatCard label="Illustrations" value="0" sub="SVG / PNG" />
                <StatCard label="Videos" value="0" sub="MP4 / WebM" />
                <StatCard label="Pending Review" value="0" sub="Awaiting approval" />
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <p className="text-slate-500 text-sm mb-4">Copy and run these commands from the repository root:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <ActionCard
                  title="Validate Dataset"
                  cmd="node scripts/validate.js"
                  desc="Run full JSON schema validation on all exercises"
                />
                <ActionCard
                  title="Dataset Statistics"
                  cmd="node scripts/admin/stats.js"
                  desc="Print comprehensive dataset statistics to the terminal"
                />
                <ActionCard
                  title="Export Release"
                  cmd="node scripts/admin/export-release.js --version 1.0.1"
                  desc="Regenerate oei-dataset.json and oei-index.json"
                />
                <ActionCard
                  title="Review Submission"
                  cmd="node scripts/admin/review-submission.js community/submissions/<file>.json"
                  desc="Validate and review a community submission"
                />
                <ActionCard
                  title="Approve Submission"
                  cmd="node scripts/admin/review-submission.js community/submissions/<file>.json --approve"
                  desc="Approve and copy submission into the exercises directory"
                />
                <ActionCard
                  title="Validate Media"
                  cmd="node scripts/validate-media.js"
                  desc="Validate the media asset registry for schema compliance"
                />
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <span>OEI Admin Dashboard · Internal Tool</span>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/community" className="hover:text-white transition-colors">Community</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  function readToken(): string {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? ''
    } catch (_) {
      return ''
    }
  }

  const [token, setToken] = useState<string>(readToken)

  function handleLogin(t: string) {
    setToken(t)
  }

  function handleLogout() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (_) {}
    setToken('')
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}
