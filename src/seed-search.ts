import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { UnknownAction } from '@reduxjs/toolkit';

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { SearchQuery, initialSearchQuery } from "./redux/searchTypes";
import { SeedStore } from './redux/seed-store';


import log from "./logging";



/*
 * A simple web component for firing search queries.
 */
@customElement("seed-search")
export class SeedSearch extends storeConsumerMixin(LitElement) {

    @property({attribute: "initial-all", type: Boolean})
    initiateEmpty: boolean = false;

    @property()
    collection!: string;

    @property()
    delay: number = 500;

    query: SearchQuery = initialSearchQuery;

    override subscribeStore() {
	log.debug("subscribing seed-search");
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// updating the search query on changes of the search query
	// slice of thestore is required to get facets etc.
	this.store?.dispatch(addAppListener({
	    predicate: (_action: UnknownAction, currentState, previousState): boolean => {
		return currentState.searchQuery !== previousState.searchQuery;
	    },
	    effect:  (_action, listenerApi) => {
		this.query = listenerApi.getState().searchQuery;
	    },
	}));
	// initiate document query
	// TODO: This needs improval. Fixed delay time may be to
	// early. Find a working sequence!
	if (this.initiateEmpty) {
	    log.debug("running initial query for all documents");
	    //window.addEventListener("load", this.initialAll(this.store)); // too early!
	    window.setTimeout(this.initialAll(this.store), this.delay);
	}
	// not working replacement
	// if (this.initiateEmpty) {
	//     log.debug("initiating fields query", this.collection);
	//     this.store?.dispatch(searchApi.endpoints.fields.initiate(this.collection));
	//     // get name of facets from store: 1) get all field names, 2) filter with this.pattern
	//     this.store?.dispatch(addAppListener({
	// 	matcher: searchApi.endpoints.fields.matchFulfilled,
	// 	effect: async (_action, listenerApi) => {
	// 	    const q: SearchQuery = listenerApi.getState().searchQuery;
	// 	    listenerApi.dispatch(searchApi.endpoints.documents.initiate(q));
	// 	}
	//     }));
	// }
    }

    render() {
	return html`
	    <div>
		<button @click="${this.search}">Search!</button>
            </div>`;
    }

    search():void {
	log.debug("Search button hit!");
	this.store?.dispatch(searchApi.endpoints.documents.initiate(this.query));
    }

    initialAll(store: SeedStore | undefined) {
	return () => {
	    // We have to get the current query from the store,
	    // because it contains the facet fields.
	    const query: SearchQuery = store?.getState()?.searchQuery ?? initialSearchQuery;
	    store?.dispatch(searchApi.endpoints.documents.initiate(query));
	}
    }


}


declare global {
    interface HTMLElementTagNameMap {
	"seed-search": SeedSearch;
    }
}
