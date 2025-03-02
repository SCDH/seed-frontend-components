import { html, css, LitElement, CSSResultGroup } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from './redux/searchSlice';
import { addFilter, removeFilter } from './redux/searchQuerySlice';
import { FacetTerms, SearchResponse, toTermCountTuples, TermCountTuple, solrSearchQuery } from './redux/searchTypes';

import log from "./logging";



/*
 * The `seed-facet` web component renders a search facet.
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
	return html`<div class="term">
	    <input type="checkbox" id="${t.term}" name="${this.field}" value="${t.term}" @change="${this.changed(t.term)}">
	    <label for="${t.term}">${t.term}</label>
	    <span>${t.count}</span>
	</div>`;
    }

    changed = (term: string) => {
	return ((e: Event) => {
	    const origin: HTMLInputElement = e.composedPath()[0] as HTMLInputElement;
	    const checked: boolean = origin.checked ?? false;
	    log.debug("facet term changed: ", term, checked, this);
	    if (checked) {
		this.store?.dispatch(addFilter({field: this.field, term: term }));
		const s = this.store?.getState().searchQuery;
		log.debug("search query", s);
		if (s !== undefined) {
		    this.store?.dispatch(searchApi.endpoints.filter.initiate(s));
		}
	    } else {
		this.store?.dispatch(removeFilter({field: this.field, term: term }));
		const s = this.store?.getState().searchQuery;
		log.debug("search query", s);
		if (s !== undefined) {
		    this.store?.dispatch(searchApi.endpoints.filter.initiate(s));
		}
	    }
	});
    }

    static styles: CSSResultGroup = [
	css`.facet {
	    display: inline-block;
	    border: 1px solid var(--window-border-color, lightblue);
	    }
	    .catetory {

	    }`
    ]

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-facet": SeedFacet;
    }
}
