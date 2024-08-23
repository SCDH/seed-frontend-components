import { startAppListeningType } from "./seed-store";
import { fetchAnnotationsPerSegment, setSegmentsPerAnnotation, TextViewsSlice, AnnotationsPerSegment, SegmentsPerAnnotation } from "./textViewsSlice";

import log from "./logging";


/*
 * A function that adds listener middleware to a {SeedStore}.
 *
 * USAGE: `addTextViewListeners(startAppListening);`
 */
export const addTextViewListeners = (startListening: startAppListeningType) => {
    log.debug("adding listener middleware for the text view slice");

    // add listener middleware for inverting AnnotationsPerSegment and storing it to SegmentsPerAnnotation
    startListening({
	//type: "textViews/fetchAnnotationsPerSegment",
	actionCreator: fetchAnnotationsPerSegment.fulfilled,
	effect: (_action, listenerApi): void => {
	    log.debug("call to annotations middleware");
	    const textViewsSlice: TextViewsSlice = listenerApi.getState().textViews;
	    Object.keys(textViewsSlice).forEach((textViewId: string) => {
		const annotsPerSegment: AnnotationsPerSegment = textViewsSlice[textViewId].annotationsPerSegment;
		// start with empty object
		const segmentsPerAnnot: SegmentsPerAnnotation = {};
		Object.keys(annotsPerSegment).filter(segmentId => segmentId.length > 0).forEach((segmentId: string) => {
		    const annots: Array<string> = annotsPerSegment[segmentId];
		    annots.forEach((annotId: string) => {
			if (segmentsPerAnnot.hasOwnProperty(annotId)) {
			    segmentsPerAnnot[annotId].push(segmentId);
			} else {
			    segmentsPerAnnot[annotId] = new Array<string>(1).fill(segmentId);
			}
		    });
		});
		// write to slice
		listenerApi.dispatch(setSegmentsPerAnnotation({viewId: textViewId, segmentsPerAnnot: segmentsPerAnnot}));
	    });
	}
    });
}
