import { html, css, HTMLTemplateResult, CSSResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { DefaultApiFactory, TransformationInfo, XsltParameterDetailsValue } from 'seed-xml-transformer-ts-client/api.ts'
import { TransformRESTElement } from './transform-rest.ts'

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


    render(): HTMLTemplateResult {
	return html`<div class="transformation-container">${this.renderTransformationChooser()}${this.renderError()}${this.renderTransformationInfo()}</div>`;
    }

    renderTransformationChooser(): HTMLTemplateResult {
	return html`<label for="transformations" @change="${this.notifySelect}">Choose a transformation:<label><select name="transformations" id="transformations">${this._transformations.map(t => html`<option value="${t}">${t}</option>`)}${this.renderTransformationInfo()}</select>`;
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



    protected async notifySelect(e: Event) {
	let transformation = (e?.target as HTMLSelectElement)?.value;
	console.log("selected", transformation);
	// this._transformation = transformation;
	this.collectTransformationInformation(transformation);
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
