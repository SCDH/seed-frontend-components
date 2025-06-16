import { HTMLTemplateResult, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    StoreConsumerElement,
    useQuery,
    watch,
} from "@scdh/lit-redux-consumer";
import type { RTKQResponse } from "@scdh/lit-redux-consumer";

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
        // @ts-ignore: TODO: Why compile error?
        searchApi.endpoints.fields,
        (_s, c) => c?.collection ?? "unkonwn",
    )
    indexFields!: Array<String>;

    @state()
    @watch<SeedState, SeedResultDetails, RTKQResponse<SearchResponse>>(
        (s, c) =>
            searchApi.endpoints.document.select({
                query: s.searchQuery,
                documentId: c?.documentId ?? "?",
            })(s),
        {
            predicatePrecondition: (s, c): boolean => {
                log.debug("testing precondition");
                if (
                    c?.documentId != undefined &&
                    s.searchQuery != undefined &&
                    c.indexFields
                ) {
                    log.debug("precondition fulfilled");
                    return (
                        c?.documentId != undefined && s.searchQuery != undefined
                    );
                } else {
                    return false;
                }
            },
        },
    )
    result!: RTKQResponse<SearchResponse>;

    @state()
    document!: Document;

    @state()
    highlighting!: Document | undefined;

    private setFields(state: SeedState): void {
        const flds: Array<string> =
            (state.searchApi.queries?.[this.fieldsQueryId()]
                ?.data as Array<string>) ?? [];
        const fldRegex: RegExp = new RegExp(this.fieldPattern);
        const txtRegex: RegExp = new RegExp(this.textPattern);
        this.fields = flds.filter((f) => f.match(fldRegex));
        this.textFields = flds.filter((f) => f.match(txtRegex));
        log.debug(
            "setting query fields for details view",
            this.fields.concat(this.textFields),
        );
        this.store?.dispatch(
            setQueryFields(this.fields.concat(this.textFields)),
        );
    }

    private fieldsQueryId(): string {
        return searchApi.endpoints.fields.name + '("' + this.collection + '")';
    }

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has("indexFields") && this.store) {
            log.debug("indexFields updated");
            this.setFields(this.store.getState());
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
                    : undefined;
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
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-details": SeedResultDetails;
    }
}
