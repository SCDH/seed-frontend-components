import { html, css, LitElement, PropertyValues } from 'lit'
import { CSSResult, query } from 'lit-element'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context';
import { addListener, UnsubscribeListener, UnknownAction } from '@reduxjs/toolkit';

import { SeedSynopsisSyncComponent, IContentMeta } from './isynopsis'

import { initText, setText, TextState } from "./redux/textsSlice";
import { TextViewsSlice, initTextView, setText as setTextViewText, scrolledTo, fetchAnnotationsPerSegment } from "./redux/textViewsSlice";
import { selectAnnotationsAtSegmentThunk, passByAnnotationsAtSegmentThunk } from "./redux/selectAnnotations";
import { CSSDefinition } from './redux/cssTypes';
import log from "./logging";

import { SeedStore, SeedState } from './redux/seed-store';
import { seedStoreContext } from './seed-context';



// define the web component
@customElement("seed-synopsis-text")
export class SeedSynopsisText extends LitElement implements SeedSynopsisSyncComponent {

    @consume({ context: seedStoreContext })
    @property({ attribute: false })
    store?: SeedStore;

    @property({ type: String })
    content: string = "";

    @property({ type: String })
    source: string = "";

    @property({ attribute: true, type: String})
    id!: string;

    @property({ attribute: "annotations-per-segment-url", type: String })
    annotationsPerSegmentUrl!: string;

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

    @state()
    cssPerSegment: { [segmentId: string]: CSSDefinition } | undefined = undefined;

    storeUnsubscribeListeners: Array<UnsubscribeListener> = [];


    subscribeStore(): void {
	log.debug("subscribing component to the redux store, element with Id " + this.id);
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// This kind of subscription with store.dispatch(addListener(...)) needs a store with listener middleware, see
	// https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware

	// listen for changes on CSS per segment
	this.store?.dispatch(addListener({
	    predicate: (_action: UnknownAction, currentState, _previousState): boolean => {
		// log.debug("checking predicate for element with Id " + this.id);
		let currState: { textViews: TextViewsSlice } = currentState as SeedState;
		return currState.textViews.hasOwnProperty(this.id) && currState.textViews[this.id].cssPerSegment !== this.cssPerSegment;
	    },
	    effect: (_action, listenerApi): void => {
		log.debug("cssPerSegment updated for element with Id " + this.id)
		let state: SeedState = listenerApi.getState() as SeedState;
		this.cssPerSegment = state.textViews[this.id].cssPerSegment;
		this.colorizeText();
	    }
	}));
	// this.storeUnsubscribeListeners.push(subsc);
    }

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("store" as keyof SeedSynopsisText) && changedProperties.get("store" as keyof SeedSynopsisText) === undefined) {
	    log.info("element subscribing to store, " + this.id);
	    this.subscribeStore();
	}
	super.willUpdate(changedProperties);
    }

    connectedCallback() {
	// this is called when the component has been added to the DOM
	super.connectedCallback();
	// set the event listener for scroll events on the post message channel
	window.addEventListener("message", this.handleMessage);
	// dispatch initTextWidget action to the redux state store:
	// this has to be done, since addText with meta information is
	// fired lately, only after the first scrolledTo action.
	this.store?.dispatch(initTextView({viewId: this.id}));
	this.store?.dispatch(setTextViewText({viewId: this.id, text: this.id}));
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
	    log.warn("no valid location in iframe, using parent location");
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
	    log.debug("filtered message: ", e, this.getContentUrl().toString());
	    switch (e.data?.event) {
		case "meta":
		    // We do not destructure e.data, since we have no control over it!
		    const txt: TextState = {
			location: this.iframe.contentDocument?.location?.toString() ?? null,
			canonicalUrl: e.data.canonicalUrl,
			title: e.data.title,
			author: e.data.author,
		    };
		    this.store?.dispatch(initText({textId: this.id}));
		    this.store?.dispatch(setText({textId: this.id, text: txt}));
		    this.store?.dispatch(fetchAnnotationsPerSegment({viewId_: this.id, url: this.annotationsPerSegmentUrl}));
		    break;
		case "scrolled":
		    this.contentMeta = e.data as IContentMeta;
		    this.store?.dispatch(scrolledTo({viewId: this.id, position: e.data.top}));
		    break;
		case "mouse-over-segment":
		    this.store?.dispatch(passByAnnotationsAtSegmentThunk(this.id, e.data.segmentIds));
		    break;
		case "mouse-out-segment":
		    // TODO
		    break;
		case "click-segment":
		    this.store?.dispatch(selectAnnotationsAtSegmentThunk(this.id, e.data.segmentIds));
		    break;
		default:
		    log.debug("unknown event: ", e);
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
	log.debug("syncing others");
	// for sending a message to an iframe, we have to post it on the iframe's content window,
	// cf. https://stackoverflow.com/questions/61548354/how-to-postmessage-into-iframe
	this.dispatchEvent(new CustomEvent('seed-synopsis-sync-scroll', { detail: { ...this.contentMeta, "event": "sync" }, bubbles: true, composed: true }));
    }

    // the reactive property syncTarget has a custom setter and getter
    private _syncTarget!: IContentMeta;

    set syncTarget(target: IContentMeta) {
	// do the sync by posting a message to the iframe
	if (this.stripFragment(target.href) !== this.stripFragment(this.getContentUrl().toString())) {
	    log.debug("sync-ing " + this.contentMeta.href + ", scrolling to element aligned to: " + target.top);
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

    /*
     * Pass data for colorizing the annotations in the text via the
     * post message channel down to the document displayed in the iframe.
     */
    colorizeText(): void {
	log.debug("colorizing text in widget " + this.id);
	const msg = {
	    ...this.contentMeta,
	    "event": "colorize",
	    "cssPerSegment": this.cssPerSegment,
	};
	this.iframe.contentWindow?.postMessage(msg, window.location.href);
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
