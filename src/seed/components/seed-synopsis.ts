import { html, css, LitElement } from 'lit'
import { queryAssignedElements, CSSResult } from 'lit-element'
import { TemplateResult } from 'lit-html'
import { customElement, property } from 'lit/decorators.js'

// define the web component
@customElement("seed-synopsis")
export class SeedSynopsis extends LitElement {

    @property({ type: String })
    id: string = "";

    @property({ type: String })
    alignment: string = "";

    connectedCallback() {
	super.connectedCallback();
	if (this.shadowRoot !== null) {
	    this.shadowRoot.addEventListener("seed-synopsis-sync-scroll", this.propagateSync);
	}
    }

    getHeight = () => {
	return window.innerHeight * 0.8;
    }

    styleTemplate(): TemplateResult<1> {
	return html`<style>:host { display: block; } div.synopsis { height: ${this.getHeight()}px; }</style>`;
    }

    render(): TemplateResult<1> {
	return html`${this.styleTemplate()}<div class="synopsis"><slot></slot></div>`;
    }

    @queryAssignedElements({ flatten: true, selector: "seed-synopsis-text" })
    synopsisTexts!: Array<LitElement>;

    // pass a sync event down by setting the syncTarget property on synoposis components
    propagateSync = (e: Event) => {
	console.log("propagating sync event to " + this.synopsisTexts.length + " children");
	var msg: Object = (e as CustomEvent).detail;
	for (var i = 0; i < this.synopsisTexts.length; i++) {
	    if ("syncTarget" in (this.synopsisTexts[i] as any)) {
		// we observe the "properties down" principle
		(this.synopsisTexts[i] as any).syncTarget = msg;
	    } else {
		console.log("not a sync component");
	    }
	}
    }


    static styles: CSSResult = css`
:host {
}
div {
  min-height: 20em;
}
`

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-synopsis": SeedSynopsis;
    }
}
