import { html, css, HTMLTemplateResult, CSSResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { DefaultApiFactory, TransformationInfo, XsltParameterDetailsValue } from 'seed-xml-transformer-ts-client/api.ts'
import { TransformRESTElement } from './transform-rest.ts'
import { SeedTransformREST } from './seed-transform-rest.ts'

// define the web component
@customElement("seed-choose-transform-rest")
export class SeedChooseTransformREST extends TransformRESTElement {

    @property() // { type: Array<String> })
    transformations: Array<String> = [];

    @state()
    protected _error: any | null = null;

    @state()
    protected _transformations: Array<String> = [];

    @state()
    protected _transformation: string | null = null;

    @state()
    protected _transformationInfo: TransformationInfo | null = null;

    @state()
    protected _parameterDetails: { [key: string]: XsltParameterDetailsValue; } | null = null;

    protected noPrintTransformationInfo: Array<String> = ["parameterDescriptors"];

    @state()
    protected _formError: string | null = null;


    render(): HTMLTemplateResult {
	return html`<div class="transformation-container"><form @submit="${this.submit}" autocomplete="off">${this.renderTransformationChooser()}${this.renderError()}${this.renderTransformationInfo()}${this.renderSourceForm()}${this.renderSubmit()}</form></div><slot></slot>`;
    }

    renderSubmit(): HTMLTemplateResult {
	if (this._transformation == null) {
	    return html`<div class="inputfield source"><input type="submit" disabled="true" value="Transform"/></div>`;
	} else {
	    return html`<div class="inputfield source"><input type="submit" value="Transform"/></div>`;
	}
    }

    renderTransformationChooser(): HTMLTemplateResult {
	return html`<div class="inputfield transformation"><label for="transformation">Transformation ID<label><select name="transformation" id="transformation" @change="${this.transformationSelected}" required><option value="" disabled selected hidden>Please choose...</option>${this._transformations.map(t => html`<option value="${t}">${t}</option>`)}${this.renderTransformationInfo()}</select></div>`;
    }

    renderError(): HTMLTemplateResult {
	if (this._error != null) {
	    return html`<div class="error">${this._error}<div>`;
	} else {
	    return html``;
	}
    }

    renderTransformationInfo(): HTMLTemplateResult {
	if (this._transformationInfo == null) {
	    return html``;
	} else {
	    const keys: Array<String> = Object.keys(this._transformationInfo).filter(k => !this.noPrintTransformationInfo.includes(k));
	    return html`<div class="transformation-info-container"><div class="heading">About this transformation</div><div class="transformation-info">${keys.map(k => html`<div class="property ${k}"><span class="key">${k}</span> <span class="value">${this._transformationInfo?.[k as keyof TransformationInfo]}</span></div>`)}</div>${this.renderParameterDescriptions()}</div>`;
	}
    }

    renderParameterDescriptions(): HTMLTemplateResult {
	console.log("parameters", this._transformationInfo?.parameterDescriptors)
	if (this._parameterDetails == null) {
	    return html``;
	} else {
	    const details: { [key: string]: XsltParameterDetailsValue; } = this._parameterDetails;
	    let names: Array<string> = Object.keys(details);
	    return html`<div class="parameters"><div class="heading">Runtime Parameters</div>${names.map(n => this.renderParameterDescription(n))}</div>`;
	}
    }

    renderParameterDescription(name: string): HTMLTemplateResult {
	return html`<div class="parameter ${name}">${this.renderParameterName(name)}${this.renderParameterType(name)}${this.renderParameterDescriptionText(name)}</div>`;
    }

    renderParameterName(name: string): HTMLTemplateResult {
	console.log("name", name);
	if (this?._parameterDetails?.[name]?.isRequired) {
	    return html`<span class="name ${name}">${name}<sup class="required">*</sup></span>`;
	} else {
	    return html`<span class="name ${name}">${name}</span>`;
	}
    }

    renderParameterType(name: string): HTMLTemplateResult {
	let p = this?._parameterDetails?.[name];
	return html`<span class="type">${p?.underlyingDeclaredType}${p?.occurrenceIndicator}</span>`;
    }

    renderParameterDescriptionText(name: string): HTMLTemplateResult {
	if (this?._transformationInfo?.parameterDescriptors?.[name]?.description) {
	    return html`<span class="description ${name}">${this._transformationInfo.parameterDescriptors[name].description}</span>`;
	} else {
	    return html`<span class="description not-available ${name}">not available</span>`;
	}
    }

    renderSourceForm(): HTMLTemplateResult {
	return html`<div class="inputfield source"><label for="source">XML Source Document</label><input type="file" id="source" name="source" accept="text/xml, application/xml, text/xhtml"/></div><div class="inputfield systemId"><label for="systemId">URL / System ID</label><input type="text" id="systemId" name="systemId"/></div>${this.renderSourceFormError()}`;
    }

    renderSourceFormError(): HTMLTemplateResult {
	if (this._formError === null) {
	    return html``;
	} else {
	    return html`<div class="error">${this._formError}</div>`;
	}
    }




    protected async transformationSelected(e: Event) {
	let transformation = (e?.target as HTMLSelectElement)?.value;
	console.log("selected", transformation);
	this._transformation = transformation;
	this._formError = null;
	this.collectTransformationInformation(transformation);
    }

    protected async submit(e: SubmitEvent) {
	console.log("form submitted");
	// we stop default handling of the submit event, i.e. sending
	// form data to the server
	// https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
	e.preventDefault();
	// get the form data from the shadow dom
	const systemId: string = (this.shadowRoot?.querySelector("#systemId") as HTMLInputElement)?.value;
	console.log("systemId", systemId);
	const files: FileList | null = (this.shadowRoot?.querySelector("#source") as HTMLInputElement)?.files;
	console.log("files", files);

	// validate input
	if ((this._transformationInfo?.requiresSource ?? false) && systemId.length === 0 && files !== null && files[0] === undefined) {
	    console.log("either URL or file must be entered");
	    this._formError = "An XML source file or an URL is required.";
	} else {

	    // run the transformation
	    const slot = this.shadowRoot?.querySelector("slot");
	    console.log(slot?.assignedElements({flatten: true}));
	    const transformer: SeedTransformREST | null = slot?.assignedElements({flatten: true})?.[0] as SeedTransformREST;
	    console.log(transformer);
	    if (transformer === null) {
		console.log("no rest transformer in slotted children");
		this._error = "HTML Error: no transformer in slotted children";
	    } else {
		// properties down
		transformer["transformation"] = this._transformation;
		transformer.href = systemId;
		transformer.src = files?.[0] ?? null;
	    }
	}
    }

    protected async collectTransformationInformation(transformation: string) {
	this._transformationInfo = await this.getTransformationInfo(transformation);
	this._parameterDetails = await this.getTransformationParameterDescriptors(transformation) ?? {};
    }

    protected async getTransformations(): Promise<Array<String>> {
	try {
	    const api = DefaultApiFactory(this.getConfiguration());
	    const response = await api.transformationsGet();
	    let restTransformations: Array<string> = response.data;
	    console.log("transformations available", restTransformations);
	    // check if transformations are narrowed down by @transformations
	    let ts: Array<string>;
	    if (this.transformations != null && this.transformations.length > 0) {
		ts = restTransformations.filter(k => this.transformations.includes(k));
	    } else {
		ts = restTransformations;
	    }

	    if (ts.length == 1) {
		this._transformation = ts[0];
		this.collectTransformationInformation(ts[0]);
	    }
	    return ts;
	} catch (err) {
	    console.log(err);
	    this._error = err;
	    return [];
	}

    }

    protected async getTransformationInfo(transformation: string): Promise<TransformationInfo | null> {
	try {
	    const api = DefaultApiFactory(this.getConfiguration());
	    let result = await api.transformTransformationInfoGet(transformation);
	    console.log("transformation info", result.data);
	    return result.data;
	} catch (err) {
	    console.error(err);
	    this._error = err;
	    return null;
	}
    }

    protected async getTransformationParameterDescriptors(transformation: string): Promise<{ [key: string]: XsltParameterDetailsValue; } | null> {
	try {
	    const api = DefaultApiFactory(this.getConfiguration());
	    let result = await api.transformTransformationParametersGet(transformation);
	    console.log("transformation parameters", result.data);
	    return result.data;
	} catch (err) {
	    console.error(err);
	    this._error = err;
	    return null;
	}
    }


    async connectedCallback() {
	super.connectedCallback();
	this._transformations = await this.getTransformations() ?? [];
    }

    static styles : CSSResult = css`
:host {
  border: 1px solid lightblue;
}
div.heading {
font-size: 1.2em;
text-decoration: underline 1px lightblue;
}
.not-available {
font-style: italic;
}
.error {
color: red;
}
select:invalid { color: darkgray; }
div.transformation-info-container {
  border: 1px solid lightblue;
}
div.transformation-info {
  height: 100%;
  font-family: monospace;
}
div.transformation-info .key {
  font-weight: 900;
  color: darkgray;
}
div.parameters div.parameter {
  height: 100%;
  font-family: monospace;
}
div.parameters div.parameter span {
display: block;
}
div.parameter .name {
font-weight: 900;
}
div.parameter span.name .required {
color: red;
}
div.parameter .type:before {
content: "Type: ";
font-weight: 900;
color: darkgray;
}
div.parameter .description:before {
content: "Description: ";
font-weight: 900;
color: darkgray;
}
`

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-choose-transform-rest": SeedChooseTransformREST;
    }
}
