import { html, css, LitElement, CSSResult, TemplateResult, PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { widgetSizeProvider } from './widget-size-provider'
import { storeConsumerMixin } from './store-consumer-mixin'
import { fetchRegexAlignment, fetchMappingAlignment } from './redux/synopsisSlice'



// define the web component
@customElement("seed-synopsis")
export class SeedSynopsis extends widgetSizeProvider(storeConsumerMixin(LitElement)) {

    @property({ type: String })
    id!: string;

    @property({ attribute: "regex-alignment" })
    regexAlignment!: string;

    @property({ attribute: "mapping-alignment" })
    mappingAlignment!: string;

    @property({ type: String, reflect: true })
    width: string = "100%";

    @property({ type: String, reflect: true })
    height: string = "100%";

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("regexAlignment") && this.regexAlignment) {
	    this.store?.dispatch(fetchRegexAlignment(this.regexAlignment));
	}
	if (changedProperties.has("mappingAlignment") && this.mappingAlignment) {
	    this.store?.dispatch(fetchMappingAlignment(this.mappingAlignment));
	}
	super.willUpdate(changedProperties);
    }

    protected styleTemplate(): TemplateResult<1> {
	return html`<style>:host { display: block; width: ${this.width}; height: ${this.height} } div.synopsis { width: 100%; height: 100% }</style>`;
    }

    render(): TemplateResult<1> {
	return html`${this.styleTemplate()}<div class="synopsis"><slot></slot></div>`;
    }

    static styles: CSSResult = css`
	:host {
	white-space: nowrap;
	white-space-collapse: discard;
	}
	div {
	}
    `

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-synopsis": SeedSynopsis;
    }
}
