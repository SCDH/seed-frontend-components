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

    collection: string,

    q: string,

}
