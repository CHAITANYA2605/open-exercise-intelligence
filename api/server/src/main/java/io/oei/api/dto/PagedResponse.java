package io.oei.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PagedResponse<T> {

    private List<T> data;
    private Meta meta;

    public PagedResponse(List<T> data, int total, int page, int perPage) {
        this.data = data;
        this.meta = new Meta(total, page, perPage);
    }

    public List<T> getData() { return data; }
    public Meta getMeta() { return meta; }

    public static class Meta {
        private int total;
        private int page;

        @JsonProperty("per_page")
        private int perPage;

        @JsonProperty("total_pages")
        private int totalPages;

        public Meta(int total, int page, int perPage) {
            this.total = total;
            this.page = page;
            this.perPage = perPage;
            this.totalPages = perPage > 0 ? (int) Math.ceil((double) total / perPage) : 0;
        }

        public int getTotal() { return total; }
        public int getPage() { return page; }
        public int getPerPage() { return perPage; }
        public int getTotalPages() { return totalPages; }
    }
}
