import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import { SearchResultElement } from "./search-result-mixin";
import { SeedState } from "./redux/seed-store";
import { SearchResponse, Document, solrSearchQuery } from "./redux/searchTypes";

import log from "./logging";

/*
 * A web component for displaying search results.
 */
@customElement("seed-search-result-count")
export class SeedSearchResultCount extends SearchResultElement {
    @state()
    documents: Array<Document> = [];

    @state()
    document_count: number = 0;

    @state()
    document_start: number = 0;

    override updateEffect(endpoint: string, s: SeedState): void {
        const queryId: string =
            endpoint + '("' + solrSearchQuery(s.searchQuery) + '")';
        log.debug(
            "updating search result",
            queryId,
            s.searchApi.queries.hasOwnProperty(queryId),
        );
        const data: SearchResponse | undefined = s.searchApi.queries[queryId]
            ?.data as SearchResponse | undefined;
        if (data !== undefined) {
            this.document_count = data.response.numFound;
            this.document_start = data.response.start;
            this.documents = data.response.docs;
        }
    }

    override render() {
        return html`<div>${this.renderDocumentCount()}</div>`;
    }

    renderDocumentCount() {
        return html`<div>
            <span>Documents found:</span><span>${this.document_count}</span>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-result-count": SeedSearchResultCount;
    }
}
