import { html, LitElement, HTMLTemplateResult, CSSResult, unsafeCSS } from 'lit'
import { customElement, property, state, query, queryAll } from 'lit/decorators.js'
import { DefaultApiFactory, TransformationInfo, XsltParameterDetailsValue } from '@scdh/seed-xml-transformer-ts-client/api.ts'
import { TransformRESTElement } from './transform-rest.ts'
import { SeedTransformREST } from './seed-transform-rest.ts'
import { XSFormFieldFactory, registerDefaultValueConverters, DefaultValueConverter } from './xsform'

import styles from './seed-transform-forms.css'

// define the web component
@customElement("seed-choose-transform-rest")
export class SeedChooseTransformREST extends TransformRESTElement {

    static styles: CSSResult = unsafeCSS(styles);

    @property() // { type: Array<String> })
    transformations: Array<String> = [];

    @property({ attribute: "form-id", reflect: true })
    public formId: string = "seed-transform-rest-form";

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

    protected noPrintTransformationInfo: Array<String> = ["parameterDescriptors", "libraries"];

    @state()
    protected _formError: string | null = null;

    @query("seed-transform-rest-params")
    protected _parametersForm: SeedTransformRestParams | undefined;


    render(): HTMLTemplateResult {
	return html`<div class="transformation-chooser"><div class="form"><form name="${this.formId}" id="${this.formId}" @submit="${this.submit}" autocomplete="off" method="post">${this.renderTransformationChooser()}${this.renderError()}${this.renderSourceForm()}<seed-transform-rest-params></seed-transform-rest-params>${this.renderSubmit()}</form></div></div><slot></slot>`;
    }

    renderSubmit(): HTMLTemplateResult {
	if (this._transformation == null) {
	    return html`<div class="inputfield submit"><input type="submit" disabled="true" value="Transform"/></div>`;
	} else {
	    return html`<div class="inputfield submit"><input type="submit" value="Transform"/></div>`;
	}
    }

    renderTransformationChooser(): HTMLTemplateResult {
	return html`<div class="inputfield transformation"><label for="transformation">Transformation ID<label><select name="transformation" id="transformation" @change="${this.transformationSelected}" required><option value="" disabled selected hidden>Please choose...</option>${this._transformations.map(t => html`<option value="${t}">${t}</option>`)}${this.renderTransformationInfo()}</select>${this.renderTransformationInfo()}</div>`;
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
	    return html`<div class="transformation-info-container"><div class="heading">About this transformation</div><div class="transformation-info">${keys.map(k => html`<div class="property ${k}"><span class="key">${k}</span> <span class="value">${this._transformationInfo?.[k as keyof TransformationInfo]}</span></div>`)}${this.renderLibraries()}</div>${this.renderParameterDescriptions()}</div>`;
	}
    }

    renderLibraries(): HTMLTemplateResult {
	if (this._transformationInfo?.libraries === null) {
	    return html``;
	} else {
	    return html`<div class="property libraries"><span class="key">libraries</span> ${this._transformationInfo?.libraries?.map(l => html`<span class="value library">${l.location}</span> `)}</div>`;
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
	return html`<div class="parameter ${name}">${this.renderParameterName(name)}${this.renderParameterType(name)}${this.renderParameterDescriptionText(name)}${this.renderParameterDefaultValue(name)}</div>`;
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
	return html`<span class="type">${p?.underlyingDeclaredType}</span>`;
    }

    renderParameterDescriptionText(name: string): HTMLTemplateResult {
	const desc: string | null = this._transformationInfo?.parameterDescriptors?.[name]?.["description"] ?? null;
	if (desc != null) {
	    return html`<span class="description ${name}">${desc}</span>`;
	} else {
	    return html`<span class="description not-available ${name}">not available</span>`;
	}
    }

    renderParameterDefaultValue(name: string): HTMLTemplateResult {
	const dflt: string | null = this._transformationInfo?.parameterDescriptors?.[name]?.["default"] ?? null;
	if (dflt != null) {
	    return html`<span class="default-value ${name}">${dflt}</span>`;
	} else {
	    return html`<span class="default-value not-available ${name}">not available</span>`;
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
	// pass properties down
	if (this._parametersForm != undefined) {
	    this._parametersForm.transformation = transformation;
	}
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
		// get input data from for data. This violates the events up principle! TODO
		const params = this._parametersForm?.getFormInput() ?? {};
		console.log("parameters from parameters form", params);
		// properties down
		transformer["transformation"] = this._transformation;
		transformer.href = systemId;
		transformer.src = files?.[0] ?? null;
		transformer.parameters = params;
	    }
	}
    }

    protected async collectTransformationInformation(transformation: string) {
	this._transformationInfo = await this.getTransformationInfo(transformation);
	this._parameterDetails = await this.getTransformationParameterDescriptors(transformation) ?? {};
	// pass properties down
	if (this._parametersForm != undefined) {
	    this._parametersForm.transformationInfo = this._transformationInfo ?? undefined;
	    this._parametersForm.parameterDetails = this._parameterDetails;
	}
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
		// pass properties down
		if (this._parametersForm != undefined) {
		    this._parametersForm.transformation = ts[0];
		}
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
	// pass setup information down to descendants
	if (this._parametersForm != undefined) {
	    this._parametersForm.formId = this.formId;
	}

    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-choose-transform-rest": SeedChooseTransformREST;
    }
}

@customElement("seed-transform-rest-params")
export class SeedTransformRestParams extends LitElement {

    static styles: CSSResult = unsafeCSS(styles);

    public inputFormPrefix: string = "parameter.";

    @property({ attribute: "form-id", reflect: true })
    public formId: string | undefined;

    @property()
    public transformation: string | undefined;

    @property()
    public transformationInfo: TransformationInfo | undefined;

    @property()
    public parameterDetails: { [key: string]: XsltParameterDetailsValue; } | undefined;

    @property()
    public includes: Array<string> = [];

    @property()
    public excludes: Array<string> = [];

    @state()
    protected _error: string | null = null;

    @queryAll("input")
    protected _inputFields!: NodeListOf<HTMLInputElement>;

    render(): HTMLTemplateResult {
	if (this.transformation === undefined || this.transformationInfo === undefined) {
	    return html`<slot></slot>`;
	} else {
	    let params: Array<string> = Object.keys(this.parameterDetails ?? {});
	    if (this.excludes.length > 0 && this.includes.length > 0) {
		this._error = "Configuration Error: excludes and includes are both set";
	    } else if (this.excludes.length > 0) {
		params = params.filter(k => !this.excludes.includes(k));
	    } else if (this.includes.length > 0) {
		params = params.filter(k => this.includes.includes(k));
	    }
	    if (params.length === 0) {
		return html`<div class="no-parameters">No params</div><slot></slot>`;
	    } else {
		return html`<div class="inputfield parameters parameters-form"><label>Parameters</label>${params.map(p => this.renderParameterForm(p))}<div><slot></slot>`;
	    }
	}
    }

    renderParameterForm(param: string): HTMLTemplateResult {
	const dflt: string | null = this.transformationInfo?.parameterDescriptors?.[param]?.["default"] ?? null;
	if (dflt === null) {
	    return html`<div class="inputfield parameter ${param}"><label class="parameter-name">${param}</span><div class="input-field ${param}"><input form="${this.formId}" name="${this.inputFormPrefix + param}" id="${this.inputFormPrefix + param}"></input></div>`;
	} else {
	    return html`<div class="inputfield parameter ${param}"><label class="parameter-name">${param}</span><div class="input-field ${param}"><input type="text" form="${this.formId}" name="${this.inputFormPrefix + param}" id="${this.inputFormPrefix + param}" value="${this.convertDefaultValue(param, dflt)}"></input></div>`;
	}
    }

    convertDefaultValue(param: string, value: string): string {
	const paramDetails: XsltParameterDetailsValue | undefined = this.parameterDetails?.[param];
	if (paramDetails != undefined) {
	    const converter: DefaultValueConverter = XSFormFieldFactory.getDefaultValueConverter(paramDetails.itemType, paramDetails.occurrenceIndicator);
	    return converter.convert(value);
	} else {
	    console.log("no parameter details for", param);
	    return value;
	}
    }

    /**
     * Get the an plain (json) object from form input.
     */
    public getFormInput(): { [key: string]: string } {
	let rc: { [key: string]: string } = {};
	for (var inputField of this._inputFields) {
	    // only add changed values to return object
	    if (inputField.value != inputField.defaultValue) {
		const name: string = inputField.name.substring(this.inputFormPrefix.length);
		console.log("input field changed", name, inputField.value);
		rc[name] = inputField.value as string;
	    }
	}
	return rc;
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-transform-rest-params": SeedTransformRestParams;
    }
}
