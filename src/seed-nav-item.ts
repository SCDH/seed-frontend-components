import { html, HTMLTemplateResult, PropertyValues, css, CSSResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { StoreConsumerElement } from "@scdh/lit-redux-consumer";
import { watch } from "@scdh/lit-redux-consumer";

import { SeedState } from "./redux/seed-store";
import type { Route } from "./redux/routerSlice";

/**
 * The `<seed-nav-item>` custoum component is essentially a HTML `<a>`
 * element that evaluates the location in order to set active or
 * non-active styles.
 */
@customElement("seed-nav-item")
export class SeedNavItem extends StoreConsumerElement<SeedState, any> {
    /**
     * The target URL.
     */
    @property()
    href!: string;

    @state()
    @watch<SeedState, SeedNavItem, Route | undefined>(
        (s, _c) => s.routes.currentRoute,
    )
    currentRoute!: Route | undefined;

    @state()
    active: boolean = false;

    @state()
    loc = location;

    protected willUpdate(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has("currentRoute")) {
            if (this.currentRoute?.pathname.startsWith(this.href) ?? false) {
                this.active = true;
            } else {
                this.active = false;
            }
        }
    }

    protected override render(): HTMLTemplateResult {
        return this.active
            ? html`<a href="${this.href}" class="active"><slot></slot></a>`
            : html`<a href="${this.href}" class="inactive"><slot></slot></a>`;
    }

    static styles: CSSResult = css`
        a {
            font-weight: 500;
            color: #646cff;
        }
        a:hover {
            color: #535bf2;
        }
        .active {
            text-decoration: underline;
        }
        .inactive {
            text-decoration: none;
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-nav-item": SeedNavItem;
    }
}
