import {
    html,
    css,
    HTMLTemplateResult,
    CSSResultGroup,
    PropertyValues,
} from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";
import { useQuery, watch } from "@scdh/lit-redux-consumer";
import type { RTKQResponse } from "@scdh/lit-redux-consumer";

import { SeedState } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import {
    SearchQuery,
    initialSearchQuery,
    SearchResponse,
} from "./redux/searchTypes";
import {
    simpleQuery,
    resetQuery,
    setQueryFields,
} from "./redux/searchQuerySlice";

import log from "./logging";

/*
 * A simple web component for firing search queries.
 */
@customElement("seed-search")
export class SeedSearch extends StoreConsumerElement<SeedState, any> {
    /**
     * If true, an query without search term is filed initially, which
     * means, that we start with all documents in the index.
     */
    @property({ attribute: "initial-all", type: Boolean })
    initiateEmpty: boolean = false;

    @property()
    collection!: string;

    // @state() // no need to re-render if query changes
    @watch<SeedState, SeedSearch, SearchQuery>((s, _c) => s.searchQuery)
    query: SearchQuery = initialSearchQuery;

    @query("#search")
    input!: HTMLInputElement;

    /**
     * This property determines which fields are queried. It is a
     * regular expression which is a applied as a filter to the list
     * of all fields in the index/schema. It also effects which fields
     * occur in the highlighting result.
     */
    @property({ attribute: "query-field-pattern" })
    queryFieldPattern!: string;

    /**
     * Stores the list of fields in the index.
     */
    @useQuery<SeedState, SeedSearch, SearchQuery, Array<String>>(
        searchApi.endpoints.fields,
        (s, _c) => s.searchQuery,
    )
    indexFields!: Array<string>;

    /**
     * Only when this property is `true`, filing a query with a search
     * term is possible. Reason: We need to set up query fields before
     * filing the query.
     */
    @state()
    ready: boolean = false;

    /**
     * Set up the query and the form as soon as the list of fields in
     * the index is present.
     *
     * @inheritdoc
     */
    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has("indexFields")) {
            // filter fields
            const pattern: RegExp = new RegExp(this.queryFieldPattern);
            var queryFields: Array<string> = this.indexFields.filter((f) =>
                f.match(pattern),
            );
            log.debug("setting query fields for details view", this);
            // Setting up query fields (qf):
            this.store?.dispatch(setQueryFields(queryFields));
            // ready to file queries with search terms
            this.ready = true;
        }
        if (changedProperties.has("ready") && this.ready) {
            if (this.initiateEmpty) {
                // after time out in order to fix variing search query
                setTimeout(() => this.initialAll(), 500);
            }
        }
    }

    /**
     * File query. This is used for initial all-query, but could
     * be used with any search query.
     *
     * We are reforcing a refetch because only the event of the
     * incoming result will make the result occur in the search
     * results view.
     */
    protected initialAll(): void {
        log.debug("running initial query for all documents");
        // @ts-ignore, it's really a promise
        let promise: Promise<RTKQResponse<SearchResponse>> =
            this.store?.dispatch(
                searchApi.endpoints.documents.initiate(this.query, {
                    forceRefetch: true,
                }),
            );
        this._queryUnsubscribers.add(
            "initialEmptyAll",
            // @ts-ignore, the promise really has the unsubscribe
            promise?.unsubscribe,
        );
    }

    /**
     * @inheritdoc
     */
    protected override render(): HTMLTemplateResult {
        return html`
            <div class="search-form-wrapper">
                <input id="search" name="search" type="text" placeholder="search"></input/>
                ${this.renderSubmit()}
            </div>`;
    }

    /**
     * Have a submit button if the form is ready.
     */
    protected renderSubmit(): HTMLTemplateResult {
        return this.ready
            ? html`<button @click="${this.search}">🔍</button>`
            : html``;
    }

    static styles: CSSResultGroup = [
        css`
            host {
            }
            .search-form-wrapper {
                display: flex;
                flex-direction: row;
                border: 1px solid red;
                border-radius: 25px;
                padding: 6px 12px;
            }
            .search-form-wrapper input,
            .search-form-wrapper button {
                border: none;
                background-color: inherit;
            }
        `,
    ];

    /**
     * Callback called from submit button.
     */
    protected search(): void {
        log.debug("Search button hit!");
        // set or reset the search term
        if (this.input?.value === "" || this.input?.value === undefined) {
            this.store?.dispatch(resetQuery());
        } else {
            this.store?.dispatch(simpleQuery(this.input.value));
        }
        // file the query
        this.store?.dispatch(
            searchApi.endpoints.documents.initiate(this.query),
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search": SeedSearch;
    }
}
