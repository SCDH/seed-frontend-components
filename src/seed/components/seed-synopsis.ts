import {html, css, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'

// define the web component
@customElement("seed-synopsis")
export class SeedSynopsis extends LitElement {

    @property({ type: String })
    id: string;

    @property({ type: String })
    alignment: string;

    getHeight = () => {
	return window.innerHeight * 0.8;
    }

    styleTemplate() : TemplateResult<1> {
	return html`<style>:host { display: block; } div.synopsis { height: ${this.getHeight()}px; }</style>`;
    }

    render() : TemplateResult<1> {
	return html`${this.styleTemplate()}<div class="synopsis"><slot></slot></div>`;
    }

    propagateSync = (msg) => {
	console.log("propagating sync event");
	var slot = this.renderRoot.querySelector("slot");
	var synopsisTexts = Array.from(slot.assignedElements({flatten: true}));
	console.log(synopsisTexts.length);
	for (var i = 0; i < synopsisTexts.length; i++) {
	    var iframe = synopsisTexts[i].renderRoot.querySelector("iframe");
	    iframe.contentWindow.postMessage(msg, window.location.protocol + window.location.host);
	}
	// TODO: propagate to containing and contained seed-synopsis elements
    }


    static styles : CSSResult = css`
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
