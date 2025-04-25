import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { consume, createContext } from "@lit/context";
import { EnhancedStore, Action } from "@reduxjs/toolkit";
//import type { Dispatch } from "@reduxjs/toolkit";
//import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

/*
 * The symbol for the providing and consuming a redux store via the
 * context protocol.
 */
export const reduxStoreContext = createContext<EnhancedStore<any, any, any>>(
    Symbol("reduxstore"),
);

export declare class StoreConsumerInterface<S, A extends Action> {
    public store?: EnhancedStore<S, A, any>;
    protected subscribeStore(): void;
    public listeners: Array<((cls: any) => any) | null>;
}

export type UnsubcribeDispatch =
    | { payload: any; type: "listenerMiddleware/add" }
    | null
    | undefined;

/*
 * A subclass of {LitElement}s that binds to a Redux store via
 * context. Subclasses must override the `subscribeStore()` method, in
 * order to set up listeners etc.
 *
 * This class overrides `willUpdate()`, so sub classes should call
 *`super.willUpdate()` when overriding this lifecycle method.
 *
 * A usage example can be found in `seed-synopsis-text.ts`.
 */
// TODO: make this with mixin
export abstract class StoreConsumerElement<
    S,
    A extends Action,
> extends LitElement {
    /*
     * A queue of functions that add listener middleware to the
     * store. They are added to the middleware, as soon as the store
     * is connected.
     *
     * This is used by, e.g., decorators, which cannot add to the
     * middleware themselves, because their setup is too early, when
     * the store is not connected. Since it is used by decorators,
     * this property also has to be public.
     */
    //listeners: Array< (store: EnhancedStore<S,A,any>) => Dispatch<A> > = [];
    //listeners: Array< ((cls: StoreConsumerElement<S,A>) => UnsubcribeDispatch) | null > = [];
    listeners!: Array<((cls: any) => any) | null>;

    /*
     * A property bound to a Redux store by context.
     */
    @consume({ context: reduxStoreContext })
    @property({ attribute: false })
    store?: EnhancedStore<S, A, any>;

    /*
     * A hook for the sub class called when the {store} property
     * is set from context for the first time. Use it to register
     * listeners etc.
     */
    protected subscribeStore(): void {
        // add listeners
    }

    /*
     * When the {StoreConsumerMixin.store} property was updated for the first time,
     * the element subscribes to the store by calling {subscribeStore()}.
     */
    protected willUpdate(changedProperties: PropertyValues<this>): void {
        if (
            changedProperties.has(
                "store" as keyof StoreConsumerElement<S, A>,
            ) &&
            // condition: store *was* undefined
            changedProperties.get(
                "store" as keyof StoreConsumerElement<S, A>,
            ) === undefined
        ) {
            // add dynamic middleware in this.listeners to the store
            this.listeners
                ?.filter((f) => f !== null)
                ?.forEach((fun) => fun(this));

            // call hook for adding dynamic middleware
            this.subscribeStore();
        }
        super.willUpdate(changedProperties);
    }
}

//type Constructor = new (...args: any[]) => {};

type GenericConstructor<T = {}> = new (...args: any[]) => T;

export type StoreConsumerConstructor<S, A extends Action> = GenericConstructor<
    StoreConsumerInterface<S, A>
>;

/*
 * A mixin that connects a {LitElement} to a redux store via context.
 *
 * Subclasses must override the `subscribeStore()` method, in
 * order to set up listeners etc.
 *
 * This mixin overrides `willUpdate()`, so sub classes should call
 *`super.willUpdate()` when overriding this lifecycle method.
 *
 * @Remark: Currently, this does not work, due to a typescript issue
 * regarding mixins that add protected or public members. See
 * https://github.com/lit/lit/issues/3865 and
 * https://github.com/microsoft/TypeScript/issues/17744#issuecomment-558990381
 * Use {StoreConsumerElement} instead!
 *
 * Usage:
 * ```
 * export class MyStatefulElement extends storeConsumerMixin<MyRootState, any>()(LitElement) {
 * ...
 * }
 * ```
 *
 * @Remark: This is a thunk function that returns a mixin
 * function. The outer function (the thunk function) is used for
 * providing type parameters to the mixin function. The first type
 * parameter should be the root state of the store, the second an
 * {Action}. Both of them are used as type parameters to
 * {EnhancedStore}, which is the type returned by Redux's
 * `configureStore()` function.
 */
export const storeConsumerMixin = <S, A extends Action>() => {
    const mixin = <T extends GenericConstructor<LitElement>>(superClass: T) => {
        class StoreConsumerMixin extends superClass {
            /*
             * A property bound to a Redux store by context.
             */
            @consume({ context: reduxStoreContext })
            @property({ attribute: false })
            store?: EnhancedStore<S, A, any>;

            /*
             * A hook for the sub class called when the {store} property
             * is set from context for the first time. Use it to register
             * listeners etc.
             */
            protected subscribeStore(): void {
                // add listeners
            }

            /*
             * When the {StoreConsumerMixin.store} property was updated for the first time,
             * the element subscribes to the store by calling {subscribeStore()}.
             */
            protected willUpdate(
                changedProperties: PropertyValues<this>,
            ): void {
                if (
                    changedProperties.has(
                        "store" as keyof StoreConsumerMixin,
                    ) &&
                    // condition: store *was* undefined
                    changedProperties.get(
                        "store" as keyof StoreConsumerMixin,
                    ) === undefined
                ) {
                    this.subscribeStore();
                }
                super.willUpdate(changedProperties);
            }
        }
        // FIXME: see issues linked in doc string
        // return StoreConsumerMixin as StoreConsumerConstructor<S, A> & T;
        return StoreConsumerMixin as T; // new members are not accessible!
    };
    return mixin;
};
