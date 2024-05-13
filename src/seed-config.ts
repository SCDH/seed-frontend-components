import { LitElement, PropertyValues, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js'

import { storeConsumerMixin } from './store-consumer-mixin';
import { fetchMappingAlignment, fetchRegexAlignment } from './redux/synopsisSlice';
import { fetchAnnotations } from './redux/annotationsSlice';
import { fetchResourceCenteredJson } from './redux/ontologySlice';

@customElement('seed-config')
export class SeedConfig extends storeConsumerMixin(LitElement) {

    @property({ attribute: "ontology-urls", type: String })
    ontologyUrls!: string;

    @property({ attribute: "annotations-url", type: String })
    annotationsUrl!: string;

    @property({ attribute: "regex-alignment" })
    regexAlignment!: string;

    @property({ attribute: "mapping-alignment" })
    mappingAlignment!: string;

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("annotationsUrl" as keyof SeedConfig)) {
	    this.store?.dispatch(fetchAnnotations(this.annotationsUrl));
	}
	if (changedProperties.has("ontologyUrls" as keyof SeedConfig)) {
	    this.store?.dispatch(fetchResourceCenteredJson(this.ontologyUrls));
	}
	if (changedProperties.has("regexAlignment" as keyof SeedConfig) && this.regexAlignment) {
	    this.store?.dispatch(fetchRegexAlignment(this.regexAlignment));
	}
	if (changedProperties.has("mappingAlignment" as keyof SeedConfig) && this.mappingAlignment) {
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
