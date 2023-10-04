import { html, HTMLTemplateResult, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TransformRESTElement } from './transform-rest.ts'
import { DefaultApiFactory } from 'seed-xml-transformer-ts-client/api.ts'

// define the web component
@customElement("seed-transform-rest")
export class SeedTransformREST extends TransformRESTElement {

    @property({ type: String })
    apiBase: string = "";

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
		    const response = await api.transformTransformationUrlPost(this.transformation, this.href, this.parameters);
		    this._result = response.data;
		} catch (err) {
		    console.log("transformTransformationUrlGet failed", err);
		    this._error = err;
		}
	    } else if (this.src != null) {
		// POST
		console.log("POST file and parameters")
		console.log("src", this.src, this.src.text());
		try {
		    // systemId has to be a valid URL, if empty string, we pass undefined instead
		    let systemId: string | undefined = this.href ?? undefined;
		    if (this.href?.length === 0 || this.href === null) {
			systemId = undefined;
		    }
		    const api = DefaultApiFactory(this.getConfiguration());
		    const response = await api.transformTransformationPost(this.transformation, this.src, systemId, this.parameters);
		    this._result = response.data;
		} catch (err) {
		    console.log("transformTransformationUrlGet failed", err);
		    this._error = err;
		}
	    }
	}
    }

    render(): HTMLTemplateResult {
	return html`<div>${this._result}</div>`;
    }


}

declare global {
    interface HTMLElementTagNameMap {
	"seed-transform-rest": SeedTransformREST;
    }
}
