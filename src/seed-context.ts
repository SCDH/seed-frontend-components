import { createContext } from "@lit/context";
import { SeedStore } from "./redux/seed-store";

export const seedStoreContext = createContext<SeedStore>(Symbol('store'));
