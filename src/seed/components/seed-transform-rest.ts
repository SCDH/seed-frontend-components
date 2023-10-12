import { html, css, HTMLTemplateResult, PropertyValues, CSSResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TransformRESTElement } from './transform-rest.ts'
import { DefaultApiFactory } from '@scdh/seed-xml-transformer-ts-client/api.ts'
import axios, { AxiosError } from 'axios';

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
		    const response = await api.transformTransformationUrlPost(this.transformation, this.href, this.makeRuntimePayload());
		    this._result = response.data;
		} catch (err) {
		    this.reportError(err);
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
		    const response = await api.transformTransformationPost(this.transformation, this.src, systemId, this.makeRuntimePayload());
		    this._result = response.data;
		} catch (err) {
		    this.reportError(err);
		}
	    }
	}
    }

    makeRuntimePayload(): { [key: string]: {} } {
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
	    // pass result down to slotted children
	    const slot = this.shadowRoot?.querySelector("slot");
	    console.log("slotted", slot?.assignedElements({flatten: true}));
	    // filter for elements with @srcdoc, e.g. iframe
	    // this is ductyping
	    const consumer: HTMLIFrameElement | null =
		slot?.assignedElements({flatten: true})?.filter(e => "srcdoc" in e)?.[0] as HTMLIFrameElement;
	    console.log("consumer", consumer);
	    if (consumer === null || consumer === undefined) {
		console.log("no rest transformer in slotted children");
		this._error = "HTML Error: no consumer in slotted children";
	    } else {
		// properties down
		// TODO: how to get contents of file object?
		consumer.srcdoc = await this._result as unknown as string;
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
