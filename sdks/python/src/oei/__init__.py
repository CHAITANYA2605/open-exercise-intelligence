"""
oei-exercise-sdk
Open Exercise Intelligence — Python SDK

License: MIT
Data: CC0 1.0
"""

from .client import OEIClient
from .models import Exercise, SearchParams, SearchResult, SearchFilters, Facets

__all__ = ["OEIClient", "Exercise", "SearchParams", "SearchResult", "SearchFilters", "Facets"]
__version__ = "1.0.0"
