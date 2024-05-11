import { html, css, LitElement, CSSResult, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { widgetSizeProvider } from './widget-size-provider'

// define the web component
@customElement("seed-synopsis")
export class SeedSynopsis extends widgetSizeProvider(LitElement) {

    @property({ type: String })
    id!: string;

    @property({ type: String, reflect: true })
    width: string = "100%";

    @property({ type: String, reflect: true })
    height: string = "100%";

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
