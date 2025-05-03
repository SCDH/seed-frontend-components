import { HTMLTemplateResult, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { StoreConsumerElement } from "./store-consumer-mixin";
import { addSingleDocFilter, setCollection } from "./redux/searchQuerySlice";
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

    @state()
    result!: SearchResponse;

    @state()
    document!: Document;

    subscribeStore(): void {
        // add listener to the store, that reports when the query is fulfilled
        this.store?.dispatch(
            addAppListener({
                matcher: searchApi.endpoints.document.matchFulfilled,
                effect: (_action, listenerApi) => {
                    // In the effect, the query at the time when the
                    // match occurs is used, not the query at the time
                    // of subscribing the listener. This allows us to
                    // update this costum element with other
                    // documents. We just have to make a new query.
                    const q: SearchQuery = listenerApi.getState().searchQuery;
                    const queryId: string =
                        'document("' +
                        solrSearchQuery(q).replaceAll('"', '\\"') +
                        '")';
                    log.debug(
                        "retrieved single document",
                        queryId,
                        listenerApi
                            .getState()
                            .searchApi.queries.hasOwnProperty(queryId),
                    );
                    this.result = listenerApi.getState().searchApi.queries[
                        queryId
                    ]?.data as SearchResponse;
                    this.document = this.result.response.docs[0];
                },
            }),
        );
        // query the document
        this.query();
    }

    protected query() {
        // set up query
        this.store?.dispatch(setCollection(this.collection));
        this.store?.dispatch(addSingleDocFilter(this.documentId));
        // query at the time of subscription
        const qry: SearchQuery =
            this.store?.getState()?.searchQuery ?? initialSearchQuery;
        // initiate this query
        this.store?.dispatch(searchApi.endpoints.document.initiate(qry));
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
