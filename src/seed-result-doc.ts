import { LitElement, html, css, CSSResultGroup, HTMLTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Document } from "./redux/searchTypes";

import log from "./logging";

/*
 * This web component displays text fields of a document in search
 * result. Which fields are presented is determined by the regular
 * expression passed in as the `pattern` attribute: It is used to
 * filter the fields in passed in `document`.
 */
@customElement("seed-result-doc")
export class SeedResultDoc extends LitElement {
    /**
     * The document as search result.
     */
    @property({ type: Object })
    document!: Document;

    /**
     * The document as search result with highlighened search terms.
     */
    @property({ type: Object })
    highlight!: Document;

    @property()
    pattern: string = "^(meta|author|title)";

    override render(): HTMLTemplateResult {
        const regex: RegExp = new RegExp(this.pattern);
        const fields: Array<string> = Object.keys(this.document ?? {}).filter(
            (f) => f.match(regex),
        );
        return html`<div class="fields">
            ${fields.map((f) =>
                this.renderField(
                    this,
                    f,
                    this.highlight?.[f] ?? this.document[f],
                ),
            )}
        </div>`;
    }

    renderField(
        thisExpr: this,
        field: string,
        value: string | Array<string>,
    ): HTMLTemplateResult {
        log.info("Solr document field value", value);
        if (!Array.isArray(value)) value = [value];
        return html`<div class="field">
            <span class="field-name">
                <span class="name"
                    ><seed-data-label key="${field}"></seed-data-label></span
                ><span class="field-name-value-sep">: </span>
            </span>
            <span class="field-value"
                >${value.map((v) => thisExpr.renderValue(thisExpr, v))}</span
            >
        </div>`;
    }

    noLabelRegex: RegExp = /\s/;

    renderValue(thisExpr: this, value: string) {
        if (typeof value !== "string")
            console.log("type", typeof value, value, thisExpr.noLabelRegex);
        return typeof value !== "string" || value.match(thisExpr.noLabelRegex)
            ? html`<span
                  class="field-single-value"
                  .innerHTML="${value}"
              ></span>`
            : html`<span class="field-single-value"
                  ><seed-data-label key="${value}"></seed-data-label
              ></span>`;
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
            em {
                background-color: var(--seed-highlight-background, yellow);
            }
            .field-single-value:nth-child(n + 2) {
                margin-left: 1em;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-result-doc": SeedResultDoc;
    }
}
