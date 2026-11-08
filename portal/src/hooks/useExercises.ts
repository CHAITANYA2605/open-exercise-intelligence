import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface Muscle {
  muscle_id: string
  muscle_slug: string
}

export interface Exercise {
  exercise_id: string
  slug: string
  name: string
  alternative_names: string[]
  description: string
  category: string
  exercise_type: string
  difficulty_level: string
  movement_pattern: string
  force_type: string
  laterality: string
  muscles: {
    primary: Muscle[]
    secondary: Muscle[]
    stabilizers: Muscle[]
  }
  equipment_required: string[]
  equipment_optional?: string[]
  execution?: Record<string, unknown>
  training_parameters?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

interface Dataset {
  dataset?: string
  version: string
  schema_version?: string
  generated_at: string
  review_policy?: string
  exercise_count: number
  exercises: Exercise[]
}

export interface SearchFilters {
  q?: string
  category?: string
  difficulty_level?: string
  exercise_type?: string
  movement_pattern?: string
  muscle_slug?: string
  review_status?: string
}

const SYNONYMS: Record<string, string[]> = {
  chest: ['pectoralis', 'pecs'],
  pectoralis: ['chest', 'pecs'],
  pecs: ['chest', 'pectoralis'],
  back: ['latissimus', 'lats', 'rhomboids', 'trapezius'],
  lats: ['latissimus', 'back'],
  latissimus: ['lats', 'back'],
  shoulders: ['deltoids', 'delts'],
  deltoids: ['shoulders', 'delts'],
  delts: ['shoulders', 'deltoids'],
  biceps: ['bicep', 'curls'],
  triceps: ['tricep'],
  quads: ['quadriceps'],
  quadriceps: ['quads'],
  hamstrings: ['hamstring'],
  glutes: ['gluteus', 'glute'],
  gluteus: ['glutes', 'glute'],
  calves: ['calf', 'gastrocnemius'],
  abs: ['abdominals', 'core', 'abdominal'],
  abdominals: ['abs', 'core'],
  core: ['abs', 'abdominals'],
  benchpress: ['bench press'],
  'bench press': ['benchpress'],
  deadlift: ['dead lift'],
  pullup: ['pull up', 'pull-up'],
  pushup: ['push up', 'push-up'],
  squat: ['squats'],
}

function expandSynonyms(query: string): string {
  let expanded = query
  const lower = query.toLowerCase()
  for (const [term, expansions] of Object.entries(SYNONYMS)) {
    const escaped = term.replace(/[-]/g, '\\-')
    const re = new RegExp('(?<![a-z0-9])' + escaped + '(?![a-z0-9])', 'i')
    if (re.test(lower)) {
      expanded += ' ' + expansions.join(' ')
    }
  }
  return expanded
}

async function fetchDataset(): Promise<Dataset> {
  const res = await fetch('/generated/oei-dataset-all.json')
  if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`)
  return res.json()
}

export function useDataset() {
  return useQuery<Dataset>({
    queryKey: ['dataset'],
    queryFn: fetchDataset,
  })
}

export function useExercises(filters: SearchFilters, page = 1, perPage = 20) {
  const { data, isLoading, error } = useDataset()

  const filtered = useMemo(() => {
    if (!data) return []

    let results = data.exercises

    if (filters.q) {
      const expanded = expandSynonyms(filters.q)
      const terms = expanded.toLowerCase().split(/\s+/).filter(Boolean)
      results = results.filter((e) => {
        const haystack = [
          e.name,
          e.description,
          ...(e.alternative_names ?? []),
          ...((e.metadata?.tags as string[] | undefined) ?? []),
          ...e.muscles.primary.map((m) => m.muscle_slug),
          ...e.muscles.secondary.map((m) => m.muscle_slug),
        ]
          .join(' ')
          .toLowerCase()
        return terms.every((term) => haystack.includes(term))
      })
    }

    if (filters.category) {
      results = results.filter((e) => e.category === filters.category)
    }

    if (filters.difficulty_level) {
      results = results.filter((e) => e.difficulty_level === filters.difficulty_level)
    }

    if (filters.exercise_type) {
      results = results.filter((e) => e.exercise_type === filters.exercise_type)
    }

    if (filters.movement_pattern) {
      results = results.filter((e) => e.movement_pattern === filters.movement_pattern)
    }

    if (filters.muscle_slug) {
      const slug = filters.muscle_slug.toLowerCase()
      results = results.filter((e) =>
        [...e.muscles.primary, ...e.muscles.secondary, ...e.muscles.stabilizers].some(
          (m) => m.muscle_slug === slug
        )
      )
    }

    if (filters.review_status) {
      results = results.filter((e) => {
        const status = e.metadata?.review_status as string | undefined
        return status === filters.review_status
      })
    }

    return results
  }, [data, filters])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  return {
    exercises: paged,
    total: filtered.length,
    totalPages,
    isLoading,
    error: error as Error | null,
    datasetVersion: data?.version,
  }
}
