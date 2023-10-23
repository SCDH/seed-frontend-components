import { html, css, HTMLTemplateResult, PropertyValues, CSSResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TransformRESTElement } from './transform-rest.ts'
import { DefaultApiFactory, RuntimeParameters } from '@scdh/seed-xml-transformer-ts-client/api.ts'
import axios, { AxiosError, AxiosResponse } from 'axios';

import { SeedTextViewElement, seedTextViewElementIsAssignableBy } from './itextview.ts'
import { SeedTypedTextViewElement, seedTypedTextViewElementIsAssignableBy } from './itextview.ts'

import { WorkaroundApiFactory } from './workaround-transformer-api'

/**
 * The <seed-transform-rest> web component performs a transformation
 * by sending a request to the TrensformerAPI implemented by the SEED
 * XML Transformer.
 *
 * The component is designed to get its relevant input for making the
 * request from elements containing it, be it a dynamic for choosing a
 * transformation like <seed-choose-transform-rest> or a more complex
 * web application like a digital edition's web site.
 */


@customElement("seed-transform-rest")
export class SeedTransformREST extends TransformRESTElement {

    /**
     * The identifier of the transformation resource to use for
     * transforming the resource.
     */
    @property() // { type: Array<String> })
    public transformation: string | null = null;

    /**
     * The runtime parameters (stylesheet parameters) to be passed to
     * the transformation resource.
     */
    @property()
    public parameters: { [key: string]: string } = {};

    /**
     * The URL or systemId of the input file to be transformed. If
     * {@link src} is not set, then the transformation will query this
     * URL to get the source document to transform. If {@link src} is
     * set, the URL may still be relevant for resolving relative
     * paths, e.g., in XIncludes.
     */
    @property()
    public href: string | null = null;

    /**
     * The source document serving as input to be transformed. This
     * may be null, but then the {@link href} has to point to the URL
     * of the source document.
     */
    @property()
    public src: File | null = null;

    @state()
    private _response: AxiosResponse<File, any> | null = null;

    /**
     * The result of the transformation as the {@link File} object
     * returned by the TransformationAPI.
     */
    @state()
    _result: File | null = null;

    /**
     * An error message displayed in the UI if the transformation
     * request failed.
     */
    @state()
    _error: any = null;

    /**
     * In the willUpdate() hook we watch out for changes of the
     * reactive properties that are set by the containing element
     * (e.g. an input form). Changes will trigger a request to the
     * TransformationAPI.
     */
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
		this._response = null;
		this._result = null;
	    } else if (this.src === null && this.href != null) {
		// POST
		console.log("from URL, POST parameters");
		try {
		    const api = DefaultApiFactory(this.getConfiguration());
		    const response = await api.transformTransformationUrlPost(this.transformation, this.href, this.makeRuntimePayload());
		    this._result = response.data;
		    this._response = response;
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
		    console.log(response);
		    this._result = response.data;
		    this._error = null;
		} catch (err) {
		    this.reportError(err);
		}
	    }
	}
    }

    /**
     * A helper method that wraps the runtime parameters in the {@link
     * RuntimeParameters} object which is specified by the
     * TransformationAPI.
     */
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


    /**
     * In the update() hook, we watch out for changes in the reactive
     * properties that are set when sending the transformation
     * request and getting its response.
     */
    override async updated(changedProperties: PropertyValues<this>) {
	if (this._result != null && changedProperties.has("_result")) {
	    // pass result down to slotted children that are text view elements
	    const slot = this.shadowRoot?.querySelector("slot");
	    // filter for text view elements
	    for (var consumer of
		 slot?.assignedElements({flatten: true})?.filter(e => seedTextViewElementIsAssignableBy(e)) ?? []) {
		// properties down
		if (seedTypedTextViewElementIsAssignableBy(consumer)) {
		    (consumer as unknown as SeedTypedTextViewElement).mediaType = this._response?.headers?.["content-type"] ?? "";
		}
		(consumer as unknown as SeedTextViewElement).srcdoc = await this._result;
	    }
	} else if (this._error != null && changedProperties.has("_error")) {
	    // cause slotted children to no longer show results from successful transformations before
	    const slot = this.shadowRoot?.querySelector("slot");
	    // filter for text view elements
	    for (var consumer of
		 slot?.assignedElements({flatten: true})?.filter(e => seedTextViewElementIsAssignableBy(e)) ?? []) {
		// properties down
		if (seedTypedTextViewElementIsAssignableBy(consumer)) {
		    (consumer as unknown as SeedTypedTextViewElement).mediaType = undefined;
		}
		(consumer as unknown as SeedTextViewElement).srcdoc = "";
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
