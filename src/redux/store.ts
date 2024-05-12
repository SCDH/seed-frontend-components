import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import textsReducer from "./textsSlice";
import textViewsReducer from "./textViewsSlice";
import annotationsReducer from "./annotationsSlice";
import ontologyReducer from "./ontologySlice";
import synopsisReducer from "./synopsisSlice";
import { subscribeAnnotationsCssUpdater, subscribeSegmentsCssOnCssUpdater, subscribeSegmentsCssOnSegmentsUpdater } from "./colorizeText";

/*
 * Listener middleware for the store.  Without listener middleware,
 * subscriptions with store.dispatch(addListener(...)) do not work.
 *
 * See https://stackoverflow.com/questions/73832645/redux-toolkit-addlistener-action-does-not-register-dynamic-middleware
 */
export const listenerMiddleware = createListenerMiddleware();


export const store = configureStore({
    reducer: {
	texts: textsReducer,
	textViews: textViewsReducer,
	annotations: annotationsReducer,
	ontology: ontologyReducer,
	synopsis: synopsisReducer,
    },
    // add the middleware
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// subscribe updaters to the store
subscribeAnnotationsCssUpdater(store);
subscribeSegmentsCssOnCssUpdater(store);
subscribeSegmentsCssOnSegmentsUpdater(store);
