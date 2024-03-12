import { html, css, LitElement } from 'lit'
import { CSSResult, query } from 'lit-element'
import { customElement, property } from 'lit/decorators.js'
import { SeedSynopsisSyncComponent, IContentMeta } from './isynopsis'

import { connect } from 'pwa-helpers';
import { initTextWidget, addText, scrolledTo, TextState } from "./redux/textsSlice";
import { store, RootState } from "./redux/store";

// define the web component
@customElement("seed-synopsis-text")
export class SeedSynopsisText extends connect(store)(LitElement) implements SeedSynopsisSyncComponent {

    @property({ type: String })
    content: string = "";

    @property({ type: String })
    source: string = "";

    @property({ attribute: true, type: String})
    id!: string;

    @property({ attribute: false, state: true })
    protected position!: string;

    @property({ type: String })
    alignment: string = "horizontal";

    @property({ type: String })
    width!: string; // = "100%";

    @property({ type: String })
    height!: string; // = "100%";

    @property({ state: true })
    protected contentMeta!: IContentMeta;

    @property({ type: Boolean })
    hasSyncManager: boolean = false;




    stateChanged(_state: RootState) {
	// this is called by the redux store to pass in state
	if (_state.texts.hasOwnProperty(this.id)) {
	    const s: TextState | null = _state.texts[this.id];
	    this.position = s?.scrollPosition ?? "start";
	}
    };


    connectedCallback() {
	// this is called when the component has been added to the DOM
	super.connectedCallback();
	// set the event listener for scroll events on the post message channel
	window.addEventListener("message", this.handleMessage);
	// dispatch initTextWidget action to the redux state store:
	// this has to be done, since addText with meta information is
	// fired lately, only after the first scrolledTo action.
	store.dispatch(initTextWidget({id: this.id}));
    }

    disconnectedCallback() {
	window.removeEventListener("message", this.handleMessage);
	super.disconnectedCallback();
    }

    protected styleTemplate() {
	return html`<style>:host { display: ${this.getHostDisplay()}; width: ${this.width}; height: ${this.height}; }</style>`;
    }

    protected headerTemplate() {
	return html`<div><span>${this.id}:</span> <span>${this.source}</span>`;
    }

    protected iframeTemplate() {
	return html`<div class="content-container" id="${this.id}-content-container"><iframe src="${this.content}" id="${this.id}-content" width="98%" height="100%" allowfullscreen="allowfullscreen"></iframe></div>`;
    }

    protected footerTemplate() {
	return html`<div>Position: <span class="scroll-position">${this.position} <button @click="${this.syncOthers}">sync others</botton></div>`;
    }

    render() {
	return html`${this.styleTemplate()}<div class="synopsis-text-container">${this.headerTemplate()}${this.iframeTemplate()}${this.footerTemplate()}</div>`;
    }

    protected getHostDisplay() : String {
	if (this.alignment == "horizontal") {
	    return "inline-block";
	} else {
	    return "block";
	}
    }

    @query("iframe")
    protected iframe!: HTMLIFrameElement;

    protected getContentUrl() : URL {
	let iframe: HTMLIFrameElement | null = this.renderRoot?.querySelector("iframe") ?? null;
	let url: string | null = iframe?.contentWindow?.location.href ?? null;
	if (url !== null) {
	    return new URL(url);
	} else {
	    console.log("no valid location in iframe, using parent location");
	    return new URL(this.content, window.location.href);
	}
    }

    /*
     * On incoming messages via the post message channel,
     * {handleMessage} dispatches redux store actions.
     */
    protected handleMessage = (e: MessageEvent) => {
	if (e.data?.href !== undefined &&
	    this.stripFragment(e.data?.href) == this.stripFragment(this.getContentUrl().toString())) {
	    console.log("filtered message: ", e, this.getContentUrl().toString());
	    switch (e.data?.event) {
		case "meta":
		    // We do not destructure e.data, since we have no control over it!
		    const txt: TextState = {
			origin: e.data.origin ?? null,
			href: e.data.href ?? null,
			pathname: e.data.pathname ?? null,
			canonicalUrl: e.data.canonicalUrl ?? null,
			title: e.data.title ?? null,
			scrollPosition: null
		    };
		    store.dispatch(addText({id: this.id, text: txt}));
		    break;
		case "scrolled":
		    this.contentMeta = e.data as IContentMeta;
		    // this.position = e.data.top; // replaced by redux stuff:
		    store.dispatch(scrolledTo({id: this.id, position: e.data.top}));
		    break;
		case "mouse-over-segment":
		    // TODO
		    break;
		case "mouse-out-segment":
		    // TODO
		    break;
		case "click-segment":
		    // TODO
		    break;
		default:
		    console.log("unknown event: ", e);
	    }
	}
    }


    protected stripFragment(url: string): string {
	let pos = url.indexOf("#");
	if (pos >= 0) {
	    return url.substring(0, pos);
	} else {
	    return url;
	}
    }

    protected syncOthers = (_e: Event) => {
	console.log("syncing others");
	// for sending a message to an iframe, we have to post it on the iframe's content window,
	// cf. https://stackoverflow.com/questions/61548354/how-to-postmessage-into-iframe
	this.dispatchEvent(new CustomEvent('seed-synopsis-sync-scroll', { detail: { ...this.contentMeta, "event": "sync" }, bubbles: true, composed: true }));
    }

    // the reactive property syncTarget has a custom setter and getter
    private _syncTarget!: IContentMeta;

    set syncTarget(target: IContentMeta) {
	// do the sync by posting a message to the iframe
	if (this.stripFragment(target.href) !== this.stripFragment(this.getContentUrl().toString())) {
	    console.log("sync-ing " + this.contentMeta.href + ", scrolling to element aligned to: " + target.top);
	    if (this.hasSyncManager) {
		// TODO
	    } else {
		// the document in the iframe must get the scroll target on its own
		this.iframe.contentWindow?.postMessage(target, window.location.href);
	    }
	}
	// see https://lit.dev/docs/components/properties/#accessors-custom
	let oldTarget: Object = this._syncTarget;
	this._syncTarget = target;
	this.requestUpdate('syncTarget', oldTarget);
    }

    @property({ attribute: false })
    get syncTarget(): IContentMeta {
	return this._syncTarget;
    }


    static styles : CSSResult = css`
:host {
  border: 1px solid lightblue;
}
div.synopsis-text-container {
  height: 100%;
}
div.content-container {
  height: 90%;
}
iframe {
  border: 1px solid silver;
}`

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-synopsis-text": SeedSynopsisText;
    }
}
