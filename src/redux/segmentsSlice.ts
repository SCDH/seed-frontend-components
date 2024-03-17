import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { TextState, TextsSlice } from "./textsSlice";

/*
 * A segments state is a mapping of segment IDs to annotation IDs for
 * fast lookup which annotations are present on a segment of text.
 */
export interface SegmentsState {

    /*
     * A property of the {SegmentsState} object stores an array of IDs
     * of annotation that target a text segment/span. This serves to
     * fast lookup of annotations when hovering etc. over
     * text segments/spans.
     */
    [segmentId: string]: Array<string>

}

/*
 * RDF Classes predicated on the annotations at text segments. This is
 * used for colourizing/highlighting the text and serves for fast
 * access based on segment IDs.
 */
export interface ClassesPerSegment {

    /*
     * A property of the {ClassesPerSegment} object stores an array of
     * RDF Classes for a text segment. This is to be used for styling
     * the text segments and must provide fast access to CSS features.
     */
    [segmentId: string]: Array<string>
}

/*
 * Interface for {Annotation} objects as stored in the state slice.
 */
export interface Annotation {

    /*
     * The annotation body (comment) as serialized HTML.
     */
    body: string;

    /*
     * RDF predications on the annotation, i.e., classes resp. tags.
     */
    predications: StatementsAboutSubject;

}

/*
 * {StatementsAboutSubject} stores RDF/JSON statements about a
 * resource. This is an object the properties of which are {Array}s of
 * the `any` type.
 */
export interface StatementsAboutSubject {

    /*
     * Property names represent to RDF predicates, values are an
     * object in plural form.
     */
    [predicate: string]: Array<any>

}

/*
 * The segments state slice stores SegmentStates per text widget.
 */
export interface SegmentsSlice {

    /*
     * Per text widget, this maps segment IDs to annotation IDs for
     * fast lookup: Given an segment/span ID, let's have an array of IDs of
     * annotations on that segment/span.
     */
    annotationsPerSegment: { [textWidgetId: string]: SegmentsState },

    /*
     * Per text widget, this maps segment IDs to annotation classes
     * for colorizing/highlighting the text. Given a segment/span ID,
     * let's have the classes, that are asserted to this span through
     * the annotations on it.
     */
    classesPerSegment: { [textWidgetId: string]: ClassesPerSegment },

    /*
     * The ID of the annotation currently selected and fully
     * displayed. This should be persistent until an other
     * annotation is selected.
     */
    annotationSelected: string | null,

    /*
     * A list of IDs of annotations currently selected. This should be
     * persistent until the next selection event.
     */
    annotationsSelected: Array<string>,

    /*
     * A list of IDs of annotations transiently active and transiently
     * displayed. This may vanish, when the mouse pointer moves on.
     */
    annotationsTransient: Array<string>,

    /*
     * A JSON map of annotations.
     */
    annotations: { [key: string]: Annotation }

}


const initialState: SegmentsSlice = {

    annotationsPerSegment: {},

    classesPerSegment: {},

    annotationSelected: null,

    annotationsSelected: [],

    annotationsTransient: [],

    annotations: {}

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

/*
 * An async action for fetching **all** annotations from a given URL.
 */
export const fetchAnnotations = createAsyncThunk<any, string>(
    "segments/fetchAnnotations",
    async (url): Promise<{[key: string]: Annotation}> => {
	console.log("fetching annotations from ", url);
	const response = await fetch(url);
	return response.json().then((result) => {
	    return result;
	}).catch(() => {
	    console.log("failed to fetch annoations from ", url);
	    return {};
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
	builder.addCase(
	    fetchAnnotations.fulfilled,
	    (state, action: PayloadAction<{[key: string]: Annotation}>) => {
		state.annotations = action.payload;
	    });
    },
});

export const { selectAnnotationsAtSegment, transientAnnotationsAtSegment } = segmentsSlice.actions;

export default segmentsSlice.reducer;
