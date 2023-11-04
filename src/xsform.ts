/*
 * An interface for default value converters. Default values originate
 * from xsl:param/@select attribtue values in XSLT
 * stylesheets. Generally the values need to be converted. E.g. for an
 * xs:string value, the quote must be removed.
 */
export interface DefaultValueConverter {

    /**
     * Convert the value from xsl:param/@select to HTML form data.
     *
     * @param value {string} - the value given in xsl:param/@select
     * @return the value suitable for the HTML form and suitable for
     * passing it to the REST interface of the SEED XML Transformer.
     */
    convert(value: string): string;

}


/**
 * A converter from default values of type xs:string. The quotes are
 * removed.
 */
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

/**
 * A converter from default values of type xs:boolean. The parens are
 * removed.
 */
export class BooleanDefaultValueConverter implements DefaultValueConverter {

    convert(value: string): string {
	if (value == "true()") {
	    return "true";
	} else if (value == "false()") {
	    return "false";
	} else if (value == "") {
	    return "";
	} else {
	    console.log("unknown xs:boolean default value", value);
	    return value;
	}
    }

}

/**
 * This converter for XSLT default parameter values leaves the value
 * untouched.
 */
export class PassDefaultValueConverter implements DefaultValueConverter {

    convert(value: string): string {
	return value;
    }

}

/**
 * A registry for converters that follows the factory pattern for
 * instantiating converters. A converter for default values for a
 * sequence of xs:string values can be instantiated by calling the
 * static method
 * {XSFormFieldFactory.getDefaultValueConverter("xs:string", "*")}.
 *
 * For registering new use the static method
 * {XSFormFieldFactory.addDefaultValueConverter(your-converter)}.
 */
export class XSFormFieldFactory {

    /**
     * This is a static property (class property)!
     */
    private static defaultValueConverters: { [key: string]: DefaultValueConverter } = {};

    static fallbackDefaultValueConverter: DefaultValueConverter = new PassDefaultValueConverter();


    /**
     * A static method for registering converters for default values.
     */
    static addDefaultValueConverter(itemType:string, occurrenceIndicator: string, converter: DefaultValueConverter) {
	const key: string = XSFormFieldFactory.mkKey(itemType, occurrenceIndicator) ?? "null";
	XSFormFieldFactory.defaultValueConverters[key] = converter;
    }

    /*
     * A static method for getting an instance of a converter for
     * default values from a pair of xs-type and occurrence indicator.
     *
     * @param itemType {string} - the xs item type, e.g. "xs:string" or "xs:boolean"
     * @param occurrenceIndicator {string} - the sequence indicator, e.g. empty string or "*"
     * @returns The registered converter or a fallback converter
     */
    static getDefaultValueConverter(itemType?: string, occurrenceIndicator?: string) {
	const key: string | null = XSFormFieldFactory.mkKey(itemType, occurrenceIndicator);
	if (key === null) {
	    return XSFormFieldFactory.fallbackDefaultValueConverter;
	} else if (key in XSFormFieldFactory.defaultValueConverters) {
	    return XSFormFieldFactory.defaultValueConverters[key];
	} else if ("all"+occurrenceIndicator in XSFormFieldFactory.defaultValueConverters) {
	    return XSFormFieldFactory.defaultValueConverters["all" + occurrenceIndicator];
	} else {
	    return XSFormFieldFactory.fallbackDefaultValueConverter;
	}
    }

    protected static mkKey(itemType?: string, occurrenceIndicator?: string): string | null {
	if (itemType === undefined || occurrenceIndicator === undefined) {
	    return null;
	} else {
	    return itemType + occurrenceIndicator;
	}
    }

    /**
     * Removes all registered converters for default values.
     */
    static resetDefaultValueConverters(): void {
	XSFormFieldFactory.defaultValueConverters = {};
    }

}

/**
 * Register all the converters from this package.
 */
export function registerDefaultValueConverters(): void {
    XSFormFieldFactory.addDefaultValueConverter("xs:string", "", new StringDefaultValueConverter());
    XSFormFieldFactory.addDefaultValueConverter("xs:boolean", "", new BooleanDefaultValueConverter());
    XSFormFieldFactory.addDefaultValueConverter("all", "", new PassDefaultValueConverter());
}
