import { HTMLTemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { changed } from "./store-consumer-decorators";
import { SeedState } from "./redux/seed-store";
import { DataLabel, mkDefaultLabel } from "./redux/dataLabelSlice";

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
    @changed<SeedState, SeedDataLabel, DataLabel | undefined>((s, c) => {
        if (c?.key !== undefined)
            if (s?.dataLabels[c.key] !== undefined) return s.dataLabels[c.key];
            else return mkDefaultLabel(c?.key);
    })
    label!: DataLabel;

    override render(): HTMLTemplateResult {
        let lang = navigator.language; // TODO: strip country?
        if (this.label !== undefined)
            return html`<span data-key="${this.key}"
                >${this.label[lang as keyof DataLabel] ??
                this.label.default}</span
            >`;
        else return html`<span data-key="${this.key}">${this.key}</span>`;
    }
}
