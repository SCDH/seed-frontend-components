import { html, HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { SeedState, addAppListener } from "./redux/seed-store";
import { addFilter, removeFilter } from "./redux/searchQuerySlice";

import log from "./logging";

/*
 * A web component that shows which search filters are applied.
 *
 * If this component is used, `seed-search-filter` (singular!)
 * must be used, too.
 */
@customElement("seed-search-filters")
export class SeedSearchFilters extends StoreConsumerElement<SeedState, any> {
    @state()
    filters: Array<{ field: string; term: string }> = [];

    @state()
    count: number = 0;

    override subscribeStore(): void {
        // filter added
        this.store?.dispatch(
            addAppListener({
                matcher: addFilter.match,
                effect: (action, _listenerApi) => {
                    log.debug("search filter added", action.payload);
                    this.filters.push(
                        JSON.parse(JSON.stringify(action.payload)),
                    ); // deep copy
                    this.count++;
                },
            }),
        );
        // filter removed
        this.store?.dispatch(
            addAppListener({
                matcher: removeFilter.match,
                effect: (action, _listenerApi) => {
                    log.debug("search filter removed", action.payload);
                    this.filters = this.filters.filter(
                        (f) =>
                            !(
                                f.field == action.payload.field &&
                                f.term == action.payload.term
                            ),
                    );
                    this.count--;
                },
            }),
        );
    }

    override render(): HTMLTemplateResult {
        log.debug("rendering search filters:", this.filters);
        return html`<div class="search-filters">
            <div class="title">
                <slot name="title">Search filters (${this.count})</slot>
            </div>
            <div class="filters">${this.filters.map(this.renderFilter)}</div>
        </div>`;
    }

    renderFilter(filter: { field: string; term: string }): HTMLTemplateResult {
        log.debug("search filter", filter);
        return html`<seed-search-filter
            field="${filter.field}"
            term="${filter.term}"
            }
        ></seed-search-filter>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-filters": SeedSearchFilters;
    }
}
