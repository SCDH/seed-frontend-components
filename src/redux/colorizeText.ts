import { SegmentsSlice, SegmentsState, Annotation, SegmentsCss, setCssForAllSegments, setCssForAllAnnotations } from "./segmentsSlice";
import { OntologyState } from "./ontologySlice";
import { Predications } from "./rdfTypes";
import { CSSDefinition } from "./cssTypes";

export const preferredColorPredicate: string = "https://intertextuality.org/annotation#preferredCssColor";
export const colorPriorityPredicate: string = "https://intertextuality.org/annotation#colorPriority";

export const defaultColor: string = "yellow";

/*
 * A thunk for setting the CSS for all annotations. This will update
 * `SegmentsSlice.cssPerAnnotation`.
 *
 * USAGE:
 * `store.dispatch(setCssAnnotationsThunk())`
 */
export const setCssAnnotationsThunk = () => {
    return (dispatch: any, getState: any) => {
	console.log("dispatched setCssAnnotationsThunk");
	const state: { ontology: OntologyState, segments: SegmentsSlice } = getState();
	const { ontology, segments } = state;
	const annotations: { [key: string]: Annotation } = segments.annotations;
	if (annotations !== undefined && Object.keys(ontology).length > 0) {
	    var css: { [key: string]: { [priority: number]: CSSDefinition } } = {};
	    // iterate over annotations to colorize
	    for (const annotId in annotations) {
		console.log("setting CSS for annotation : " + annotId);
		// get the annotation by ID
		const annotation = annotations[annotId];
		css[annotId] = {};
		// collect attributed RDF classes into the tags variable
		var tags: any = {}
		// an annotation may have multiple predicates with multiple objects
		// iterate over the predicates
		for (const pred in annotation.predications) {
		    console.log("testing predicate is annotation class", pred);
		    // iterate over array of RDF objects
		    for (const obj of annotation.predications[pred]) {
			console.log("rdf object", obj);
			if (obj.type === "resource") {
			    const clasUri = obj.value;
			    console.log("rdf class", clasUri);
			    if (ontology.hasOwnProperty(clasUri)) {
				console.log("rdf class in ontology", clasUri, ontology[clasUri]);
				tags[clasUri] = ontology[clasUri];
				var tag: Predications = ontology[clasUri];
				// get the CSS properties: background color
				if (!tag.hasOwnProperty(preferredColorPredicate)) {
				    css[annotId][0] = new CSSStyleDeclaration();
				    css[annotId][0].backgroundColor = defaultColor;
				} else {
				    var priority: number = 0;
				    if (tag.hasOwnProperty(colorPriorityPredicate)) {
					priority = +tag[colorPriorityPredicate][0].value;
				    }
				    css[annotId][priority] = {};
				    css[annotId][priority].backgroundColor = tag[preferredColorPredicate][0].value;
				}
			    }
			}
		    }
		}
		console.log("annotation rdf tags", tags);
	    }
	    dispatch(setCssForAllAnnotations(css));
	}
    }
}

/*
 * A thunk for setting the CSS for all segments of a text widget
 */
export const setCssForAllSegmentsThunk = (textWidget: string) => {
    return (dispatch: any, getState: any) => {
	const state: { ontology: OntologyState, segments: SegmentsSlice } = getState();
	const { ontology, segments } = state;
	const annotsPerSegment: SegmentsState = segments.annotationsPerSegment[textWidget];
	const annotations: { [key: string]: Annotation } = segments.annotations;
	if (annotations !== undefined && Object.keys(ontology).length > 0) {
	    var cssPerSegment: SegmentsCss = {};
	    // iterate over segments to colorize
	    for (const segment in annotsPerSegment) {
		console.log("colorizing segment with ID " + segment);
		// collect tags, i.e. RDF classes attributed to the annotations at the segment
		var tags: any = {}
		// a segment may be targeted by multiple annotations, so
		// iterate over annotations at the segment
		for (const annotId of annotsPerSegment[segment]) {
		    console.log("annotation on segment " + segment + ": " + annotId);
		    // get the annotation by ID
		    const annotation = annotations[annotId];
		    console.log("annotation", annotation);
		    // an annotation may have multiple predicates with multiple objects
		    // iterate over the predicates
		    for (const pred in annotation.predications) {
			console.log("testing predicate is annotation class", pred);
			// iterate over array of RDF objects
			for (const obj of annotation.predications[pred]) {
			    console.log("rdf object", obj);
			    if (obj.type === "resource") {
				const clasUri = obj.value;
				console.log("rdf class", clasUri);
				if (ontology.hasOwnProperty(clasUri)) {
				    console.log("rdf class in ontology", clasUri, ontology[clasUri]);
				    tags[clasUri] = ontology[clasUri];
				}
			    }
			}
		    }
		    console.log("annotation rdf tags", tags);
		}
	    dispatch(setCssForAllSegments({textWidgetId: textWidget, cssPerSegment: cssPerSegment}));
	    }
	}
    }
}

