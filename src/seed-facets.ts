import { html, css, LitElement, CSSResultGroup, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { UnknownAction } from '@reduxjs/toolkit';
import { provide } from '@lit/context';
import { QuerySubState } from '@reduxjs/toolkit/query';

import { storeConsumerMixin } from './store-consumer-mixin';

import { addAppListener, SeedState } from "./redux/seed-store";
import { searchApi } from './redux/searchSlice';

import log from "./logging";



// define the web component
@customElement("seed-facets")
export class SeedFacets extends storeConsumerMixin(LitElement) {

    @property()
    pattern: string = ".*_ss$";

    @state()
    fields: Array<String> = [];

    @state()
    collection: string = "";

    async subscribeStore() {
	log.debug("subscribing seed-facets");
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// TODO: get from store
	this.collection = "tei4";
	// get name of facets from store: 1) get all field names, 2) filter with this.pattern
	this.store?.dispatch(addAppListener({
	    matcher: searchApi.endpoints.fields.matchFulfilled,
	    effect: async (_action, listenerApi) => {
		const pattern: RegExp = new RegExp(this.pattern);
		log.debug("search result updated", listenerApi.getState().searchApi);
		const flds: Array<string> = listenerApi.getState().searchApi.queries?.[this.queryName()]?.data as Array<string> ?? [];
		log.debug("facet fields", flds);
		this.fields  = flds.filter(f => f.match(pattern));
	    }
	}));
    }

    protected queryName(): string {
	// TODO
	return 'fields(\"' + this.collection + '\")';
    }

    render() {
	return html`<div>Facets:<div>${this.fields}</div></div>`;
    }

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-facets": SeedFacets;
    }
}
