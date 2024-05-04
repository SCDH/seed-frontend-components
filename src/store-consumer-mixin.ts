import { LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { SeedStore } from './redux/seed-store';
import { seedStoreContext } from './seed-context';


type Constructor<T = {}> = new (...args: any[]) => T;

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
export const storeConsumerMixin = <T extends Constructor<LitElement>>(superClass: T) => {

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
	subscribeStore(): void {
	    // add listeners
	}

	/*
	 * When the {StoreConsumerMixin.store} property was updated for the first time,
	 * the element subscribes to the store by calling {subscribeStore()}.
	 */
	protected willUpdate(changedProperties: PropertyValues<this>): void {
	    if (changedProperties.has("store" as keyof StoreConsumerMixin)
		// condition: store *was* undefined
		&& changedProperties.get("store" as keyof StoreConsumerMixin) === undefined) {
		this.subscribeStore();
	    }
	    super.willUpdate(changedProperties);
	}

    };
    return StoreConsumerMixin;

}
