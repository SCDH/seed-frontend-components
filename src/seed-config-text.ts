import { LitElement, PropertyValues, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { fetchText } from './redux/textsSlice';
// import { fetchAnnotationsPerSegment } from './redux/textViewsSlice';


@customElement('seed-config-text')
export class SeedConfigText extends storeConsumerMixin(LitElement) {

    @property({ attribute: "text-id" })
    textId!: string;

    @property({ attribute: "text-url", type: String })
    textUrl!: string;

    // @property({ attribute: "annotations-per-segment-url", type: String })
    // annotationsPerSegmentUrl!: string;

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("textUrl" as keyof SeedConfigText) && this.id !== undefined) {
	    console.debug("fetching text from ", this.textUrl);
	    this.store?.dispatch(fetchText({ textId: this.textId, location: this.textUrl }));
	}
	// if (changedProperties.has("annotationsPerSegmentUrl" as keyof SeedConfigText) && this.id) {
	//     this.store?.dispatch(fetchAnnotationsPerSegment({ viewId_: this.id, url: this.textUrl }));
	// }
	super.willUpdate(changedProperties);
    }

    render() {
	return html`<slot></slot>`;
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-config-text": SeedConfigText;
    }
}
