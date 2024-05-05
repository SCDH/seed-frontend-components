import { createContext } from "@lit/context";
import { SeedStore } from "./redux/seed-store";

export const seedStoreContext = createContext<SeedStore>(Symbol('store'));

export const seedWidgetWidthContext = createContext<number>(Symbol('widget-width'));
export const seedWidgetHeightContext = createContext<number>(Symbol('widget-height'));
export const seedWidgetWidthMinimizedContext = createContext<number>(Symbol('widget-width-minimized'));
export const seedWidgetHeightMinimizedContext = createContext<number>(Symbol('widget-height-minimized'));
export const seedWidgetDisplayContext = createContext<string>(Symbol('widget-display'));
export const seedWidgetMarginContext = createContext<number>(Symbol('widget-margin'));
