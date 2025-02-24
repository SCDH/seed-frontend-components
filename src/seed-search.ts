import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { UnknownAction } from '@reduxjs/toolkit';

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { SearchQuery, initialSearchQuery } from "./redux/searchTypes";


import log from "./logging";



/*
 * A simple web component for firing search queries.
 */
@customElement("seed-search")
export class SeedSearch extends storeConsumerMixin(LitElement) {

    query: SearchQuery = initialSearchQuery;

    override subscribeStore() {
	log.debug("subscribing seed-facets");
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
    }

    render() {
	return html`
	    <div>
		<button @click="${this.search}">Search!</button>
		<button @click="${this.fields}">Fields?</button>
            </div>`;
    }

    search():void {
	log.debug("Search button hit!");
	this.store?.dispatch(searchApi.endpoints.documents.initiate(this.query));
    }

    fields():void {
	log.debug("Fields button hit!");
	this.store?.dispatch(searchApi.endpoints.fields.initiate("tei4"));
    }

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-search": SeedSearch;
    }
}
