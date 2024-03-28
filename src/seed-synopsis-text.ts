import { html, css, LitElement } from 'lit'
import { CSSResult, query } from 'lit-element'
import { customElement, property } from 'lit/decorators.js'
import { connect } from 'pwa-helpers';

import { SeedSynopsisSyncComponent, IContentMeta } from './isynopsis'

import { initText, setText, TextState } from "./redux/textsSlice";
import { TextViewState, AnnotationsPerSegment, initTextView, setText as setTextViewText, scrolledTo, fetchAnnotationsPerSegment } from "./redux/textViewsSlice";
import { selectAnnotationsAtSegmentThunk, passByAnnotationsAtSegmentThunk } from "./redux/selectAnnotations";
import { CSSDefinition } from './redux/cssTypes';
import { OntologyState } from './redux/ontologySlice';
import { setCssAnnotationsThunk, setCssForAllSegmentsThunk } from './redux/colorizeText';
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

    ontology: OntologyState | undefined;

    annotationsPerSegment: AnnotationsPerSegment | undefined;

    cssPerSegment: { [segmentId: string]: CSSDefinition } | undefined = undefined;

    /*
     * Inherited from {connect}. This method is called by the redux
     * store to pass in state.
     */
    stateChanged(_state: RootState) {
	// set scroll position from redux store (overkill)
	if (_state.textViews.hasOwnProperty(this.id)) {
	    const s: TextViewState | null = _state.textViews[this.id];
	    this.position = s?.scrollPosition ?? "start";
	}
	// set colorize the text if all required data is present
	if (_state.textViews.hasOwnProperty(this.id)  && _state.textViews[this.id].cssPerSegment !== this.cssPerSegment && this.iframe !== null) {
	    this.cssPerSegment = _state.textViews[this.id].cssPerSegment;
	    //this.colorizeText(_state);
	}
	if (_state.ontology !== this.ontology) {
	    this.ontology = _state.ontology;
	    if (this.annotationsPerSegment !== undefined) {
		// TODO: move elsewhere and run as subscriber
		//store.dispatch(setCssAnnotationsThunk());
		//store.dispatch(setCssForAllSegmentsThunk(this.id));
	    }
	}
	// set annotationsPerSegment and colorize the text if all required data is present
	if (_state.textViews.hasOwnProperty(this.id)  && _state.textViews[this.id].annotationsPerSegment !== this.annotationsPerSegment) {
	    this.annotationsPerSegment = _state.textViews[this.id].annotationsPerSegment;
	    if (this.ontology !== undefined) {
		// TODO: move elsewhere and run as subscriber
		//store.dispatch(setCssAnnotationsThunk());
		//store.dispatch(setCssForAllSegmentsThunk(this.id));
	    }
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
	store.dispatch(initTextView({viewId: this.id}));
	store.dispatch(setTextViewText({viewId: this.id, text: this.id}));
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
			location: this.iframe.contentDocument?.location?.toString() ?? null,
			canonicalUrl: e.data.canonicalUrl,
			title: e.data.title,
			author: e.data.author,
		    };
		    store.dispatch(initText({textId: this.id}));
		    store.dispatch(setText({textId: this.id, text: txt}));
		    store.dispatch(fetchAnnotationsPerSegment({viewId_: this.id, url: this.annotationsPerSegmentUrl}));
		    break;
		case "scrolled":
		    this.contentMeta = e.data as IContentMeta;
		    store.dispatch(scrolledTo({viewId: this.id, position: e.data.top}));
		    break;
		case "mouse-over-segment":
		    store.dispatch(passByAnnotationsAtSegmentThunk(this.id, e.data.segmentId));
		    break;
		case "mouse-out-segment":
		    // TODO
		    break;
		case "click-segment":
		    store.dispatch(selectAnnotationsAtSegmentThunk(this.id, e.data.segmentId));
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

    /*
     * Pass data for colorizing the annotations in the text via the
     * post message channel down to the document displayed in the iframe.
     */
    colorizeText(_state: RootState): void {
	console.log("colorizing text in widget " + this.id);
	const msg = {
	    ...this.contentMeta,
	    "event": "colorize",
	    "cssPerSegment": _state.textViews[this.id].cssPerSegment,
	    // "ontology": _state.ontology,
	    // "annotationsPerSegment": _state.segments.annotationsPerSegment[this.id],
	    // "annotations": _state.segments.annotations,
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
