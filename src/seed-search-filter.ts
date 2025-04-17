import { html, LitElement, HTMLTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { storeConsumerMixin } from "./store-consumer-mixin";
import { removeFilter } from "./redux/searchQuerySlice";
import { searchApi } from "./redux/searchSlice";

/*
 * A web component for a removable search filter displayed in a filter status view.
 */
@customElement("seed-search-filter")
export class SeedSearchFilter extends storeConsumerMixin(LitElement) {
    @property()
    field!: string;

    @property()
    term!: string;

    override render(): HTMLTemplateResult {
        return html`<button class="removable-filter" type="button" @click="${this.rmFilter}" title="remove this filter">
	    <span class="remove-filter-symbol dispose">&#x1F5D9;</span>
	    <span>${this.field}</span><span class="field-term-sep">:</span
	    <span>${this.term}</span>
	</button>`;
    }

    rmFilter(): void {
        this.store?.dispatch(
            removeFilter({ field: this.field, term: this.term }),
        );
        // The filter endpoint has to be initiated, because the new
        // combination of filters may not have been queried before.
        // If no filters are applied any more, calling the documents
        // endpoint is not required. Is it?
        if (
            Object.keys(this.store?.getState()?.searchQuery?._fq_faceted ?? {})
                .length > 0
        ) {
            this.store?.dispatch(
                searchApi.endpoints.filter.initiate(
                    this.store?.getState()?.searchQuery,
                ),
            );
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-filter": SeedSearchFilter;
    }
}
