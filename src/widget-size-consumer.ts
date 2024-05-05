import { LitElement, html, HTMLTemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { seedWidgetHeightContext, seedWidgetWidthContext, seedWidgetHeightMinimizedContext, seedWidgetWidthMinimizedContext, seedWidgetDisplayContext } from './seed-context';
import { isMinimized } from './window-mixin';


type Constructor<T = {}> = new (...args: any[]) => T;

/*
 * A mixin for {LitElement}s that sets the widget dimensions from context.
 *
 * A usage example can be found in `seed-synopsis-text.ts`.
 */
export const widgetSizeConsumer = <T extends Constructor<LitElement>>(superClass: T) => {

    class WidgetSizeConsumer extends superClass {

        @state()
        @consume({ context: seedWidgetHeightContext, subscribe: true })
        widgetHeight?: number;

        @state()
        @consume({ context: seedWidgetWidthContext, subscribe: true })
        widgetWidth?: number;

        @state()
        @consume({ context: seedWidgetHeightMinimizedContext, subscribe: true })
        widgetHeightMinimized?: number;

        @state()
        @consume({ context: seedWidgetWidthMinimizedContext, subscribe: true })
        widgetWidthMinimized?: number;

        @state()
        @consume({ context: seedWidgetDisplayContext, subscribe: true })
        widgetDisplay?: string;

        /*
         * Scoped styles with dynamic properties setting the host's dimensions.
         */
        protected styleTemplate(): HTMLTemplateResult {
            if (isMinimized(this)) {
                return html`<style>:host {
                    display: ${this.widgetDisplay};
                    width: ${this.widgetWidthMinimized}px;
                    height: ${this.widgetHeightMinimized}px;
                }</style>`;
            }
            return html`<style>:host {
                display: ${this.widgetDisplay};
                width: ${this.widgetWidth}px;
                height: ${this.widgetHeight}px;
            }</style>`;
        }

    };
    return WidgetSizeConsumer;

}
