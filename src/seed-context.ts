import { createContext } from "@lit/context";
import { SeedTextView } from "./seed-text-view";
import { SeedText } from "./types";

export const seedTextViewContext = createContext<SeedTextView>(
    Symbol("textView"),
);

/**
 * Context symbol for text contexts. A text provider may provide a
 * text that is displayed in a text widget.
 */
export const seedTextContext = createContext<SeedText>(Symbol("text"));

export const seedWidgetWidthContext = createContext<number>(
    Symbol("widget-width"),
);
export const seedWidgetHeightContext = createContext<number>(
    Symbol("widget-height"),
);
export const seedWidgetWidthMinimizedContext = createContext<number>(
    Symbol("widget-width-minimized"),
);
export const seedWidgetHeightMinimizedContext = createContext<number>(
    Symbol("widget-height-minimized"),
);
export const seedWidgetDisplayContext = createContext<string>(
    Symbol("widget-display"),
);
export const seedWidgetMarginContext = createContext<number>(
    Symbol("widget-margin"),
);
