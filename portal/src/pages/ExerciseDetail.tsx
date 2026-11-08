import { useParams, Link } from 'react-router-dom'
import { useDataset, type Exercise } from '../hooks/useExercises'

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className ?? 'bg-slate-700 text-slate-300'}`}>
      {children}
    </span>
  )
}

const categoryColors: Record<string, string> = {
  strength: 'bg-blue-900 text-blue-300',
  cardio: 'bg-red-900 text-red-300',
  flexibility: 'bg-green-900 text-green-300',
  mobility: 'bg-teal-900 text-teal-300',
  plyometric: 'bg-orange-900 text-orange-300',
  power: 'bg-yellow-900 text-yellow-300',
  rehabilitation: 'bg-purple-900 text-purple-300',
  functional: 'bg-cyan-900 text-cyan-300',
  stretching: 'bg-lime-900 text-lime-300',
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-900 text-emerald-300',
  intermediate: 'bg-amber-900 text-amber-300',
  advanced: 'bg-rose-900 text-rose-300',
  expert: 'bg-red-900 text-red-300',
}

const reviewStatusColors: Record<string, string> = {
  APPROVED: 'bg-emerald-900 text-emerald-300',
  UNREVIEWED: 'bg-slate-700 text-slate-400',
  IN_REVIEW: 'bg-blue-900 text-blue-300',
  NEEDS_REVISION: 'bg-amber-900 text-amber-300',
  REJECTED: 'bg-red-900 text-red-300',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h2 className="text-white font-semibold text-lg mb-4">{title}</h2>
      {children}
    </div>
  )
}

function MuscleList({ muscles, label }: { muscles: { muscle_id: string; muscle_slug: string }[]; label: string }) {
  if (!muscles || muscles.length === 0) return null
  return (
    <div className="mb-3">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {muscles.map((m) => (
          <span key={m.muscle_id} className="text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
            {m.muscle_slug.replace(/-/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  )
}

type Execution = {
  steps?: string[]
  setup?: string
  cues?: string[]
  breathing?: string
  common_errors?: string[]
  safety_notes?: string[]
}

type TrainingParams = {
  sets?: { min?: number; max?: number }
  reps?: { min?: number; max?: number }
  rest_seconds?: { min?: number; max?: number }
  tempo?: string
  intensity_range?: string
}

export default function ExerciseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useDataset()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/2" />
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-700 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-300">Failed to load dataset: {error.message}</p>
      </div>
    )
  }

  const exercise = data?.exercises.find((e) => e.slug === slug)

  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-white font-bold text-xl mb-2">Exercise not found</h1>
        <p className="text-slate-400 mb-6">No exercise with slug "{slug}" exists in the dataset.</p>
        <Link to="/explore" className="btn-primary">Back to Explore</Link>
      </div>
    )
  }

  const execution = exercise.execution as Execution | undefined
  const trainingParams = exercise.training_parameters as TrainingParams | undefined
  const reviewStatus = exercise.metadata?.review_status as string | undefined

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
        <span>/</span>
        <span className="text-slate-300">{exercise.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <h1 className="text-3xl font-bold text-white flex-1">{exercise.name}</h1>
          {reviewStatus && (
            <Badge className={reviewStatusColors[reviewStatus] ?? 'bg-slate-700 text-slate-400'}>
              {reviewStatus}
            </Badge>
          )}
        </div>

        {exercise.alternative_names && exercise.alternative_names.length > 0 && (
          <p className="text-slate-500 text-sm mb-3">
            Also known as: {exercise.alternative_names.join(', ')}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={categoryColors[exercise.category] ?? 'bg-slate-700 text-slate-300'}>
            {exercise.category}
          </Badge>
          <Badge className={difficultyColors[exercise.difficulty_level] ?? 'bg-slate-700 text-slate-300'}>
            {exercise.difficulty_level}
          </Badge>
          <Badge>{exercise.exercise_type}</Badge>
          {exercise.movement_pattern && <Badge>{exercise.movement_pattern}</Badge>}
          {exercise.laterality && <Badge>{exercise.laterality}</Badge>}
          {exercise.force_type && <Badge>{exercise.force_type}</Badge>}
        </div>

        <p className="text-slate-300 leading-relaxed">{exercise.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Muscles */}
        <Section title="Muscles">
          <MuscleList muscles={exercise.muscles?.primary ?? []} label="Primary" />
          <MuscleList muscles={exercise.muscles?.secondary ?? []} label="Secondary" />
          <MuscleList muscles={exercise.muscles?.stabilizers ?? []} label="Stabilizers" />
        </Section>

        {/* Equipment */}
        <Section title="Equipment">
          {exercise.equipment_required && exercise.equipment_required.length > 0 ? (
            <div className="mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Required</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {exercise.equipment_required.map((eq) => (
                  <span key={eq} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                    {eq.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No equipment required</p>
          )}
          {(exercise.equipment_optional ?? []).length > 0 && (
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Optional</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(exercise.equipment_optional ?? []).map((eq) => (
                  <span key={eq} className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded">
                    {eq.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* Execution */}
      {execution && (
        <Section title="Execution">
          {execution.setup && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-1">Setup</h3>
              <p className="text-slate-300 text-sm">{execution.setup}</p>
            </div>
          )}

          {execution.steps && execution.steps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Steps</h3>
              <ol className="space-y-2">
                {execution.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-900 text-indigo-300 text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {execution.breathing && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-1">Breathing</h3>
              <p className="text-slate-300 text-sm">{execution.breathing}</p>
            </div>
          )}

          {execution.cues && execution.cues.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Coaching Cues</h3>
              <ul className="space-y-1">
                {execution.cues.map((cue, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-indigo-400 shrink-0">→</span>
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {execution.common_errors && execution.common_errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-amber-400 mb-2">Common Errors</h3>
              <ul className="space-y-1">
                {execution.common_errors.map((err, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-amber-400 shrink-0">!</span>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {execution.safety_notes && execution.safety_notes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-2">Safety Notes</h3>
              <ul className="space-y-1">
                {execution.safety_notes.map((note, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-red-400 shrink-0">⚠</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Training Parameters */}
      {trainingParams && (
        <Section title="Training Parameters">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trainingParams.sets && (
              <div className="text-center bg-slate-700/50 rounded-lg p-3">
                <div className="text-white font-semibold text-lg">
                  {trainingParams.sets.min === trainingParams.sets.max
                    ? trainingParams.sets.min
                    : `${trainingParams.sets.min}–${trainingParams.sets.max}`}
                </div>
                <div className="text-slate-500 text-xs mt-0.5">Sets</div>
              </div>
            )}
            {trainingParams.reps && (
              <div className="text-center bg-slate-700/50 rounded-lg p-3">
                <div className="text-white font-semibold text-lg">
                  {trainingParams.reps.min === trainingParams.reps.max
                    ? trainingParams.reps.min
                    : `${trainingParams.reps.min}–${trainingParams.reps.max}`}
                </div>
                <div className="text-slate-500 text-xs mt-0.5">Reps</div>
              </div>
            )}
            {trainingParams.rest_seconds && (
              <div className="text-center bg-slate-700/50 rounded-lg p-3">
                <div className="text-white font-semibold text-lg">
                  {trainingParams.rest_seconds.min === trainingParams.rest_seconds.max
                    ? `${trainingParams.rest_seconds.min}s`
                    : `${trainingParams.rest_seconds.min}–${trainingParams.rest_seconds.max}s`}
                </div>
                <div className="text-slate-500 text-xs mt-0.5">Rest</div>
              </div>
            )}
            {trainingParams.tempo && (
              <div className="text-center bg-slate-700/50 rounded-lg p-3">
                <div className="text-white font-semibold text-lg font-mono">{trainingParams.tempo}</div>
                <div className="text-slate-500 text-xs mt-0.5">Tempo</div>
              </div>
            )}
          </div>
          {trainingParams.intensity_range && (
            <p className="text-slate-400 text-sm mt-3">Intensity: {trainingParams.intensity_range}</p>
          )}
        </Section>
      )}

      {/* Meta */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-xs text-slate-500 flex flex-wrap gap-4">
        <span>ID: <code className="font-mono text-slate-400">{exercise.exercise_id}</code></span>
        <span>Slug: <code className="font-mono text-slate-400">{exercise.slug}</code></span>
      </div>

      {/* Back link */}
      <div>
        <Link to="/explore" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          ← Back to Explore
        </Link>
      </div>
    </div>
  )
}
