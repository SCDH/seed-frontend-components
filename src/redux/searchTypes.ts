/*
 * The type for a Solr response data object returned on `/solr/COLLECTION/select?...`
 */
export interface SearchResponse {
    responseHeader: ResponseHeader;

    response: Response;

    facet_counts: undefined | FacetCounts;
}

/*
 * The type of the header in the Solr response data object.
 */
export interface ResponseHeader {
    zkConnected: boolean;
    status: bigint;
    QTime: bigint;
    params: Parameters;
}

export interface Parameters {
    q: string;
    indent: boolean;
    useParams: string;
    _: string;
}

/*
 * The type of the "response" field in the Solr response data object.
 */
export interface Response {
    numFound: number;
    start: number;
    numFoundExact: boolean;
    docs: Array<Document>;
}

/*
 * A document is an object, where the property names are names of
 * stored Solr fields and the property values are stored fields. So
 * the structure depends on the indexed data and the managed schema.
 */
export interface Document {
    [field: string]: FieldValue;
}

/*
 * The field values are either arrays or singlular field values.
 */
export type FieldValue = Array<any> | any;

/*
 * The facets part of the Solr response object.
 */
export interface FacetCounts {
    facet_queries: any;
    facet_fields: FacetFields;
    facet_ranges: any;
    facet_intervals: any;
    facet_heatmaps: any;
}

/*
 * The facet fields are similar to `Document`.
 */
export interface FacetFields {
    [facet_field: string]: FacetTerms;
}

/*
 * The property values of `FacetFields` are arrays of field values
 * interleaved with counts. Ugh, ugly!
 */
export type FacetTerms = Array<string | number>;

export interface TermCountTuple {
    term: string;
    count: number;
}

export function toTermCountTuples(
    facetTerms: FacetTerms,
): Array<TermCountTuple> {
    var rc: Array<TermCountTuple> = [];
    var i: number = 0;
    while (i < facetTerms.length) {
        rc.push({
            term: facetTerms[i] as string,
            count: facetTerms[i + 1] as number,
        });
        i = i + 2;
    }
    return rc;
}

export const initialResponseHeader = {
    zkConnected: false,
    status: 0,
    QTime: 0,
    params: {},
};

export const initialResponse: Response = {
    numFound: 0,
    start: 0,
    numFoundExact: true,
    docs: [],
};

export const initialSearchResponse = {
    responseHeader: initialResponseHeader,
    response: initialResponse,
    facet_counts: undefined,
};

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
    collection: string;

    /*
     * Selects the query parser.
     */
    defType: string;

    q: string;

    fq: string | undefined;

    /*
     * Use for setting up facet filtering via the fq parameter.
     */
    _fq_faceted: FacetFilterQuery | undefined;

    /*
     * Use for restricting result to a single document!
     */
    _fq_id: string | undefined;

    q_op: string;

    fl: Array<string>;

    /*
     * Specifies a default searchable field. Used by startard (lucene) and eDisMax parser
     */
    df: string | undefined;

    /*
     * Query fields. Used by DisMax and eDisMax query parser.
     */
    qf: Array<string>;

    indent: boolean;

    /*
     * If set to `true`, this parameter enables facet counts in the query response.
     */
    facet: boolean;

    /*
     * Identifies a field that should be treated as a facet. This
     * parameter can be specified multiple times in a query to select
     * multiple facet fields.
     */
    facet_fields: Array<string>;

    params: string;
}

export interface FacetFilterQuery {
    [field: string]: Array<string>;
}

export const initialSearchQuery: SearchQuery = {
    collection: "tei4", // default collection
    defType: "edismax",
    q: "*", // match all in edismax
    fq: undefined,
    df: undefined,
    qf: [],
    _fq_id: undefined,
    _fq_faceted: {} as FacetFilterQuery,
    q_op: "OR",
    fl: ["id"],
    indent: true,
    facet: true,
    facet_fields: [],
    params: "",
};

/*
 * Make a Solr search query from the given `SearchQuery` object.
 *
 * @param query - the search query, mostly taken from the slice
 *
 * @param singleDocumentId - this may optionally be a string of a
 * single document to retrieve. If this a string, the facet filters
 * will be ignored and all existing fields will be returned for the
 * document ID.
 *
 * @param facetSetup - this may optionally set to `true` and is usable
 * for initiating a query to get all facet terms. When true, facet
 * filters will be removed from the query.
 */
export function solrSearchQuery(
    query: SearchQuery,
    singleDocumentId?: string | false,
    facetSetup?: boolean,
): string {
    var rc: string = "";

    rc += "?defType=" + (query?.defType ?? "lucene");

    rc += "&q=" + query.q;

    if (
        query.defType == "lucene" ||
        !query.defType ||
        query.defType == "edismax"
    ) {
        rc += "&q.op=" + query.q_op;
    }

    if (
        (query.defType == "dismax" || query.defType == "edismax") &&
        query.qf.length > 0
    ) {
        rc += "&qf=";
        const l: number = query.qf.length - 1;
        query.qf.forEach((field: string, i: number) => {
            rc += field;
            if (i < l) rc += " ";
        });
    }

    if (query.defType == "dismax") {
        rc += "&q.alt=*";
    }

    // Apply facet filters and select fields if and only if the query
    // is not for a single document. Reason: We want all fields if we
    // query a single document and we want it only once (per query in
    // the q parameter).
    if (query._fq_id || singleDocumentId) {
        if (query._fq_id) {
            rc += "&fq=id:" + query._fq_id;
        } else {
            rc += "&fq=id:" + singleDocumentId;
        }
    } else {
        if (query.fl.length > 0) {
            rc += "&fl=";
            query.fl.forEach((f) => (rc += f + ","));
        }

        if (!query.defType || query.defType == "lucene") {
            if (query.df !== undefined) {
                rc += "&df=" + query.df;
            }
        }

        if (query.fq !== undefined) {
            rc += "&fq=" + query.fq;
        }

        if (!facetSetup) {
            const fields: Array<string> = Object.keys(query._fq_faceted ?? {});
            for (const field of fields) {
                const terms: Array<string> = query._fq_faceted?.[field] ?? [];
                if (terms.length > 0) {
                    rc += "&fq=" + field + ":(";
                    var i = 0;
                    for (const term of terms) {
                        if (i > 0) {
                            rc += " OR ";
                        }
                        rc += '"' + term + '"';
                        i++;
                    }
                    rc += ")";
                }
            }
        }

        if (query.facet || facetSetup) {
            rc += "&facet=true";
            query.facet_fields.forEach((f) => {
                rc += "&facet.field=" + f;
            });
        }
    }

    rc += "&params=" + query.params;

    return encodeURI(rc);
}
