import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDataset } from '../hooks/useExercises'

const TOKEN_KEY = 'oei_admin_token'
const API_BASE = 'http://localhost:8080'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DatasetVersion {
  version: string
  generated_at: string
  exercise_count: number
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
  exercise_types?: FacetItem[]
}

type ReviewStatus = 'UNREVIEWED' | 'IN_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED'

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) { setError('Enter any value to continue.'); return }
    try { localStorage.setItem(TOKEN_KEY, value.trim()) } catch (_) {}
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
            <label htmlFor="token" className="block text-slate-300 text-sm font-medium mb-1">Admin Token</label>
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
          <button type="submit" className="w-full btn-primary">Sign In</button>
        </form>
        <p className="text-slate-600 text-xs text-center mt-4">UI gate only — not real authentication.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-3xl font-bold ${accent ?? 'text-white'}`}>{value}</div>
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
    navigator.clipboard.writeText(cmd).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="text-white text-sm font-semibold mb-1">{title}</div>
      <div className="text-slate-500 text-xs mb-3">{desc}</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-slate-900 text-emerald-400 text-xs px-3 py-2 rounded-lg font-mono truncate">{cmd}</code>
        <button onClick={copy} className="text-slate-400 hover:text-white transition-colors p-1" title="Copy">
          {copied
            ? <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          }
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review status badge
// ---------------------------------------------------------------------------
const statusStyles: Record<ReviewStatus, string> = {
  APPROVED: 'bg-emerald-900 text-emerald-300',
  UNREVIEWED: 'bg-slate-700 text-slate-400',
  IN_REVIEW: 'bg-blue-900 text-blue-300',
  NEEDS_REVISION: 'bg-amber-900 text-amber-300',
  REJECTED: 'bg-red-900 text-red-300',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[status as ReviewStatus] ?? 'bg-slate-700 text-slate-400'}`}>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Exercise Review Panel
// ---------------------------------------------------------------------------
type ExerciseForReview = {
  exercise_id: string
  slug: string
  name: string
  category: string
  exercise_type: string
  difficulty_level: string
  movement_pattern: string
  description: string
  metadata?: Record<string, unknown>
}

function ExerciseReviewPanel() {
  const { data, isLoading, error } = useDataset()
  const [filterStatus, setFilterStatus] = useState<string>('UNREVIEWED')
  const [searchQ, setSearchQ] = useState('')
  const [selected, setSelected] = useState<ExerciseForReview | null>(null)
  const [approveNote, setApproveNote] = useState('')
  const [approver, setApprover] = useState(() => { try { return localStorage.getItem('oei_approver') ?? '' } catch { return '' } })
  const [actionResult, setActionResult] = useState<{ slug: string; status: ReviewStatus; ts: string } | null>(null)

  const exercises = (data?.exercises ?? []) as ExerciseForReview[]

  const filtered = exercises.filter(e => {
    const status = (e.metadata?.review_status as string) ?? 'UNREVIEWED'
    if (filterStatus && status !== filterStatus) return false
    if (searchQ) {
      const q = searchQ.toLowerCase()
      return e.name.toLowerCase().includes(q) || e.slug.includes(q) || e.category.includes(q)
    }
    return true
  })

  const statusCounts = exercises.reduce<Record<string, number>>((acc, e) => {
    const s = (e.metadata?.review_status as string) ?? 'UNREVIEWED'
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {})

  function saveApprover(v: string) {
    setApprover(v)
    try { localStorage.setItem('oei_approver', v) } catch (_) {}
  }

  function buildPatch(status: ReviewStatus): object {
    const now = new Date().toISOString()
    const base = { review_status: status, updated_at: now }
    if (status === 'APPROVED') {
      return { ...base, approved_at: now, approved_by: approver || 'admin' }
    }
    if (status === 'NEEDS_REVISION') {
      return { ...base, review_notes: approveNote || 'Needs revision' }
    }
    return base
  }

  function copyPatchCommand(status: ReviewStatus) {
    if (!selected) return
    const patch = buildPatch(status)
    const patchStr = JSON.stringify(patch, null, 2)

    // Build a node one-liner that merges the patch into the exercise's metadata
    const cmd = `node -e "
const fs=require('fs');
const files=[];
function walk(d){fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{if(e.isDirectory())walk(d+'/'+e.name);else if(e.name.endsWith('.json'))files.push(d+'/'+e.name)});}
walk('data/exercises');
const f=files.find(p=>p.includes('${selected.slug}'));
if(!f){console.error('Not found: ${selected.slug}');process.exit(1);}
const d=JSON.parse(fs.readFileSync(f,'utf8'));
d.metadata=Object.assign(d.metadata||{},${JSON.stringify(patch)});
fs.writeFileSync(f,JSON.stringify(d,null,2)+'\\n');
console.log('Updated ${selected.slug} -> ${status}');
"`
    navigator.clipboard.writeText(cmd.trim()).then(() => {
      setActionResult({ slug: selected.slug, status, ts: new Date().toLocaleTimeString() })
    })
  }

  if (isLoading) return <div className="py-10 text-center text-slate-500">Loading exercises from dataset...</div>
  if (error) return (
    <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
      Failed to load dataset: {error.message}
      <br /><span className="text-red-400">Make sure <code className="font-mono">data/generated/oei-dataset-all.json</code> exists. Run: <code className="font-mono">node scripts/generation/build-dataset.js</code></span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {(['UNREVIEWED', 'IN_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED'] as ReviewStatus[]).map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setSelected(null) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? statusStyles[s] + ' ring-2 ring-offset-2 ring-offset-slate-900 ring-current' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            {s} <span className="ml-1 opacity-70">({statusCounts[s] ?? 0})</span>
          </button>
        ))}
        <button
          onClick={() => { setFilterStatus(''); setSelected(null) }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === '' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
        >
          All ({exercises.length})
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Exercise list */}
        <div className="space-y-3">
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by name or category..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <div className="text-slate-500 text-xs">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''}</div>
          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {filtered.slice(0, 200).map(e => (
              <button
                key={e.exercise_id}
                onClick={() => { setSelected(e); setApproveNote('') }}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${selected?.slug === e.slug ? 'bg-indigo-900/60 border border-indigo-700' : 'bg-slate-800 border border-slate-700 hover:border-slate-600'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-white text-sm font-medium leading-tight">{e.name}</span>
                  <StatusBadge status={(e.metadata?.review_status as string) ?? 'UNREVIEWED'} />
                </div>
                <div className="text-slate-500 text-xs mt-0.5">{e.category} · {e.difficulty_level}</div>
              </button>
            ))}
            {filtered.length > 200 && (
              <div className="text-slate-500 text-xs text-center py-2">Showing first 200. Use search to narrow down.</div>
            )}
            {filtered.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-6">No exercises match</div>
            )}
          </div>
        </div>

        {/* Review panel */}
        <div>
          {!selected ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-500 h-full flex items-center justify-center flex-col gap-2">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <span className="text-sm">Select an exercise to review</span>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
              <div>
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-white font-semibold flex-1">{selected.name}</h3>
                  <StatusBadge status={(selected.metadata?.review_status as string) ?? 'UNREVIEWED'} />
                </div>
                <div className="text-slate-500 text-xs font-mono">{selected.slug}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 rounded px-2 py-1.5">
                  <span className="text-slate-500">Category</span>
                  <div className="text-slate-200 mt-0.5">{selected.category}</div>
                </div>
                <div className="bg-slate-700/50 rounded px-2 py-1.5">
                  <span className="text-slate-500">Type</span>
                  <div className="text-slate-200 mt-0.5">{selected.exercise_type}</div>
                </div>
                <div className="bg-slate-700/50 rounded px-2 py-1.5">
                  <span className="text-slate-500">Difficulty</span>
                  <div className="text-slate-200 mt-0.5">{selected.difficulty_level}</div>
                </div>
                <div className="bg-slate-700/50 rounded px-2 py-1.5">
                  <span className="text-slate-500">Movement</span>
                  <div className="text-slate-200 mt-0.5">{selected.movement_pattern}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-500 text-xs mb-1">Description</div>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">{selected.description}</p>
              </div>

              <Link
                to={`/exercise/${selected.slug}`}
                target="_blank"
                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
              >
                View full detail →
              </Link>

              {/* Approver field */}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Your GitHub username (approver)</label>
                <input
                  value={approver}
                  onChange={e => saveApprover(e.target.value)}
                  placeholder="e.g. CHAITANYA2605"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Notes field (shown for NEEDS_REVISION) */}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Review note (required for Needs Revision)</label>
                <textarea
                  value={approveNote}
                  onChange={e => setApproveNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Fix movement_pattern — should be hinge not squat"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              {/* How it works — numbered steps */}
              <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg px-3 py-3 text-xs space-y-1.5">
                <div className="text-indigo-300 font-medium mb-2">How to approve</div>
                <div className="flex gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-indigo-800 text-indigo-200 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  Click an action button below → <strong className="text-slate-300">command copied to clipboard</strong>
                </div>
                <div className="flex gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-indigo-800 text-indigo-200 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  Paste in terminal at project root → updates the JSON file
                </div>
                <div className="flex gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-indigo-800 text-indigo-200 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  Rebuild: <code className="font-mono text-emerald-400 ml-1">node scripts/generation/build-dataset.js</code>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyPatchCommand('APPROVED')}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => copyPatchCommand('IN_REVIEW')}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 text-blue-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  Mark In Review
                </button>
                <button
                  onClick={() => copyPatchCommand('NEEDS_REVISION')}
                  className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  Needs Revision
                </button>
                <button
                  onClick={() => copyPatchCommand('REJECTED')}
                  className="flex-1 bg-red-900 hover:bg-red-800 text-red-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>

              {actionResult && actionResult.slug === selected.slug && (
                <div className="bg-emerald-950 border border-emerald-800 rounded-lg px-3 py-2 text-xs text-emerald-300">
                  Command copied! Paste in terminal to mark <strong>{actionResult.slug}</strong> as <strong>{actionResult.status}</strong>. ({actionResult.ts})
                </div>
              )}
            </div>
          )}
        </div>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'actions'>('overview')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const [vRes, fRes] = await Promise.all([
        fetch(`${API_BASE}/v1/dataset/versions`),
        fetch(`${API_BASE}/v1/facets`),
      ])
      if (vRes.ok) setVersion(await vRes.json())
      if (fRes.ok) setFacets(await fRes.json())
      if (!vRes.ok && !fRes.ok) setApiError('API not reachable at http://localhost:8080')
    } catch (_) {
      setApiError('API not reachable at http://localhost:8080')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const categories = facets?.categories ?? []
  const maxCatCount = categories.length > 0 ? Math.max(...categories.map(c => c.count)) : 1

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'review', label: 'Review Exercises' },
    { id: 'actions', label: 'Quick Actions' },
  ] as const

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
            <button onClick={fetchData} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1" title="Refresh">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors text-sm">Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex gap-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API banner */}
        {apiError && (
          <div className="mb-6 bg-yellow-950 border border-yellow-800 text-yellow-300 rounded-xl px-4 py-3 text-sm">
            <strong>API Offline:</strong> {apiError} — <code className="font-mono text-yellow-400">docker compose up</code>
          </div>
        )}

        {/* Overview tab */}
        {activeTab === 'overview' && (
          loading ? (
            <div className="text-center py-16 text-slate-500">Loading...</div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Dataset Health</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Total Exercises" value={version?.exercise_count ?? 866} sub={`v${version?.version ?? '—'}`} />
                  <StatCard label="Schema Version" value={version?.schema_version ?? '1.1.0'} sub="JSON Schema draft-07" />
                  <StatCard label="Categories" value={categories.length > 0 ? categories.length : '—'} sub="Exercise categories" />
                  <StatCard label="Generated" value={version?.generated_at ? new Date(version.generated_at).toLocaleDateString() : '—'} sub="Dataset build date" />
                </div>

                {categories.length > 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Exercises by Category</h3>
                    <div className="space-y-2">
                      {[...categories].sort((a, b) => b.count - a.count).map(({ value, count }) => (
                        <div key={value} className="flex items-center gap-3">
                          <div className="w-28 text-slate-400 text-xs text-right flex-shrink-0">{value}</div>
                          <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${(count / maxCatCount) * 100}%` }} />
                          </div>
                          <div className="w-10 text-slate-300 text-xs">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )
        )}

        {/* Review tab */}
        {activeTab === 'review' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Review Exercises</h2>

              {/* Workflow steps banner */}
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {[
                  { step: '1', title: 'Pick an exercise', desc: 'Filter by status (e.g. UNREVIEWED), then click any row on the left.' },
                  { step: '2', title: 'Choose an action', desc: 'Click Approve, Needs Revision, etc. — the terminal command is copied instantly.' },
                  { step: '3', title: 'Paste in terminal', desc: 'Run the command at the project root, then rebuild the dataset to apply.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</span>
                    <div>
                      <div className="text-white text-sm font-medium">{title}</div>
                      <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ExerciseReviewPanel />
          </div>
        )}

        {/* Actions tab */}
        {activeTab === 'actions' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Quick Actions</h2>
            <p className="text-slate-500 text-sm mb-6">Copy and run these from the repository root.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <ActionCard title="Build Dataset" cmd="node scripts/generation/build-dataset.js" desc="Generate data/generated/ files from all exercises" />
              <ActionCard title="Validate Dataset" cmd="node scripts/validate.js" desc="Run full JSON schema validation on all exercises" />
              <ActionCard title="Run All Tests" cmd="node tests/search.test.js && node tests/contract/dataset-format.test.js" desc="Search + contract tests" />
              <ActionCard title="Release Check" cmd="node scripts/release-check.js" desc="Dry-run release gate — checks for P0 errors" />
              <ActionCard title="Analytics Report" cmd="node scripts/analytics/dataset-report.js" desc="Print category, difficulty and review status breakdown" />
              <ActionCard title="Start API (Docker)" cmd="docker compose up --build" desc="Build and start the Spring Boot REST API on :8080" />
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 py-6 px-4 mt-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-slate-500 text-sm">
          <span>OEI Admin</span>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  function readToken() { try { return localStorage.getItem(TOKEN_KEY) ?? '' } catch { return '' } }
  const [token, setToken] = useState<string>(readToken)

  function handleLogout() {
    try { localStorage.removeItem(TOKEN_KEY) } catch (_) {}
    setToken('')
  }

  if (!token) return <LoginForm onLogin={setToken} />
  return <Dashboard onLogout={handleLogout} />
}
