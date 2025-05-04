//import { LitElement } from "lit";

import { StoreConsumerElement } from "./store-consumer-mixin";
import { SeedState, addAppListener } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { addFilter, removeFilter } from "./redux/searchQuerySlice";
import { SearchQuery, solrSearchQuery } from "./redux/searchTypes";

import log from "./logging";

// /*
//  * A mixin class for web components that display search results. This
//  * also mixes in the `storeConsumerMixin`.
//  */
// export const searchResultMixin = <T extends Constructor<LitElement>>(
//     superClass: T,
// ) => {
//     abstract class SearchResultMixin extends storeConsumerMixin<
//         SeedState,
//         any
//     >()(superClass) {
//
//     ...
//
//     return SearchResultMixin;
// };

export abstract class SearchResultElement extends StoreConsumerElement<
    SeedState,
    any
> {
    /*
     * Override the `subscribeStore()` method from the
     * `storeConsumerMixin`. It subscribes to store actions that
     * result in a change of search results; the abstract
     * `updateEffect` method is called on changes.
     */
    override subscribeStore() {
        log.debug("subscribing to search result");
        if (this.store === undefined) {
            log.debug("no store yet for element with Id ", this.id);
        }
        // get documents from state store
        this.store?.dispatch(
            addAppListener({
                matcher: searchApi.endpoints.documents.matchFulfilled,
                effect: async (_action, listenerApi) =>
                    this.updateEffect(
                        searchApi.endpoints.documents.name,
                        listenerApi.getState(),
                    ),
            }),
        );
        // get result when a filter was applied and the query was initiated
        this.store?.dispatch(
            addAppListener({
                matcher: searchApi.endpoints.filter.matchFulfilled,
                effect: async (_action, listenerApi) =>
                    this.updateEffect(
                        searchApi.endpoints.filter.name,
                        listenerApi.getState(),
                    ),
            }),
        );
        // get result for search queries already initiated
        // 1. filter removed, result already present from document(...) query, i.e., all filters were removed
        this.store?.dispatch(
            addAppListener({
                matcher: removeFilter.match,
                effect: (_action, listenerApi) =>
                    this.updateEffect(
                        searchApi.endpoints.documents.name,
                        listenerApi.getState(),
                    ),
            }),
        );
        // 2. filter removed, result already present from filter(...) query
        this.store?.dispatch(
            addAppListener({
                matcher: removeFilter.match,
                effect: (_action, listenerApi) =>
                    this.updateEffect(
                        searchApi.endpoints.filter.name,
                        listenerApi.getState(),
                    ),
            }),
        );
        // 2. filter added, result already present from filter(...) query
        this.store?.dispatch(
            addAppListener({
                matcher: addFilter.match,
                effect: (_action, listenerApi) =>
                    this.updateEffect(
                        searchApi.endpoints.filter.name,
                        listenerApi.getState(),
                    ),
            }),
        );
        // at the end:
        // call update effect, if the query was already processed
        const q: SearchQuery | undefined = this.store?.getState().searchQuery;
        if (q !== undefined) {
            const queryId: string =
                searchApi.endpoints.document.name +
                '("' +
                solrSearchQuery(q).replaceAll('"', '\\"') +
                '")';
            if (
                this.store?.getState().searchApi.queries.hasOwnProperty(queryId)
            ) {
                this.updateEffect(
                    searchApi.endpoints.document.name,
                    this.store.getState(),
                );
            }
        }
    }

    /*
     * The `updateEffect` function is called as effect when the search
     * result is updated. Subclasses must implement it.
     */
    abstract updateEffect(endpoint: string, state: SeedState): void;
}
