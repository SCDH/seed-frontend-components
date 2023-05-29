import { html, css, LitElement } from 'lit'
import { queryAssignedElements, CSSResult } from 'lit-element'
import { TemplateResult } from 'lit-html'
import { customElement, property } from 'lit/decorators.js'
import { IContentMeta, SeedSynopsisSyncComponent } from './isynopsis'

// define the web component
@customElement("seed-synopsis")
export class SeedSynopsis extends LitElement implements SeedSynopsisSyncComponent {

    @property({ type: String })
    id: string = "";

    @property({ type: String })
    alignment: string = "";

    connectedCallback() {
	super.connectedCallback();
	if (this.shadowRoot !== null) {
	    this.shadowRoot.addEventListener("seed-synopsis-sync-scroll", (e: Event) => {
		console.log("propagating sync event to " + this.synopsisTexts.length + " children");
		this.propagateSync((e as CustomEvent).detail as IContentMeta);
	    });
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

    @queryAssignedElements({ flatten: true, selector: "*" })
    synopsisTexts!: Array<Element>;

    // pass a sync event down by setting the syncTarget property on synoposis components
    protected propagateSync = (msg: IContentMeta) => {
	for (var i = 0; i < this.synopsisTexts.length; i++) {
	    // test if element is a SeedSynopsisSyncComponent by using type guard
	    if ("syncTarget" in (this.synopsisTexts[i] as any)) {
		// following the "properties down" principle
		// information is passed by setting a property
		(this.synopsisTexts[i] as any).syncTarget = msg;
	    }
	}
    }

    // the syncTarget property has a custom setter and getter
    private _syncTarget!: IContentMeta;

    set syncTarget(target: IContentMeta) {
	this.propagateSync(target);
	// see https://lit.dev/docs/components/properties/#accessors-custom
	let oldTarget: Object = this._syncTarget;
	this._syncTarget = target;
	this.requestUpdate('syncTarget', oldTarget);
    }

    @property({ attribute: false })
    get syncTarget(): IContentMeta {
	return this._syncTarget;
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
