import { html, css, LitElement, CSSResultGroup, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { UnknownAction } from '@reduxjs/toolkit';
import { provide } from '@lit/context';
import { QuerySubState } from '@reduxjs/toolkit/query';

import { storeConsumerMixin } from './store-consumer-mixin';

import { addAppListener, SeedState } from "./redux/seed-store";
import { searchApi } from './redux/searchSlice';
import { SearchQuery } from './redux/searchTypes';

import log from "./logging";



// define the web component
@customElement("seed-facets")
export class SeedFacets extends storeConsumerMixin(LitElement) {

    query: SearchQuery = { q: "*%3A*", collection: "tei4" }


    @property()
    pattern: string = "^about.*_ss$";

    @state()
    fields: Array<String> = [];

    async subscribeStore() {
	log.debug("subscribing seed-facets");
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// This kind of subscription with store.dispatch(addListener(...)) needs a store with listener middleware, see
	// https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware
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
	return 'fields({"collection":"tei4","q":"*%3A*"})';
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
