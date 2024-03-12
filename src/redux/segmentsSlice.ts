import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { TextState, TextsSlice } from "./textsSlice";

/*
 * A segments state is a mapping of segment IDs to annotation IDs for
 * fast lookup which annotations are present on a segment of text.
 */
export interface SegmentsState {

    [segmentId: string]: Array<string>

}

/*
 * The segments state slice stores SegmentStates per text widget.
 */
export interface SegmentsSlice {
    annotationsPerSegment: { [textWidgetId: string]: SegmentsState },

    annotationSelected: string | null,

    annotationsSelected: Array<string>,

    annotationsTransient: Array<string>,

}


const initialState: SegmentsSlice = {

    annotationsPerSegment: {},

    annotationSelected: null,

    annotationsSelected: [],

    annotationsTransient: [],

}

/*
 * A helper interface to access the {TextsSlice} of the redux store.
 */
interface StoreHelper {
    texts: TextsSlice,
}


/*
 * An async action for getting the SegmentState for a text widget's
 * from the backend.
 */
export const getAnnotationsPerSegment = createAsyncThunk<any, string, { state: StoreHelper }>(
    "segments/getAnnotationsPerSegment",
    async (textWidgetId_, { getState }): Promise<{textWidgetId: string, segments: SegmentsState}> => {
	const textSlice: TextsSlice = getState().texts;
	const textState: TextState | null = textSlice[textWidgetId_];
	const docHref: string = textState?.href ?? "";
	const segmentsHref: string = docHref + ".segments.json";
	console.log("fetching annotated segments from ", segmentsHref);
	const response = await fetch(segmentsHref);
	return response.json().then((result) => {
	    return {textWidgetId: textWidgetId_, segments: result};
	}).catch(() => {
	    // If fetching failed, then let's have the empty mapping
	    // of segment IDs to annotations IDs:
	    return {textWidgetId: textWidgetId_, segments: {} };
	});
    }
)

const segmentsSlice = createSlice({
    name: "segments",
    initialState,
    reducers: {
	selectAnnotationsAtSegment: (state, action: PayloadAction<{textWidgetId: string, segmentId: string}>) => {
	    var annots: Array<string> = state.annotationsPerSegment?.[action.payload.textWidgetId]?.[action.payload.segmentId] ?? [];
	    if (annots.length > 0) {
		state.annotationsSelected = annots;
		// if none is selected or if previously selected is not in set of selected: show the first in detail
		if (state.annotationSelected == null || (state.annotationSelected != null && annots.indexOf(state.annotationSelected) === -1)) {
		    state.annotationSelected = annots[0];
		}
	    } else {
		state = state;
	    }
	},
	transientAnnotationsAtSegment: (state, action: PayloadAction<{textWidgetId: string, segmentId: string}>) => {
	    state.annotationsTransient =
		state.annotationsPerSegment?.[action.payload.textWidgetId]?.[action.payload.segmentId] ?? [];
	},
    },
    extraReducers: (builder) => {
	// Note: When using addCase, the type parameter of the promise
	// returned by the async thunk and the type paramter of the
	// payload action must be the same.
	builder.addCase(
	    getAnnotationsPerSegment.fulfilled,
	    (state, action: PayloadAction<{textWidgetId: string, segments: SegmentsState}>) => {
		state.annotationsPerSegment[action.payload.textWidgetId] = action.payload.segments;
	    });
    },
});

export const { selectAnnotationsAtSegment, transientAnnotationsAtSegment } = segmentsSlice.actions;

export default segmentsSlice.reducer;
