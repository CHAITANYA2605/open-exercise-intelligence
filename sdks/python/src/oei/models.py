"""
Data models (dataclasses) for the OEI Python SDK.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class MuscleRef:
    muscle_id: str
    muscle_slug: str

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "MuscleRef":
        return cls(muscle_id=d.get("muscle_id", ""), muscle_slug=d.get("muscle_slug", ""))


@dataclass
class Muscles:
    primary: List[MuscleRef] = field(default_factory=list)
    secondary: List[MuscleRef] = field(default_factory=list)
    stabilizers: List[MuscleRef] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "Muscles":
        return cls(
            primary=[MuscleRef.from_dict(m) for m in d.get("primary", [])],
            secondary=[MuscleRef.from_dict(m) for m in d.get("secondary", [])],
            stabilizers=[MuscleRef.from_dict(m) for m in d.get("stabilizers", [])],
        )


@dataclass
class Execution:
    starting_position: str = ""
    setup_instructions: str = ""
    steps: List[str] = field(default_factory=list)
    breathing_instructions: str = ""
    common_mistakes: List[str] = field(default_factory=list)
    safety_considerations: List[str] = field(default_factory=list)
    range_of_motion_guidance: str = ""
    tempo_recommendations: str = ""
    coaching_cues: List[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "Execution":
        return cls(**{k: d.get(k, v) for k, v in cls.__dataclass_fields__.items()})  # type: ignore[attr-defined]


@dataclass
class TrainingParameters:
    recommended_rep_ranges: List[Dict[str, Any]] = field(default_factory=list)
    recommended_set_ranges: List[Dict[str, Any]] = field(default_factory=list)
    rest_periods: Dict[str, int] = field(default_factory=dict)
    training_goals: List[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "TrainingParameters":
        return cls(
            recommended_rep_ranges=d.get("recommended_rep_ranges", []),
            recommended_set_ranges=d.get("recommended_set_ranges", []),
            rest_periods=d.get("rest_periods", {}),
            training_goals=d.get("training_goals", []),
        )


@dataclass
class ExerciseMetadata:
    created_at: str = ""
    updated_at: str = ""
    created_by: str = ""
    version: str = "1.0.0"
    sources: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "ExerciseMetadata":
        return cls(
            created_at=d.get("created_at", ""),
            updated_at=d.get("updated_at", ""),
            created_by=d.get("created_by", ""),
            version=d.get("version", "1.0.0"),
            sources=d.get("sources", []),
            tags=d.get("tags", []),
        )


@dataclass
class Exercise:
    exercise_id: str
    slug: str
    name: str
    alternative_names: List[str] = field(default_factory=list)
    description: str = ""
    category: str = ""
    exercise_type: str = ""
    difficulty_level: str = ""
    movement_pattern: str = ""
    force_type: str = ""
    mechanics_type: str = ""
    laterality: str = ""
    exercise_family: str = ""
    status: str = "active"
    muscles: Muscles = field(default_factory=Muscles)
    equipment_required: List[str] = field(default_factory=list)
    equipment_optional: List[str] = field(default_factory=list)
    execution: Execution = field(default_factory=Execution)
    training_parameters: TrainingParameters = field(default_factory=TrainingParameters)
    metadata: ExerciseMetadata = field(default_factory=ExerciseMetadata)
    _raw: Dict[str, Any] = field(default_factory=dict, repr=False)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "Exercise":
        return cls(
            exercise_id=d.get("exercise_id", ""),
            slug=d.get("slug", ""),
            name=d.get("name", ""),
            alternative_names=d.get("alternative_names", []),
            description=d.get("description", ""),
            category=d.get("category", ""),
            exercise_type=d.get("exercise_type", ""),
            difficulty_level=d.get("difficulty_level", ""),
            movement_pattern=d.get("movement_pattern", ""),
            force_type=d.get("force_type", ""),
            mechanics_type=d.get("mechanics_type", ""),
            laterality=d.get("laterality", ""),
            exercise_family=d.get("exercise_family", ""),
            status=d.get("status", "active"),
            muscles=Muscles.from_dict(d.get("muscles", {})),
            equipment_required=d.get("equipment_required", []),
            equipment_optional=d.get("equipment_optional", []),
            execution=Execution.from_dict(d.get("execution", {})),
            training_parameters=TrainingParameters.from_dict(d.get("training_parameters", {})),
            metadata=ExerciseMetadata.from_dict(d.get("metadata", {})),
            _raw=d,
        )


@dataclass
class SearchFilters:
    category: Optional[str] = None
    difficulty_level: Optional[str] = None
    movement_pattern: Optional[str] = None
    exercise_type: Optional[str] = None
    laterality: Optional[str] = None
    force_type: Optional[str] = None
    status: Optional[str] = None
    muscle_slug: Optional[str] = None
    primary_muscle_slug: Optional[str] = None
    equipment_id: Optional[str] = None
    training_goal: Optional[str] = None
    tags: Optional[List[str]] = None


@dataclass
class SearchParams:
    q: str = ""
    filters: SearchFilters = field(default_factory=SearchFilters)
    sort_by: str = "score"
    sort_order: str = "desc"
    page: int = 1
    per_page: int = 20
    include_related: bool = False


@dataclass
class ExerciseSummary:
    exercise_id: str
    slug: str
    name: str
    category: str
    difficulty_level: str
    movement_pattern: str = ""
    exercise_type: str = ""
    muscles: Optional[Muscles] = None
    _score: float = 0.0
    related: Optional[List["ExerciseSummary"]] = None


@dataclass
class SearchResult:
    results: List[ExerciseSummary]
    total: int
    page: int
    per_page: int
    total_pages: int


@dataclass
class FacetEntry:
    value: str
    count: int


@dataclass
class Facets:
    category: List[FacetEntry] = field(default_factory=list)
    difficulty_level: List[FacetEntry] = field(default_factory=list)
    movement_pattern: List[FacetEntry] = field(default_factory=list)
    exercise_type: List[FacetEntry] = field(default_factory=list)
    laterality: List[FacetEntry] = field(default_factory=list)
    force_type: List[FacetEntry] = field(default_factory=list)
