import { html } from "lit";
import { property } from "lit/decorators.js";
import { customElement } from "lit/decorators.js";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";

import { SeedState } from "./redux/seed-store";
import {
    fetchMappingAlignment,
    fetchRegexAlignment,
} from "./redux/synopsisSlice";
import { fetchAnnotations } from "./redux/annotationsSlice";
import { fetchResourceCenteredJson } from "./redux/ontologySlice";
import { fetchDataLabels } from "./redux/dataLabelSlice";
import { setDefType } from "./redux/searchQuerySlice";

@customElement("seed-config")
export class SeedConfig extends StoreConsumerElement<SeedState, any> {
    @property({ attribute: "ontology-urls", type: String })
    ontologyUrls!: string;

    @property({ attribute: "annotations-url", type: String })
    annotationsUrl!: string;

    @property({ attribute: "regex-alignment" })
    regexAlignment!: string;

    @property({ attribute: "mapping-alignment" })
    mappingAlignment!: string;

    @property({ attribute: "data-labels" })
    dataLabels!: string;

    @property({ attribute: "solr-query-parser" })
    solrQueryParser!: string;

    override subscribeStore(): void {
        // Dispatch actions so that config properties are propagated
        // to the redux store.
        if (this.solrQueryParser)
            this.store?.dispatch(setDefType(this.solrQueryParser));
        if (this.annotationsUrl)
            this.store?.dispatch(fetchAnnotations(this.annotationsUrl));
        if (this.regexAlignment)
            this.store?.dispatch(fetchRegexAlignment(this.regexAlignment));
        if (this.mappingAlignment)
            this.store?.dispatch(fetchMappingAlignment(this.mappingAlignment));
        if (this.dataLabels)
            this.store?.dispatch(fetchDataLabels(this.dataLabels));
        if (this.ontologyUrls)
            this.store?.dispatch(fetchResourceCenteredJson(this.ontologyUrls));
    }

    render() {
        return html`<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-config": SeedConfig;
    }
}
