import { LitElement, html, HTMLTemplateResult } from "lit";
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
            return html`<host
                ><iframe
                    width="98%"
                    height="100%"
                    .srcdoc="${this.text.text}"
                ></iframe
            ></host>`;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-text-widget": SeedTextWidget;
    }
}
