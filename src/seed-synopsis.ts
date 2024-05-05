import { html, css, LitElement, CSSResult, TemplateResult } from 'lit'
import { customElement, property, queryAssignedElements } from 'lit/decorators.js'
import { IContentMeta, SeedSynopsisSyncComponent } from './isynopsis'

import { widgetSizeProvider } from './widget-size-provider'

// define the web component
@customElement("seed-synopsis")
export class SeedSynopsis extends widgetSizeProvider(LitElement) implements SeedSynopsisSyncComponent {

    @property({ type: String })
    id: string = "";

    @property({ type: String, attribute: true, reflect: true })
    alignment: string = "horizontal";

    @property({ type: String, reflect: true })
    width: string = "100%";

    @property({ type: String, reflect: true })
    height: string = Math.floor(window.innerHeight * 0.8).toString() + "px";

    connectedCallback() {
	super.connectedCallback();
	if (this.shadowRoot !== null) {
	    this.shadowRoot.addEventListener("seed-synopsis-sync-scroll", (e: Event) => {
		console.log("propagating sync event to " + this.synopsisTexts.length + " children");
		this.propagateSync((e as CustomEvent).detail as IContentMeta);
	    });
	}
	// // Would there be a better event to register this alignChildren method to?
	// window.addEventListener("load", this.alignChildren);
    }

    disconnectedCallback() {
	// window.removeEventListener("load", this.alignChildren);
	super.disconnectedCallback();
    }

    protected styleTemplate(): TemplateResult<1> {
	return html`<style>:host { display: block; width: ${this.width}; height: ${this.height} } div.synopsis { width: 100%; height: 100% }</style>`;
    }

    render(): TemplateResult<1> {
	return html`${this.styleTemplate()}<div class="synopsis"><slot></slot></div>`;
    }

    @property({ attribute: false, state: true })
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


    /**
     * Set alignment, width, and height properties on children.
     */
    protected alignChildren = (_e: Event) => {
	let countOfChildren = this.synopsisTexts.length;
	let childWidth: number = 99;
	let childHeight: number = 100;
	if (this.alignment == "horizontal") {
	    childWidth = Math.floor(childWidth / countOfChildren);
	} else {
	    childHeight = Math.floor(childHeight / countOfChildren);
	}
	console.log("aligning " + countOfChildren + " children:", this.alignment, childWidth, childHeight);
	for (let i = 0; i < countOfChildren; i++) {
	    (this.synopsisTexts[i] as any).alignment = this.alignment;
	    (this.synopsisTexts[i] as any).width = childWidth.toString() + "%";
	    (this.synopsisTexts[i] as any).height = childHeight.toString() + "%";
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
