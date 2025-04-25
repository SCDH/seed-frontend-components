import { html, css, CSSResultGroup, HTMLTemplateResult, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { addFilter, removeFilter } from "./redux/searchQuerySlice";

import log from "./logging";

/*
 * The `seed-facet-term` web component renders a single search term for facet.
 */
@customElement("seed-facet-term")
export class SeedFacetTerm extends StoreConsumerElement<SeedState, any> {
    @property()
    field!: string;

    @property()
    term!: string;

    @property()
    count!: number;

    @property()
    active: boolean = false;

    @query("input")
    checkbox!: HTMLInputElement;

    async subscribeStore() {
        log.debug("subscribing seed-facet-term");
        if (this.store === undefined) {
            log.debug("no store yet for element with Id ", this.id);
        }
        // subscribe to addFilter actions
        this.store?.dispatch(
            addAppListener({
                actionCreator: addFilter,
                effect: async (action, _listenerApi) => {
                    log.debug("facet term added", action.payload);
                    if (
                        action.payload.field == this.field &&
                        action.payload.term == this.term
                    ) {
                        this.active = true;
                        this.checkbox.checked = true; // required
                    }
                },
            }),
        );
        // subscribe to addFilter actions
        this.store?.dispatch(
            addAppListener({
                actionCreator: removeFilter,
                effect: async (action, _listenerApi) => {
                    if (
                        action.payload.field == this.field &&
                        action.payload.term == this.term
                    ) {
                        log.debug("facet term de-activated", action.payload);
                        this.active = false;
                        this.checkbox.checked = false; // required
                    }
                },
            }),
        );
    }

    /*
     * Makes the id attribute value for the check box.
     */
    inputId(): string {
        return `${this.field}.${this.term}`;
    }

    render(): HTMLTemplateResult {
        return html`<div class="term">
	    <input type="checkbox" id="${this.inputId()}" name="${this.inputId()}" @change="${this.changed}" ?checked="${this.active || nothing}"></input>
	    <label for="${this.inputId()}">
		<span class="label-content">${this.term}</span>
	    </label>
	    <span class="count">${this.count}</span>
	</div>`;
    }

    isChecked(): HTMLTemplateResult {
        if (this.active) {
            return html``;
        } else {
            return html`checked`;
        }
    }

    changed(e: Event) {
        const origin: HTMLInputElement =
            e.composedPath()[0] as HTMLInputElement;
        const checked: boolean = origin.checked ?? false;
        log.debug("facet term changed: ", this.term, checked, this);
        if (checked) {
            this.store?.dispatch(
                addFilter({ field: this.field, term: this.term }),
            );
            const s = this.store?.getState().searchQuery;
            log.debug("search query", s);
            if (s !== undefined) {
                this.store?.dispatch(searchApi.endpoints.filter.initiate(s));
            }
        } else {
            this.store?.dispatch(
                removeFilter({ field: this.field, term: this.term }),
            );
            const s = this.store?.getState().searchQuery;
            log.debug("search query", s);
            if (s !== undefined) {
                this.store?.dispatch(searchApi.endpoints.filter.initiate(s));
            }
        }
    }

    static styles: CSSResultGroup = [
        css`
            .term {
                width: 100%;
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
            }
            label {
                flex-shrink: 10;
                overflow: hidden;
                position: relative;
            }
            label .label-content {
                overflow: fade(10%);
                text-align: justify;
                white-space: nowrap;
            }
            .count {
                margin-left: 0.75em !important;
                font-weight: 700;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-facet-term": SeedFacetTerm;
    }
}
