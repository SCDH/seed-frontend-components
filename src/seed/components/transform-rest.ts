import { LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { Configuration } from '@scdh/seed-xml-transformer-ts-client/configuration.ts'
//import { DefaultApiFactory } from 'seed-xml-transformer-ts-client/api.ts'


export abstract class TransformRESTElement extends LitElement {

    @property({ type: String })
    transformationApi!: string;

    protected getConfiguration(): Configuration {
	return new Configuration({
	    basePath: this.transformationApi
	});
    }

    propagateApiInformation(element: TransformRESTElement):void  {
	element.transformationApi = this.transformationApi;
    }
}
