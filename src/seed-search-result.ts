import { html, HTMLTemplateResult, css, CSSResultGroup } from "lit";
import { customElement, state, property } from "lit/decorators.js";

import { SearchResultElement } from "./search-result-mixin";
import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import {
    SearchResponse,
    Document,
    solrSearchQuery,
    Highlighting,
} from "./redux/searchTypes";
import {
    setFl,
    setHighlighting,
    setHighlightingSnippets,
} from "./redux/searchQuerySlice";

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

    @property({ type: Boolean })
    highlighting: boolean = false;

    @property({ attribute: "highlighting-snippets", type: Number })
    highlightingSnippets: number = 1;

    @property({ attribute: "kwic-pattern" })
    kwicPattern: string = "^(html_hts_)";

    /*
     * Path segment to search, used for in the path to details
     * view. This is passed through to all the links to detail pages.
     */
    @property({ attribute: "search-path" })
    searchPath: string = "/search/";

    @state()
    documents: Array<Document> = [];

    @state()
    highlightedDocuments: Highlighting = {};

    @state()
    document_count: number = 0;

    @state()
    document_start: number = 0;

    override subscribeStore(): void {
        // add fields to be included in the response, by adding them to the query parameter fl.
        // Note that the query may already have been initiated, but not been yet fulfilled.
        if (
            this.store
                ?.getState()
                .searchApi.queries.hasOwnProperty(this.fieldsQueryId()) &&
            this.store?.getState()?.searchApi?.queries[this.fieldsQueryId()]
                ?.status == "fulfilled"
        ) {
            log.debug("fields query already fulfilled");
            this.store.dispatch(setFl(this.setFields(this.store.getState())));
        } else {
            this.store?.dispatch(
                addAppListener({
                    matcher: searchApi.endpoints.fields.matchFulfilled,
                    effect: (_action, listenerApi) => {
                        listenerApi.dispatch(
                            setFl(this.setFields(listenerApi.getState())),
                        );
                    },
                }),
            );
        }
        this.store?.dispatch(setHighlighting(this.highlighting));
        this.store?.dispatch(
            setHighlightingSnippets(this.highlightingSnippets),
        );
        super.subscribeStore();
    }

    private fieldsQueryId(): string {
        return searchApi.endpoints.fields.name + '("' + this.collection + '")';
    }

    private setFields(state: SeedState): Array<string> {
        const flds: Array<string> =
            (state.searchApi?.queries?.[this.fieldsQueryId()]
                ?.data as Array<string>) ?? [];
        const regex: RegExp = new RegExp(this.fieldPattern);
        log.debug("setting search result fields", flds);
        return flds.filter((f) => f.match(regex));
    }

    override updateEffect(endpoint: string, s: SeedState): void {
        const queryId: string =
            endpoint + '("' + solrSearchQuery(s.searchQuery) + '")';
        log.debug(
            "updating search result",
            queryId,
            s.searchApi.queries.hasOwnProperty(queryId),
        );
        const data: SearchResponse | undefined = s.searchApi.queries[queryId]
            ?.data as SearchResponse | undefined;
        if (data !== undefined) {
            this.document_count = data.response.numFound;
            this.document_start = data.response.start;
            this.documents = data.response.docs;
            this.highlightedDocuments = data?.highlighting ?? {};
        }
    }

    override render(): HTMLTemplateResult {
        return html`<div>
            ${this.renderDocumentCount()}
            <div class="result-documents">
                ${this.documents.map((d) =>
                    this.renderDocument(
                        d,
                        this.fieldPattern,
                        this.highlightedDocuments[d.id],
                        this.kwicPattern,
                    ),
                )}
            </div>
        </div>`;
    }

    renderDocumentCount(): HTMLTemplateResult {
        return html`<div>
            <span>Documents found:</span><span>${this.document_count}</span>
        </div>`;
    }

    renderDocument(
        doc: Document,
        fieldPattern: string,
        highlightedDoc: Document,
        kwicPattern: string,
    ): HTMLTemplateResult {
        // Mind the dot!
        return html`<div class="result-document">
            <seed-result-doc
                collection="${this.collection}"
                doc-id="${doc.id}"
                .document="${doc}"
                .highlight="${highlightedDoc}"
                pattern="${fieldPattern}"
            ></seed-result-doc>
            <seed-kwic
                collection="${this.collection}"
                doc-id="${doc.id}"
                .highlight="${highlightedDoc}"
                pattern="${kwicPattern}"
            ></seed-kwic>
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
