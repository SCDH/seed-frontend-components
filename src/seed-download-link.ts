import { LitElement, HTMLTemplateResult, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { SeedTypedTextViewElement } from './itextview.ts'


/**
 * The `<seed-download-link>` web component offers a download link if
 * something (a string, a File object etc.) is written to its `srcdoc`
 * attribute.  It can be used as a sink for transformation results.
 *
 * If this element has children, they will be used as link
 * content.  Otherwise, the URL of the created
 * Blob object will be shown as link text.
 */
@customElement("seed-download-link")
export class SeedDownloadLink extends LitElement implements SeedTypedTextViewElement {

    /*
     * {@inheritDoc itextview!SeedTextViewElement.srcdoc}
     */
    @property()
    public srcdoc: any;

    /*
     * {@inheritDoc itextview!SeedTypedTextViewElement.mediaType}
     */
    @property()
    public mediaType: string | undefined;

    render(): HTMLTemplateResult {
	if (this.srcdoc === undefined || this.srcdoc === null) {
	    return html``;
	} else {
	    // create the blob object and an object URL
	    const url: string = URL.createObjectURL(new Blob([this.srcdoc], {type: this.mediaType}));
	    if (this.innerHTML === "") {
		return html`<div class="download-link"><a href="${url}">${url}</a></div>`;
	    } else {
		return html`<div class="download-link"><a href="${url}"><slot></slot></a></div>`;
	    }
	}
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-download-link": SeedDownloadLink;
    }
}
