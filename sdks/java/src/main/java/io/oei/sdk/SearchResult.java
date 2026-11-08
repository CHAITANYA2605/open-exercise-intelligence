package io.oei.sdk;

import java.util.List;

/** Paginated search result returned by {@link OEIClient#search(SearchParams)}. */
public final class SearchResult {

    public final List<Exercise> results;
    public final int total;
    public final int page;
    public final int perPage;
    public final int totalPages;

    public SearchResult(List<Exercise> results, int total, int page, int perPage, int totalPages) {
        this.results = results;
        this.total = total;
        this.page = page;
        this.perPage = perPage;
        this.totalPages = totalPages;
    }
}
