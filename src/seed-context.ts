import { createContext } from "@lit/context";
import { SeedTextView } from "./seed-text-view";
import { EnhancedStore } from "@reduxjs/toolkit";

export const seedStoreContext = createContext<EnhancedStore<any, any, any>>(
    Symbol("store"),
);

export const seedTextViewContext = createContext<SeedTextView>(
    Symbol("textView"),
);

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
