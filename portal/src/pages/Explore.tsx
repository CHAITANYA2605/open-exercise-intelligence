import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import FilterPanel, { type Filters } from '../components/FilterPanel'
import ExerciseCard from '../components/ExerciseCard'
import { useExercises } from '../hooks/useExercises'

const PER_PAGE = 24

export default function Explore() {
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState<Filters>({
    category: '',
    difficulty_level: '',
    exercise_type: '',
    movement_pattern: '',
    review_status: '',
  })
  const [page, setPage] = useState(1)

  const handleSearch = (value: string) => {
    setQ(value)
    setPage(1)
  }

  const handleFilters = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const { exercises, total, totalPages, isLoading, error } = useExercises(
    {
      q: q || undefined,
      category: filters.category || undefined,
      difficulty_level: filters.difficulty_level || undefined,
      exercise_type: filters.exercise_type || undefined,
      movement_pattern: filters.movement_pattern || undefined,
      review_status: filters.review_status || undefined,
    },
    page,
    PER_PAGE,
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Exercises</h1>
        <p className="text-slate-400">Browse all 866 exercises. Loaded directly from the dataset — no server required.</p>
      </div>

      <div className="mb-6">
        <SearchBar value={q} onChange={handleSearch} placeholder="Search by name, muscle, or keyword..." />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <FilterPanel filters={filters} onChange={handleFilters} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">
              {isLoading ? 'Loading...' : `${total.toLocaleString()} exercise${total !== 1 ? 's' : ''} found`}
            </span>
            {totalPages > 1 && (
              <span className="text-slate-500 text-sm">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-950 border border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-300 font-medium mb-1">Failed to load dataset</p>
              <p className="text-red-400 text-sm">{error.message}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-700 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-slate-700 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-5/6" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && exercises.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-300 font-medium mb-2">No exercises found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Exercise grid */}
          {!isLoading && !error && exercises.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard key={exercise.exercise_id} exercise={exercise} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const pageNum = start + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                      pageNum === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
