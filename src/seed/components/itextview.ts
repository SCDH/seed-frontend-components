/**
 * A SeedTextViewElement is an HTML element that is able to present a text
 * in the UI. There is no determination on how the text is presented:
 * It can be presented for reading, it can be presented as a download link,
 * etc.  Typically, a SeedTextViewElement serves as a sink for
 * transformations.  A SeedTextViewElement has a srcdoc Attribute like
 * an HTMLIFrameElement.
 */
export interface SeedTextViewElement {

    /**
     * The srcdoc property can be used to get a text given as string
     * or File object into the element. This behaves exactly like
     * iframe/@srcdoc.
     */
    srcdoc: any;

}

/**
 * A function for testing if a given object is (behaves as) a
 * SeedTextViewElement.
 *
 * @param obj {any} - object to test
 * @return {boolean}
 */
export function seedTextViewElementIsAssignableBy(obj: any): obj is SeedTextViewElement {
    return `srcdoc` in obj;
}

/**
 * A SeedTypeTextViewElement is a {@link SeedTextViewElement} with an
 * additional mediaType property.
 */
export interface SeedTypedTextViewElement extends SeedTextViewElement {

    /**
     * Media Type information, e.g. "text/xml"
     */
    mediaType: string | undefined;

}


/**
 * A function for testing if a given object is (behaves as) a
 * SeedTypedTextViewElement.
 *
 * @param obj {any} - object to test
 * @return {boolean}
 */
export function seedTypedTextViewElementIsAssignableBy(obj: any): obj is SeedTypedTextViewElement {
    return `srcdoc` in obj && `mediaType` in obj;
}
