import { html, LitElement, PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { connect } from 'pwa-helpers';
import { store, RootState } from "./redux/store";
import { fetchAnnotations, Annotation } from './redux/annotationsSlice';
import { fetchResourceCenteredJson } from './redux/ontologySlice';

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

    @property({ attribute: "ontology-urls", type: String })
    ontologyUrls!: string;

    /*
     * Pull in the state from the redux store and write them to
     * reactive properties that result in re-rendering the component
     * when changed.
     */
    stateChanged(_state: RootState): void {
	this.annotationId = _state.annotations.annotationSelected;
	if (this.annotationId != null && _state.annotations.annotations.hasOwnProperty(this.annotationId)) {
	    this.annotation = _state.annotations.annotations[this.annotationId];
	} else {
	    this.annotation = null;
	}
    }

    protected willUpdate(changedProperties: PropertyValues<this>): void {
	if (changedProperties.has("annotationsUrl" as keyof SeedAnnotationPermanent)) {
	    store.dispatch(fetchAnnotations(this.annotationsUrl));
	}
	if (changedProperties.has("ontologyUrls" as keyof SeedAnnotationPermanent)) {
	    store.dispatch(fetchResourceCenteredJson(this.ontologyUrls));
	}
    }

    /*
     * Render the web component.
     */
    render() {
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

    _fetchAnnotations(): void {
	store.dispatch(fetchAnnotations(this.annotationsUrl));
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-annotation-permanent": SeedAnnotationPermanent;
    }
}
