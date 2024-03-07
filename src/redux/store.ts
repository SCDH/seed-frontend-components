import { configureStore } from "@reduxjs/toolkit";
import textsReducer from "./textsSlice";

export const store = configureStore({
    reducer: {
	texts: textsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
