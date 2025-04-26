import { html, CSSResultGroup, HTMLTemplateResult, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { SeedState } from "./redux/seed-store";
import { Annotation } from "./redux/annotationsSlice";
import { changed } from "./store-consumer-decorators";

/*
 * The {SeedAnnotationPermanent} object is Lit web component for
 * displaying the annotation given in the annotation state slice as
 * `annotationSelected`.
 */
@customElement("seed-annotation-permanent")
export class SeedAnnotationPermanent extends StoreConsumerElement<
    SeedState,
    any
> {
    @property({ state: true })
    @changed<SeedState, String | null>((s) => s.annotations.annotationSelected)
    annotationId!: string;

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

    protected override willUpdate(
        changedProperties: PropertyValues<this>,
    ): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has("annotationId")) {
            let state = this.store?.getState() as SeedState;
            this.annotation = state.annotations.annotations[this.annotationId];
        }
    }

    /*
     * Render the web component.
     */
    render() {
        return html`<div class="annotation-container annotation-permanent">
            ${this.renderAnnotationId()}${this.renderAnnotationBody()}
        </div>`;
    }

    renderAnnotationId() {
        if (this.annotationId == null) {
            return html`<div class="annotation-id empty">
                (no annotation selected)
            </div>`;
        } else {
            return html`<div class="annotation-id">
                Annotation <span>${this.annotationId}</span>
            </div>`;
        }
    }

    renderAnnotationBody() {
        if (this.annotation == null) {
            return html``;
        } else {
            // TODO: deeper check if this is a security issue!
            // Cf. https://github.com/lit/lit.dev/issues/448
            // Cf. https://stackoverflow.com/questions/64769225/javascript-lit-element-safe-way-to-parse-html
            return html`<div
                class="annotation-body"
                .innerHTML=${this.annotation.body}
            ></div>`;
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
        return html`<style>
            :host {
                display: ${this.display};
                width: ${this.width};
                height: ${this.height};
            }
        </style>`;
    }

    static styles: CSSResultGroup = [];
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-annotation-permanent": SeedAnnotationPermanent;
    }
}
