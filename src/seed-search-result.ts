import {
    html,
    HTMLTemplateResult,
    css,
    CSSResultGroup,
    PropertyValues,
} from "lit";
import { customElement, state, property } from "lit/decorators.js";
import {
    StoreConsumerElement,
    useQuery,
    matched,
} from "@scdh/lit-redux-consumer";
import type { RTKQResponse } from "@scdh/lit-redux-consumer";

import { SeedState } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import {
    SearchResponse,
    Document,
    SearchQuery,
    Highlighting,
} from "./redux/searchTypes";
import {
    setFl,
    setHighlighting,
    setHighlightingSnippets,
    addFilter,
    removeFilter,
    resetQuery,
} from "./redux/searchQuerySlice";

import log from "./logging";

/*
 * A web component for displaying search results.
 */
@customElement("seed-search-result")
export class SeedSearchResult extends StoreConsumerElement<SeedState, any> {
    @property()
    collection!: string;

    /**
     * The fields which should be presented in the fielded result view.
     */
    @state()
    fields: Array<string> = [];

    /**
     * Queries and stores the list of all fields in the index/schema.
     */
    @useQuery<SeedState, SeedSearchResult, SearchQuery, Array<String>>(
        searchApi.endpoints.fields,
        (s, _c) => s.searchQuery,
    )
    indexFields!: Array<string>;

    /**
     * The `fieldPattern` attribute takes a regex which is used to
     * filter out the fields (categories) for the `fields` property.
     */
    @property({ attribute: "field-pattern" })
    fieldPattern: string = "^(meta|author|title)";

    @property({ type: Boolean })
    highlighting: boolean = false;

    @property({ attribute: "highlighting-snippets", type: Number })
    highlightingSnippets: number = 1;

    @property({ attribute: "kwic-pattern" })
    kwicPattern: string = "^(html_hts_)";

    /*
     * Path segment to search, used for in the path to details
     * view. This is passed through to all the links to detail pages.
     */
    @property({ attribute: "search-path" })
    searchPath: string = "/search/";

    @state()
    @matched<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
        searchApi.endpoints.documents.matchFulfilled,
        (s, _c) => searchApi.endpoints.documents.select(s.searchQuery)(s),
    )
    // @matched<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
    // 	searchApi.endpoints.facetTerms.matchFulfilled,
    // 	(s, _c) => searchApi.endpoints.facetTerms.select(s.searchQuery)(s))
    // get result when a filter was applied and the query was initiated
    @matched<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
        searchApi.endpoints.filter.matchFulfilled,
        (s, _c) => searchApi.endpoints.filter.select(s.searchQuery)(s),
    )
    // get result for search queries already initiated
    // 1. filter removed, result already present from document(...) query, i.e., all filters were removed
    @matched<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
        removeFilter.match,
        (s, _c) => searchApi.endpoints.documents.select(s.searchQuery)(s),
    )
    // 2. filter removed, result already present from filter(...) query
    @matched<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
        addFilter.match,
        (s, _c) => searchApi.endpoints.filter.select(s.searchQuery)(s),
    )
    // search reset
    @matched<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
        resetQuery.match,
        (s, _c) => searchApi.endpoints.documents.select(s.searchQuery)(s),
    )
    // @watch<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
    // 	(s, _c) => searchApi.endpoints.documents.select(s.searchQuery)(s)
    // )
    // @watch<SeedState, SeedSearchResult, RTKQResponse<SearchResponse>>(
    // 	(s, _c) => searchApi.endpoints.facetTerms.select(s.searchQuery)(s)
    // )
    result!: RTKQResponse<SearchResponse>;

    @state()
    documents: Array<Document> = [];

    @state()
    highlightedDocuments: Highlighting = {};

    @state()
    document_count: number = 0;

    @state()
    document_start: number = 0;

    override subscribeStore(): void {
        this.store?.dispatch(setHighlighting(this.highlighting));
        this.store?.dispatch(
            setHighlightingSnippets(this.highlightingSnippets),
        );
    }

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has("indexFields")) {
            // set fields from indexFields
            const regex: RegExp = new RegExp(this.fieldPattern);
            this.fields = this.indexFields.filter((f) => f.match(regex));
        }
        if (changedProperties.has("fields") && this.store) {
            // set fl query parameter
            this.store.dispatch(setFl(this.fields));
        }
        if (changedProperties.has("result")) {
            // updating search result
            log.debug("search result updated", this.result);
            if (this.result.data !== undefined) {
                this.document_count = this.result.data.response.numFound;
                this.document_start = this.result.data.response.start;
                this.documents = this.result.data.response.docs;
                this.highlightedDocuments =
                    this.result.data?.highlighting ?? {};
            }
        }
    }

    override render(): HTMLTemplateResult {
        return html`<div>
            ${this.renderDocumentCount()}
            <div class="result-documents">
                ${this.documents.map((d) =>
                    this.renderDocument(
                        d,
                        this.fieldPattern,
                        this.highlightedDocuments[d.id],
                        this.kwicPattern,
                    ),
                )}
            </div>
        </div>`;
    }

    renderDocumentCount(): HTMLTemplateResult {
        return html`<div>
            <span>Documents found:</span><span>${this.document_count}</span>
        </div>`;
    }

    renderDocument(
        doc: Document,
        fieldPattern: string,
        highlightedDoc: Document,
        kwicPattern: string,
    ): HTMLTemplateResult {
        // Mind the dot!
        return html`<div class="result-document">
            <seed-result-doc
                collection="${this.collection}"
                doc-id="${doc.id}"
                .document="${doc}"
                .highlight="${highlightedDoc}"
                pattern="${fieldPattern}"
            ></seed-result-doc>
            <seed-kwic
                collection="${this.collection}"
                doc-id="${doc.id}"
                .highlight="${highlightedDoc}"
                pattern="${kwicPattern}"
            ></seed-kwic>
            <seed-result-details-link
                collection="${this.collection}"
                doc-id="${doc.id}"
                search-path="${this.searchPath}"
            ></seed-result-details-link>
        </div>`;
    }

    static styles: CSSResultGroup = [
        css`
            .result-document {
                margin: var(--search-result-margin, 15px) 0;
                border: var(
                    --search-result-border,
                    3px solid var(--window-border-color, lightblue)
                );
                border-radius: var(--search-result-border-radius, 10px);
                background-color: var(
                    --search-result-background-color,
                    aliceblue
                );
                padding: var(--search-result-padding, 10px);
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-result": SeedSearchResult;
    }
}
