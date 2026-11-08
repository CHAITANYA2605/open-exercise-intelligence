import CodeBlock from '../components/CodeBlock'

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-slate-700">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Endpoint({
  method,
  path,
  description,
  params,
  example,
  response,
}: {
  method: string
  path: string
  description: string
  params?: { name: string; type: string; description: string; required?: boolean }[]
  example: string
  response: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-900 text-green-300',
    POST: 'bg-blue-900 text-blue-300',
    PUT: 'bg-yellow-900 text-yellow-300',
    DELETE: 'bg-red-900 text-red-300',
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <span className={`badge font-mono font-bold ${methodColors[method] ?? 'bg-slate-700 text-slate-300'}`}>{method}</span>
          <code className="text-slate-200 font-mono text-sm">{path}</code>
        </div>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>

      {params && params.length > 0 && (
        <div className="p-4 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Parameters</h4>
          <div className="space-y-2">
            {params.map((p) => (
              <div key={p.name} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-[180px]">
                  <code className="text-indigo-300 font-mono">{p.name}</code>
                  {p.required && <span className="text-red-400 text-xs">required</span>}
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-slate-500 font-mono text-xs mt-0.5 w-16">{p.type}</span>
                  <span className="text-slate-400">{p.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-b border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Example Request</h4>
        <CodeBlock code={example} language="bash" />
      </div>

      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Example Response</h4>
        <CodeBlock code={response} language="json" />
      </div>
    </div>
  )
}

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'base-url', label: 'Base URL' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'list-exercises', label: '  GET /exercises' },
  { id: 'get-exercise', label: '  GET /exercises/{id}' },
  { id: 'related', label: '  GET /exercises/{id}/related' },
  { id: 'facets', label: '  GET /facets' },
  { id: 'muscles', label: '  GET /muscles' },
  { id: 'equipment', label: '  GET /equipment' },
  { id: 'dataset-version', label: '  GET /dataset-version' },
  { id: 'sdks', label: 'SDKs' },
  { id: 'errors', label: 'Error Handling' },
]

export default function Docs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        {/* TOC sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">On this page</h3>
            <nav className="space-y-1">
              {toc.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-slate-400 hover:text-white transition-colors py-0.5"
                  style={{ paddingLeft: label.startsWith('  ') ? '12px' : '0' }}
                >
                  {label.trim()}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">API Reference</h1>
            <p className="text-slate-400 text-lg">Complete documentation for the Open Exercise Intelligence REST API.</p>
          </div>

          <Section id="overview" title="Overview">
            <p className="text-slate-300">
              The OEI API is a RESTful HTTP API that provides access to 866+ exercises with full metadata including muscle mappings, equipment requirements, execution instructions, and training parameters.
            </p>
            <p className="text-slate-300">
              All responses are JSON. The API uses standard HTTP response codes. No authentication is required — the API is fully open and free to use.
            </p>
          </Section>

          <Section id="authentication" title="Authentication">
            <div className="bg-green-950 border border-green-800 rounded-lg p-4">
              <p className="text-green-300 font-medium">No authentication required</p>
              <p className="text-green-400 text-sm mt-1">The OEI API is completely open. No API key, no account, no rate limits.</p>
            </div>
          </Section>

          <Section id="base-url" title="Base URL">
            <CodeBlock code="http://localhost:8080/v1" language="text" title="Local Development" />
            <p className="text-slate-400 text-sm">
              All endpoints are prefixed with <code className="text-indigo-300">/v1</code>. Run the API locally with Docker:
            </p>
            <CodeBlock code="docker compose up -d" language="bash" />
          </Section>

          <Section id="endpoints" title="Endpoints">
            <div id="list-exercises">
              <Endpoint
                method="GET"
                path="/v1/exercises"
                description="List or search exercises with optional filters. All filter parameters are combined with AND logic. Supports full-text search across exercise names, descriptions, muscles, and tags."
                params={[
                  { name: 'q', type: 'string', description: 'Full-text search query (AND semantics across name, description, muscles, tags)' },
                  { name: 'category', type: 'string', description: 'Filter by category: strength, cardio, flexibility, mobility, plyometric, power, rehabilitation, functional, stretching' },
                  { name: 'difficulty', type: 'string', description: 'Filter by difficulty: beginner, intermediate, advanced, expert' },
                  { name: 'muscle', type: 'string', description: 'Filter by muscle slug (any role — primary, secondary, or stabilizer)' },
                  { name: 'equipment', type: 'string', description: 'Filter by equipment ID' },
                  { name: 'movement_pattern', type: 'string', description: 'Filter by movement pattern: push, pull, hinge, squat, lunge, carry, rotation, etc.' },
                  { name: 'exercise_type', type: 'string', description: 'Filter by exercise type: compound, isolation, calisthenics, cardio, plyometric, strength, stretching' },
                  { name: 'page', type: 'integer', description: 'Page number, 1-indexed (default: 1)' },
                  { name: 'per_page', type: 'integer', description: 'Results per page, max 100 (default: 20)' },
                ]}
                example={`curl "http://localhost:8080/v1/exercises?category=strength&difficulty=beginner&per_page=5"

# Full-text search
curl "http://localhost:8080/v1/exercises?q=bench+press"

# Multiple filters
curl "http://localhost:8080/v1/exercises?category=strength&movement_pattern=push&page=2"`}
                response={`{
  "data": [
    {
      "exercise_id": "ex-bench-press-...",
      "slug": "barbell-bench-press",
      "name": "Barbell Bench Press",
      "category": "strength",
      "difficulty_level": "intermediate",
      "movement_pattern": "push",
      "exercise_type": "compound",
      "muscles": {
        "primary": [{"muscle_id": "...", "muscle_slug": "pectoralis-major"}],
        "secondary": [{"muscle_id": "...", "muscle_slug": "anterior-deltoid"}],
        "stabilizers": []
      },
      "description": "..."
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 5,
    "total_pages": 29
  }
}`}
              />
            </div>

            <div id="get-exercise">
              <Endpoint
                method="GET"
                path="/v1/exercises/{idOrSlug}"
                description="Get a single exercise by its UUID or slug. Returns full exercise details including execution instructions and training parameters."
                params={[
                  { name: 'idOrSlug', type: 'string', description: 'Exercise UUID (exercise_id) or URL slug', required: true },
                ]}
                example={`# By slug
curl "http://localhost:8080/v1/exercises/barbell-bench-press"

# By UUID
curl "http://localhost:8080/v1/exercises/ex-bench-press-4000-a000-123456789012"`}
                response={`{
  "exercise_id": "ex-bench-press-...",
  "slug": "barbell-bench-press",
  "name": "Barbell Bench Press",
  "category": "strength",
  "difficulty_level": "intermediate",
  "execution": {
    "steps": ["Step 1: ...", "Step 2: ..."],
    "coaching_cues": ["Keep your back flat", "Drive through your feet"],
    "common_mistakes": ["Flared elbows", "Bouncing the bar"],
    "breathing_instructions": "Inhale on descent, exhale on press"
  },
  "training_parameters": {
    "recommended_rep_ranges": [
      {"goal": "strength", "min_reps": 3, "max_reps": 6}
    ]
  }
}`}
              />
            </div>

            <div id="related">
              <Endpoint
                method="GET"
                path="/v1/exercises/{idOrSlug}/related"
                description="Get exercises related to the specified exercise, ranked by muscle overlap. Returns up to 10 related exercises."
                params={[
                  { name: 'idOrSlug', type: 'string', description: 'Exercise UUID or slug', required: true },
                ]}
                example={`curl "http://localhost:8080/v1/exercises/barbell-bench-press/related"`}
                response={`{
  "data": [
    {
      "exercise_id": "...",
      "slug": "dumbbell-bench-press",
      "name": "Dumbbell Bench Press",
      ...
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}`}
              />
            </div>

            <div id="facets">
              <Endpoint
                method="GET"
                path="/v1/facets"
                description="Returns aggregated counts for all filterable fields. Useful for building filter UIs."
                params={[]}
                example={`curl "http://localhost:8080/v1/facets"`}
                response={`{
  "categories": {"strength": 320, "cardio": 85, "flexibility": 72, ...},
  "difficulties": {"beginner": 210, "intermediate": 380, "advanced": 220, "expert": 56},
  "exercise_types": {"compound": 290, "isolation": 310, ...},
  "movement_patterns": {"push": 140, "pull": 130, "squat": 90, ...}
}`}
              />
            </div>

            <div id="muscles">
              <Endpoint
                method="GET"
                path="/v1/muscles"
                description="Returns the full muscle taxonomy including muscle groups and individual muscles."
                params={[]}
                example={`curl "http://localhost:8080/v1/muscles"`}
                response={`[
  {
    "muscle_id": "11111111-0001-4000-a000-000000000001",
    "slug": "chest",
    "common_name": "Chest",
    "anatomical_name": "Pectoral Muscles",
    "anatomical_region": "upper_body",
    "entry_type": "group"
  }
]`}
              />
            </div>

            <div id="equipment">
              <Endpoint
                method="GET"
                path="/v1/equipment"
                description="Returns the full equipment list."
                params={[]}
                example={`curl "http://localhost:8080/v1/equipment"`}
                response={`[
  {
    "equipment_id": "eq000001-0000-4000-a000-000000000001",
    "slug": "bodyweight",
    "name": "No Equipment (Bodyweight)",
    "category": "bodyweight",
    "cost_tier": "free",
    "portability": "portable"
  }
]`}
              />
            </div>

            <div id="dataset-version">
              <Endpoint
                method="GET"
                path="/v1/dataset-version"
                description="Returns dataset version and metadata."
                params={[]}
                example={`curl "http://localhost:8080/v1/dataset-version"`}
                response={`{
  "version": "1.0.0",
  "generated_at": "2026-11-08T00:00:00Z",
  "exercise_count": 866
}`}
              />
            </div>
          </Section>

          <Section id="sdks" title="SDKs">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  lang: 'JavaScript / TypeScript',
                  color: 'text-yellow-400',
                  install: 'npm install oei-js',
                  note: 'Works in Node.js and browsers. TypeScript definitions included.',
                },
                {
                  lang: 'Python',
                  color: 'text-blue-400',
                  install: 'pip install oei',
                  note: 'Requires Python 3.8+. Full type hints included.',
                },
                {
                  lang: 'Java (Maven)',
                  color: 'text-red-400',
                  install: '<groupId>io.oei</groupId>\n<artifactId>oei-sdk</artifactId>\n<version>1.0.0</version>',
                  note: 'Requires Java 11+. No external dependencies.',
                },
              ].map(({ lang, color, install, note }) => (
                <div key={lang} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h3 className={`font-semibold mb-2 ${color}`}>{lang}</h3>
                  <CodeBlock code={install} language="bash" />
                  <p className="text-slate-400 text-xs mt-2">{note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="media" title="Media Endpoints">
            <p className="text-slate-300 mb-4">
              The media API exposes exercise illustrations, anatomical diagrams, and other visual
              assets stored in the OEI media registry. Only assets with status{' '}
              <code className="text-indigo-300 font-mono text-xs">approved</code> are returned.
            </p>
            <div className="space-y-6">
              {[
                {
                  method: 'GET',
                  path: '/v1/media',
                  desc: 'Paginated list of all approved media assets.',
                  params: [
                    { name: 'page', type: 'integer', default: '1', desc: 'Page number (1-based)' },
                    { name: 'per_page', type: 'integer', default: '20', desc: 'Items per page (max 100)' },
                  ],
                  example: `{
  "data": [],
  "total": 0,
  "page": 1,
  "per_page": 20,
  "total_pages": 0
}`,
                },
                {
                  method: 'GET',
                  path: '/v1/media/stats',
                  desc: 'Aggregate counts of media assets by type, license, and status.',
                  params: [],
                  example: `{
  "total_assets": 0,
  "approved_assets": 0,
  "by_type": {},
  "by_license": {},
  "by_status": {}
}`,
                },
                {
                  method: 'GET',
                  path: '/v1/media/{assetId}',
                  desc: 'Retrieve a single media asset by its UUID. Returns 404 if the asset does not exist.',
                  params: [
                    { name: 'assetId', type: 'string', default: null, desc: 'UUID v4 of the asset' },
                  ],
                  example: null,
                },
                {
                  method: 'GET',
                  path: '/v1/exercises/{idOrSlug}/media',
                  desc: 'All approved media assets for a specific exercise. Returns an empty array (not 404) when the exercise has no media.',
                  params: [
                    { name: 'idOrSlug', type: 'string', default: null, desc: 'Exercise ID or slug' },
                  ],
                  example: `[
  {
    "asset_id": "550e8400-e29b-41d4-a716-446655440000",
    "exercise_slug": "barbell-back-squat",
    "asset_type": "anatomical_illustration",
    "filename": "barbell-back-squat-muscles.svg",
    "url": "https://example.com/image.svg",
    "mime_type": "image/svg+xml",
    "license": {
      "spdx": "CC0-1.0",
      "allows_commercial_use": true,
      "requires_attribution": false
    },
    "status": "approved"
  }
]`,
                },
              ].map(({ method, path, desc, params, example }) => (
                <div key={path} className="border border-slate-700 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-800">
                    <span className="text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded">{method}</span>
                    <code className="text-indigo-300 font-mono text-sm">{path}</code>
                  </div>
                  <div className="px-4 py-3 bg-slate-800/40">
                    <p className="text-slate-300 text-sm mb-3">{desc}</p>
                    {params.length > 0 && (
                      <div className="mb-3">
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Parameters</p>
                        <div className="space-y-1">
                          {params.map((p) => (
                            <div key={p.name} className="flex flex-wrap gap-2 text-xs">
                              <code className="text-indigo-300 font-mono">{p.name}</code>
                              <span className="text-slate-500">{p.type}</span>
                              {p.default && <span className="text-slate-500">default: {p.default}</span>}
                              <span className="text-slate-400">— {p.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {example && <CodeBlock code={example} language="json" title="Example Response" />}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="errors" title="Error Handling">
            <p className="text-slate-300">The API uses standard HTTP status codes.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium py-2 pr-6">Status Code</th>
                    <th className="text-left text-slate-400 font-medium py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['200', 'Success'],
                    ['400', 'Bad request — invalid query parameters'],
                    ['404', 'Exercise not found'],
                    ['500', 'Internal server error'],
                  ].map(([code, desc]) => (
                    <tr key={code} className="border-b border-slate-800">
                      <td className="py-2 pr-6 font-mono text-indigo-300">{code}</td>
                      <td className="py-2 text-slate-300">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CodeBlock
              code={`{
  "error": "Exercise not found",
  "status": 404
}`}
              language="json"
              title="Error Response Format"
            />
          </Section>
        </main>
      </div>
    </div>
  )
}
