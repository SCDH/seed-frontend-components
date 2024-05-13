import { LitElement, html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { fetchMappingAlignment, fetchRegexAlignment } from './redux/synopsisSlice';

@customElement('seed-config')
export class SeedConfig extends storeConsumerMixin(LitElement) {

    // _provider = new ContextProvider(this, {context: seedStoreContext, initialValue: store});

    @property({ attribute: "regex-alignment" })
    regexAlignment!: string;

    @property({ attribute: "mapping-alignment" })
    mappingAlignment!: string;

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("regexAlignment") && this.regexAlignment) {
	    this.store?.dispatch(fetchRegexAlignment(this.regexAlignment));
	}
	if (changedProperties.has("mappingAlignment") && this.mappingAlignment) {
	    this.store?.dispatch(fetchMappingAlignment(this.mappingAlignment));
	}
	super.willUpdate(changedProperties);
    }

    render() {
	return html`<slot></slot>`;
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-config": SeedConfig;
    }
}
