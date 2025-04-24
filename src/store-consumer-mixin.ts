import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { EnhancedStore } from "@reduxjs/toolkit";

import { seedStoreContext } from "./seed-context";

/*
 * A subclass of {LitElement}s that binds to a Redux store via
 * context. Subclasses must override the `subscribeStore()` method, in
 * order to set up listeners etc.
 *
 * This mixin overrides `willUpdate()`, so sub classes should call
 *`super.willUpdate()` when overriding this lifecycle method.
 *
 * A usage example can be found in `seed-synopsis-text.ts`.
 */
// TODO: make a mixin from this!  See
// https://github.com/lit/lit/issues/3865 and
// https://github.com/microsoft/TypeScript/issues/17744#issuecomment-558990381
export abstract class StoreConsumerElement<S> extends LitElement {
    /*
     * A property bound to a Redux store by context.
     */
    @consume({ context: seedStoreContext })
    @property({ attribute: false })
    store?: EnhancedStore<S, any, any>;

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
            changedProperties.has("store" as keyof StoreConsumerElement<S>) &&
            // condition: store *was* undefined
            changedProperties.get("store" as keyof StoreConsumerElement<S>) ===
                undefined
        ) {
            this.subscribeStore();
        }
        super.willUpdate(changedProperties);
    }
}
