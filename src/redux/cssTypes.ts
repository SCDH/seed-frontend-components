/*
 * A {CSSDefinition} is essentially an object to store CSS
 * properties. Properties should be a subset of {CSSStyleDeclaration}.
 */
export interface CSSDefinition {

    [key: string]: any;

}
