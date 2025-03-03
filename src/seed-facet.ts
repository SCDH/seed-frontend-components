import { html, css, LitElement, CSSResultGroup } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from './redux/searchSlice';
//import { addFilter, removeFilter } from './redux/searchQuerySlice';
import { FacetTerms, SearchResponse, toTermCountTuples, TermCountTuple, solrSearchQuery } from './redux/searchTypes';

import log from "./logging";



/*
 * The `seed-facet` web component renders a search facet.
 *
 * If this component is used, the seed-facet-term component
 * has to be loaded, too.
 */
@customElement("seed-facet")
export class SeedFacet extends storeConsumerMixin(LitElement) {

    @property()
    field!: string;

    @property()
    threshold: number = 0;

    @state()
    terms: Array<TermCountTuple> = [];

    async subscribeStore() {
	log.debug("subscribing seed-facet");
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// get name of facets from store: 1) get all field names, 2) filter with this.pattern
	this.store?.dispatch(addAppListener({
	    matcher: searchApi.endpoints.documents.matchFulfilled,
	    effect: async (_action, listenerApi) => {
		log.debug("api", listenerApi.getState().searchApi.queries);
		const queryId: string = searchApi.endpoints.documents.name + "(\"" + solrSearchQuery(listenerApi.getState().searchQuery).replaceAll("\"", "\\\"") + "\")";
		const data: SearchResponse | undefined = listenerApi.getState().searchApi.queries[queryId]?.data as SearchResponse | undefined;
		if (data !== undefined) {
		    this.terms = toTermCountTuples(data.facet_counts?.facet_fields[this.field] as FacetTerms);
		}
	    }
	}));
    }

    render() {
	return html`<div class="facet">
	    <div class="category">Facet: ${this.field}</div>
	    <div>
		${this.terms.map(t => this.renderTerm(t))}
	    </div>
	</div>`;
    }

    renderTerm(t: TermCountTuple) {
	return html`<seed-facet-term class="term" field="${this.field}" term="${t.term}" count="${t.count}"></seed-facet-term>`;
    }

    static styles: CSSResultGroup = [
	css`.facet {
	    border: 1px solid var(--window-border-color, lightblue);
	    display: flex;
	    flex-direction: column;
	    flex-wrap: nowrap;
	    }`
    ]

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-facet": SeedFacet;
    }
}
