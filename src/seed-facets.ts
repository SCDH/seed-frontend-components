import { html, css, LitElement, CSSResultGroup } from 'lit'
import { customElement, property, state, } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { addAppListener } from "./redux/seed-store";
import { searchApi } from './redux/searchSlice';
import { addFacetFields } from './redux/searchQuerySlice';

import log from "./logging";



/*
 * The `seed-facets` web component is a container for search
 * facets. It takes a regex pattern for filtering a list of fields of
 * the search engine, each of which it generates a facet for. The
 * generated facets are based on the `seed-facet` (singular) web
 * component.
 *
 * If you need a fixed list of fields, simply use regex groups like
 * this: `pattern="^(cat1|cat2)$"`.
 *
 * If this web component is used, the seed-facet and seed-facet-term
 * web components need to be loaded, too.
 */
@customElement("seed-facets")
export class SeedFacets extends storeConsumerMixin(LitElement) {

    /*
     * The `pattern` attribute takes a regex which is used to filter
     * out the fields (categories) of the search index, for which
     * facets are to be generated.
     */
    @property()
    pattern: string = ".*_ss$";

    @state()
    fields: Array<string> = [];

    @property()
    collection!: string;

    override subscribeStore() {
	log.debug("subscribing seed-facets");
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// This container initiates a query to the fields endpoint,
	// because without a set of fields, it cannot make up the
	// facets given by pattern.
	if (this.collection !== undefined) {
	    log.debug("initiating fields query", this.collection);
	    this.store?.dispatch(searchApi.endpoints.fields.initiate(this.collection));
	}
	// get name of facets from store: 1) get all field names, 2) filter with this.pattern
	this.store?.dispatch(addAppListener({
	    matcher: searchApi.endpoints.fields.matchFulfilled,
	    effect: async (_action, listenerApi) => {
		const pattern: RegExp = new RegExp(this.pattern);
		log.debug("search result updated", listenerApi.getState().searchApi);
		const flds: Array<string> = listenerApi.getState().searchApi?.queries?.[this.queryName()]?.data as Array<string> ?? [];
		log.debug("facet fields", flds);
		// store facet fields as local state
		this.fields  = flds.filter(f => f.match(pattern));
		// add facet fields to search query
		this.store?.dispatch(addFacetFields(this.fields));
	    }
	}));
    }

    /*
     * Make the query name, which is `fields("COLLECTION")` where
     * `COLLECTION` is the collection parameter passed to the `fields`
     * endpoint.
     */
    private queryName(): string {
	return searchApi.endpoints.fields.name + '(\"' + this.collection + '\")';
    }

    override render() {
	return html`<div class="facets">
	    <div class="title">
		<slot name="title">Facets ${this.pattern}</slot>
	    </div>
	    <div class="container">
		${this.fields.map(f => this.renderFacet(f))}
	    </div>
	</div>`
    }

    renderFacet(field: string) {
	log.debug("rendering facet", field);
	return html`<seed-facet collection="${this.collection}" field="${field}"></seed-facet>`;
    }

    static styles: CSSResultGroup = [
	css`.facets {
	    }
	    .container {
	    display: flex;
	    flex-direction: column;
	    }`
    ]

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-facets": SeedFacets;
    }
}
