import { html, LitElement, CSSResultGroup, css } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { consume } from '@lit/context';
import { addListener, UnknownAction } from '@reduxjs/toolkit';

import { TextViewsSlice } from "./redux/textViewsSlice";
import { SeedState } from './redux/seed-store';


import log from "./logging";
import { SeedSynopsisText } from './seed-synopsis-text';
import { windowStyles } from './window-mixin';
import { seedTextViewContext } from './seed-context';
import { storeConsumerMixin } from './store-consumer-mixin';


/*
 * `seed-state-scroll-position` is a custom HTML element to be used in
 * the status line of a window. It shows the scroll position and
 * allows to scroll to user input.
 */
@customElement("seed-state-scroll-position")
export class SeedStateScrollPosition extends storeConsumerMixin(LitElement) {

    @state()
    @consume({ context: seedTextViewContext })
    protected textView?: SeedSynopsisText;

    @state()
    protected position?: string; // binding to this.textView?.position does not work!

    @query("#scrollTo")
    protected scrollToInput!: HTMLInputElement;

    subscribeStore(): void {
	if (this.store === undefined) {
	    log.debug("no store yet");
	}
	this.store?.dispatch(addListener({
	    predicate: (_action: UnknownAction, currentState, _previousState): boolean => {
		// log.debug("checking predicate for element with Id " + this.id);
		let currState: { textViews: TextViewsSlice } = currentState as SeedState;
		return currState.textViews.hasOwnProperty(this.textView?.id ?? "_") && currState.textViews[this.textView?.id ?? "_"]?.scrollPosition !== this.position;
	    },
	    effect: (_action, listenerApi): void => {
		//log.debug("cssPerSegment updated for element with Id " + this.id)
		let state: SeedState = listenerApi.getState() as SeedState;
		this.position = state.textViews[this.textView?.id ?? "_"]?.scrollPosition ?? undefined;
	    }
	}));
    }

    render() {
	return html`<span class="window-status-item">
	    <span class="scroll-position">
		<label for="scrollTo">Position</label>
		<input name="scrollTo" id="scrollTo" type="text" value="${this.position}"/>
		<button class="unicode-button" @click="${this.handleScrollToInput}" title="Go to manually entered position!">&#x23ce;</button>
	    </span>
	</span>`;
    }

    handleScrollToInput(): void {
	log.info("manual scroll to");
	const scrollTarget: string = this.scrollToInput.value.trim();
	this.dispatchEvent(new CustomEvent("scrollTo", {
	    bubbles: true,
	    detail: { scrollTo: scrollTarget }
	}));
    }

    // see https://lit.dev/docs/components/styles/#inheriting-styles-from-a-superclass
    static styles: CSSResultGroup = [
	windowStyles,
	css`:host { border: none; }`
    ];

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-state-scroll-position": SeedStateScrollPosition;
    }
}
