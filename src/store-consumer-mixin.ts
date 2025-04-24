import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { consume } from "@lit/context";

import { SeedStore } from "./redux/seed-store";
import { seedStoreContext } from "./seed-context";

type Constructor<T = {}> = new (...args: any[]) => T;

/*
 * Dumb class required for workaround a Typescript limitation
 * regarding protected and public members of mixin classes.  See [Lit
 * docs](https://lit.dev/docs/composition/mixins/#typing-the-subclass)
 * and the [Typescript bug
 * 17744](https://github.com/microsoft/TypeScript/issues/17744#issuecomment-558990381)
 */
export declare abstract class StoreConsumerMixinInterface {
    store?: SeedStore;
    protected subscribeStore(): void;
    //protected willUpdate(changedProperties: PropertyValues<this>): void;
}

/*
 * A mixin for {LitElement}s that bind to a Redux {SeedStore} via
 * context. Subclasses must override the `subscribeStore()` method,
 * in order to set up listeners etc.
 *
 * This mixin overrides `willUpdate()`, so sub classes should call
 *`super.willUpdate()` when overriding this lifecycle method.
 *
 * A usage example can be found in `seed-synopsis-text.ts`.
 */
export const storeConsumerMixin = <T extends Constructor<LitElement>>(
    superClass: T,
) => {
    class StoreConsumerMixin extends superClass {
        /*
         * A property bound to a {SeedStore} by context.
         */
        @consume({ context: seedStoreContext })
        @property({ attribute: false })
        store?: SeedStore;

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
                changedProperties.has("store" as keyof StoreConsumerMixin) &&
                // condition: store *was* undefined
                changedProperties.get("store" as keyof StoreConsumerMixin) ===
                    undefined
            ) {
                this.subscribeStore();
            }
            super.willUpdate(changedProperties);
        }
    }
    return StoreConsumerMixin as Constructor<StoreConsumerMixinInterface> & T;
};
