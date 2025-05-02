import { html, HTMLTemplateResult, css, CSSResultGroup } from "lit";
import { customElement, state, property } from "lit/decorators.js";

import { SearchResultElement } from "./search-result-mixin";
import { SeedListenerApi, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { SearchResponse, Document, solrSearchQuery } from "./redux/searchTypes";
import { addFl } from "./redux/searchQuerySlice";

import log from "./logging";

/*
 * A web component for displaying search results.
 */
@customElement("seed-search-result")
export class SeedSearchResult extends SearchResultElement {
    @property()
    collection!: string;

    @property({ attribute: "field-pattern" })
    fieldPattern: string = "^(meta|author|title)";

    /*
     * Path segment to search, used for in the path to details
     * view. This is passed through to all the links to detail pages.
     */
    @property({ attribute: "search-path" })
    searchPath: string = "/search/";

    @state()
    documents: Array<Document> = [];

    @state()
    document_count: number = 0;

    @state()
    document_start: number = 0;

    override subscribeStore(): void {
        // add fields to be included in the response, by adding them to the query parameter fl
        this.store?.dispatch(
            addAppListener({
                matcher: searchApi.endpoints.fields.matchFulfilled,
                effect: (_action, listenerApi) => {
                    const queryId: string =
                        searchApi.endpoints.fields.name +
                        '("' +
                        this.collection +
                        '")';
                    const flds: Array<string> =
                        (listenerApi.getState().searchApi?.queries?.[queryId]
                            ?.data as Array<string>) ?? [];
                    const regex: RegExp = new RegExp(this.fieldPattern);
                    const fl: Array<string> = flds.filter((f) =>
                        f.match(regex),
                    );
                    log.debug("adding fields to query", queryId, fl);
                    listenerApi.dispatch(addFl(fl));
                },
            }),
        );
        super.subscribeStore();
    }

    override updateEffect(
        endpoint: string,
        listenerApi: SeedListenerApi,
    ): void {
        const queryId: string =
            endpoint +
            '("' +
            solrSearchQuery(listenerApi.getState().searchQuery).replaceAll(
                '"',
                '\\"',
            ) +
            '")';
        log.debug(
            "updating search result",
            queryId,
            listenerApi.getState().searchApi.queries.hasOwnProperty(queryId),
        );
        const data: SearchResponse | undefined = listenerApi.getState()
            .searchApi.queries[queryId]?.data as SearchResponse | undefined;
        if (data !== undefined) {
            this.document_count = data.response.numFound;
            this.document_start = data.response.start;
            this.documents = data.response.docs;
        }
    }

    override render(): HTMLTemplateResult {
        return html`<div>
            ${this.renderDocumentCount()}
            <div class="result-documents">
                ${this.documents.map((d) =>
                    this.renderDocument(d, this.fieldPattern),
                )}
            </div>
        </div>`;
    }

    renderDocumentCount(): HTMLTemplateResult {
        return html`<div>
            <span>Documents found:</span><span>${this.document_count}</span>
        </div>`;
    }

    renderDocument(doc: Document, fieldPattern: string): HTMLTemplateResult {
        // Mind the dot!
        return html`<div class="result-document">
            <seed-result-doc
                collection="${this.collection}"
                doc-id="${doc.id}"
                .document="${doc}"
                pattern="${fieldPattern}"
            ></seed-result-doc>
            <seed-result-details-link
                collection="${this.collection}"
                doc-id="${doc.id}"
                search-path="${this.searchPath}"
            ></seed-result-details-link>
        </div>`;
    }

    static styles: CSSResultGroup = [
        css`
            .result-document {
                margin: 5px;
                border: var(
                    --search-result-border,
                    5px solid var(--window-border-color, lightblue)
                );
                padding: 5px;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-result": SeedSearchResult;
    }
}
