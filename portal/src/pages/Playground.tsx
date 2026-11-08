import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const BASE_URL = 'http://localhost:8080'

type Endpoint = {
  label: string
  method: string
  path: string
  params: { name: string; label: string; type: 'text' | 'select'; options?: string[] }[]
}

const endpoints: Endpoint[] = [
  {
    label: 'List / Search Exercises',
    method: 'GET',
    path: '/v1/exercises',
    params: [
      { name: 'q', label: 'Search (q)', type: 'text' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: ['', 'strength', 'cardio', 'flexibility', 'mobility', 'plyometric', 'power', 'rehabilitation', 'functional', 'stretching'],
      },
      {
        name: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        options: ['', 'beginner', 'intermediate', 'advanced', 'expert'],
      },
      {
        name: 'exercise_type',
        label: 'Exercise Type',
        type: 'select',
        options: ['', 'compound', 'isolation', 'calisthenics', 'cardio', 'plyometric', 'strength', 'stretching'],
      },
      {
        name: 'movement_pattern',
        label: 'Movement Pattern',
        type: 'select',
        options: ['', 'push', 'pull', 'hinge', 'hip-hinge', 'squat', 'lunge', 'carry', 'rotation', 'anti-rotation', 'gait', 'overhead', 'bridge', 'plank', 'plyometric', 'balance'],
      },
      { name: 'page', label: 'Page', type: 'text' },
      { name: 'per_page', label: 'Per Page', type: 'text' },
    ],
  },
  {
    label: 'Get Exercise by ID or Slug',
    method: 'GET',
    path: '/v1/exercises/{id}',
    params: [{ name: 'id', label: 'ID or Slug', type: 'text' }],
  },
  {
    label: 'Related Exercises',
    method: 'GET',
    path: '/v1/exercises/{id}/related',
    params: [{ name: 'id', label: 'ID or Slug', type: 'text' }],
  },
  {
    label: 'Facets (filter counts)',
    method: 'GET',
    path: '/v1/facets',
    params: [],
  },
  {
    label: 'Muscles',
    method: 'GET',
    path: '/v1/muscles',
    params: [],
  },
  {
    label: 'Equipment',
    method: 'GET',
    path: '/v1/equipment',
    params: [],
  },
  {
    label: 'Dataset Version',
    method: 'GET',
    path: '/v1/dataset-version',
    params: [],
  },
]

function buildUrl(endpoint: Endpoint, values: Record<string, string>): string {
  let path = endpoint.path

  // Replace path params
  const pathParams = new Set<string>()
  path = path.replace(/\{(\w+)\}/g, (_, key) => {
    pathParams.add(key)
    return values[key] || `{${key}}`
  })

  // Build query params
  const qp: string[] = []
  for (const param of endpoint.params) {
    if (!pathParams.has(param.name) && values[param.name]) {
      qp.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(values[param.name])}`)
    }
  }

  return `${BASE_URL}${path}${qp.length ? '?' + qp.join('&') : ''}`
}

export default function Playground() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)

  const endpoint = endpoints[selectedIndex]
  const url = buildUrl(endpoint, values)

  const handleEndpointChange = (index: number) => {
    setSelectedIndex(index)
    setValues({})
    setResponse(null)
    setStatus(null)
    setError(null)
    setElapsed(null)
  }

  const handleSend = async () => {
    setLoading(true)
    setResponse(null)
    setError(null)
    setStatus(null)
    setElapsed(null)

    const start = performance.now()
    try {
      const res = await fetch(url)
      const ms = Math.round(performance.now() - start)
      setElapsed(ms)
      setStatus(res.status)
      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setResponse(JSON.stringify(json, null, 2))
      } catch {
        setResponse(text)
      }
    } catch (err) {
      setElapsed(Math.round(performance.now() - start))
      setError(err instanceof Error ? err.message : 'Request failed. Is the API server running on localhost:8080?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API Playground</h1>
        <p className="text-slate-400">
          Test API endpoints interactively. Requires the Spring Boot API running at <code className="text-indigo-300">localhost:8080</code>.
          Start it with <code className="text-indigo-300">docker compose up</code>.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Endpoint</label>
            <select
              value={selectedIndex}
              onChange={(e) => handleEndpointChange(Number(e.target.value))}
              className="select-field"
            >
              {endpoints.map((ep, i) => (
                <option key={i} value={i}>{ep.label}</option>
              ))}
            </select>
          </div>

          {endpoint.params.map((param) => (
            <div key={param.name}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{param.label}</label>
              {param.type === 'select' ? (
                <select
                  value={values[param.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [param.name]: e.target.value }))}
                  className="select-field"
                >
                  {param.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt === '' ? '— any —' : opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[param.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [param.name]: e.target.value }))}
                  className="input-field"
                  placeholder={`Enter ${param.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSend}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </button>
        </div>

        {/* Right: request + response */}
        <div className="lg:col-span-3 space-y-4">
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Request URL</div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm text-slate-200 break-all">
              <span className="text-green-400">{endpoint.method}</span>{' '}
              <span className="text-slate-200">{url}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-slate-400">Response</div>
              <div className="flex items-center gap-3 text-xs">
                {status !== null && (
                  <span className={status >= 200 && status < 300 ? 'text-green-400' : 'text-red-400'}>
                    {status}
                  </span>
                )}
                {elapsed !== null && <span className="text-slate-500">{elapsed}ms</span>}
              </div>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                <p className="text-red-300 text-sm font-medium mb-1">Request failed</p>
                <p className="text-red-400 text-sm">{error}</p>
                <p className="text-red-500 text-xs mt-2">Make sure <code>docker compose up</code> is running and the API is accessible at localhost:8080.</p>
              </div>
            )}

            {response !== null && !error && (
              <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
                <pre className="p-4 overflow-auto text-sm text-slate-200 font-mono leading-relaxed max-h-[480px]">
                  {response}
                </pre>
              </div>
            )}

            {response === null && !error && !loading && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-500 text-sm">Configure the request and click Send to see the response.</p>
              </div>
            )}
          </div>

          {response !== null && (
            <div>
              <div className="text-xs font-medium text-slate-400 mb-1">cURL Command</div>
              <CodeBlock code={`curl "${url}"`} language="bash" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
