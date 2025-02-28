import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { SearchResponse, Document } from "./redux/searchTypes";


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
		log.debug("api", listenerApi.getState().searchApi.queries);
		// TODO: better way to access query response
		for (var q in listenerApi.getState().searchApi.queries) {
		    if (q.startsWith("documents")) {
			const data: SearchResponse = listenerApi.getState().searchApi.queries[q]?.data as SearchResponse;
			log.debug("data", data.response);
			this.document_count = data.response.numFound;
			this.document_start = data.response.start;
			this.documents = data.response.docs;
			break;
		    }
		}
	    }
	}));
    }

    render() {
	return html`<div>
                ${this.renderDocumentCount()}
            </div>`;
    }

    renderDocumentCount() {
	return html`<div><span>Documents found:<span><span>${this.document_count}</span></div>`;
    }

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-search-result": SeedSearchResult;
    }
}
