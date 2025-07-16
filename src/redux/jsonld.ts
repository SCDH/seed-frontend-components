/**
 * A JSON-LD graph, consisting of a default graph `@graph` and a
 * `@context`.
 */
export interface JsonLD {
    /**
     * The default graph.
     */
    "@graph": Array<Object>;

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
export function graphToResourceObjects(
    input: JsonLD,
    idKey: string,
): { [key: string]: Object } {
    var output: { [key: string]: Object } = {};
    input["@graph"].forEach((obj: Object) => {
        if (
            obj.hasOwnProperty(idKey) &&
            typeof obj[idKey as keyof typeof obj] === "string"
        ) {
            // @ts-ignore
            const ident: string = obj[idKey as keyof typeof obj];
            output[ident] = obj;
        }
    });
    return output;
}
