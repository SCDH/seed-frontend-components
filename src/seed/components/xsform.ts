export interface DefaultValueConverter {

    convert(value: string): string;

}

export class XSFormFieldFactory {

    static defaultValueConverters: { [key: string]: DefaultValueConverter } = {};

    static addDefaultValueConverter(itemType:string, occurrenceIndicator: string, converter: DefaultValueConverter) {
	const key: string = XSFormFieldFactory.mkKey(itemType, occurrenceIndicator);
	XSFormFieldFactory.defaultValueConverters[key] = converter;
    }
    
    static getDefaultValueConverter(itemType: string, occurrenceIndicator: string) {
	const key: string = XSFormFieldFactory.mkKey(itemType, occurrenceIndicator);
	return XSFormFieldFactory.defaultValueConverters?.[key];
    }

    protected static mkKey(itemType: string, occurrenceIndicator: string): string {
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
