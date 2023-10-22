import { html, css, HTMLTemplateResult, PropertyValues, CSSResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TransformRESTElement } from './transform-rest.ts'
import { DefaultApiFactory, RuntimeParameters } from '@scdh/seed-xml-transformer-ts-client/api.ts'
import axios, { AxiosError } from 'axios';
import { SeedTextViewElement, seedTextViewElementIsAssignableBy } from './itextview.ts'

import { WorkaroundApiFactory } from './workaround-transformer-api'

// define the web component
@customElement("seed-transform-rest")
export class SeedTransformREST extends TransformRESTElement {

    @property() // { type: Array<String> })
    transformation: string | null = null;

    @property()
    parameters: { [key: string]: string } = {};

    @property()
    href: string | null = null;

    @property()
    src: File | null = null;

    @state()
    _result: File | null = null;

    @state()
    _error: any = null;

    override async willUpdate(changedProperties: PropertyValues<this>) {
	console.log("will update called");
	if (this.transformation != null &&
	    (changedProperties.has("transformation") ||
		changedProperties.has("parameters") ||
		changedProperties.has("href") ||
		changedProperties.has("src"))) {
	    console.log("has transformation and properties changed");
	    if (this.src === null && this.href === null) {
		console.log("not enough information");
		// TODO: nothing
		this._result = null;
	    } else if (this.src === null && this.href != null) {
		// GET
		console.log("from URL, POST parameters");
		try {
		    const api = DefaultApiFactory(this.getConfiguration());
		    const response = await api.transformTransformationUrlPost(this.transformation, this.href, this.makeRuntimePayload());
		    this._result = response.data;
		    this._error = null;
		} catch (err) {
		    this.reportError(err);
		}
	    } else if (this.src != null) {
		// POST
		console.log("POST file and parameters")
		const params: RuntimeParameters = this.makeRuntimePayload();
		console.log("parameters", params, "source", this.src, this.src.text());
		try {
		    // systemId has to be a valid URL, if empty string, we pass undefined instead
		    let systemId: string | undefined = this.href ?? undefined;
		    if (this.href?.length === 0 || this.href === null) {
			systemId = undefined;
		    }
		    const api = WorkaroundApiFactory(this.getConfiguration());
		    const response = await api.transformTransformationPost(this.transformation, this.src, systemId, params, {});
		    this._result = response.data;
		    this._error = null;
		} catch (err) {
		    this.reportError(err);
		}
	    }
	}
    }

    makeRuntimePayload(): RuntimeParameters {
	let rc: { [key: string]: {} } = {};
	rc["globalParameters"] = this.parameters;
	return rc;
    }

    reportError(err:any): void {
	console.log("transformTransformationUrlGet failed", err);
	if (axios.isAxiosError(err)) {
	    this._error = err + ". " + (err as AxiosError).response?.data;
	} else {
	    this._error = err;
	}
    }



    override async updated(changedProperties: PropertyValues<this>) {
	if (this._result != null && changedProperties.has("_result")) {
	    // pass result down to slotted children that are text view elements
	    const slot = this.shadowRoot?.querySelector("slot");
	    // filter for text view elements
	    for (var consumer of
		 slot?.assignedElements({flatten: true})?.filter(e => seedTextViewElementIsAssignableBy(e)) ?? []) {
		// properties down
		(consumer as unknown as SeedTextViewElement).srcdoc = await this._result;
	    }
	}
    }

    render(): HTMLTemplateResult {
	if (this._error === null) {
	    return html`<slot></slot>`;
	} else {
	    return html`<div class="error">${this._error}</div><slot></slot>`;
	}
    }

    static styles : CSSResult = css`.error { color: red; }`;

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-transform-rest": SeedTransformREST;
    }
}
