import { HTMLTemplateResult, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { provide } from "@lit/context";
import {
    StoreConsumerElement,
    useQuery,
    watch,
} from "@scdh/lit-redux-consumer";
import type { RTKQResponse } from "@scdh/lit-redux-consumer";

import type { SeedText } from "./types";
import { seedTextContext } from "./seed-context";
import { SeedState } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { setQueryFields } from "./redux/searchQuerySlice";
import { SearchResponse, Document } from "./redux/searchTypes";
import log from "./logging";

/*
 * The `<seed-result-detail>` custom element shows a single document
 * from the search result.
 *
 * Which document is shown, is determined by the two attributes
 * `collection` and `doc-id`. Therefore, this component initiates a
 * query to the Solr search engine.
 *
 */
@customElement("seed-result-details")
export class SeedResultDetails extends StoreConsumerElement<SeedState, any> {
    /*
     * The collection of the search engine.
     */
    @property()
    collection!: string;

    /*
     * The identifier of the document inside the collection.
     */
    @property({ attribute: "doc-id" })
    documentId!: string;

    @property({ attribute: "field-pattern" })
    fieldPattern: string = "^(meta|author|title)";

    @state()
    fields!: Array<string>;

    @property({ attribute: "text-pattern" })
    textPattern: string = "^(html_htm_)";

    @state()
    textFields!: Array<string>;

    @useQuery<SeedState, SeedResultDetails, string, Array<String>>(
        searchApi.endpoints.fields,
        (_s, c) => c.collection ?? "unkonwn",
    )
    indexFields!: Array<string>;

    @state()
    @watch<SeedState, SeedResultDetails, RTKQResponse<SearchResponse>>(
        (s, c) =>
            searchApi.endpoints.document.select({
                query: s.searchQuery,
                documentId: c.documentId ?? "?",
            })(s),
        {
            precondition: (s, c): boolean =>
                c.documentId != undefined &&
                s.searchQuery != undefined &&
                c.indexFields != undefined,
        },
    )
    result!: RTKQResponse<SearchResponse>;

    @state()
    document!: Document;

    @state()
    highlighting!: Document | undefined;

    @state()
    @provide({ context: seedTextContext })
    text!: SeedText;

    private setFields(): void {
        const fldRegex: RegExp = new RegExp(this.fieldPattern);
        const txtRegex: RegExp = new RegExp(this.textPattern);
        this.fields = this.indexFields.filter((f) => f.match(fldRegex));
        this.textFields = this.indexFields.filter((f) => f.match(txtRegex));
    }

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has("indexFields") && this.store) {
            log.debug("indexFields updated");
            this.setFields();
            log.debug(
                "setting query fields for details view",
                this.fields.concat(this.textFields),
            );
            // set qf for next search query
            this.store?.dispatch(
                setQueryFields(this.fields.concat(this.textFields)),
            );
            // initiate query for document
            this.store?.dispatch(
                searchApi.endpoints.document.initiate({
                    query: this.store.getState().searchQuery,
                    documentId: this.documentId,
                }),
            );
        }
        // When the result comes in, also set the `document` property
        // from the result.
        if (changedProperties.has("result")) {
            log.debug(
                "result was updated",
                changedProperties.get("result"),
                this.result,
            );
            if (this.result?.data) {
                this.document = this.result.data.response.docs[0];
                this.highlighting = this.result.data.highlighting
                    ? [this.documentId]
                    : this.document;
                if (this.highlighting !== undefined) {
                    const txtRegex: RegExp = new RegExp(this.textPattern);
                    const txtFld: string | undefined = Object.keys(
                        this.highlighting,
                    )
                        .filter((f) => f.match(txtRegex))
                        .find((x) => x !== undefined);
                    if (txtFld !== undefined) {
                        this.text = {
                            text: this.highlighting[txtFld],
                            id: this.documentId,
                        };
                    }
                }
            }
        }
    }

    protected override render(): HTMLTemplateResult {
        log.info(
            "renderiing seed-result-details",
            this?.indexFields,
            this?.result,
        );
        if (this.result?.data == undefined) {
            return html`Getting document with ID ${this.documentId} ...
            ${this.result?.status ?? "not yet initialized"}`;
        }
        return html`<div>
            <div>
                ${this.result.data.response.numFound ?? "failed"}
                ${this.document.id}
            </div>
            <seed-result-doc
                collection="${this.collection}"
                doc-id="${this.documentId}"
                .document="${this.document}"
                .highlight="${this.highlighting}"
                pattern="${this.fieldPattern}"
            ></seed-result-doc>
            <div>${this.indexFields}</div>
            <div class="text"><seed-text-widget></seed-text-widget></div>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-details": SeedResultDetails;
    }
}
