import { LitElement, HTMLTemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("seed-result-details-link")
export class SeedResultDetailsLink extends LitElement {
    @property()
    collection!: string;

    @property({ attribute: "doc-id" })
    documentId!: string;

    /*
     * Path segment to search, used for in the path to details view.
     */
    @property({ attribute: "search-path" })
    searchPath: string = "/search/";

    protected override render(): HTMLTemplateResult {
        return html`<a
            href="${this.searchPath}${this.collection}/detail/${this
                .documentId}"
            >${this.documentId}</a
        >`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-details-link": SeedResultDetailsLink;
    }
}
