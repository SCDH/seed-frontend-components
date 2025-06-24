import { html, css, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";

import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { resetQuery } from "./redux/searchQuerySlice";
import {
    FacetTerms,
    SearchResponse,
    toTermCountTuples,
    TermCountTuple,
    solrSearchQuery,
} from "./redux/searchTypes";

import log from "./logging";

/*
 * The `seed-facet` web component renders a search facet.
 *
 * If this component is used, the seed-facet-term component
 * has to be loaded, too.
 */
@customElement("seed-facet")
export class SeedFacet extends StoreConsumerElement<SeedState, any> {
    @property()
    field!: string;

    @property()
    threshold: number = 0;

    @state()
    terms: Array<TermCountTuple> = [];

    override subscribeStore() {
        log.debug("subscribing seed-facet");
        if (this.store === undefined) {
            log.error("no store yet for element", this);
            return;
        }
        // If the non-filtered query has already be processed
        // successfully, then the terms property can be set up from
        // the query response present in the redux store.
        if (
            this.store
                .getState()
                .searchApi.queries.hasOwnProperty(
                    this.facetTermsQuery(this.store.getState()),
                ) &&
            this.store.getState().searchApi.queries[
                this.facetTermsQuery(this.store.getState())
            ]?.status == "fulfilled"
        ) {
            this.setTerms(this.store.getState());
        } else {
            // Otherwise we set up a listener which set the terms when
            // the query is processed.
            this.store?.dispatch(
                addAppListener({
                    matcher: searchApi.endpoints.facetTerms.matchFulfilled,
                    effect: async (_action, listenerApi) => {
                        log.debug(
                            "api",
                            listenerApi.getState().searchApi.queries,
                        );
                        this.setTerms(listenerApi.getState());
                    },
                }),
            );
            // initiate a facetTerms query
            this.store.dispatch(
                searchApi.endpoints.facetTerms.initiate(
                    this.store.getState().searchQuery,
                ),
            );
        }
        this.store.dispatch(
            this.addAppListener({
                matcher: searchApi.endpoints.documents.matchFulfilled,
                effect: (_action, listenerApi) => {
                    listenerApi.dispatch(
                        searchApi.endpoints.facetTerms.initiate(
                            listenerApi.getState().searchQuery,
                        ),
                    );
                },
            }),
        );
        this.store.dispatch(
            this.addAppListener({
                actionCreator: resetQuery,
                effect: (_action, listenerApi) => {
                    this.setTerms(listenerApi.getState());
                },
            }),
        );
    }

    /*
     * Returns the query ID of the query for facet terms, which is is
     * used for making up terms with correct counts.
     */
    private facetTermsQuery(state: SeedState): string {
        return (
            searchApi.endpoints.facetTerms.name +
            '("' +
            solrSearchQuery(state.searchQuery, false, true) +
            '")'
        );
    }

    /*
     * Set the terms property. Get name of facets from store: 1) get
     * all field names, 2) filter with this.pattern.
     */
    private setTerms(state: SeedState): void {
        const data: SearchResponse | undefined = state.searchApi.queries[
            this.facetTermsQuery(state)
        ]?.data as SearchResponse | undefined;
        if (data !== undefined) {
            this.terms = toTermCountTuples(
                data.facet_counts?.facet_fields[this.field] as FacetTerms,
            );
        }
    }

    render() {
        return html`<ds-facet class="facet">
            <div slot="title" class="category">${this.field}</div>
            <div slot="main">${this.terms.map((t) => this.renderTerm(t))}</div>
        </div>`;
    }

    renderTerm(t: TermCountTuple) {
        return html`<seed-facet-term
            class="term"
            field="${this.field}"
            term="${t.term}"
            count="${t.count}"
        ></seed-facet-term>`;
    }

    static styles: CSSResultGroup = [
        css`
            .facet {
                border: 1px solid var(--window-border-color, lightblue);
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-facet": SeedFacet;
    }
}
