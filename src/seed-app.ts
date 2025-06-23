import { LitElement, html } from "lit";
import { state } from "lit/decorators.js";
import { customElement } from "lit/decorators.js";
import { provide } from "@lit/context";
import { reduxStoreContext } from "@scdh/lit-redux-consumer";

import { SeedStore } from "./redux/seed-store";
import { store } from "./redux/store";

@customElement("seed-app")
export class SeedApp extends LitElement {
    @provide({ context: reduxStoreContext })
    @state()
    seedStore: SeedStore = store;

    render() {
        return html`<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-app": SeedApp;
    }
}
