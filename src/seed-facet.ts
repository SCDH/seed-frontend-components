import { html, css, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
//import { addFilter, removeFilter } from './redux/searchQuerySlice';
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

    protected override subscribeStore() {
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
                    this.nonFilteredQuery(this.store.getState()),
                )
        ) {
            this.setTerms(this.store.getState());
        } else {
            // Otherwise we set up a listener which set the terms when
            // the query is processed.
            this.store?.dispatch(
                addAppListener({
                    matcher: searchApi.endpoints.documents.matchFulfilled,
                    effect: async (_action, listenerApi) => {
                        log.debug(
                            "api",
                            listenerApi.getState().searchApi.queries,
                        );
                        this.setTerms(listenerApi.getState());
                    },
                }),
            );
        }
    }

    /*
     * Returns the query ID of the non-filtered query, which is is
     * used for making up terms with correct counts.
     */
    private nonFilteredQuery(state: SeedState): string {
        return (
            searchApi.endpoints.documents.name +
            '("' +
            solrSearchQuery(state.searchQuery).replaceAll('"', '\\"') +
            '")'
        );
    }

    /*
     * Set the terms property. Get name of facets from store: 1) get
     * all field names, 2) filter with this.pattern.
     */
    private setTerms(state: SeedState): void {
        const data: SearchResponse | undefined = state.searchApi.queries[
            this.nonFilteredQuery(state)
        ]?.data as SearchResponse | undefined;
        if (data !== undefined) {
            this.terms = toTermCountTuples(
                data.facet_counts?.facet_fields[this.field] as FacetTerms,
            );
        }
    }

    render() {
        return html`<div class="facet">
            <div class="category">Facet: ${this.field}</div>
            <div>${this.terms.map((t) => this.renderTerm(t))}</div>
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
