import { LitElement, html, HTMLTemplateResult, css, CSSResultArray } from "lit";
import { customElement } from "lit/decorators.js";
import { consume } from "@lit/context";

import { SeedText } from "./types";
import { seedTextContext } from "./seed-context";

/**
 * The {@link SeedTextWidget} is view element for displaying a single
 * text. The text is passed in via context together with an
 * identifier.
 *
 * The widget may talk to the redux store, but does not get the text
 * directly from it. Thus, this element can be used as a descendant of
 * an element that gets the text by whatever means, by it by searching
 * or by navigating a collection or by something else.
 */
@customElement("seed-text-widget")
export class SeedTextWidget extends LitElement {
    @consume({ context: seedTextContext })
    text!: SeedText;

    render(): HTMLTemplateResult {
        if (this.text === undefined) {
            return html`<host><ds-waiting></ds-waiting></host>`;
        } else {
            return html`<iframe
                width="98%"
                height="100%"
                .srcdoc="${this.text.text}"
            ></iframe>`;
        }
    }

    static styles: CSSResultArray = [
        css`
            :host {
                width: 100%;
                height: 100%;
                min-height: 40ex;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-text-widget": SeedTextWidget;
    }
}
