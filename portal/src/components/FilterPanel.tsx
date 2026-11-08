export interface Filters {
  category: string
  difficulty_level: string
  exercise_type: string
  movement_pattern: string
}

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const categories = ['', 'strength', 'cardio', 'flexibility', 'mobility', 'plyometric', 'power', 'rehabilitation', 'functional', 'stretching']
const difficulties = ['', 'beginner', 'intermediate', 'advanced', 'expert']
const exerciseTypes = ['', 'compound', 'isolation', 'calisthenics', 'cardio', 'plyometric', 'strength', 'stretching']
const movementPatterns = [
  '', 'push', 'pull', 'hinge', 'hip-hinge', 'squat', 'lunge', 'carry', 'rotation',
  'anti-rotation', 'gait', 'overhead', 'bridge', 'plank', 'plyometric', 'balance'
]

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === '' ? `All ${label}s` : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const set = (key: keyof Filters) => (value: string) => onChange({ ...filters, [key]: value })

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        {hasFilters && (
          <button
            onClick={() => onChange({ category: '', difficulty_level: '', exercise_type: '', movement_pattern: '' })}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <FilterSelect label="Category" value={filters.category} options={categories} onChange={set('category')} />
      <FilterSelect label="Difficulty" value={filters.difficulty_level} options={difficulties} onChange={set('difficulty_level')} />
      <FilterSelect label="Type" value={filters.exercise_type} options={exerciseTypes} onChange={set('exercise_type')} />
      <FilterSelect label="Movement" value={filters.movement_pattern} options={movementPatterns} onChange={set('movement_pattern')} />
    </div>
  )
}
