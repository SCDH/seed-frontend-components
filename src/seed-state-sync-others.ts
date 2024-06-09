import { html, LitElement, CSSResultGroup, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { consume } from '@lit/context';

import { scrolledTextViewThunk } from './redux/synopsisActions';
import { syncOthers } from './redux/synopsisSlice';

import log from "./logging";
import { SeedSynopsisText } from './seed-synopsis-text';
import { windowStyles } from './window-mixin';
import { seedTextViewContext } from './seed-context';
import { storeConsumerMixin } from './store-consumer-mixin';

/*
 * `seed-state-sync-others` is a custom HTML element to be used in the
 * status line of a window. It offers a button for scrolling the other
 * texts to the corresponding position in a synoptical setup.
 */
@customElement("seed-state-sync-others")
export class SeedStateSyncOthers extends storeConsumerMixin(LitElement) {

    @consume({ context: seedTextViewContext })
    protected textView!: SeedSynopsisText;

    render() {
	return html`<span class="window-status-item">
	    <button class="unicode-button" @click="${this.syncOtherViews}" title="Sync others!">&#x2194;</botton>
	</span>`;
    }

    protected syncOtherViews = (_e: Event) => {
	log.debug("syncing others");
	this.store?.dispatch(scrolledTextViewThunk(syncOthers, this.textView.id, [this.textView.position]));
    }

    // see https://lit.dev/docs/components/styles/#inheriting-styles-from-a-superclass
    static styles: CSSResultGroup = [
	windowStyles,
	css`:host { border: none; }`
    ];

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-state-sync-others": SeedStateSyncOthers;
    }
}
