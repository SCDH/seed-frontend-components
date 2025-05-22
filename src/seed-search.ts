import { html, css, HTMLTemplateResult, CSSResultGroup } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { UnknownAction } from "@reduxjs/toolkit";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";

import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { SearchQuery, initialSearchQuery } from "./redux/searchTypes";
import {
    simpleQuery,
    resetQuery,
    setDefaultField,
    resetDefaultField,
} from "./redux/searchQuerySlice";
import { SeedStore } from "./redux/seed-store";

import log from "./logging";

/*
 * A simple web component for firing search queries.
 */
@customElement("seed-search")
export class SeedSearch extends StoreConsumerElement<SeedState, any> {
    @property({ attribute: "initial-all", type: Boolean })
    initiateEmpty: boolean = false;

    @property()
    collection!: string;

    @property()
    delay: number = 500;

    query: SearchQuery = initialSearchQuery;

    @query("#search")
    input!: HTMLInputElement;

    @property()
    field!: string;

    override subscribeStore() {
        log.debug("subscribing seed-search");
        if (this.store === undefined) {
            log.debug("no store yet for element with Id ", this.id);
        }
        // updating the search query on changes of the search query
        // slice of thestore is required to get facets etc.
        this.store?.dispatch(
            addAppListener({
                predicate: (
                    _action: UnknownAction,
                    currentState,
                    previousState,
                ): boolean => {
                    return (
                        currentState.searchQuery !== previousState.searchQuery
                    );
                },
                effect: (_action, listenerApi) => {
                    this.query = listenerApi.getState().searchQuery;
                },
            }),
        );
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

    render(): HTMLTemplateResult {
        return html`<host>
<div class="search-form-wrapper">
<input id="search" name="search" type="text" placeholder="search"></input/>
<button @click="${this.search}">🔍</button>
</div>
</host>`;
    }

    static styles: CSSResultGroup = [
        css`
            host {
            }
            .search-form-wrapper {
                display: flex;
                flex-direction: row;
                border: 1px solid red;
                border-radius: 25px;
                padding: 6px 12px;
            }
            .search-form-wrapper input,
            .search-form-wrapper button {
                border: none;
                background-color: inherit;
            }
        `,
    ];

    search(): void {
        log.debug("Search button hit!");
        if (this.input?.value === "" && this.input?.value === undefined) {
            this.store?.dispatch(resetQuery());
        } else {
            this.store?.dispatch(simpleQuery(this.input.value));
        }
        if (this.field) {
            this.store?.dispatch(setDefaultField(this.field));
        } else {
            this.store?.dispatch(resetDefaultField());
        }
        this.store?.dispatch(
            searchApi.endpoints.documents.initiate(this.query),
        );
    }

    initialAll(store: SeedStore | undefined) {
        return () => {
            // We have to get the current query from the store,
            // because it contains the facet fields.
            const query: SearchQuery =
                store?.getState()?.searchQuery ?? initialSearchQuery;
            store?.dispatch(searchApi.endpoints.documents.initiate(query));
        };
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search": SeedSearch;
    }
}
