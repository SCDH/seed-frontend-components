import { expect, test } from 'vitest';
import { DefaultValueConverter, XSFormFieldFactory, registerDefaultValueConverters } from '../src/xsform';
import { StringDefaultValueConverter, PassDefaultValueConverter, BooleanDefaultValueConverter } from '../src/xsform';


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

    XSFormFieldFactory.resetDefaultValueConverters();

    XSFormFieldFactory.addDefaultValueConverter("xs:string", "", new StringDefaultValueConverter());
    XSFormFieldFactory.addDefaultValueConverter("xs:boolean", "", new BooleanDefaultValueConverter());

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "") instanceof StringDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "").convert("'hello'")).toBe("hello");

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:boolean", "") instanceof BooleanDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:boolean", "").convert("true()")).toBe("true");

})

test("default value converter registry has fallback", () => {

    XSFormFieldFactory.resetDefaultValueConverters();

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "") instanceof PassDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "").convert("'hello'")).toBe("'hello'");


})


test("default value converter registry filled by registerDefaultValueConverters()", () => {

    XSFormFieldFactory.resetDefaultValueConverters();
    registerDefaultValueConverters();

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "") instanceof StringDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:string", "").convert("'hello'")).toBe("hello");

    expect(XSFormFieldFactory.getDefaultValueConverter("xs:boolean", "") instanceof BooleanDefaultValueConverter).toBe(true);
    expect(XSFormFieldFactory.getDefaultValueConverter("xs:boolean", "").convert("true()")).toBe("true");

})
