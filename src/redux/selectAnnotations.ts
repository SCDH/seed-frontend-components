import { AnnotationsSlice, annotationSelected, annotationsSelected, annotationsPassedBy } from './annotationsSlice';
import { TextViewsSlice } from './textViewsSlice';

/*
 * A redux thunk function that sets the
 * {AnnotationsSlice.selectedAnnotations} property from a given pair
 * of text view ID and segment IDs. Generally, not only a single
 * segment ID should be passed in, but all the IDs of the ancestors of
 * this segment, since annotation segments/spans may nest. The
 * {AnnotationsSlice.selectedAnnotation} will also be updated.  The
 * thunk is intended to be dispatched on click or other selection
 * events on portions of a text.
 */
export const selectAnnotationsAtSegmentThunk = (textViewId: string, subtreeIds: Array<string>) => {
    return (dispatch: any, getState: any) => {
	let state: { textViews: TextViewsSlice, annotations: AnnotationsSlice } = getState();
	const { textViews, annotations } = state;
	let annots: Array<string> = [];
	for (const segmentId of subtreeIds) {
	    annots = annots.concat(textViews?.[textViewId]?.annotationsPerSegment?.[segmentId] ?? []);
	}
	if (annots.length > 0) {
	    dispatch(annotationsSelected(annots));
	    // if none is selected or if previously selected is not in set of selected: show the first in detail
	    if (annotations.annotationSelected == null || (annotations.annotationSelected != null && annots.indexOf(annotations.annotationSelected) === -1)) {
		dispatch(annotationSelected(annots[0]));
	    }
	}
    };
}

/*
 * A redux thunk function that sets the
 * {AnnotationsSlice.transientAnnotations} property from a given pair
 * of text view ID and segment IDs. Generally, not only a single
 * segment ID should be passed in, but all the IDs of the ancestors of
 * this segment, since annotation segments/spans may nest. This
 * function is intended be used to set the state when hovering over
 * portions of a text and to highlight or inform about annotations
 * passed by the mouse pointer.
 */
export const passByAnnotationsAtSegmentThunk = (textViewId: string, subtreeIds: Array<string>) => {
    return (dispatch: any, getState: any) => {
	let state: { textViews: TextViewsSlice } = getState();
	let annots: Array<string> = [];
	for (const segmentId of subtreeIds) {
	    annots = annots.concat(state.textViews?.[textViewId]?.annotationsPerSegment?.[segmentId] ?? []);
	}
	dispatch(annotationsPassedBy(annots));
    };
}
