//import { Action } from "@reduxjs/toolkit";
import { addListener } from "@reduxjs/toolkit";

import log from "./logging";
import { StoreConsumerElement } from "./store-consumer-mixin";

// type Interface<T> = {
//   [K in keyof T]: T[K];
// };

export function changed<S, V, C extends StoreConsumerElement<S, any>>(
    selector: (state: S) => V,
) {
    return function (target: C, key: string) {
        let currentValue!: V;

        Object.defineProperty(target, key, {
            set: (_newValue: V) => {
                log.error("a property decorated with @changed cannot be set");
            },
            get: () => {
                return currentValue;
            },
        });

        // in the early stage of setup, the store is always undefined!
        log.info("changed decorator setup");
        target.store?.dispatch(
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
                    let oldValue = currentValue;
                    currentValue = next;
                    target.requestUpdate(key, oldValue);
                },
            }),
        );
    };
}
