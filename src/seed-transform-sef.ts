import { PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SaxonJS } from 'saxon-js'; //const SaxonJS = require('saxon-js');

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
@customElement("seed-transform-sef")
export class SeedTransformSEF extends SeedTransformer {

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
		    const content = ""; // TODO: get file from URL
		    const result = await SaxonJS.transform({
			stylesheetLocation: this.getStylesheetLocation(),
			sourceType: "xml",
			sourceText: content,
			sourceBaseURI: this.href,
			destination: "serialized"});
		    this._result = result?.principalResult;
		    this._mediaType = "text/xml"; // TODO: response?.headers?.["content-type"];
		    this._error = null;
		} catch (err) {
		    this.reportError(err);
		}
	    } else if (this.src != null) {
		// POST
		console.log("POST file and parameters")
		console.log("parameters", this.parameters, "source", this.src, this.src.text());
		try {
		    // systemId has to be a valid URL, if empty string, we pass undefined instead
		    let systemId: string | undefined = this.href ?? undefined;
		    if (this.href?.length === 0 || this.href === null) {
			systemId = undefined;
		    }

		    const content = await this.src.text();
		    const result = await SaxonJS.transform({
			stylesheetLocation: this.getStylesheetLocation(),
			sourceType: "xml",
			sourceText: content,
			sourceBaseURI: systemId,
			destination: "serialized"});
		    this._result = result?.principalResult;
		    this._mediaType = "text/xml"; // response?.headers?.["content-type"];
		    this._error = null;
		} catch (err) {
		    this.reportError(err);
		}
	    }
	}
    }

    reportError(err:any): void {
	console.log("transformation failed", err);
	this._error = err;
    }

    getStylesheetLocation(): string {
	return this.transformationApi + "transform/" + this.transformation + "/stylesheet.sef";
    }
}

declare global {
    interface HTMLElementTagNameMap {
	"seed-transform-sef": SeedTransformSEF;
    }
}
