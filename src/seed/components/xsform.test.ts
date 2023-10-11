import { expect, test } from 'vitest';
import { DefaultValueConverter, XSFormFieldFactory } from './xsform';
import { StringDefaultValueConverter, PassDefaultValueConverter, BooleanDefaultValueConverter } from './xsform';


test("string default value converter", () => {
    const converter: DefaultValueConverter = new StringDefaultValueConverter();
    expect(converter.convert("'hello'")).toBe("hello");
})

test("pass default value converter", () => {
    const converter: DefaultValueConverter = new PassDefaultValueConverter();
    expect(converter.convert("9")).toBe("9");
    expect(converter.convert("'hello'")).toBe("'hello'");
})

test("boolean default value converter", () => {
    const converter: DefaultValueConverter = new BooleanDefaultValueConverter();
    expect(converter.convert("")).toBe("");
    expect(converter.convert("true()")).toBe("true");
    expect(converter.convert("false()")).toBe("false");
    expect(converter.convert("unknown")).toBe("unknown");
})


test("default value converter registry", () => {
    XSFormFieldFactory.addDefaultValueConverter("xs:string", "", new StringDefaultValueConverter());
    XSFormFieldFactory.addDefaultValueConverter("xs:boolean", "", new BooleanDefaultValueConverter());

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "") instanceof StringDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "").convert("'hello'")).toBe("hello");

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:boolean", "") instanceof BooleanDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:boolean", "").convert("true()")).toBe("true");

})
