import { configureStore } from "@reduxjs/toolkit";
import textsReducer from "./textsSlice";
import segmentsReducer from "./segmentsSlice";
import ontologyReducer from "./ontologySlice";

export const store = configureStore({
    reducer: {
	texts: textsReducer,
	segments: segmentsReducer,
	ontology: ontologyReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
