import { addListener } from "@reduxjs/toolkit";

import log from "./logging";
import { StoreConsumerElement } from "./store-consumer-mixin";

export interface DecoratorOptions<S, C> {
    predicatePrecondition?: (state: S, connectedTarget: C) => boolean;
}

/*
 * The `@changed` decorator subscribes an instance property to changes
 * in the redux store. It makes the property a reactive property by
 * triggering the update lifecycle when the change occurs.
 *
 * @example
 * This sets up subscribes the `annoationId` property to the selected
 * annotation:
 *
 * ```
 * @changed<RootState, SeedAnnotationPermanent, String | null>(s => s.annotations.annotationSelected)
 * annotationId!: string;
 * ```
 *
 * @param selector - a function that extracts a value from the
 * store. It is used to set up a predicate that compares the value
 * from the current state with the value of the previous state and for
 * setting the decorated property's value when current and previous
 * values differ. The selector function takes the state and optionally
 * the target object as input. It is thus possible to use properties
 * of the target in the selector function. However, it's the property
 * value at the time, when the dynamic middleware is set up for the
 * target object: **when the store is first connected**.
 *
 * @param options? - decorator options
 *
 * This function takes two type parameters:
 * @typeParam S - the type of the root state of the redux store
 * @typeParam C - the type of the target
 * @typeParam V - the type of the state property returned
 *
 * @remarks
 * The `C` type parameter is there for providing type save selector
 * functions when accessing properties of the target instance.
 *
 * @remarks: This kind of subscription with
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
                        log.debug("changed decorator effect on:", key, c);
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
 * The `@taken` decorator subscribes an instance property to action
 * calls in a redux store.  It makes the property a reactive property
 * by triggering the update lifecycle when the change occurs.
 *
 * @param action - the action creator
 *
 * @param select - a selector function that extracts the value for the
 * target property from the store. The function takes the state and
 * the target object as parameters.
 *
 * @param _options? - decorator options
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
        log.debug("taken decorator setup for property " + key);
        const changeListener = (c: C & { [key]: V }) => {
            log.debug(
                "taken decorator adds listener middleware to the store for property '" +
                    key +
                    "' on element",
                c,
            );
            const unsubscribe = c?.store?.dispatch(
                addListener({
                    actionCreator: action,
                    effect: (_action, listenerApi): void => {
                        log.debug("taken decorator effect on", key, c);
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

/*
 * The `@matched` decorator subscribes an instance property to action
 * matchers in a redux store.  It makes the property a reactive
 * property by triggering the update lifecycle when the change occurs.
 *
 * @param matcher - the action matcher
 *
 * @param select - a selector function that extracts the value for the
 * target property from the store. The function takes the state and
 * the target object as parameters.
 *
 * @param _options? - decorator options
 *
 * This function takes three type parameters:
 *
 * @typeParam S – the type of the root state of the redux store
 * @typeParam C - the target's type
 *
 * @typeParam V - the type of the decorated property. i.e. the return
 * type of the function passed in the `select` parameter
 */
export function matched<S, C extends StoreConsumerElement<S, any>, V>(
    matcher: any,
    select: (state: S, connectedTarget?: C) => V,
    _options?: DecoratorOptions<any, C>,
) {
    return function (target: C, key: string) {
        // In the early stage of setup, the store is not always
        // undefined!  Thus, we push a function on a stack of
        // functions for adding listener middleware.
        log.debug("matched decorator setup for property " + key);
        const listener = (c: C & { [key]: V }) => {
            log.debug(
                "matched decorator adds listener middleware to the store for property '" +
                    key +
                    "' on element",
                c,
            );
            const unsubscribe = c?.store?.dispatch(
                addListener({
                    matcher,
                    effect: (_action, listenerApi): void => {
                        log.debug("matched decorator effect on:", key, c);
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
        // push the listener function on the target's listener
        // stack, which may still by undefined
        if (target.hasOwnProperty("listeners")) {
            target.listeners.push(listener);
        } else {
            target["listeners"] = [listener];
        }
    };
}
