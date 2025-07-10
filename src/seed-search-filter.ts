import { html, HTMLTemplateResult, css, CSSResultArray } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";

import { removeFilter } from "./redux/searchQuerySlice";
import { searchApi } from "./redux/searchSlice";
import { SeedState } from "./redux/seed-store";

/*
 * A web component for a removable search filter displayed in a filter status view.
 */
@customElement("seed-search-filter")
export class SeedSearchFilter extends StoreConsumerElement<SeedState, any> {
    @property()
    field!: string;

    @property()
    term!: string;

    override render(): HTMLTemplateResult {
        return html`<button
            class="removable-filter"
            type="button"
            @click="${this.rmFilter}"
            title="remove this filter"
        >
            <span class="unicode-icon dispose">&#x1F5D9;</span>
            <seed-data-label key="${this.field}"></seed-data-label
            ><span class="field-term-sep">:</span>
            <seed-data-label key="${this.term}"></seed-data-label>
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

    static styles: CSSResultArray = [
        css`
            .unicode-icon {
                font-family: var(--icon-font, Helvetica, Arial, sans-serif);
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-filter": SeedSearchFilter;
    }
}
