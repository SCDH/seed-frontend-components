import {
    html,
    css,
    CSSResultGroup,
    HTMLTemplateResult,
    nothing,
    PropertyValues,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { UnsubscribeListener } from "@reduxjs/toolkit";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";

import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { addFilter, removeFilter } from "./redux/searchQuerySlice";
import { FacetFilterQuery } from "./redux/searchTypes";

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

    @state()
    active: boolean = false;

    @query("input")
    checkbox!: HTMLInputElement;

    subscribeStore() {
        log.debug("subscribing seed-facet-term");
        if (this.store === undefined) {
            log.debug("no store yet for element ", this.id);
            return;
        }
        // look up the state, if term is active
        const terms: FacetFilterQuery | undefined =
            this.store.getState().searchQuery._fq_faceted ?? {};
        this.active = (terms[this.field] ?? []).includes(this.term);
        // subscribe to addFilter actions
        let unsubscriber = this.store?.dispatch(
            addAppListener({
                actionCreator: addFilter,
                effect: async (action, _listenerApi) => {
                    // log.debug("facet term added", action.payload);
                    if (
                        action.payload.field == this.field &&
                        action.payload.term == this.term
                    ) {
                        this.active = true;
                    }
                },
            }),
        );
        this._unsubscribers.push(
            unsubscriber as unknown as UnsubscribeListener,
        );
        // subscribe to addFilter actions
        unsubscriber = this.store?.dispatch(
            addAppListener({
                actionCreator: removeFilter,
                effect: async (action, _listenerApi) => {
                    if (
                        action.payload.field == this.field &&
                        action.payload.term == this.term
                    ) {
                        log.debug("facet term de-activated", action.payload);
                        this.active = false;
                    }
                },
            }),
        );
        this._unsubscribers.push(
            unsubscriber as unknown as UnsubscribeListener,
        );
    }

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        // It is required to set checkbox.checked to make things work in Lit template.
        if (changedProperties.has("active") && this.checkbox) {
            this.checkbox.checked = this.active;
        }
    }

    /*
     * Makes the id attribute value for the check box.
     */
    inputId(): string {
        return `${this.field}.${this.term}`;
    }

    render(): HTMLTemplateResult {
        if (this.count > 0) {
            return html`<div class="term">
<input type="checkbox" id="${this.inputId()}" name="${this.inputId()}" @change="${this.changed}" ?checked="${this.active || nothing}"></input>
<label for="${this.inputId()}">
<seed-data-label class="label-content" key="${this.term}"></seed-data-label>
</label>
<span class="count">${this.count}</span>
</div>`;
        } else {
            return html``;
        }
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
