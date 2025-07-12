import { LitElement, html, HTMLTemplateResult, css, CSSResultArray } from "lit";
import { customElement, query, property } from "lit/decorators.js";
import { consume } from "@lit/context";

import { SeedText } from "./types";
import { seedTextContext } from "./seed-context";

import log from "./logging";

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

    @query("iframe")
    iframe!: HTMLIFrameElement;

    @property({ reflect: true })
    height: string = "200px";

    /**
     * Whether a fixed height is used for displaying the
     * content. Default to `false`, which means, that the height is
     * adjusted dynamically to the scroll height of the content.
     */
    @property({ attribute: "fixed-height" })
    fixedHeight: boolean = false;

    /**
     * Set the height from the height of the loaded content, if the
     * height is set dynamically.
     */
    private resizeIFrame() {
        return (e: Event) => {
            if (!this.fixedHeight) {
                log.debug("iframe content loaded");
                const iframe: HTMLIFrameElement =
                    this.iframe ?? (e.target as HTMLIFrameElement);
                this.height =
                    (iframe.contentWindow?.document.documentElement
                        .scrollHeight ?? 100) + "px";
            }
        };
    }

    render(): HTMLTemplateResult {
        if (this.text === undefined) {
            return html`<ds-waiting></ds-waiting>`;
        } else {
            return html`<div style="height:${this.height}!important;">
                <iframe
                    @load="${this.resizeIFrame()}"
                    .srcdoc="${this.text.text}"
                ></iframe>
            </div>`;
        }
    }

    static styles: CSSResultArray = [
        css`
            iframe {
                height: 100%;
                width: 100%;
                border: none;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-text-widget": SeedTextWidget;
    }
}
