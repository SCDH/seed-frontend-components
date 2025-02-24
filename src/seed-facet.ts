import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from './redux/searchSlice';
import { FacetTerms, SearchResponse } from './redux/searchTypes';

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
    terms: FacetTerms = [];

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
		// TODO: better way to access query response
		for (var q in listenerApi.getState().searchApi.queries) {
		    if (q.startsWith("documents")) {
			const data: SearchResponse = listenerApi.getState().searchApi.queries[q]?.data as SearchResponse;
			log.debug("data", data.facet_counts?.facet_fields[this.field]);
			this.terms = data.facet_counts?.facet_fields[this.field] as FacetTerms;
			break;
		    }
		}
		//this.terms = action.payload.response?.facet_counts?.facet_fields?[this.field] : [];
		log.debug("terms", this.terms);
	    }
	}));
    }

    render() {
	return html`<div><div>Facet: ${this.field}</div><div .innerHTML="${this.renderTerms()}"></div></div>`;
    }

    renderTerms() {
	log.debug("rendering terms");
	var i: number = 0;
	var rc: string = "";
	while (i < this.terms.length) {
	    log.debug(this.terms[i], this.terms[i+1]);
	    rc += `<div><span>${this.terms[i]}</span> <span>${this.terms[i+1]}</span></div>`;
	    i += 2;
	}
	return rc;
    }


}


declare global {
    interface HTMLElementTagNameMap {
	"seed-facet": SeedFacet;
    }
}
