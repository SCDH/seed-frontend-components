/*
 * Representation of resource-centric RDF/JSON serialization as
 * javascript data structure.
 */
export interface Statements {

    /*
     * Property names of a {Statements} object represent RDF resources
     * (subjects), property values are statements ({Predications}) on it.
     */
    [resource: string]: Predications

}

/*
 * {Predications} stores RDF/JSON statements about a
 * resource (resource centered). This is an object the properties of
 * which are {Array}s of the {RdfObject} type.
 */
export interface Predications {

    /*
     * Property names represent to RDF predicates, values are an
     * object in plural form.
     */
    [predicate: string]: Array<RdfObject>

}

/*
 * Representation of an RDF object. TODO: make more type safe.
 */
export interface RdfObject {

    /*
     * The type is either `"literal"` or `"resource"`.
     */
    type: string,

    value: string,

    datatype: string | undefined,

    /*
     * The `@lang` annotation on string literals.
     */
    lang: string | undefined,

}
