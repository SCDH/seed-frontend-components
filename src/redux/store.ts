import { configureStore } from "@reduxjs/toolkit";
import textsReducer from "./textsSlice";
import segmentsReducer from "./segmentsSlice";

export const store = configureStore({
    reducer: {
	texts: textsReducer,
	segments: segmentsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
