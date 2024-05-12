import { EnhancedStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";
import { addListener } from "@reduxjs/toolkit";
import { UnsubscribeListener, Action } from "@reduxjs/toolkit";
// import { Action, UnknownAction, Tuple } from "@reduxjs/toolkit";
// import { Middleware } from "@reduxjs/toolkit";
// import { StoreEnhancer } from "@reduxjs/toolkit";

import { TextsSlice } from "./textsSlice";
import { TextViewsSlice } from "./textViewsSlice";
import { AnnotationsSlice } from "./annotationsSlice";
import { OntologyState } from "./ontologySlice";
import { SynopsisSlice } from "./synopsisSlice";

/*
 * An interface describing a store with the slices of this library.
 */
export interface SeedState {

    texts: TextsSlice;

    textViews: TextViewsSlice;

    annotations: AnnotationsSlice;

    ontology: OntologyState;

    synopsis: SynopsisSlice;

};

/*
 * A SEED store is an {EnhancedStore} parametrized with {SeedState}
 * and other types.
 */

// export type SeedStore<
//   S = SeedState,
//   A extends Action = UnknownAction,
//   M extends Tuple<Middleware<S>> = Tuple<Middleware<S>>
//   E extends Tuple<Enhancers> = Tuple<Enhancers>,
//   P = S> = EnhancedStore<S, A, M, E>;

export type SeedStore = EnhancedStore<SeedState, any, any>;
export type SeedDispatch = ((action: Action<"listenerMiddleware/add">) => UnsubscribeListener) & ThunkDispatch<SeedState, unknown, UnknownAction>;

export const seedListenerMiddleware = createListenerMiddleware();
export const startAppListening = seedListenerMiddleware.startListening.withTypes<SeedState, SeedDispatch>();

export const addAppListener = addListener.withTypes<SeedState, SeedDispatch>();
