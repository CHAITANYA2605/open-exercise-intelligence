// Open Exercise Intelligence — TypeScript type definitions
// License: MIT  |  Data: CC0 1.0

export interface MuscleRef {
  muscle_id: string;
  muscle_slug: string;
}

export interface Muscles {
  primary: MuscleRef[];
  secondary: MuscleRef[];
  stabilizers: MuscleRef[];
}

export interface RepRange {
  goal: string;
  min_reps: number;
  max_reps: number;
}

export interface SetRange {
  goal: string;
  min_sets: number;
  max_sets: number;
}

export interface TrainingParameters {
  recommended_rep_ranges: RepRange[];
  recommended_set_ranges: SetRange[];
  rest_periods: Record<string, number>;
  training_goals: string[];
}

export interface Execution {
  starting_position: string;
  setup_instructions: string;
  steps: string[];
  breathing_instructions: string;
  common_mistakes: string[];
  safety_considerations: string[];
  range_of_motion_guidance: string;
  tempo_recommendations: string;
  coaching_cues: string[];
}

export interface Variants {
  easier: string[];
  harder: string[];
  unilateral: string[];
  bilateral: string[];
  equipment_alternatives: string[];
}

export interface Media {
  thumbnail: string | null;
  images: string[];
  videos: string[];
  anatomical_illustrations: string[];
}

export interface ExerciseMetadata {
  created_at: string;
  updated_at: string;
  created_by: string;
  version: string;
  sources: string[];
  tags: string[];
}

export interface Exercise {
  exercise_id: string;
  slug: string;
  name: string;
  alternative_names: string[];
  description: string;
  category: string;
  exercise_type: 'compound' | 'isolation';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  movement_pattern: string;
  force_type: string;
  mechanics_type: string;
  laterality: 'bilateral' | 'unilateral';
  exercise_family: string;
  status: 'active' | 'deprecated' | 'draft';
  muscles: Muscles;
  equipment_required: string[];
  equipment_optional: string[];
  execution: Execution;
  variants: Variants;
  training_parameters: TrainingParameters;
  media: Media;
  metadata: ExerciseMetadata;
}

export interface SearchFilters {
  category?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  movement_pattern?: string;
  exercise_type?: 'compound' | 'isolation';
  laterality?: 'bilateral' | 'unilateral';
  force_type?: string;
  status?: string;
  muscle_slug?: string;
  primary_muscle_slug?: string;
  equipment_id?: string;
  training_goal?: string;
  tags?: string[];
}

export interface SearchParams {
  q?: string;
  filters?: SearchFilters;
  sort_by?: 'score' | 'name' | 'difficulty';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  include_related?: boolean;
}

export interface ExerciseSummary {
  exercise_id: string;
  slug: string;
  name: string;
  category: string;
  difficulty_level: string;
  movement_pattern?: string;
  exercise_type?: string;
  laterality?: string;
  muscles?: Muscles;
  equipment_required?: string[];
  description?: string;
  _score?: number;
  related?: ExerciseSummary[];
}

export interface SearchResult {
  results: ExerciseSummary[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FacetEntry {
  value: string;
  count: number;
}

export interface Facets {
  category: FacetEntry[];
  difficulty_level: FacetEntry[];
  movement_pattern: FacetEntry[];
  exercise_type: FacetEntry[];
  laterality: FacetEntry[];
  force_type: FacetEntry[];
}
