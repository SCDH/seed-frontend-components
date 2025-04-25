import { addListener } from "@reduxjs/toolkit";

import log from "./logging";
import { StoreConsumerElement } from "./store-consumer-mixin";

/*
 * A decorator subscribes a property to changes in the redux store.
 *
 * @Remark: This kind of subscription with
 * `store.dispatch(addListener(...))` needs a store with listener
 * middleware, see
 * https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware
 */
export function changed<S, V, C extends StoreConsumerElement<S, any>>(
    selector: (state: S) => V,
) {
    return function (target: C, key: string) {
        // In the early stage of setup, the store is always undefined!
        // Thus, we push a function on a stack of functions for adding
        // listener middleware.
        log.debug("changed decorator setup for property " + key);
        const changeListener = (c: C & { [key]: V }) => {
            log.debug(
                "changed decorator adds listener middleware to the store ...",
            );
            const unsubscribe = c?.store?.dispatch(
                addListener({
                    predicate: (_action, currentState, previousState) => {
                        return (
                            selector(currentState as S) !==
                            selector(previousState as S)
                        );
                    },
                    effect: (_action, listenerApi): void => {
                        log.info("changed decorator effect");
                        let state: S = listenerApi.getState() as S;
                        let next: V = selector(state);
                        let k = key as keyof C;
                        let oldValue = c[k];
                        c[k] = next as any;
                        c.requestUpdate(k, oldValue);
                    },
                }),
            );
            return unsubscribe;
        };
        if (target.hasOwnProperty("listeners")) {
            target.listeners.push(changeListener);
        } else {
            target["listeners"] = [changeListener];
        }
    };
}
