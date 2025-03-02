import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener, SeedListenerApi } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { addFilter, removeFilter } from './redux/searchQuerySlice';
import { SearchResponse, Document, solrSearchQuery } from "./redux/searchTypes";


import log from "./logging";



/*
 * A web component for displaying search results.
 */
@customElement("seed-search-result")
export class SeedSearchResult extends storeConsumerMixin(LitElement) {

    @state()
    documents: Array<Document> = [];

    @state()
    document_count: number = 0;

    @state()
    document_start: number = 0;

    override subscribeStore() {
	log.debug("subscribing seed-facet");
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// get documents from state store
	this.store?.dispatch(addAppListener({
	    matcher: searchApi.endpoints.documents.matchFulfilled,
	    effect: async (_action, listenerApi) => {
		const queryId: string = "documents(\"" + solrSearchQuery(listenerApi.getState().searchQuery).replaceAll("\"", "\\\"") + "\")";
		log.debug("api document initiated", queryId, listenerApi.getState().searchApi.queries.hasOwnProperty(queryId));
		const data: SearchResponse = listenerApi.getState().searchApi.queries[queryId]?.data as SearchResponse;
		this.document_count = data.response.numFound;
		this.document_start = data.response.start;
		this.documents = data.response.docs;
	    }
	}));
	this.store?.dispatch(addAppListener({
	    matcher: searchApi.endpoints.filter.matchFulfilled,
	    effect: async (_action, listenerApi) => {
		const queryId: string = "filter(\"" + solrSearchQuery(listenerApi.getState().searchQuery).replaceAll("\"", "\\\"") + "\")";
		log.debug("api filter initiated", queryId, listenerApi.getState().searchApi.queries.hasOwnProperty(queryId));
		const data: SearchResponse = listenerApi.getState().searchApi.queries[queryId]?.data as SearchResponse;
		this.document_count = data.response.numFound;
		this.document_start = data.response.start;
		this.documents = data.response.docs;
	    }
	}));
	// get result for search queries already initiated
	// 1. filter removed, result already present from document(...) query
	this.store?.dispatch(addAppListener({
	    matcher: removeFilter.match,
	    effect: (_action, listenerApi) => this.updateEffect(searchApi.endpoints.documents.name, listenerApi),
	}));
	// 2. filter removed, result already present from filter(...) query
	this.store?.dispatch(addAppListener({
	    matcher: removeFilter.match,
	    effect: (_action, listenerApi) => this.updateEffect(searchApi.endpoints.filter.name, listenerApi),
	}));
	// 2. filter added, result already present from filter(...) query
	this.store?.dispatch(addAppListener({
	    matcher: addFilter.match,
	    effect: (_action, listenerApi) => this.updateEffect(searchApi.endpoints.filter.name, listenerApi),
	}));
    }

    updateEffect(endpoint: string, listenerApi: SeedListenerApi): void {
	const queryId: string = endpoint + "(\"" + solrSearchQuery(listenerApi.getState().searchQuery).replaceAll("\"", "\\\"") + "\")";
	log.debug("filter removed", queryId, listenerApi.getState().searchApi.queries.hasOwnProperty(queryId));
	const data: SearchResponse | undefined = listenerApi.getState().searchApi.queries[queryId]?.data as SearchResponse | undefined;
	if (data !== undefined) {
	    this.document_count = data.response.numFound;
	    this.document_start = data.response.start;
	    this.documents = data.response.docs;
	}
    }

    render() {
	return html`<div>
                ${this.renderDocumentCount()}
            </div>`;
    }

    renderDocumentCount() {
	return html`<div><span>Documents found:</span><span>${this.document_count}</span></div>`;
    }

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-search-result": SeedSearchResult;
    }
}
