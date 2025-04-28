import { addListener } from "@reduxjs/toolkit";

import log from "./logging";
import { StoreConsumerElement } from "./store-consumer-mixin";

export interface DecoratorOptions<S, C> {
    predicatePrecondition?: (state: S, connectedTarget: C) => boolean;
}

/*
 * This decorator subscribes an instance property to changes in the
 * redux store. It makes the property a reactive property by
 * triggering the update lifecycle when the change occurs.
 *
 * Usage:
 * ```
 * @changed<RootState, String | null>(s => s.annotations.annotationSelected)
 * annotationId!: string;
 * ```
 *
 * The two type parameters are 1) the type of the root state of the redux
 * store and 2) the type of the state property returned.
 *
 * The parameter is a type-save selector function on the root state, where
 * `s: RootState`.
 *
 * @Remark: This kind of subscription with
 * `store.dispatch(addListener(...))` needs a store with listener
 * middleware, see
 * https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware
 */
export function changed<S, C extends StoreConsumerElement<S, any>, V>(
    selector: (state: S, connectedTarget?: C) => V,
    options?: DecoratorOptions<S, C>,
) {
    return function (target: C, key: string) {
        // In the early stage of setup, the store is always undefined!
        // Thus, we push a function on a stack of functions for adding
        // listener middleware.
        log.debug("changed decorator setup for property " + key);
        const changeListener = (c: C & { [key]: V }) => {
            // make a clone for passing to the selector function
            log.debug(
                "changed decorator adds listener middleware to the store for property '" +
                    key +
                    "' on element",
                c,
            );
            const unsubscribe = c?.store?.dispatch(
                addListener({
                    predicate: (_action, currentState, previousState) => {
                        if (options?.predicatePrecondition !== undefined) {
                            if (
                                !options.predicatePrecondition(
                                    currentState as S,
                                    c,
                                )
                            ) {
                                return false;
                            }
                        }
                        return (
                            selector(currentState as S, c) !==
                            selector(previousState as S, c)
                        );
                    },
                    effect: (_action, listenerApi): void => {
                        log.info("changed decorator effect");
                        let state: S = listenerApi.getState() as S;
                        let next: V = selector(state, c);
                        let k = key as keyof C;
                        let oldValue = c[k];
                        c[k] = next as any;
                        // run the update lifecycle
                        c.requestUpdate(k, oldValue);
                    },
                }),
            );
            return unsubscribe;
        };
        // push the changeListener function on the target's listener
        // stack, which may still by undefined
        if (target.hasOwnProperty("listeners")) {
            target.listeners.push(changeListener);
        } else {
            target["listeners"] = [changeListener];
        }
    };
}

/*
 * This decorator subscribes an instance property to action calls in a
 * redux store.
 *
 * @param action - the action creator
 *
 * @param select - a selector function that extracts the value for the
 * target property from the store. The function takes the state and
 * the target object as parameters.
 *
 * @param _option? - decorator options
 *
 * This function takes three type parameters:
 *
 * @typeParam S – the type of the root state of the redux store
 * @typeParam C - the target's type
 *
 * @typeParam V - the type of the decorated property. i.e. the return
 * type of the function passed in the `select` parameter
 */
export function taken<S, C extends StoreConsumerElement<S, any>, V>(
    action: any,
    select: (state: S, connectedTarget?: C) => V,
    _options?: DecoratorOptions<any, C>,
) {
    return function (target: C, key: string) {
        // In the early stage of setup, the store is always undefined!
        // Thus, we push a function on a stack of functions for adding
        // listener middleware.
        log.debug("changed decorator setup for property " + key);
        const changeListener = (c: C & { [key]: V }) => {
            log.debug(
                "changed decorator adds listener middleware to the store for property '" +
                    key +
                    "' on element",
                c,
            );
            const unsubscribe = c?.store?.dispatch(
                addListener({
                    actionCreator: action,
                    effect: (_action, listenerApi): void => {
                        log.info("changed decorator effect");
                        let state: S = listenerApi.getState() as S;
                        let next: V = select(state, c);
                        let k = key as keyof C;
                        let oldValue = c[k];
                        c[k] = next as any;
                        // run the update lifecycle
                        c.requestUpdate(k, oldValue);
                    },
                }),
            );
            return unsubscribe;
        };
        // push the changeListener function on the target's listener
        // stack, which may still by undefined
        if (target.hasOwnProperty("listeners")) {
            target.listeners.push(changeListener);
        } else {
            target["listeners"] = [changeListener];
        }
    };
}
