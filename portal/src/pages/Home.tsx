import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'

const stats = [
  { label: 'Exercises', value: '866' },
  { label: 'Categories', value: '9' },
  { label: 'Muscle Groups', value: '50+' },
  { label: 'SDKs', value: '3' },
]

const features = [
  {
    icon: '🆓',
    title: 'Completely Free',
    desc: 'No API key, no account, no rate limits, no licensing fees. CC0 data, MIT code.',
  },
  {
    icon: '🔍',
    title: 'Powerful Search',
    desc: 'Full-text search with AND semantics across names, descriptions, muscles, and tags.',
  },
  {
    icon: '💪',
    title: 'Rich Metadata',
    desc: 'Muscle mappings, equipment, execution steps, training parameters, and variants for every exercise.',
  },
  {
    icon: '📦',
    title: 'Multiple SDKs',
    desc: 'Official JavaScript, Python, and Java SDKs with TypeScript definitions included.',
  },
  {
    icon: '🔗',
    title: 'REST API',
    desc: 'Spring Boot REST API with OpenAPI 3.1 spec. Run it locally or in Docker in seconds.',
  },
  {
    icon: '🏗️',
    title: 'Production Ready',
    desc: 'Paginated responses, CORS enabled, Gzip compression, health endpoints out of the box.',
  },
]

const jsExample = `import { OEIClient } from '@oei/exercise-sdk'

const client = new OEIClient({
  dataPath: './data/generated/oei-dataset-all.json'
})
await client.load()

// Search with fuzzy matching and pagination
const results = client.search({
  q: 'bench press',
  category: 'strength',
  difficulty: 'intermediate',
  per_page: 10,
})

console.log(\`Found \${results.total} exercises (\${results.total_pages} pages)\`)
results.exercises.forEach(e => console.log(e.name))`

const pythonExample = `from oei import OEIClient

client = OEIClient(data_path="data/generated/oei-dataset-all.json")
client.load()

# Filter by muscle with pagination
results = client.search(
    muscle="chest",
    difficulty="beginner",
    per_page=10,
    page=1,
)

print(f"Found {results.total} exercises")
for exercise in results.exercises:
    print(exercise.name)`

const curlExample = `# Start the API (builds dataset first)
node scripts/generation/build-dataset.js
docker compose up -d

# List approved exercises only
curl "http://localhost:8080/v1/exercises?review_status=APPROVED&per_page=5"

# Fuzzy full-text search
curl "http://localhost:8080/v1/exercises?q=benchpress&category=strength"

# Get a single exercise
curl "http://localhost:8080/v1/exercises/barbell-bench-press"

# Find equipment substitutions
curl "http://localhost:8080/v1/exercises/barbell-bench-press/alternatives"`

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-sm px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            v1.0.0 — 866 exercises, fully open
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Open Exercise
            <span className="text-indigo-400"> Intelligence</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            A free, community-driven exercise knowledge base for developers. 866 exercises with full muscle mappings, equipment, execution instructions, and training parameters — no API key required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/docs" className="btn-primary text-center">
              Read the Docs
            </Link>
            <Link to="/explore" className="btn-secondary text-center">
              Explore Exercises
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-slate-800 bg-slate-800/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-1">{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Everything you need</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            OEI is designed from the ground up as open infrastructure — data developers can depend on without legal uncertainty.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-600 transition-colors">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Quick Start</h2>
          <p className="text-slate-400 text-center mb-12">Get up and running in minutes with your preferred language or the REST API.</p>

          <div className="space-y-8">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-yellow-400">JS</span> JavaScript / TypeScript
              </h3>
              <CodeBlock code={`# Not yet on npm — local install:\nnpm install ./sdks/js`} language="bash" title="Install" />
              <div className="mt-3">
                <CodeBlock code={jsExample} language="typescript" title="Usage" />
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-blue-400">Py</span> Python
              </h3>
              <CodeBlock code={`# Not yet on PyPI — local install:\npip install ./sdks/python`} language="bash" title="Install" />
              <div className="mt-3">
                <CodeBlock code={pythonExample} language="python" title="Usage" />
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-red-400">☕</span> Java (Maven)
              </h3>
              <CodeBlock code={`<!-- Not yet on Maven Central — build locally: -->\n<!-- cd sdks/java && mvn install -->\n<dependency>\n  <groupId>io.oei</groupId>\n  <artifactId>exercise-sdk</artifactId>\n  <version>0.9.0-beta</version>\n</dependency>`} language="xml" title="pom.xml" />
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-green-400">🐳</span> REST API (Docker)
              </h3>
              <CodeBlock code={curlExample} language="bash" title="Run & Query" />
            </div>
          </div>
        </div>
      </section>

      {/* Join the Community CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-950/60 to-slate-800 border border-emerald-800/50 rounded-2xl p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-800 text-emerald-300 text-sm px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Open to everyone
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join the Community</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            OEI grows through community contributions. Add exercises, fix errors, contribute illustrations. Every PR is reviewed by a maintainer and released under CC0 — permanently open.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/community" className="btn-primary text-center">
              How to Contribute
            </Link>
            <a
              href="https://github.com/CHAITANYA2605/open-exercise-intelligence"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Start building today</h2>
          <p className="text-slate-400 mb-8">No registration, no API key. Clone, load, and go.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore" className="btn-primary">
              Browse 866 Exercises
            </Link>
            <Link to="/playground" className="btn-secondary">
              Try the Playground
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <span>© 2026 OEI Contributors · Data: CC0 1.0 · Code: MIT</span>
          <div className="flex gap-6">
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link to="/community" className="hover:text-white transition-colors">Community</Link>
            <a href="https://github.com/CHAITANYA2605/open-exercise-intelligence" className="hover:text-white transition-colors">GitHub</a>
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
