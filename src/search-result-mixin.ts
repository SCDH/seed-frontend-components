import { LitElement } from "lit";

import { storeConsumerMixin } from "./store-consumer-mixin";
import { SeedState, addAppListener, SeedListenerApi } from "./redux/seed-store";
import { searchApi } from "./redux/searchSlice";
import { addFilter, removeFilter } from "./redux/searchQuerySlice";

import log from "./logging";

type Constructor<T = {}> = new (...args: any[]) => T;

/*
 * A mixin class for web components that display search results. This
 * also mixes in the `storeConsumerMixin`.
 */
export const searchResultMixin = <T extends Constructor<LitElement>>(
    superClass: T,
) => {
    abstract class SearchResultMixin extends storeConsumerMixin<
        SeedState,
        any
    >()(superClass) {
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
                            listenerApi,
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
                            listenerApi,
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
                            listenerApi,
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
                            listenerApi,
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
                            listenerApi,
                        ),
                }),
            );
        }

        /*
         * The `updateEffect` function is called as effect when the search
         * result is updated. Subclasses must implement it.
         */
        abstract updateEffect(
            endpoint: string,
            listenerApi: SeedListenerApi,
        ): void;
    }

    return SearchResultMixin;
};
