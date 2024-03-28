import { configureStore } from "@reduxjs/toolkit";
import textsReducer from "./textsSlice";
import textViewsReducer from "./textViewsSlice";
import annotationsReducer from "./annotationsSlice";
import ontologyReducer from "./ontologySlice";

export const store = configureStore({
    reducer: {
	texts: textsReducer,
	textViews: textViewsReducer,
	annotations: annotationsReducer,
	ontology: ontologyReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
