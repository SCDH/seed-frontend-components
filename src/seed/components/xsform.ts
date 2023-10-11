export interface DefaultValueConverter {

    convert(value: string): string;

}

export class XSFormFieldFactory {

    static defaultValueConverters: { [key: string]: Array<DefaultValueConverter> } = {};

    static addDefaultValueConverter(itemType:string, occurrenceIndicator: string, converter: DefaultValueConverter) {
	const key: string = this.getKey(itemType, occurrenceIndicator);
	this.defaultValueConverters[key] = converter;
    }
    
    static getDefaultValueConverter(itemType: string, occurrenceIndicator: string) {
	const key: string = this.getKey(itemType, occurrenceIndicator);
	return this.defaultValuesConverters[key];
    }

    protected getKey(itemType: string, occurrenceIndicator): string {
	return itemType + occurrenceIndicator;
    }

}

export class StringDefaultValueConverter implements DefaultValueConverter {

    convert(value: string): string {
	const len: number = value.length;
	try {
	    return value.substring(1, len - 1);
	} catch (err) {
	    return value;
	}
    }

}

export class PassDefaultValueConverter implements DefaultValueConverter {

    convert(value: string): string {
	return value;
    }

}
