import { html, LitElement, PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { connect } from 'pwa-helpers';
import { store, RootState } from "./redux/store";
import { fetchAnnotations, Annotation } from './redux/segmentsSlice';

/*
 * The {SeedAnnotationPermanent} object is Lit web component for
 * displaying the annotation given in the annotation state slice as
 * `annotationSelected`.
 */
@customElement("seed-annotation-permanent")
export class SeedAnnotationPermanent extends connect(store)(LitElement) {

    @property({ attribute: "annotations-url", type: String })
    annotationsUrl!: string;

    @property({ state: true } )
    annotationId: string | null = null;

    @property({ state: true })
    annotationBody: string | null = null;

    @property({ state: true })
    annotation: Annotation | null = null;

    /*
     * Pull in the state from the redux store and write them to
     * reactive properties that result in re-rendering the component
     * when changed.
     */
    stateChanged(_state: RootState): void {
	this.annotationId = _state.segments.annotationSelected;
	if (this.annotationId != null && _state.segments.annotations.hasOwnProperty(this.annotationId)) {
	    this.annotation = _state.segments.annotations[this.annotationId];
	} else {
	    this.annotation = null;
	}
    }

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("annotationsUrl" as keyof SeedAnnotationPermanent)) {
	    store.dispatch(fetchAnnotations(this.annotationsUrl));
	}
    }

    /*
     * Render the web component.
     */
    render() {
	return html`<div class="annotation-container annotation-permanent">${this.annotationIdTemplate()}${this.annotationBodyTemplate()}</div>`;
    }

    annotationIdTemplate() {
	if (this.annotationId == null) {
	    return html`<div class="annotation-id empty">(no annotation selected)</div>`;
	} else {
	    return html`<div class="annotation-id"><span>Annotation </span>${this.annotationId}</div>`;
	}
    }

    annotationBodyTemplate() {
	if (this.annotation == null) {
	    return html``;
	} else {
	    //return html`${this.annotation.body}`;
	    return html`<div class="annotation-id">${this.annotation.body}</div>`;
	}
    }

    _fetchAnnotations(): void {
	store.dispatch(fetchAnnotations(this.annotationsUrl));
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-annotation-permanent": SeedAnnotationPermanent;
    }
}
