/*
 * The type for a Solr response data object returned on `/solr/COLLECTION/select?...`
 */
export interface SearchResponse {

    responseHeader: ResponseHeader,

    response: Response

}

/*
 * The type of the header in the Solr response data object.
 */
export interface ResponseHeader {

    zkConnected: boolean,
    status: bigint,
    QTime: bigint,
    params: Parameters

}

export interface Parameters {

    q: string,
    indent: boolean,
    useParams: string,
    _: string

}

/*
 * The type of the "response" field in the Solr response data object.
 */
export interface Response {

    numFound: number,
    start: number,
    numFoundExact: boolean,
    docs: Array<Document>,
    facet_counts: undefined | FacetCounts

}

/*
 * A document is an object, where the property names are names of
 * stored Solr fields and the property values are stored fields. So
 * the structure depends on the indexed data and the managed schema.
 */
export interface Document {

    [field: string]: FieldValue
}

/*
 * The field values are either arrays or singlular field values.
 */
export type FieldValue = Array<any> | any;

/*
 * The facets part of the Solr response object.
 */
export interface FacetCounts {

    facet_queries: any,
    facet_fields: FacetFields,
    facet_ranges: any,
    facet_intervals: any,
    facet_heatmaps: any

}

/*
 * The facet fields are similar to `Document`.
 */
export interface FacetFields {

    [facet_field: string]: FacetTerms

}

/*
 * The property values of `FacetFields` are arrays of field values
 * interleaved with counts. Ugh, ugly!
 */
export type FacetTerms = Array<string | number>;


export const initialResponseHeader = {
    zkConnected: false,
    status: 0,
    QTime: 0,
    params: {}
}

export const initialResponse: Response = {
    numFound: 0,
    start: 0,
    numFoundExact: true,
    docs: [],
    facet_counts: undefined,
}

export const initialSearchResponse = {
    responseHeader: initialResponseHeader,
    response: initialResponse
}



/*
 * The parameters of a search query are stored in an extra slice.
 *
 * TODO: same as Parameters + collection
 */
export interface SearchQuery {

    /*
     * The collection to search in. Note: If we want a search that can
     * search multiple collections, we should consider making this a
     * property name!
     */
    collection: string,

    q: string,

    q_op: string,

    fl: Array<string>,

    indent: boolean,

    /*
     * If set to `true`, this parameter enables facet counts in the query response.
     */
    facet: boolean;

    /*
     * Identifies a field that should be treated as a facet. This
     * parameter can be specified multiple times in a query to select
     * multiple facet fields.
     */
    facet_fields: Array<string>,


    params: string,

}

export const initialSearchQuery: SearchQuery = {
    collection: "tei4", // default collection
    q: "*%3A*",         // match all
    q_op: "OR",
    fl: [ "id" ],
    indent: true,
    facet: true,
    facet_fields: [],
    params: "",
}


export function solrSearchQuery(query: SearchQuery): string {
    var rc: string = "";

    rc += "?q=" + query.q;

    rc += "&q.op=" + query.q_op;

    if (query.fl.length > 0) {
	rc += "&fl=";
	query.fl.forEach(f => rc += f + ",");
    }

    if (query.facet) {
	rc += "&facet=true";
	query.facet_fields.forEach(f => {
	    rc += "&facet.field=" + f;
	})
    }

    rc += "&params=" + query.params;

    return rc;
}
