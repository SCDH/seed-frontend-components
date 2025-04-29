import { HTMLTemplateResult, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { SeedState } from "./redux/seed-store";
import { DataLabel } from "./redux/dataLabelSlice";

import log from "./logging";

/*
 * A custom element that make a label from the identifier given as the
 * value of its `key` property. This can be used for labels, that are
 * define in data, not in the web app.
 *
 * @example
 * In an digital scholarly edition, named entities are conciliated
 * (mapped to global identifiers from an authority file). At some
 * places, e.g., facet terms, these identifiers are provided by the
 * backend. This slice provides human readable labels, i.e., the
 * names, to the user in the frontend.
 *
 * @example
 * ```
 * <seed-data-label key="http://de.wikipedia.de/Albrecht_Dürer"></seed-data-label>
 * ```
 *
 * This would show up as `<div data-key="...">Albrecht Dürer</div>`,
 * provided that the labelling data is available in the frontend.
 */
@customElement("seed-data-label")
export class SeedDataLabel extends StoreConsumerElement<SeedState, any> {
    /*
     * The identifier to get the label for.
     */
    @property()
    key!: string;

    /*
     * The label is extracted from the stores `dataLabels` slice.
     */
    @state()
    label!: DataLabel;

    protected override firstUpdated(
        changedProperties: PropertyValues<this>,
    ): void {
        super.firstUpdated(changedProperties);
        // Listening to changes in the redux state store would not be
        // the right thing here, since the data labels are loaded when
        // the application starts up. So we can just read the label
        // once in the lifecycle of this web component.
        if (this.store !== undefined && this.key !== undefined)
            this.label = this.store.getState().dataLabels[this.key];
    }

    override render(): HTMLTemplateResult {
        let lang = navigator.language; // TODO: strip country?
        if (this.label !== undefined) {
            log.info("label present");
            return html`<span data-key="${this.key}"
                >${this.label[lang as keyof DataLabel] ??
                this.label.default}</span
            >`;
        } else return html`<span data-key="${this.key}">${this.key}</span>`;
    }
}
