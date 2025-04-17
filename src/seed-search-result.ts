import { html, LitElement, HTMLTemplateResult } from "lit";
import { customElement, state, property } from "lit/decorators.js";

import { searchResultMixin } from "./search-result-mixin";
import { SeedListenerApi, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { SearchResponse, Document, solrSearchQuery } from "./redux/searchTypes";
import { addFl } from "./redux/searchQuerySlice";

import log from "./logging";

/*
 * A web component for displaying search results.
 */
@customElement("seed-search-result")
export class SeedSearchResult extends searchResultMixin(LitElement) {
    @property()
    collection!: string;

    @property()
    pattern: string = "^(meta|author|title)";

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
                    const regex: RegExp = new RegExp(this.pattern);
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
                    this.renderDocument(d, this.pattern),
                )}
            </div>
        </div>`;
    }

    renderDocumentCount(): HTMLTemplateResult {
        return html`<div>
            <span>Documents found:</span><span>${this.document_count}</span>
        </div>`;
    }

    renderDocument(doc: Document, pattern: string): HTMLTemplateResult {
        // Mind the dot!
        return html`<seed-result-doc
            collection="${this.collection}"
            doc-id="${doc.id}"
            .document="${doc}"
            pattern="${pattern}"
        ></seed-result-doc>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-search-result": SeedSearchResult;
    }
}
