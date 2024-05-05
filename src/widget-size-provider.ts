import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';

import { WindowState } from './window-mixin';
import { seedWidgetHeightContext, seedWidgetWidthContext, seedWidgetHeightMinimizedContext, seedWidgetWidthMinimizedContext, seedWidgetDisplayContext } from './seed-context';
import log from "./logging";


type Constructor<T = {}> = new (...args: any[]) => T;

/*
 * A mixin for {LitElement}s that sets the widget dimensions from context.
 *
 * A usage example can be found in `seed-synopsis-text.ts`.
 */
export const widgetSizeProvider = <T extends Constructor<LitElement>>(superClass: T) => {

    class WidgetSizeProvider extends superClass {

        @property({ attribute: true })
        orientation: string = "horizontal";

        @property({ attribute: "children-height"})
        @provide({ context: seedWidgetHeightContext })
        widgetHeight: number = 100;

        @property({ attribute: "children-width"})
        @provide({ context: seedWidgetWidthContext })
        widgetWidth: number = 100;

        @property({ attribute: "children-display"})
        @provide({ context: seedWidgetDisplayContext })
        widgetDisplay: string = "inline-block";

        @property({ attribute: "children-width-minimized" })
        @provide({ context: seedWidgetWidthMinimizedContext })
        widgetWidthMinimized: number = 50;

        @property({ attribute: "children-height-minimized" })
        @provide({ context: seedWidgetHeightMinimizedContext })
        widgetHeightMinimized: number = 50;

	@property({ attribute: "default-line-height-px" })
	defaultLineHeightPx: string = "15";

        @state()
        childrenCount: number = 0;

        @state()
        childrenCountContainer: number = 0;

        @state()
        childrenCountMinimized: number = 0;

        recalculateChildDimensions() {
            log.debug("recalculating dimensions of " + this.childrenCount.toString() + " children");
	    const lineHeightStr: string = window.getComputedStyle(this)?.getPropertyValue("font-size")?.match(/\d+/)?.[0] ?? this.defaultLineHeightPx;
	    const lineHeight: number = Number(lineHeightStr);
            if (this.orientation === "horizontal") {
                this.widgetHeight = this.offsetHeight;
                this.widgetWidth = (this.offsetWidth -
		    (this.childrenCountMinimized * this.widgetWidthMinimized) - // minus minimized
		    (this.childrenCount * 6) - // minus border and margin
		    0) / // minus fixed value
		    Math.max(this.childrenCountContainer, 1);
                this.widgetDisplay = "inline-block";
		this.widgetHeightMinimized = this.widgetHeight;
		this.widgetWidthMinimized = lineHeight * 2;
            } else {
                this.widgetHeight = (this.offsetHeight -
		    (this.childrenCountMinimized * this.widgetHeightMinimized) - // minux minimized
		    (this.childrenCount * 6) - // minus border and margin
		    2) /
		    Math.max(this.childrenCountContainer, 1);
                this.widgetWidth = this.offsetWidth;
                this.widgetDisplay = "block";
		this.widgetHeightMinimized = lineHeight * 2;
		this.widgetWidthMinimized = this.widgetWidth;
            }
        }

        connectedCallback(): void {
            super.connectedCallback();
            if (this.shadowRoot) {
                log.debug("add event listener for widget size consumer event");
                this.shadowRoot.addEventListener("widget-size-consumer", this.handleChildEvent());
            }
        }

        handleChildEvent() {
            return (e: Event) => {
                const { windowState, initialize } = (e as CustomEvent<{ windowState: WindowState, initialize: boolean }>).detail;
                if (initialize) this.childrenCount += 1;
                if (windowState === WindowState.Container) {
                    this.childrenCountContainer += 1;
                    if (!initialize) {
                        this.childrenCountMinimized -= 1;
                    }
                } else if (windowState === WindowState.Minimized) {
                    this.childrenCountMinimized += 1;
                    if (!initialize) {
                        this.childrenCountContainer -= 1;
                    }
                } else if (windowState === WindowState.Disposed) {
                    // this.childrenCount -= 1;
                    // this.childrenCountContainer -= 1;
                }
                e.stopPropagation(); // do not allow bubbling up to the next provider
                this.recalculateChildDimensions();
            };
        }

    };

    return WidgetSizeProvider;

}
