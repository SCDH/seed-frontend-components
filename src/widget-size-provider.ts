import { LitElement, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';

import { WindowState } from './window-mixin';
import { seedWidgetHeightContext, seedWidgetWidthContext, seedWidgetHeightMinimizedContext, seedWidgetWidthMinimizedContext, seedWidgetDisplayContext, seedWidgetMarginContext } from './seed-context';
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

	@property({ attribute: "children-margin-px"})
	@provide({ context: seedWidgetMarginContext })
	childrenMarginPx: number = 2;

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
		    (this.childrenCount * 2 * (this.childrenMarginPx + 1)) - // minus margin and border
		    2) / // minus fixed value
		    Math.max(this.childrenCountContainer, 1);
                this.widgetDisplay = "inline-block";
		this.widgetHeightMinimized = this.widgetHeight;
		this.widgetWidthMinimized = lineHeight * 2;
            } else {
                this.widgetHeight = (this.offsetHeight -
		    (this.childrenCountMinimized * this.widgetHeightMinimized) - // minux minimized
		    (this.childrenCount * 2 * (this.childrenMarginPx + 1)) - // minus border and margin
		    2) /
		    Math.max(this.childrenCountContainer, 1);
                this.widgetWidth = this.offsetWidth;
                this.widgetDisplay = "block";
		this.widgetHeightMinimized = lineHeight * 2;
		this.widgetWidthMinimized = this.widgetWidth;
            }
        }

        constructor(..._args: any[]) {
            super();
            log.debug("adding event listener for widget-size-consumer event");
            this.addEventListener("widget-size-consumer", this.handleChildEvent());
        }

	firstUpdated(changedProperties: PropertyValues<this>): void {
	    super.firstUpdated(changedProperties);
	    this.recalculateChildDimensions();
	}

        handleChildEvent() {
            return (e: Event) => {
                const { oldWindowState, newWindowState, initialize } = (e as CustomEvent<{ oldWindowState: WindowState | undefined, newWindowState: WindowState, initialize: boolean }>).detail;
                if (initialize === true) {
		    log.debug("handling window initialization");
		    this.childrenCount += 1;
                    if (newWindowState === WindowState.Container) {
			this.childrenCountContainer += 1;
                    } else if (newWindowState === WindowState.Minimized) {
			this.childrenCountMinimized += 1;
                    } else if (newWindowState === WindowState.Disposed) {
			log.error("inconsistent window state: initializing with disposed state");
		    } else {
			log.error("unknown window state: " + newWindowState);
		    }
		} else if (newWindowState === WindowState.Disposed) {
		    log.debug("handling window disposal");
                    if (oldWindowState === WindowState.Container) {
			this.childrenCountContainer -= 1;
                    } else if (oldWindowState === WindowState.Minimized) {
			this.childrenCountMinimized -= 1;
		    } else {
			log.error("unknown state of disposed window: " + newWindowState);
		    }
		    this.childrenCount -= 1;
		} else if (oldWindowState === WindowState.Minimized && newWindowState === WindowState.Container) {
                    this.childrenCountMinimized -= 1;
                    this.childrenCountContainer += 1;
                } else if (oldWindowState === WindowState.Container && newWindowState === WindowState.Minimized) {
                    this.childrenCountContainer -= 1;
                    this.childrenCountMinimized += 1;
                } else {
		    log.error("unknown window state: ", oldWindowState, newWindowState);
		}
                e.stopPropagation(); // do not allow bubbling up to the next provider
                this.recalculateChildDimensions();
            };
        }

    };

    return WidgetSizeProvider;

}
