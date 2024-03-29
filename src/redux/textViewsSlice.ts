import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { CSSDefinition } from "./cssTypes";
import log from "./logging";


/*
 * The state of a text view.
 *
 * The relation of {Text} to {TextView} is 1 to n: A text may be
 * presented in multiple views, e.g., every view scrolled to an other
 * position of the text or each view displaying on different subset of
 * annotations.
 *
 * The relation of widget or UI component to {TextView} is m to 1: A
 * text view may be determine properties of multiple widgets, e.g.,
 * the scroll position in a readable text (Zoom 0) or a scroll
 * position in a text bar (Zoom 2).
 */
export interface TextViewState {

    /*
     * The identifier for the represented text. This is a foreign key
     * to the text slice.
     */
    textId: string | undefined;

    /*
     * The position (id of a fragment) which the text is actually
     * scrolled to.
     */
    scrollPosition: string | null;

    /*
     * A text view may show only a subset of the annotations on the
     * text while an other text view may show a different subset. The
     * subset may result from an arbitrary query.
     */
    annotations: Array<string>;

    /*
     * Per text view, this maps segment IDs to annotation IDs for fast
     * lookup: Given an segment/span ID, what are the IDs of
     * annotations on that segment/span?
     *
     * The range of annotations is a subset of the {annotations}
     * property.
     *
     * This state property may be changed by UI actions, like adding or
     * removing annotations. It may also be changed by a library for
     * internalizing annotions. It may also be set from an async action,
     * e.g., when when dealing with static data.
     *
     * Despite it may be judged as derived from other state values, it
     * is a key to fast handling of UI events on text views an
     * annotations represented in them.
     */
    annotationsPerSegment: AnnotationsPerSegment;

    /*
     * The CSS attributed to an segment on the base of annotations on
     * it.
     *
     * TODO: As this is derived from ontology, annotations and
     * {annotationsPerSegment} property, this should be removed from a
     * normalized state and moved to a `reselect`-based selector
     * instead. See
     * https://redux.js.org/style-guide/#normalize-complex-nestedrelational-state
     */
    cssPerSegment: { [segmentId: string]: CSSDefinition },

}

/*
 * The type of {TextViewState.annotationsPerSegment} allows a fast lookup of
 * annotations assigned for a given segment or span ID.
 */
export interface AnnotationsPerSegment {

    [segmentId: string]: Array<string>;

}

/*
 * The {TextViewsSlice} is a slice of the redux state for keeping
 * the state of a view on a text.  The type of
 * it is a mapping of view identifiers to {TextViewState}. So, the
 * state of a text view can be accessed by `RootState.textViews[viewId]`.
 *
 * What to use as identifiers? Using the canonical URL would mean that
 * we could not keep different views of the same text. So the
 * identifier of the main text widget, that offers the view, would be
 * a better candidate.
 */
export interface TextViewsSlice {
    [viewId: string]: TextViewState
}


/*
 * The initial state of the text slice is the empty mapping (empty
 * object).
 */
const initialState: TextViewsSlice = {
};


/*
 * An async action for getting the {SegmentState} for a text widget
 * from the backend.
 */
export const fetchAnnotationsPerSegment = createAsyncThunk<{viewId: string, segments: AnnotationsPerSegment}, {viewId_: string, url: string}>(
    // type parameters:
    // 1: type of returned Promise
    // 2: first argument to function, i.e., the type of the argument of the dispatch function
    "textViews/fetchAnnotationsPerSegment",
    async ({viewId_, url}): Promise<{viewId: string, segments: AnnotationsPerSegment}> => {
	log.info("fetching annotated segments from ", url);
	const response = await fetch(url);
	return response.json().then((result: AnnotationsPerSegment) => {
	    return {viewId: viewId_, segments: result};
	}).catch(() => {
	    // If fetching failed, then let's have the empty mapping
	    // of segment IDs to annotations IDs:
	    return {viewId: viewId_, segments: {} };
	});
    }
)


const textViewsSlice = createSlice({
    name: "textViews",
    initialState,
    reducers: {
	/*
	 * The {initTextView} action adds a text view of type
	 * {TextViewState} to the slice. The properties of
	 * {TextViewState} are all `null`. This action can be called
	 * early in the initialization process, to make sure, that a
	 * property with the ID of the text view is present in the
	 * slice.
	 */
	initTextView: (state, action: PayloadAction<{viewId: string}>) => {
	    state[action.payload.viewId] = {
		textId: undefined,
		scrollPosition: null,
		annotations: [],
		annotationsPerSegment: {},
		cssPerSegment: {}
	    };
	},
	/*
	 * The {setText} action sets the text of a text view.
	 */
	setText: (state, action: PayloadAction<{viewId: string, text: string}>) => {
	    state[action.payload.viewId].textId = action.payload.text;
	},
	/*
	 * The {scrolledTo} action updates the scroll position of a text widget.
	 */
	scrolledTo: (state, action: PayloadAction<{viewId: string, position: string}>) => {
	    state[action.payload.viewId].scrollPosition = action.payload.position;
	},
	/*
	 * The {setCssForAllSegments} action updates the
	 * {TextViewState.cssPerSegment} property.
	 */
	setCssForAllSegments: (state, action: PayloadAction<{viewId: string, cssPerSegment: { [segmentId: string]: CSSDefinition }}>) => {
	    state[action.payload.viewId].cssPerSegment = action.payload.cssPerSegment;
	},

    },
    extraReducers: (builder) => {
	builder.addCase(
	    fetchAnnotationsPerSegment.fulfilled,
	    (state, action: PayloadAction<{viewId: string, segments: AnnotationsPerSegment}>) => {
		state[action.payload.viewId].annotationsPerSegment = action.payload.segments;
	    });
    },
});

export const { initTextView, setText, scrolledTo, setCssForAllSegments } = textViewsSlice.actions;

export default textViewsSlice.reducer;
