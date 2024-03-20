import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { TextState, TextsSlice } from "./textsSlice";
import { Predications } from "./rdfTypes";
import { CSSDefinition } from "./cssTypes";

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

export interface SegmentsCss {

    [segmentId: string]: CSSDefinition,
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
    predications: Predications;

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

    cssPerSegment: { [textWidgetId: string]: SegmentsCss },

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

    /*
     * For each annotation given by its ID, we store a map of
     * prioritized {CSSStyleDeclaration}s.
     */
    cssPerAnnotation: { [key: string]: { [priority: number]: CSSDefinition } }

}


const initialState: SegmentsSlice = {

    annotationsPerSegment: {},

    cssPerSegment: {},

    classesPerSegment: {},

    annotationSelected: null,

    annotationsSelected: [],

    annotationsTransient: [],

    annotations: {},

    cssPerAnnotation: {},

}

/*
 * A helper interface to access the {TextsSlice} of the redux store.
 */
interface StoreHelper {
    texts: TextsSlice,
}


/*
 * DEPRECATED: An async action for getting the SegmentState for a text
 * widget from the backend.
 *
 * This calculates the URL of the JSON object from the document
 * displayed in the text widget.
 */
export const getAnnotationsPerSegment = createAsyncThunk<{textWidgetId: string, segments: SegmentsState}, string, { state: StoreHelper }>(
    // type parameters:
    // 1: type of returned Promise
    // 2: first argument to function, i.e., the type of the argument of the dispatch function
    // 3: type parameter of optional GetAsyncAPI object: state is required to know because we use getState below
    "segments/getAnnotationsPerSegment",
    async (textWidgetId_: string, { getState }): Promise<{textWidgetId: string, segments: SegmentsState}> => {
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
 * An async action for getting the {SegmentState} for a text widget
 * from the backend.
 */
export const fetchAnnotationsPerSegment = createAsyncThunk<{textWidgetId: string, segments: SegmentsState}, {textWidgetId_: string, url: string}>(
    // type parameters:
    // 1: type of returned Promise
    // 2: first argument to function, i.e., the type of the argument of the dispatch function
    "segments/fetchAnnotationsPerSegment",
    async ({textWidgetId_, url}): Promise<{textWidgetId: string, segments: SegmentsState}> => {
	console.log("fetching annotated segments from ", url);
	const response = await fetch(url);
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
	setCssForAllSegments: (state, action: PayloadAction<{textWidgetId: string, cssPerSegment: SegmentsCss}>) => {
	    //Object.assign(state.cssPerSegment[action.payload.textWidgetId], action.payload.cssPerSegment);
	    state.cssPerSegment[action.payload.textWidgetId] = action.payload.cssPerSegment;
	},
	setCssForAllAnnotations: (state, action: PayloadAction<{ [key: string]: { [priority: number]: CSSDefinition } }>) => {
	    Object.assign(state.cssPerAnnotation, action.payload);
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
	    fetchAnnotationsPerSegment.fulfilled,
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

export const { selectAnnotationsAtSegment, transientAnnotationsAtSegment, setCssForAllSegments, setCssForAllAnnotations } = segmentsSlice.actions;

export default segmentsSlice.reducer;
