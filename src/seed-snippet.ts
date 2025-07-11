import { LitElement, html, HTMLTemplateResult, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import log from "./logging";

/**
 * The `<seed-snippet>` custoum component loads a text snippet from
 * some given `url` and displays it. This is suitable for little
 * static text snippets in the website.
 *
 * A snippet is not a complete HTML DOM, but only a part of it, e.g.,
 * a division. So do not load complete HTML pages as snippets.
 */
@customElement("seed-snippet")
export class SeedSnippet extends LitElement {
    /**
     * The URL of the snippet.
     */
    @property()
    url!: string;

    /**
     * The content type of the snippet. Supported content types:
     *
     * - `text/html`
     */
    @property({ attribute: "content-type" })
    contentType: string = "text/html";

    @state()
    content!: unknown;

    protected willUpdate(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has("url")) {
            fetch(this.url).then((response) => {
                if (this.contentType == "text/html") {
                    response.text().then((c) => {
                        this.content = c;
                    });
                } else {
                    log.error(
                        "unsupported content type",
                        this.contentType,
                        this,
                    );
                }
            });
        }
    }

    protected override render(): HTMLTemplateResult {
        return this.content
            ? html`<div .innerHTML="${this.content}"></div>`
            : html``;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-snippet": SeedSnippet;
    }
}
