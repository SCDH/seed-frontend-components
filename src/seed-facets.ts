import { html, css, CSSResultGroup, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { StoreConsumerElement, useQuery } from "@scdh/lit-redux-consumer";

import { SeedState } from "./redux/seed-store";
import type { SearchQuery } from "./redux/searchTypes";
import { searchApi } from "./redux/searchSlice";
import { addFacetFields } from "./redux/searchQuerySlice";

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
export class SeedFacets extends StoreConsumerElement<SeedState, any> {
    /*
     * The `pattern` attribute takes a regex which is used to filter
     * out the fields (categories) of the search index, for which
     * facets are to be generated.
     */
    @property()
    pattern: string = ".*_ss$";

    /**
     * The list of fields to make facets from.
     */
    @state()
    fields: Array<string> = [];

    @property()
    collection!: string;

    /**
     * Gets and stores the fields of the index/collection.
     */
    @useQuery<SeedState, SeedFacets, SearchQuery, Array<String>>(
        searchApi.endpoints.fields,
        (s, _c) => s.searchQuery,
    )
    indexFields!: Array<string>;

    /**
     * @inheritdoc
     */
    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has("indexFields") && this.store) {
            // set fields property
            const pattern: RegExp = new RegExp(this.pattern);
            this.fields = this.indexFields
                .filter((f) => f.match(pattern))
                .map((f) => f.trim());
            log.debug("setting up facets", this, this.fields);
            // set fields as facet fields
            this.store?.dispatch(addFacetFields(this.fields));
        }
    }

    /**
     * @inheritdoc
     */
    protected override render() {
        return html`<div class="facets">
            <div class="title">
                <slot name="title">Facets ${this.pattern}</slot>
            </div>
            <div class="container">
                ${this.fields.map((f) => this.renderFacet(f))}
            </div>
        </div>`;
    }

    /**
     * Render a single facet.
     */
    protected renderFacet(field: string) {
        log.debug("rendering facet", field);
        return html`<seed-facet
            collection="${this.collection}"
            field="${field}"
        ></seed-facet>`;
    }

    static styles: CSSResultGroup = [
        css`
            .facets {
            }
            .container {
                display: flex;
                flex-direction: column;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-facets": SeedFacets;
    }
}
