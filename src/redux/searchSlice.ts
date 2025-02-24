import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { SearchResponse, SearchQuery } from './searchTypes'
import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import type { CombinedState, QueryDefinition, FetchArgs, FetchBaseQueryError, BaseQueryFn } from '@reduxjs/toolkit/query';


/*
 * The `searchApi` slice is the redux slice we get from running
 * queries against the search engine. We are using RTK Query for this.
 */
export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery: fetchBaseQuery({
	// TODO: make this configurable, see https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#constructing-a-dynamic-base-url-using-redux-state
	baseUrl: '/solr/',
	prepareHeaders: (headers) => {
	    headers.set("Authorization", "Basic c29scjpTb2xyUm9ja3M=");
	    // headers.set("Origin", "*");
	    return headers;
	}
    }),
    endpoints: (builder) => ({
	// get documents matching the search query
	documents: builder.query<SearchResponse, SearchQuery>({
	    query: (qry) => `${qry.collection}/select?q=${qry.q}&q.op=OR&indent=true&fl=id&useParams=`
	}),
	// get all used field names from the solr index
	fields: builder.query<Array<String>, string>({
	    query: (collection) => ({
		url: `${collection}/select?q=*%3A*&wt=csv&rows=0`,
		// Since the response body is csv, the default
		// response handler is not suitable. See
		// https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery#parsing-a-response
		responseHandler: (response) => response.text()
	    }),
	    transformResponse: (response: String, _meta: FetchBaseQueryMeta | undefined, _arg: string) => {
		return response.split(",");
	    }
	}),
    }),
})

//export type SearchState = typeof searchApi.reducer
export type SearchState = CombinedState<{
    // this lists all endpoint types
    documents: QueryDefinition<SearchQuery, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, SearchResponse, "searchApi">;
    fields:    QueryDefinition<string, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, Array<String>, "searchApi">;
}, never, "searchApi">

// TODO: does not work, since it needs react hooks
//export const { useDocumentsQuery } = searchApi
