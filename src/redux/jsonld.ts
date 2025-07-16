/**
 * A JSON-LD graph, consisting of a default graph `@graph` and a
 * `@context`.
 */
export interface JsonLD<T> {
    /**
     * The default graph.
     */
    "@graph": Array<T>;

    /**
     * The context object.
     */
    "@context"?: Object;
}

/**
 * Transform a JSON-LD graph into an object, the keys of which are
 * made from a key of the objects in the graph, e.g., from "@id", and
 * the values of which are the objects.
 *
 * @param input - the JSON-LD input graph.
 *
 * @param idKey - the property of the graph's object to use as keys of the resulting object.
 */
export function graphToResourceObjects<T extends Object>(
    input: JsonLD<T>,
    idKey: keyof T & string,
): { [key: string]: T } {
    var output: { [key: string]: T } = {};
    input["@graph"].forEach((obj: T) => {
        if (obj.hasOwnProperty(idKey)) {
            // @ts-ignore
            const ident: string = obj[idKey];
            output[ident] = obj;
        }
    });
    return output;
}
