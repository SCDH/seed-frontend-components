import { expect, test } from 'vitest';
import { DefaultValueConverter } from './xsform';
import { StringDefaultValueConverter, PassDefaultValueConverter } from './xsform';


test("string default value converter", () => {
    const converter: DefaultValueConverter = new StringDefaultValueConverter();
    expect(converter.convert("'hello'")).toBe("hello");
})

test("pass default value converter", () => {
    const converter: DefaultValueConverter = new PassDefaultValueConverter();
    expect(converter.convert("9")).toBe("9");
    expect(converter.convert("'hello'")).toBe("'hello'");
})
