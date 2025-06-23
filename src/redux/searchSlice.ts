import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import type {
    CombinedState,
    QueryDefinition,
    FetchArgs,
    FetchBaseQueryError,
    BaseQueryFn,
} from "@reduxjs/toolkit/query";
import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";

import type { SearchResponse, SearchQuery } from "./searchTypes";
import { solrSearchQuery, solrSearchInSingleDoc } from "./searchTypes";

/*
 * The `searchApi` slice is the redux slice we get from running
 * queries against the search engine. We are using RTK Query for this.
 */
export const searchApi = createApi({
    reducerPath: "searchApi",
    baseQuery: fetchBaseQuery({
        // TODO: make this configurable, see https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#constructing-a-dynamic-base-url-using-redux-state
    }),
    endpoints: (builder) => ({
        // get documents matching the search query
        documents: builder.query<SearchResponse, SearchQuery>({
            query: (qry) =>
                `${qry.apiBaseUrl}/${qry.collection}/select${solrSearchQuery(qry)}`,
            serializeQueryArgs: serializeQueryArgs,
        }),
        // get documents matching the search query, used after adding or removing a filter
        filter: builder.query<SearchResponse, SearchQuery>({
            query: (qry) =>
                `${qry.apiBaseUrl}/${qry.collection}/select${solrSearchQuery(qry)}`,
            serializeQueryArgs: serializeQueryArgs,
        }),
        // get a single document matching the search query. _fq_id should be set in the query.
        document: builder.query<
            SearchResponse,
            { query: SearchQuery; documentId: string }
        >({
            query: ({ query: qry, documentId: docId }) =>
                `${qry.apiBaseUrl}/${qry.collection}/select${solrSearchInSingleDoc(qry, docId)}`,
            serializeQueryArgs: serializeQueryArgsDict,
        }),
        facetTerms: builder.query<SearchResponse, SearchQuery>({
            query: (qry) =>
                `${qry.apiBaseUrl}/${qry.collection}/select${solrSearchQuery(qry, false, true)}`,
            serializeQueryArgs: serializeFacetTerms,
        }),
        // get all used field names from the solr index
        fields: builder.query<Array<String>, SearchQuery>({
            query: (qry) => ({
                url: `${qry.apiBaseUrl}/${qry.collection}/select?q=*%3A*&wt=csv&rows=0`,
                // Since the response body is csv, the default
                // response handler is not suitable. See
                // https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery#parsing-a-response
                responseHandler: (response) => response.text(),
            }),
            serializeQueryArgs: serializeFieldsQuery,
            transformResponse: (
                response: String,
                _meta: FetchBaseQueryMeta | undefined,
                _arg: SearchQuery,
            ) => {
                return response.split(",");
            },
        }),
    }),
});

function serializeQueryArgs(args: {
    queryArgs: SearchQuery;
    endpointDefinition: any;
    endpointName: string;
}) {
    const qs = solrSearchQuery(args.queryArgs);
    return defaultSerializeQueryArgs({
        queryArgs: qs,
        endpointDefinition: args.endpointDefinition,
        endpointName: args.endpointName,
    });
}

function serializeQueryArgsDict(args: {
    queryArgs: { query: SearchQuery; documentId?: string | undefined };
    endpointDefinition: any;
    endpointName: string;
}) {
    let qs: string;
    if (args.queryArgs.documentId) {
        qs = solrSearchInSingleDoc(
            args.queryArgs.query,
            args.queryArgs.documentId,
        );
    } else {
        qs = solrSearchQuery(args.queryArgs.query);
    }
    return defaultSerializeQueryArgs({
        queryArgs: qs,
        endpointDefinition: args.endpointDefinition,
        endpointName: args.endpointName,
    });
}

function serializeFacetTerms(args: {
    queryArgs: SearchQuery;
    endpointDefinition: any;
    endpointName: string;
}) {
    const qs = solrSearchQuery(args.queryArgs, false, true);
    return defaultSerializeQueryArgs({
        queryArgs: qs,
        endpointDefinition: args.endpointDefinition,
        endpointName: args.endpointName,
    });
}

function serializeFieldsQuery(args: {
    queryArgs: SearchQuery;
    endpointDefinition: any;
    endpointName: string;
}) {
    return `${args.queryArgs.apiBaseUrl}/${args.endpointName}('${args.queryArgs.collection}')`;
}

//export type SearchState = typeof searchApi.reducer
export type SearchState = CombinedState<
    {
        // this lists all endpoint types
        documents: QueryDefinition<
            SearchQuery,
            BaseQueryFn<
                string | FetchArgs,
                unknown,
                FetchBaseQueryError,
                {},
                FetchBaseQueryMeta
            >,
            never,
            SearchResponse,
            "searchApi"
        >;
        filter: QueryDefinition<
            SearchQuery,
            BaseQueryFn<
                string | FetchArgs,
                unknown,
                FetchBaseQueryError,
                {},
                FetchBaseQueryMeta
            >,
            never,
            SearchResponse,
            "searchApi"
        >;
        document: QueryDefinition<
            { query: SearchQuery; documentId: string },
            BaseQueryFn<
                string | FetchArgs,
                unknown,
                FetchBaseQueryError,
                {},
                FetchBaseQueryMeta
            >,
            never,
            SearchResponse,
            "searchApi"
        >;
        facetTerms: QueryDefinition<
            SearchQuery,
            BaseQueryFn<
                string | FetchArgs,
                unknown,
                FetchBaseQueryError,
                {},
                FetchBaseQueryMeta
            >,
            never,
            SearchResponse,
            "searchApi"
        >;
        fields: QueryDefinition<
            SearchQuery,
            BaseQueryFn<
                string | FetchArgs,
                unknown,
                FetchBaseQueryError,
                {},
                FetchBaseQueryMeta
            >,
            never,
            Array<String>,
            "searchApi"
        >;
    },
    never,
    "searchApi"
>;

// TODO: does not work, since it needs react hooks
//export const { useDocumentsQuery } = searchApi
