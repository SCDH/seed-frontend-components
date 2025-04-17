import { html, css, LitElement, CSSResultGroup, HTMLTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { storeConsumerMixin } from "./store-consumer-mixin";
import { Document } from "./redux/searchTypes";

//import log from "./logging";

/*
 * A web component for displaying search results.
 */
@customElement("seed-result-doc")
export class SeedResultDoc extends storeConsumerMixin(LitElement) {
    @property({ type: Object })
    document!: Document;

    @property({ attribute: "doc-id" })
    documentId!: string;

    @property()
    pattern: string = "^(meta|author|title)";

    override render(): HTMLTemplateResult {
        const regex: RegExp = new RegExp(this.pattern);
        const fields: Array<string> = Object.keys(this.document ?? {}).filter(
            (f) => f.match(regex),
        );
        return html`<div class="result-document">
            <div class="">
                ${fields.map((f) => this.renderField(f, this.document))}
            </div>
            <div class="link details"><a>${this.documentId}</a></div>
        </div>`;
    }

    renderField(field: string, document: Document): HTMLTemplateResult {
        return html`<div class="field">
            <span class="field-name">
                <span class="name">${field}</span
                ><span class="field-name-value-sep">: </span>
            </span>
            <span class="field-value">${document[field]}</span>
        </div>`;
    }

    static styles: CSSResultGroup = [
        css`
            .result-document {
                margin: 5px;
                border: 5px solid var(--window-border-color, lightblue);
                padding: 5px;
            }
            .field {
                display: flex;
                flex-direction: row;
            }
            .field-name {
                wrap: nowrap;
                flex-shrink: 0;
                font-weight: 600;
            }
            .field-name-value-sep:after {
                content: "";
                margin-right: 0.5em;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-doc": SeedResultDoc;
    }
}
