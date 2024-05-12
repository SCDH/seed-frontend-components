import { html, css, LitElement, CSSResultGroup, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { addListener, UnsubscribeListener, UnknownAction } from '@reduxjs/toolkit';

import { storeConsumerMixin } from './store-consumer-mixin';
import { windowMixin, windowStyles } from './window-mixin';
import { widgetSizeConsumer } from './widget-size-consumer';

import { addAppListener } from "./redux/seed-store";
import { initText, setText, TextState, TextsSlice } from "./redux/textsSlice";
import { TextViewsSlice, initTextView, setText as setTextViewText, scrolledTo, fetchAnnotationsPerSegment } from "./redux/textViewsSlice";
import { selectAnnotationsAtSegmentThunk, passByAnnotationsAtSegmentThunk } from "./redux/selectAnnotations";
import { CSSDefinition } from './redux/cssTypes';
import { scrolled, syncOthers } from './redux/synopsisSlice';
import { scrolledTextViewThunk } from './redux/synopsisActions';
import { setScrollTarget, WithScrollTarget } from './redux/synopsisMiddleware';

import log from "./logging";

import { SeedState } from './redux/seed-store';



// define the web component
@customElement("seed-synopsis-text")
export class SeedSynopsisText extends widgetSizeConsumer(windowMixin(storeConsumerMixin(LitElement))) implements WithScrollTarget {

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

    @property({ attribute: false, state: true })
    scrollTarget!: string;

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

	// get the text title / listen for changes
	this.store?.dispatch(addListener({
	    predicate: (_action: UnknownAction, currentState, previousState): boolean => {
		let currState: { textViews: TextViewsSlice, texts: TextsSlice } = currentState as SeedState;
		let prevState: { textViews: TextViewsSlice, texts: TextsSlice } = previousState as SeedState;
		return currState.textViews.hasOwnProperty(this.id)
		    // && currState.textViews[this.id].textId !== null
		    // && currState.texts.hasOwnProperty(currState.textViews[this.id]?.textId ?? "unknown")
		    && currState.texts[currState.textViews[this.id]?.textId ?? "unknown"] !== prevState.texts[currState.textViews[this.id]?.textId ?? "unknown"];
 ;
	    },
	    effect: (_action, listenerApi): void => {
		let state: SeedState = listenerApi.getState() as SeedState;
		this.title = state.texts[state.textViews[this.id]?.textId ??
		    "unknown"].title ?? state.texts[state.textViews[this.id]?.textId ?? "unknown"].author ??
		    "unknown";
	    }
	}));

	// this.store?.dispatch(addAppListener({
	//     actionCreator: scrolled,
	//     effect: setScrollTarget(this, this.id),
	// })); 
	this.store?.dispatch(addAppListener({
	    actionCreator: syncOthers,
	    effect: setScrollTarget(this, this.id),
	})); 

	// this.storeUnsubscribeListeners.push(subsc);
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
	// TODO: store.dispatch(disposeTextView({viewId: this.id});
    }

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	super.willUpdate(changedProperties);
	if (changedProperties.has("scrollTarget" as keyof SeedSynopsisText)) {
	    const msg = {
		"event": "sync",
		"scrollTarget": this.scrollTarget,
	    };
	    this.iframe.contentWindow?.postMessage(msg, window.location.href);
	}
    }

    protected headerTemplate() {
	return html`<div><span>${this.id}:</span> <span>${this.source}</span>`;
    }

    protected iframeTemplate() {
	return html`<div class="content-container" id="${this.id}-content-container"><iframe src="${this.content}" id="${this.id}-content" width="98%" height="100%" allowfullscreen="allowfullscreen"></iframe></div>`;
    }

    footerTemplate() {
	return html`<div>Position: <span class="scroll-position">${this.position}</span> <button @click="${this.syncOtherViews}">sync others</botton></div>`;
    }

    renderContent() {
	return html`<div class="synopsis-text-container">${this.iframeTemplate()}</div>`;
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
		    this.position = e.data.top;
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


    protected stripFragment(url: string): string {
	let pos = url.indexOf("#");
	if (pos >= 0) {
	    return url.substring(0, pos);
	} else {
	    return url;
	}
    }

    protected syncOtherViews = (_e: Event) => {
	log.debug("syncing others");
	this.store?.dispatch(scrolledTextViewThunk(syncOthers, this.id, [this.position]));
    }

    /*
     * Pass data for colorizing the annotations in the text via the
     * post message channel down to the document displayed in the iframe.
     */
    colorizeText(): void {
	log.debug("colorizing text in widget " + this.id);
	const msg = {
	    "event": "colorize",
	    "cssPerSegment": this.cssPerSegment,
	};
	this.iframe.contentWindow?.postMessage(msg, window.location.href);
    }

    static styles: CSSResultGroup = [
	windowStyles,
	css`
 	    div.synopsis-text-container {
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
	"seed-synopsis-text": SeedSynopsisText;
    }
}
