import { html, css, CSSResultGroup, HTMLTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { Document } from "./redux/searchTypes";
import { SeedState } from "./redux/seed-store";

//import log from "./logging";

/*
 * This web component displays keywords in context in search
 * result. Which field(s) is/are presented is determined by the
 * regular expression passed in as the `pattern` attribute: It is used
 * to filter the fields in passed in `highlight` property.
 */
@customElement("seed-kwic")
export class SeedKWiC extends StoreConsumerElement<SeedState, any> {
    @property({ type: Object })
    highlight!: Document;

    @property()
    pattern: string = "^(html_hts_)";

    override render(): HTMLTemplateResult {
        const regex: RegExp = new RegExp(this.pattern);
        const fields: Array<string> = Object.keys(this.highlight ?? {}).filter(
            (f) => f.match(regex),
        );
        return html`<div class="kwic">
            ${fields.map((f) => this.renderField(f, this.highlight[f]))}
        </div>`;
    }

    renderField(_field: string, value: Array<string>): HTMLTemplateResult {
        return html`<div>
            ${value.map((v) => {
                return html`<div class="snippet" .innerHTML="${v}">text</div>`;
            })}
        </div>`;
    }

    static styles: CSSResultGroup = [
        css`
            .kwic {
            }
            em {
                background-color: var(--seed-highlight-background, yellow);
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-kwic": SeedKWiC;
    }
}
