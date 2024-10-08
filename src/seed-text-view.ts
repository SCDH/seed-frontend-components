import { html, css, LitElement, CSSResultGroup, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { UnsubscribeListener, UnknownAction } from '@reduxjs/toolkit';
import { provide } from '@lit/context';

import { storeConsumerMixin } from './store-consumer-mixin';
import { windowMixin, windowStyles } from './window-mixin';

import { seedTextViewContext } from "./seed-context";
import { addAppListener, SeedState } from "./redux/seed-store";
import { initText, setText, TextState } from "./redux/textsSlice";
import { initTextView, setText as setTextViewText, scrolledTo, fetchAnnotationsPerSegment } from "./redux/textViewsSlice";
import { annotationSelected, annotationsPassedBy } from './redux/annotationsSlice';
import { selectAnnotationsAtSegmentThunk, passByAnnotationsAtSegmentThunk } from "./redux/selectAnnotations";
import { CSSDefinition } from './redux/cssTypes';
import { scrolled, syncOthers } from './redux/synopsisSlice';
import { scrolledTextViewThunk } from './redux/synopsisActions';
import { setScrollTarget } from './redux/synopsisMiddleware';

import log from "./logging";



// define the web component
@customElement("seed-text-view")
export class SeedTextView extends windowMixin(storeConsumerMixin(LitElement)) {

    @provide({ context: seedTextViewContext })
    self_: SeedTextView = this;

    @property({ type: String })
    content: string | undefined;

    @property({ attribute: "text-id" })
    textId: string | undefined;

    @property({ attribute: true, type: String})
    id!: string;

    @property({ attribute: "annotations-per-segment-url", type: String })
    annotationsPerSegmentUrl!: string;

    @query("iframe")
    protected iframe: HTMLIFrameElement | undefined;

    @state()
    doc: string | undefined;

    protected annotationSelected: string | null = null;

    protected docLoaded: boolean = false;

    protected msgQueue: Array<any> = [];

    storeUnsubscribeListeners: Array<UnsubscribeListener> = [];

    /*
     * If the text is alread fully loaded into the iframe, the given
     * `msg` is posted to it via the post message protocol. Otherwise
     * it is put on a message queue, that will be worked on when a
     * "loaded" message is received from the iframe.
     *
     * This method should be used instead of calling
     * `this.iframe.window.postMessage()` directly.
     */
    postMsg(msg: any): void {
	if (this.docLoaded) {
	    this.iframe?.contentWindow?.postMessage(msg, this.getIFrameTarget());
	} else {
	    this.msgQueue.push(msg);
	}
    }

    subscribeStore(): void {
	log.debug("subscribing component to the redux store, element with Id " + this.id);
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// This kind of subscription with store.dispatch(addListener(...)) needs a store with listener middleware, see
	// https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware

	// listen for changes on CSS per segment
	this.store?.dispatch(addAppListener({
	    predicate: (_action: UnknownAction, currentState, previousState): boolean => {
		// log.debug("checking predicate for element with Id " + this.id);
		return currentState.textViews.hasOwnProperty(this.id) && currentState.textViews[this.id].cssPerSegment !== previousState.textViews[this.id].cssPerSegment;
	    },
	    effect: (_action, listenerApi): void => {
		log.debug("cssPerSegment updated for element with Id " + this.id)
		this.colorizeText(listenerApi.getState().textViews[this.id].cssPerSegment);
	    }
	}));

	// get the text title / listen for changes
	this.store?.dispatch(addAppListener({
	    predicate: (_action: UnknownAction, currentState, previousState): boolean => {
		return currentState.textViews.hasOwnProperty(this.id)
		    // && currState.textViews[this.id].textId !== null
		    // && currState.texts.hasOwnProperty(currState.textViews[this.id]?.textId ?? "unknown")
		    && currentState.texts[currentState.textViews[this.id]?.textId ?? "unknown"] !== previousState.texts[currentState.textViews[this.id]?.textId ?? "unknown"];
	    },
	    effect: (_action, listenerApi): void => {
		let state: SeedState = listenerApi.getState() as SeedState;
		this.title = state.texts[state.textViews[this.id]?.textId ??
		    "unknown"].title ?? state.texts[state.textViews[this.id]?.textId ?? "unknown"].author ??
		    "unknown";
	    }
	}));

	this.store?.dispatch(addAppListener({
	    predicate: (_action: UnknownAction, currentState, previousState): boolean => {
		return this.textId !== undefined &&
		    currentState.texts.hasOwnProperty(this.textId) &&
		    (currentState.texts[this.textId].doc !== previousState.texts[this.textId]?.doc ?? "unknown");
	    },
	    effect: (_action, listenerApi): void => {
		this.doc = listenerApi.getState().texts[this.textId ?? "_"].doc;
	    }
	}));

	this.store?.dispatch(addAppListener({
	    actionCreator: annotationSelected,
	    effect: (_action, listenerApi): void => {
		// reset highlighting of previously selected annotation
		if (this.annotationSelected) {
		    this.colorizeAnnotation(listenerApi.getState(), this.annotationSelected, { "border": "none"});
		}
		// highlight currently selected annotation
		this.annotationSelected = listenerApi.getState().annotations.annotationSelected ?? "unknown";
		// TODO: make CSS configurable
		this.colorizeAnnotation(listenerApi.getState(), this.annotationSelected, { "border": "1px solid red"});
	    }
	}));

	this.store?.dispatch(addAppListener({
	    actionCreator: annotationsPassedBy,
	    effect: (_action, listenerApi): void => {
		// reset highlighting of previously transient annotations:
		// general annotation highlighting and transient
		// highlighting are bound to the same visual category,
		// so we can use the general highlighting for a reset
		this.colorizeText(listenerApi.getState().textViews[this.id].cssPerSegment);
		// highlight transient annotations
		const annotIds: Array<string> = listenerApi.getState().annotations.annotationsTransient;
		annotIds.forEach(annotId => {
		    // TODO: make CSS configurable
		    this.colorizeAnnotation(listenerApi.getState(), annotId, { "background-color": "silver"});
		});
	    }
	}));

	// this.storeUnsubscribeListeners.push(subsc);
    }

    connectedCallback() {
	// this is called when the component has been added to the DOM
	super.connectedCallback();
	// set the event listener for scroll events on the post message channel
	window.addEventListener("message", this.handleMessage);
	// set the event listener for scrollTo events
	this.addEventListener("scrollTo", e => {
	    log.info("handling scroll to");
	    if ((e as CustomEvent).detail?.scrollTo !== null) {
		this.scrollTextTo((e as CustomEvent).detail.scrollTo);
		e.stopPropagation();
	    }
	});
	// dispatch initTextWidget action to the redux state store:
	// this has to be done, since addText with meta information is
	// fired lately, only after the first scrolledTo action.
	this.store?.dispatch(initTextView({viewId: this.id}));
	this.store?.dispatch(setTextViewText({viewId: this.id, text: this.id}));
    }

    disconnectedCallback() {
	window.removeEventListener("message", this.handleMessage);
	super.disconnectedCallback();
	// TODO: store.dispatch(disposeTextView({viewId: this.id});
    }

    /*
     * A callback for scrolling the text to `scrollTarget` position.
     */
    scrollTextTo(scrollTarget: string): void {
	if (this.iframe) {
	    log.debug("scrolling via handler");
	    const msg = {
		"event": "sync",
		"scrollTarget": scrollTarget,
	    };
	    this.postMsg(msg);
	}
    }

    /*
     * A thunk that returns a callback for scrolling the text to
     * `scrollTarget` position. This can be used in places, where
     * methods are not working, e.g., in middleware for a redux store.
     */
    scrollTextToThunk = (iframe: HTMLIFrameElement | undefined, targetOrigin: string) => {
	return (scrollTarget: string): void => {
	    log.debug("scrolling via thunk", iframe, targetOrigin);
	    const msg = {
		"event": "sync",
		"scrollTarget": scrollTarget,
	    };
	    iframe?.contentWindow?.postMessage(msg, targetOrigin);
	};
    }

    protected firstUpdated(_changedProperties: PropertyValues<this>): void {
	// Fetching annotations for this view and the entailed
	// colorizing can only be done, after the <iframe> is
	// present. So, putting this in the firstUpdated hook is a
	// reasonable choice.
	if (this.annotationsPerSegmentUrl) {
	    this.store?.dispatch(fetchAnnotationsPerSegment({viewId_: this.id, url: this.annotationsPerSegmentUrl}));
	}
    }

    protected updated(_changedProperties: PropertyValues<this>): void {
	// when using srcdoc, colorizing needs to be done on each rendering
	this.colorizeText(this.store?.getState()?.textViews?.[this.id]?.cssPerSegment);
	// when using srcdoc, setting a the syncOthers listener needs
	// to be done on each rendering
	if (this.iframe) {
	    // this.store?.dispatch(addAppListener({
	    //     actionCreator: scrolled,
	    //     effect: setScrollTarget(this.id, this.scrollTextTo),
	    // }));
	    this.store?.dispatch(addAppListener({
		actionCreator: syncOthers,
		effect: setScrollTarget(this.id, this.scrollTextToThunk(this.iframe, this.getIFrameTarget())),
	    }));
	}
    }

    protected iframeTemplate() {
	if (this.usesSrcDoc()) {
	    log.debug("loading text " + this.textId + " into view " + this.id);
	    return html`<div class="content-container" id="${this.id}-content-container">
                <iframe srcdoc="${this.doc}" id="${this.id}-content" width="98%" height="100%" allowfullscreen="allowfullscreen"></iframe>
	    </div>`;
	} else if (this.content !== undefined) {
	    return html`<div class="content-container" id="${this.id}-content-container">
		<iframe src="${this.content}" id="${this.id}-content" width="98%" height="100%" allowfullscreen="allowfullscreen"></iframe>
	    </div>`;
	} else {
	    return html`<div class="content-container" id="${this.id}-content-container"><div class="error">text not available</div></div>`;
	}
    }

    renderContent() {
	return html`<div class="text-container">${this.iframeTemplate()}</div>`;
    }

    /*
     * Whether or not the srcdoc Attribute of the iframe, that
     * presents the document, is used.
     */
    protected usesSrcDoc(): boolean {
	return this.textId !== undefined && this.doc !== undefined;
    }

    /*
     * Get the target-origin for posting messages to the iframe's
     * window. See
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin
     * and
     * https://stackoverflow.com/questions/58098237/can-i-use-postmessage-on-an-iframe-whos-html-is-passed-via-srcdoc-attribute
     */
    protected getIFrameTarget(): string {
	if (this.usesSrcDoc()) {
	    return "*";
	} else {
	    return this.iframe?.contentWindow?.location?.href ?? "*";
	}
    }

    /*
     * On incoming messages via the post message channel,
     * {handleMessage} dispatches redux store actions etc.
     */
    protected handleMessage = (e: MessageEvent) => {
	if (this.iframe && e.source === this.iframe.contentWindow) {
	    log.debug("filtered message on " + this.id, e);
	    switch (e.data?.event) {
		case "loaded":
		    log.debug("document loaded, posting messages in queue: ", this.msgQueue.length);
		    this.docLoaded = true;
		    this.msgQueue.forEach((msg) => {
			this.iframe?.contentWindow?.postMessage(msg, this.getIFrameTarget());
		    });
		    this.msgQueue = [];
		    break;
		case "meta":
		    // We do not destructure e.data, since we have no control over it!
		    const txt: TextState = {
			location: this.iframe.contentDocument?.location?.toString() ?? null,
			canonicalUrl: e.data.canonicalUrl,
			title: e.data.title,
			author: e.data.author,
			doc: undefined,
		    };
		    this.store?.dispatch(initText({textId: this.id}));
		    this.store?.dispatch(setText({textId: this.id, text: txt}));
		    break;
		case "scrolled":
		    this.store?.dispatch(scrolledTo({viewId: this.id, position: e.data.top}));
		    this.store?.dispatch(scrolledTextViewThunk(scrolled, this.id, [e.data.top]));
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
	    e.stopPropagation();
	}
    }

    /*
     * Pass data for colorizing the annotations in the text via the
     * post message channel down to the document displayed in the iframe.
     */
    colorizeText(cssPerSegment: { [segmentId: string]: CSSDefinition } | undefined = undefined): void {
	if (this.iframe && cssPerSegment) {
	    log.debug(`colorizing text in widget ${this.id}: ${Object.keys(cssPerSegment).length} segments`);
	    const msg = {
		"event": "colorize",
		"cssPerSegment": cssPerSegment,
	    };
	    this.postMsg(msg);
	}
    }

    /*
     * Get the text segements included in an annotation given by
     * `annotId` and colorize them with the given CSS.
     */
    protected colorizeAnnotation(state: SeedState, annotId: string, css: CSSDefinition): void {
	if (state.textViews[this.id].segmentsPerAnnotation.hasOwnProperty(annotId)) {
	    log.debug("colorizing selected annotation in " + this.id + ": " + annotId);
	    const segments: Array<string> = state.textViews[this.id].segmentsPerAnnotation[annotId];
	    const cssPerSegments: { [segmentId: string]: CSSDefinition } = {};
	    segments.forEach(seg => {
		cssPerSegments[seg] = css;
	    });
	    this.colorizeText(cssPerSegments);
	}
    }

    static styles: CSSResultGroup = [
	windowStyles,
	css`
 	    div.text-container {
 	    height: 100%;
 	    }
 	    div.content-container {
 	    height: 100%;
 	    }
 	    iframe {
 	    border: none; /* 1px solid silver; */
 	    }`
    ]
}


declare global {
    interface HTMLElementTagNameMap {
	"seed-text-view": SeedTextView;
    }
}
