"""
OEIClient — main entry point for the OEI Python SDK.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

from .models import (
    Exercise,
    ExerciseSummary,
    Facets,
    FacetEntry,
    Muscles,
    SearchFilters,
    SearchParams,
    SearchResult,
)

_DIFFICULTY_ORDER = {"beginner": 0, "intermediate": 1, "advanced": 2}


def _tokenize(text: str) -> List[str]:
    return [t for t in re.sub(r"[^a-z0-9 -]", " ", text.lower()).split() if t]


def _build_search_text(ex: Exercise) -> str:
    parts = [
        ex.name,
        " ".join(ex.alternative_names),
        ex.description,
        ex.category,
        ex.exercise_family,
        ex.movement_pattern,
        " ".join(ex.metadata.tags),
        " ".join(m.muscle_slug for m in ex.muscles.primary),
        " ".join(m.muscle_slug for m in ex.muscles.secondary),
        " ".join(m.muscle_slug for m in ex.muscles.stabilizers),
    ]
    return re.sub(r"[^a-z0-9 -]", " ", " ".join(parts).lower())


def _score(search_text: str, name: str, tokens: List[str]) -> float:
    if not tokens:
        return 1.0
    score = 0.0
    name_lower = name.lower()
    for token in tokens:
        if token not in search_text:
            return 0.0
        score += 10.0 if token in name_lower else 1.0
    return score


def _matches_filter(ex: Exercise, f: SearchFilters) -> bool:
    if f.category and ex.category != f.category:
        return False
    if f.difficulty_level and ex.difficulty_level != f.difficulty_level:
        return False
    if f.movement_pattern and ex.movement_pattern != f.movement_pattern:
        return False
    if f.exercise_type and ex.exercise_type != f.exercise_type:
        return False
    if f.laterality and ex.laterality != f.laterality:
        return False
    if f.force_type and ex.force_type != f.force_type:
        return False
    if f.status and ex.status != f.status:
        return False

    if f.muscle_slug:
        slugs = {m.muscle_slug for m in ex.muscles.primary + ex.muscles.secondary + ex.muscles.stabilizers}
        if f.muscle_slug not in slugs:
            return False

    if f.primary_muscle_slug:
        slugs = {m.muscle_slug for m in ex.muscles.primary}
        if f.primary_muscle_slug not in slugs:
            return False

    if f.equipment_id:
        ids = set(ex.equipment_required + ex.equipment_optional)
        if f.equipment_id not in ids:
            return False

    if f.training_goal:
        goals = set(ex.training_parameters.training_goals)
        if f.training_goal not in goals:
            return False

    if f.tags:
        ex_tags = set(ex.metadata.tags)
        if not all(t in ex_tags for t in f.tags):
            return False

    return True


class OEIClient:
    """
    Client for the OEI exercise dataset.

    Examples
    --------
    >>> client = OEIClient(data_dir="./data/exercises")
    >>> client.init()
    >>> results = client.search(SearchParams(q="squat", per_page=5))
    >>> print(results.total)
    """

    def __init__(self, data_dir: Optional[str] = None) -> None:
        self._data_dir = data_dir
        self._index: List[Tuple[Exercise, str]] = []

    def init(self) -> "OEIClient":
        """Load exercises from data_dir."""
        if not self._data_dir:
            raise ValueError("OEIClient: data_dir is required for init()")
        exercises = self._load_from_dir(self._data_dir)
        self.load_from_list(exercises)
        return self

    @staticmethod
    def _load_from_dir(data_dir: str) -> List[Exercise]:
        exercises: List[Exercise] = []
        for root, _, files in os.walk(data_dir):
            for fname in files:
                if fname.endswith(".json"):
                    try:
                        with open(os.path.join(root, fname), encoding="utf-8") as fh:
                            d = json.load(fh)
                        exercises.append(Exercise.from_dict(d))
                    except Exception:
                        pass
        return exercises

    def load_from_list(self, exercises: List[Exercise]) -> "OEIClient":
        """Load exercises from a list of Exercise objects."""
        self._index = [(ex, _build_search_text(ex)) for ex in exercises]
        return self

    def load_from_dicts(self, raw: List[Dict[str, Any]]) -> "OEIClient":
        """Load exercises from a list of raw dicts (e.g., parsed JSON)."""
        return self.load_from_list([Exercise.from_dict(d) for d in raw])

    @property
    def size(self) -> int:
        return len(self._index)

    def get(self, id_or_slug: str) -> Optional[Exercise]:
        """Get a single exercise by UUID or slug."""
        for ex, _ in self._index:
            if ex.exercise_id == id_or_slug or ex.slug == id_or_slug:
                return ex
        return None

    def search(self, params: Optional[SearchParams] = None) -> SearchResult:
        """Search exercises with text and filters."""
        if params is None:
            params = SearchParams()

        tokens = _tokenize(params.q)
        per_page = max(1, min(params.per_page, 100))
        page = max(1, params.page)

        scored = [
            (ex, _score(st, ex.name, tokens))
            for ex, st in self._index
            if _matches_filter(ex, params.filters)
        ]
        scored = [(ex, s) for ex, s in scored if s > 0]

        # Sort
        reverse = params.sort_order == "desc"
        if params.sort_by == "name":
            scored.sort(key=lambda t: t[0].name, reverse=reverse)
        elif params.sort_by == "difficulty":
            scored.sort(key=lambda t: _DIFFICULTY_ORDER.get(t[0].difficulty_level, 0), reverse=reverse)
        else:
            scored.sort(key=lambda t: t[1], reverse=True)

        total = len(scored)
        offset = (page - 1) * per_page
        page_items = scored[offset : offset + per_page]

        results: List[ExerciseSummary] = []
        for ex, s in page_items:
            summary = ExerciseSummary(
                exercise_id=ex.exercise_id,
                slug=ex.slug,
                name=ex.name,
                category=ex.category,
                difficulty_level=ex.difficulty_level,
                movement_pattern=ex.movement_pattern,
                exercise_type=ex.exercise_type,
                muscles=ex.muscles,
                _score=s,
            )
            if params.include_related:
                summary.related = self.related(ex.exercise_id)
            results.append(summary)

        return SearchResult(
            results=results,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=max(1, -(-total // per_page)),
        )

    def related(self, id_or_slug: str, limit: int = 5) -> List[ExerciseSummary]:
        """Get related exercises ranked by muscle overlap and category similarity."""
        target = self.get(id_or_slug)
        if target is None:
            return []
        primary_slugs = {m.muscle_slug for m in target.muscles.primary}

        candidates = []
        for ex, _ in self._index:
            if ex.exercise_id == target.exercise_id:
                continue
            overlap = sum(1 for m in ex.muscles.primary if m.muscle_slug in primary_slugs)
            bonus = (2 if ex.category == target.category else 0) + (3 if ex.exercise_family == target.exercise_family else 0)
            score = overlap * 5 + bonus
            if score > 0:
                candidates.append((ex, score))

        candidates.sort(key=lambda t: t[1], reverse=True)
        return [
            ExerciseSummary(
                exercise_id=ex.exercise_id,
                slug=ex.slug,
                name=ex.name,
                category=ex.category,
                difficulty_level=ex.difficulty_level,
            )
            for ex, _ in candidates[:limit]
        ]

    def facets(self, filters: Optional[SearchFilters] = None) -> Facets:
        """Return value-count facets for the given filter context."""
        if filters is None:
            filters = SearchFilters()
        filtered = [ex for ex, _ in self._index if _matches_filter(ex, filters)]

        def count(getter):
            counts: Dict[str, int] = {}
            for ex in filtered:
                v = getter(ex)
                if v:
                    counts[v] = counts.get(v, 0) + 1
            return [FacetEntry(value=k, count=v) for k, v in sorted(counts.items(), key=lambda t: -t[1])]

        return Facets(
            category=count(lambda e: e.category),
            difficulty_level=count(lambda e: e.difficulty_level),
            movement_pattern=count(lambda e: e.movement_pattern),
            exercise_type=count(lambda e: e.exercise_type),
            laterality=count(lambda e: e.laterality),
            force_type=count(lambda e: e.force_type),
        )

    def list(self, page: int = 1, per_page: int = 20) -> SearchResult:
        """List all exercises paginated."""
        return self.search(SearchParams(page=page, per_page=per_page))
