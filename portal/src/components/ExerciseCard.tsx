interface Muscle {
  muscle_id: string
  muscle_slug: string
}

interface Exercise {
  exercise_id: string
  slug: string
  name: string
  description: string
  category: string
  exercise_type: string
  difficulty_level: string
  movement_pattern: string
  muscles: {
    primary: Muscle[]
    secondary: Muscle[]
    stabilizers: Muscle[]
  }
}

interface ExerciseCardProps {
  exercise: Exercise
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

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const primaryMuscles = exercise.muscles?.primary?.slice(0, 3) ?? []

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors leading-tight">
          {exercise.name}
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`badge ${categoryColors[exercise.category] ?? 'bg-slate-700 text-slate-300'}`}>
          {exercise.category}
        </span>
        <span className={`badge ${difficultyColors[exercise.difficulty_level] ?? 'bg-slate-700 text-slate-300'}`}>
          {exercise.difficulty_level}
        </span>
        <span className="badge bg-slate-700 text-slate-300">
          {exercise.exercise_type}
        </span>
      </div>

      <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
        {exercise.description}
      </p>

      {primaryMuscles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {primaryMuscles.map((m) => (
            <span key={m.muscle_id} className="text-xs text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded">
              {m.muscle_slug.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {exercise.movement_pattern && (
        <div className="mt-2 text-xs text-slate-500">
          {exercise.movement_pattern}
        </div>
      )}
    </div>
  )
}
