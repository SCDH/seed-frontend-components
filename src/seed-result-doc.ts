import { html, css, CSSResultGroup, HTMLTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";

import { Document } from "./redux/searchTypes";
import { SeedState } from "./redux/seed-store";

//import log from "./logging";

/*
 * This web component displays text fields of a document in search
 * result. Which fields are presented is determined by the regular
 * expression passed in as the `pattern` attribute: It is used to
 * filter the fields in passed in `document`.
 */
@customElement("seed-result-doc")
export class SeedResultDoc extends StoreConsumerElement<SeedState, any> {
    @property({ type: Object })
    document!: Document;

    @property()
    pattern: string = "^(meta|author|title)";

    override render(): HTMLTemplateResult {
        const regex: RegExp = new RegExp(this.pattern);
        const fields: Array<string> = Object.keys(this.document ?? {}).filter(
            (f) => f.match(regex),
        );
        return html`<div class="fields">
            ${fields.map((f) => this.renderField(f, this.document))}
        </div>`;
    }

    renderField(field: string, document: Document): HTMLTemplateResult {
        return html`<div class="field">
            <span class="field-name">
                <span class="name"><seed-data-label key="${field}"><seed-data-label></span
                ><span class="field-name-value-sep">: </span>
            </span>
            <span class="field-value">${document[field]}</span>
        </div>`;
    }

    static styles: CSSResultGroup = [
        css`
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
