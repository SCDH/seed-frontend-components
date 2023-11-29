import { PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'
import axios, { AxiosError } from 'axios';

import { DefaultApiFactory, RuntimeParameters } from '@scdh/seed-xml-transformer-ts-client/api.ts'

import { WorkaroundApiFactory } from './workaround-transformer-api'
import { SeedTransformer } from './transformation-api-client.ts'


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
export class SeedTransformREST extends SeedTransformer {

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
		this._mediaType = null;
		this._result = null;
	    } else if (this.src === null && this.href != null) {
		// POST
		console.log("from URL, POST parameters");
		try {
		    const api = DefaultApiFactory(this.getConfiguration());
		    const response = await api.transformTransformationUrlPost(this.transformation, this.href, this.makeRuntimePayload());
		    this._result = response.data;
		    this._mediaType = response?.headers?.["content-type"];
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

		    // assert that we have a File object
		    var source: File;
		    if (this.src instanceof Blob) {
			source = new File([this.src], systemId ?? "uploaded");
		    } else {
			source = this.src;
		    }

		    const response = await api.transformTransformationPost(this.transformation, source, systemId, params, {});
		    console.log(response);
		    this._result = response.data;
		    this._mediaType = response?.headers?.["content-type"];
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

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-transform-rest": SeedTransformREST;
    }
}
