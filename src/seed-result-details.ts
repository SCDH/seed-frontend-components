import { HTMLTemplateResult, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { SeedState } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { StoreConsumerElement } from "./store-consumer-mixin";
import { matched } from "./store-consumer-decorators";
import {
    addSingleDocFilter,
    removeSingleDocFilter,
    setCollection,
} from "./redux/searchQuerySlice";
import {
    SearchResponse,
    Document,
    SearchQuery,
    solrSearchQuery,
    initialSearchQuery,
} from "./redux/searchTypes";
import log from "./logging";

/*
 * The `<seed-result-detail>` custom element shows a single document
 * from the search result.
 *
 * Which document is shown, is determined by the two attributes
 * `collection` and `doc-id`. Therefore, this component initiates a
 * query to the Solr search engine.
 *
 */
@customElement("seed-result-details")
export class SeedResultDetails extends StoreConsumerElement<SeedState, any> {
    /*
     * The collection of the search engine.
     */
    @property()
    collection!: string;

    /*
     * The identifier of the document inside the collection.
     */
    @property({ attribute: "doc-id" })
    documentId!: string;

    @matched<SeedState, SeedResultDetails, SearchResponse | undefined>(
        searchApi.endpoints.document.matchFulfilled,
        (s, _c) => {
            const q: SearchQuery = s.searchQuery;
            const queryId: string =
                searchApi.endpoints.document.name +
                '("' +
                solrSearchQuery(q).replaceAll('"', '\\"') +
                '")';
            return s.searchApi.queries[queryId]?.data as
                | SearchResponse
                | undefined;
        },
    )
    result!: SearchResponse;

    @state()
    document!: Document;

    override disconnectedCallback(): void {
        // When the element is removed from the dom, the single
        // document filter must be removed from the search query slice.
        this.store?.dispatch(removeSingleDocFilter());
        super.disconnectedCallback();
    }

    /*
     * Initiates a request for the document given by ID in the `documentId` property.
     */
    protected query() {
        log.debug("initiate request for document", this.documentId);
        // set up query
        this.store?.dispatch(setCollection(this.collection));
        this.store?.dispatch(addSingleDocFilter(this.documentId));
        // query at the time of subscription
        const qry: SearchQuery =
            this.store?.getState()?.searchQuery ?? initialSearchQuery;
        // initiate this query
        this.store?.dispatch(searchApi.endpoints.document.initiate(qry));
    }

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        // When the result comes in, also set the `document` property
        // from the result.
        if (changedProperties.has("result")) {
            this.document = this.result.response.docs[0];
        }
        // When the documentId property is updated, a new request is
        // send.
        if (changedProperties.has("documentId")) {
            this.query();
        }
    }

    protected override render(): HTMLTemplateResult {
        if (this.result?.response?.numFound != 1) {
            return html`Getting document with ID ${this.documentId} ...`;
        }
        return html`<div>
            ${this.result?.response?.numFound ?? "failed"} ${this.document.id}
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-details": SeedResultDetails;
    }
}
