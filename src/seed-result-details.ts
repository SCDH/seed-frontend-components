import { HTMLTemplateResult, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { UnsubscribeListener } from "@reduxjs/toolkit";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";
import { matched } from "@scdh/lit-redux-consumer";

import { SeedState } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { setCollection, setQueryFields } from "./redux/searchQuerySlice";
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

    @property({ attribute: "field-pattern" })
    fieldPattern: string = "^(meta|author|title)";

    @property({ attribute: "text-pattern" })
    textPattern: string = "^(html_htm_)";

    @matched<SeedState, SeedResultDetails, SearchResponse | undefined>(
        searchApi.endpoints.document.matchFulfilled,
        (s, c) => {
            const q: SearchQuery = s.searchQuery;
            const queryId: string =
                searchApi.endpoints.document.name +
                '("' +
                solrSearchQuery(q, c?.documentId ?? undefined) +
                '")';
            log.debug(
                "search result loaded",
                s.searchApi.queries[queryId],
                queryId,
            );
            return s.searchApi.queries[queryId]?.data as
                | SearchResponse
                | undefined;
        },
    )
    result!: SearchResponse;

    @state()
    document!: Document;

    @state()
    highlighting!: Document | undefined;

    // override disconnectedCallback(): void {
    //     // When the element is removed from the dom, the single
    //     // document filter must be removed from the search query slice.
    //     this.store?.dispatch(removeSingleDocFilter());
    //     super.disconnectedCallback();
    // }

    protected override subscribeStore(): void {
        if (this.store === undefined) {
            log.error("no store yet for element", this);
            return;
        }
        this.setFields(this.store.getState());
        // If the field name in the search index were already
        // requested, take them from the redux store and set up the
        // fields property.
        if (
            this.store
                .getState()
                .searchApi.queries.hasOwnProperty(this.fieldsQueryId()) &&
            this.store.getState().searchApi.queries[this.fieldsQueryId()]
                ?.status == "fulfilled"
        ) {
            log.debug("fields alread queried when setting up details view");
            this.setFields(this.store?.getState());
            this.query();
        } else {
            // If not already in the request, initiate a request and
            // set up a listener, that sets the fields property.
            log.debug("initiating fields query", this.collection);
            this.store?.dispatch(
                searchApi.endpoints.fields.initiate(this.collection),
            );
            const unsubscriber = this.store?.dispatch(
                this.addAppListener({
                    matcher: searchApi.endpoints.fields.matchFulfilled,
                    effect: async (_action, listenerApi) => {
                        this.setFields(listenerApi.getState());
                        this.query();
                    },
                }),
            );
            this._unsubscribers.push(
                unsubscriber as unknown as UnsubscribeListener,
            );
        }
    }

    /*
     * Initiates a request for the document given by ID in the `documentId` property.
     */
    protected query() {
        log.debug("initiate request for document", this.documentId);
        // set up query
        this.store?.dispatch(setCollection(this.collection));
        //this.store?.dispatch(addSingleDocFilter(this.documentId));
        // query at the time of subscription
        const qry: SearchQuery =
            this.store?.getState()?.searchQuery ?? initialSearchQuery;
        // initiate this query
        this.store?.dispatch(
            searchApi.endpoints.document.initiate({
                query: qry,
                documentId: this.documentId,
            }),
        );
    }

    private setFields(state: SeedState): void {
        const flds: Array<string> =
            (state.searchApi?.queries?.[this.fieldsQueryId()]
                ?.data as Array<string>) ?? [];
        const fldRegex: RegExp = new RegExp(this.fieldPattern);
        const txtRegex: RegExp = new RegExp(this.textPattern);
        const qf: Array<string> = flds.filter(
            (f) => f.match(fldRegex) || f.match(txtRegex),
        );
        log.debug("setting query fields for details view", qf);
        this.store?.dispatch(setQueryFields(qf));
    }

    private fieldsQueryId(): string {
        return searchApi.endpoints.fields.name + '("' + this.collection + '")';
    }

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        // When the result comes in, also set the `document` property
        // from the result.
        if (changedProperties.has("result")) {
            log.debug("result was updated");
            this.document = this.result.response.docs[0];
            this.highlighting = this.result.highlighting
                ? [this.documentId]
                : undefined;
        }
    }

    protected override render(): HTMLTemplateResult {
        log.error("result", this.result);
        if (this.result?.response?.numFound != 1) {
            return html`Getting document with ID ${this.documentId} ...
            ${this.result}`;
        }
        return html`<div>
            <div>
                ${this.result?.response?.numFound ?? "failed"}
                ${this.document.id}
            </div>
            <seed-result-doc
                collection="${this.collection}"
                doc-id="${this.documentId}"
                .document="${this.document}"
                .highlight="${this.highlighting}"
                pattern="${this.fieldPattern}"
            ></seed-result-doc>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-details": SeedResultDetails;
    }
}
