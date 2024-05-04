import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js'
import { provide } from '@lit/context';

// import { ContextProvider } from '@lit/context';

import { seedStoreContext } from './seed-context';

import { SeedStore } from './redux/seed-store';
import { store } from './redux/store';


@customElement('seed-app')
export class SeedApp extends LitElement {

    @provide({ context: seedStoreContext })
    @state()
    seedStore: SeedStore = store;

    // _provider = new ContextProvider(this, {context: seedStoreContext, initialValue: store});

    render() {
	return html`<slot></slot>`;
    }

}

declare global {
    interface HTMLElementTagNameMap {
	"seed-app": SeedApp;
    }
}
