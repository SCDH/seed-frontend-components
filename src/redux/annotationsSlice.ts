import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { Predications } from "./rdfTypes";
import { CSSDefinition } from "./cssTypes";
import log from "./logging";


export type AnnotationId = string;


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
export interface AnnotationsSlice {

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
     *
     * TODO: Change to {Statements}?
     */
    annotations: { [key: AnnotationId]: Annotation },

    /*
     * For each annotation given by its ID, we store a map of
     * prioritized {CSSStyleDeclaration}s.
     *
     * This is not stored inside the {annotations} property, because
     * it has derived values and we want to be precise on the type no
     * matter how {annotations} look like in the future.
     */
    cssPerAnnotation: { [key: AnnotationId]: { [priority: number]: CSSDefinition } },

}


const initialState: AnnotationsSlice = {

    annotationSelected: null,

    annotationsSelected: [],

    annotationsTransient: [],

    annotations: {},

    cssPerAnnotation: {},

}


/*
 * An async action for fetching **all** annotations from a given URL.
 */
export const fetchAnnotations = createAsyncThunk<any, string>(
    "segments/fetchAnnotations",
    async (url): Promise<{[key: AnnotationId]: Annotation}> => {
	log.info("fetching annotations from ", url);
	const response = await fetch(url);
	return response.json().then((result) => {
	    return result;
	}).catch(() => {
	    log.error("failed to fetch annoations from ", url);
	    return {};
	});
    }
)

const annotationsSlice = createSlice({
    name: "annotations",
    initialState,
    reducers: {
	/*
	 * The {annotationsSelected} action sets the
	 * {AnnotationsSlice.annotationsSelected} property and the
	 * {AnnotationsSlice.annotationSelected} property.
	 */
	annotationsSelected: (state, action: PayloadAction<Array<AnnotationId>>) => {
	    state.annotationsSelected = action.payload;
	    //state.annotationSelected = action.payload[0] || null; // use extra reducer instead!
	},
	/*
	 * The {annotationsSelected} action sets the
	 * {AnnotationsSlice.annotationSelected} property.
	 */
	annotationSelected: (state, action: PayloadAction<AnnotationId>) => {
	    state.annotationSelected = action.payload;
	},
	/*
	 * The {annotationsPassedBy} action sets the
	 * {AnnotationsSlice.annotationsTransient}.
	 */
	annotationsPassedBy: (state, action: PayloadAction<Array<AnnotationId>>) => {
	    state.annotationsTransient = action.payload;
	},
	/*
	 * Sets the {AnnotationSlice.cssByAnnotation} property.
	 */
	setCssForAllAnnotations: (state, action: PayloadAction<{ [key: AnnotationId]: { [priority: number]: CSSDefinition } }>) => {
	    state.cssPerAnnotation = action.payload;
	},
    },
    extraReducers: (builder) => {
	// Note: When using addCase, the type parameter of the promise
	// returned by the async thunk and the type paramter of the
	// payload action must be the same.
	builder.addCase(
	    fetchAnnotations.fulfilled,
	    (state, action: PayloadAction<{[key: AnnotationId]: Annotation}>) => {
		state.annotations = action.payload;
	    });
    },
});

export const { annotationsSelected, annotationSelected, annotationsPassedBy, setCssForAllAnnotations } = annotationsSlice.actions;

export default annotationsSlice.reducer;
