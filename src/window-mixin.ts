import { LitElement, html, css, CSSResultGroup, HTMLTemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';


import log from "./logging";

/*
 * An enumeration type describing the window state.
 */
export enum WindowState {
    Container,
    Minimized,
    Disposed
}

/*
 * An interface for widgets which are windows. A window is a widget
 * with visibility properties (and the functions for setting them are
 * exposed to the user).
 */
export interface IWindow {

    /*
     * A window has an window state, i.e., a visibility state.
     */
    windowState: WindowState;

}

/*
 * Test whether an unknown object is a window.
 */
export function isWindow(obj: unknown): obj is IWindow {
    return (obj as IWindow)!.windowState !== undefined
	&& typeof (obj as IWindow).windowState === "number";
}

/*
 * Test whether an unknown object is a window and if it's window state
 * is {WindowState.Minimized}.
 */
export function isMinimized(obj: unknown): boolean {
    return (obj as IWindow)!.windowState !== undefined
	&& typeof (obj as IWindow).windowState === "number"
	&& (obj as IWindow).windowState === WindowState.Minimized;
}

/*
 * CSS styles for window mixin. This is moved outside of the class for
 * easy inheritance. See
 * https://lit.dev/docs/components/styles/#inheriting-styles-from-a-superclass
 */
export const windowStyles = css`
    :host {
    border: 1px solid var(--window-border-color, lightblue);
    }
    div.window-container {
    height: 100%;
    }
    .window-header, .window-footer {
    height: 1.5em;
    padding: var(--window-padding, 0.5em);
    }
    div.window-content {
    height: calc(100% - 5em - 3px - 2*var(--window-padding, 0.5em)); /* 100% minus height of decoration, footer, padding */
    padding: var(--window-padding, 0.5em);
    }
    .window-header {
    background: var(--window-header-background-color, aliceblue);
    border-bottom: 1px solid var(--window-border-color, lightblue);
    }
    .window-footer {
    background: var(--window-header-background-color, aliceblue);
    border-top: 1px solid var(--window-border-color, lightblue);
    }
    .window-decoration {
    display: inline;
    white-space: nowrap;
    }
    .window-visibility {
    float: right;
    }
    .window-status-item {
    border: none;
    }
    .window-status-item button,
    .window-visibility > button {
    padding: 2px;
    border: none;
    background: none;
    width: var(--window-button-width, auto);
    height: var(--window-button-height, auto);
    font-family: var(--windowo-button-font-family, Helvetica, Arial, Verdana, sans-serif);
    }
    .window-visibility > button.minimize {
    background: var(--window-minimize-button-bg, inherit);
    }
    .window-visibility > button.maximize {
    background: var(--window-maximize-button-bg, inherit);
    }
    .window-visibility > button.dispose {
    background: var(--window-dispose-button-bg, inherit);
    }
    .window-status-item button:hover,
    .window-visibility > button:hover {
    color: red;
    }
    .window-title {
    display: inline-block;
    width: 65%;
    max-width: 65%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }
    .window-container.minimized-window {
    }
    .window-container.minimized-window .window-title {
    display: none;
    }`;


type Constructor<T = {}> = new (...args: any[]) => T;

/*
 * A mixin for {LitElement}s that adds Window functionality. A window
 * is a widget with its own visibility functions exposed to the user.
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

	@property({ attribute: "styles-minimized"})
        stylesMinimized: string = "max-height: calc(2*var(--window-padding, 0.5em) + 1.5em) !important; min-width: calc(2*var(--window-padding, 0.5em) + 1em) !important; max-width: calc(2*var(--window-padding, 0.5em) + 1em) !important; flex-grow: 0 !important;";

	@property({ attribute: true })
	disposable: boolean = true;

	@property({ attribute: true, reflect: true, type: Boolean })
	minimized: boolean = false;

	@property({ attribute: true })
	direction: string = "horizontal";


	render(): HTMLTemplateResult {
	    if (this.windowState === WindowState.Minimized) {
		return html`${this.styleTemplate()}
		<div class="${this.clas} window-container minimized-window">
                    <div class="window-header">
                        ${this.renderWindowDecorationMinimized()}
                    </div>
		</div>`;
	    }
            return html`${this.styleTemplate()}
                <div class="${this.clas} window-container container-managed-window">
                    <div class="window-header">
                       ${this.renderWindowDecoration()}
                    </div>
                    <div class="window-content">
                        ${this.renderContent()}
                    </div>
                    <div class="window-footer">
                        ${this.footerTemplate()}
                    </div>
                </div>`;
        }

	/*
         * Scoped styles with dynamic properties setting the host's dimensions.
         */
        protected styleTemplate(): HTMLTemplateResult {
            return isMinimized(this)
		? html`<style>:host {${this.stylesMinimized}}</style>`
		: html``;
        }

	renderContent(): HTMLTemplateResult {
	    return html``;
	}

	footerTemplate(): HTMLTemplateResult {
	    return html`<slot name="status"></slot>`;
	}

	renderWindowDecoration(): HTMLTemplateResult {
	    return html`<div class="window-decoration">
		<span class="window-title">${this.title}</span>
		<span class="window-visibility">
		    <button @click=${this.minimizeHandler} class="minimize" title="Minimize!">&#x1F5D5;</button>
		    ${this.renderDisposeButton()}
		</span>
	    </div>`;
	}

	renderWindowDecorationMinimized(): HTMLTemplateResult {
	    return html`<div class="window-decoration">
		<span class="window-title minimized-rotation">${this.title}</span>
             	<span class="window-visibility">
		    <button @click=${this.restoreHandler} class="maximize" title="Restore size!">&#x1F5D6;</button>
                </span>
            </div>`
	}

	renderDisposeButton(): HTMLTemplateResult {
	    if (!this.disposable) return html``;
	    return html`<button @click=${this.disposeHandler} class="dispose" title="Close!">&#x1F5D9;</button>`
	}

	private evopts = { bubbles: true, cancelable: false, composed: true };

	restoreHandler(): void {
	    this.minimized = false;
	    this.dispatchEvent(new CustomEvent('widget-size-consumer',
					       { ...this.evopts, detail: { oldWindowState: this.windowState, newWindowState: WindowState.Container, initialize: false}}));
	    this.windowState = WindowState.Container;
	}

	minimizeHandler(): void {
	    log.debug("minimizing window");
	    this.minimized = true;
	    this.dispatchEvent(new CustomEvent('widget-size-consumer',
					       { ...this.evopts, detail: { oldWindowState: this.windowState, newWindowState: WindowState.Minimized, initialize: false}}));
	    this.windowState = WindowState.Minimized;
	}

	disposeHandler(): void {
	    log.debug("disposing window");
	    this.dispatchEvent(new CustomEvent('widget-size-consumer',
					       { ...this.evopts, detail: { oldWindowState: this.windowState, newWindowState: WindowState.Disposed, initialize: false}}));
	    this.windowState = WindowState.Disposed;
	    this.remove();
	}

	connectedCallback(): void {
	    super.connectedCallback();
	    log.debug("initializing widget with ", this.windowState);
	    this.dispatchEvent(new CustomEvent("widget-size-consumer",
					       { ...this.evopts, detail: { newWindowState: this.windowState, initialize: true}}));
	}

	// see https://lit.dev/docs/components/styles/#inheriting-styles-from-a-superclass
	static styles = windowStyles as CSSResultGroup;

	};
    return WindowMixin;

}
