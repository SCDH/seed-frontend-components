import { LitElement, HTMLTemplateResult, html, CSSResult, css, PropertyValues } from 'lit'
import { property, state } from 'lit/decorators.js'

import { Configuration } from '@scdh/seed-xml-transformer-ts-client/configuration.ts'

import { SeedTextViewElement, seedTextViewElementIsAssignableBy } from './itextview.ts'
import { SeedTypedTextViewElement, seedTypedTextViewElementIsAssignableBy } from './itextview.ts'

export abstract class TransformationAPIClient extends LitElement {

    @property({ type: String })
    transformationApi!: string;

    protected getConfiguration(): Configuration {
	return new Configuration({
	    basePath: this.transformationApi
	});
    }

    propagateApiInformation(element: TransformationAPIClient):void  {
	element.transformationApi = this.transformationApi;
    }
}


/**
 * SeedTransformer is an abstract class for a LitElement based web
 * component that that actually do a transformation, whether by
 * posting a request to the Transformation API or by doing something
 * else.
 *
 * A SeedTransformer works seamlessly with the forms provided in this
 * package.
 *
 * It writes the transformation result to slotted children
 * implementing {@link ./itextview!SeedTypedTextViewElement}.
 *
 * Subclasses should implement the {@link LitElement.willUpdate}
 * method for actually running the transformation.
 */
export abstract class SeedTransformer extends TransformationAPIClient {

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

    /**
     * The result of the transformation as the {@link File} object
     * returned by the TransformationAPI.
     */
    @state()
    protected _result: File | null = null;

    /**
     * The media type of the transformation result.
     */
    @state()
    protected _mediaType: string | null = null;

    /**
     * An error message displayed in the UI if the transformation
     * request failed.
     */
    @state()
    protected _error: any = null;

    /**
     * In the update() hook, we watch out for changes in the reactive
     * properties that are set when sending the transformation
     * request and getting its response.
     */
    override async updated(changedProperties: PropertyValues<this>) {
	if (this._result != null && changedProperties.has("_result" as keyof SeedTransformer)) {
	    // pass result down to slotted children that are text view elements
	    const slot = this.shadowRoot?.querySelector("slot");
	    // filter for text view elements
	    for (var consumer of
		 slot?.assignedElements({flatten: true})?.filter(e => seedTextViewElementIsAssignableBy(e)) ?? []) {
		// properties down
		if (seedTypedTextViewElementIsAssignableBy(consumer)) {
		    (consumer as unknown as SeedTypedTextViewElement).mediaType = this._mediaType ?? "";
		}
		(consumer as unknown as SeedTextViewElement).srcdoc = await this._result;
	    }
	} else if (this._error != null && changedProperties.has("_error" as keyof SeedTransformer)) {
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
