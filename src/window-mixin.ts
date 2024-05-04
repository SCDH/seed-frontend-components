import { LitElement, html, HTMLTemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import log from "./logging";


export enum WindowState {
    Container,
    Minimized,
    Disposed
}

type Constructor<T = {}> = new (...args: any[]) => T;

/*
 * A mixin for {LitElement}s that adds Window functionality. A window
 *is a widget with its own visibility functions exposed to the user.
 *
 * This mixin overrides `willUpdate()`, so sub classes should call
 *`super.willUpdate()` when overriding this lifecycle method.
 *
 * A usage example can be found in `seed-synopsis-text.ts`.
 */
export const windowMixin = <T extends Constructor<LitElement>>(superClass: T) => {

    class WindowMixin extends superClass {

	@state()
	windowState: WindowState = WindowState.Container;

	@property({ attribute: true })
	title!: string;

	@property({ attribute: false })
	clas!: string;

	@property({ attribute: true })
	disposable: boolean = true;

	render(): HTMLTemplateResult {
	    if (this.windowState === WindowState.Minimized) {
		return html`<div class="${this.clas} minimized-window">
		    <button @click=${this.restoreHandler}>!</button>
		</div>`;
	    }
	    return html`<div class="${this.clas} container-window">
		${this.renderWindowDecoration()}
		<div class="window-content">
		    ${this.renderContent()}
		</div>
	    </div>`;
	}

	renderContent(): HTMLTemplateResult {
	    return html``;
	}

	renderWindowDecoration(): HTMLTemplateResult {
	    return html`<div class="window-decoration" width="100%">
		<span class="window-title">${this.title}</span>
		<span class="window-visibility">
		    <button @click=${this.minimizeHandler}>_</button>
		    ${this.renderDisposeButton()}
		</span>
	    </div>`;
	}

	renderDisposeButton(): HTMLTemplateResult {
	    if (!this.disposable) return html``;
	    return html`<button @click=${this.disposeHandler}>X</button>`
	}

	restoreHandler(): void {
	    this.windowState = WindowState.Container;
	}

	minimizeHandler(): void {
	    log.debug("minimizing window");
	    this.windowState = WindowState.Minimized;
	}

	disposeHandler(): void {
	    // TODO
	}

    };
    return WindowMixin;

}
