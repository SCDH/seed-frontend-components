import { html, LitElement, CSSResultGroup, HTMLTemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { addListener } from '@reduxjs/toolkit';

import { storeConsumerMixin } from './store-consumer-mixin';
import { SeedState } from './redux/seed-store';
import { Annotation } from './redux/annotationsSlice';
import { windowMixin, windowStyles } from './window-mixin';
import log from "./logging";

/*
 * The {SeedAnnotationPermanent} object is Lit web component for
 * displaying the annotation given in the annotation state slice as
 * `annotationSelected`.
 */
@customElement("seed-annotation-permanent")
export class SeedAnnotationPermanent extends windowMixin(storeConsumerMixin(LitElement)) {

    @property({ state: true } )
    annotationId: string | null = null;

    @property({ state: true })
    annotationBody: string | null = null;

    @property({ state: true })
    annotation: Annotation | null = null;

    @property({ attribute: true })
    width: string = "auto";

    @property({ attribute: true })
    height: string = "auto";

    @property({ attribute: true })
    display: string = "block";

    @property({ attribute: true })
    clas: string = "annotations";


    subscribeStore(): void {
	log.debug("subscribing component to the redux store, element with Id " + this.id);
	if (this.store === undefined) {
	    log.debug("no store yet for element with Id ", this.id);
	}
	// This kind of subscription with store.dispatch(addListener(...)) needs a store with listener middleware, see
	// https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware

	// listen for changes on annotation[this.annotationId]
	this.store?.dispatch(addListener({
	    predicate: (_action, currentState, previousState): boolean => {
		// log.debug("checking predicate for element with Id " + this.id);
		let currState: SeedState = currentState as SeedState;
		let prevState: SeedState = previousState as SeedState;
		return prevState.annotations.annotationSelected !== currState.annotations.annotationSelected;
	    },
	    effect: (_action, listenerApi): void => {
		log.debug("cssPerSegment updated for element with Id " + this.id)
		let state: SeedState = listenerApi.getState() as SeedState;
		this.annotationId = state.annotations.annotationSelected;
		if (this.annotationId) {
		    this.annotation = state.annotations.annotations[this.annotationId];
		}
	    }
	}));
    }

    /*
     * Render the web component.
     */
    renderContent() {
	return html`<div class="annotation-container annotation-permanent">${this.renderAnnotationId()}${this.renderAnnotationBody()}</div>`;
    }

    renderAnnotationId() {
	if (this.annotationId == null) {
	    return html`<div class="annotation-id empty">(no annotation selected)</div>`;
	} else {
	    return html`<div class="annotation-id">Annotation <span>${this.annotationId}</span></div>`;
	}
    }

    renderAnnotationBody() {
	if (this.annotation == null) {
	    return html``;
	} else {
	    // TODO: deeper check if this is a security issue!
	    // Cf. https://github.com/lit/lit.dev/issues/448
	    // Cf. https://stackoverflow.com/questions/64769225/javascript-lit-element-safe-way-to-parse-html
	    return html`<div class="annotation-body" .innerHTML=${this.annotation.body}></div>`;
	}
    }

    protected headerTemplate() {
	return html`<div>
	    <span>Annotations</span>
	</div>`;
    }

    /*
     * Scoped styles with dynamic properties. Override this with
     * what you need.
     */
    protected styleTemplate(): HTMLTemplateResult {
            return html`<style>:host {
                display: ${this.display};
		width: ${this.width};
                height: ${this.height};
            }</style>`;
    }

    static styles: CSSResultGroup = [
	windowStyles,
    ];

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-annotation-permanent": SeedAnnotationPermanent;
    }
}
