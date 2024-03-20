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
				    css[annotId][0]["background-color"] = defaultColor;
				} else {
				    var priority: number = 0;
				    if (tag.hasOwnProperty(colorPriorityPredicate)) {
					priority = +tag[colorPriorityPredicate][0].value;
				    }
				    css[annotId][priority] = {};
				    css[annotId][priority]["background-color"] = tag[preferredColorPredicate][0].value;
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
	const { segments }: { segments: SegmentsSlice }  = getState();
	const annotsPerSegment: SegmentsState | undefined = segments.annotationsPerSegment[textWidget];
	const cssPerAnnotation: { [key: string]: { [priority: number]: CSSDefinition } } = segments.cssPerAnnotation;
	if (annotsPerSegment !== undefined && Object.keys(cssPerAnnotation).length > 0) {
	    const cssPerSegment: SegmentsCss = {};
	    // iterate over segments to colorize
	    for (const segment in annotsPerSegment) {
		if (segment !== undefined && segment !== "") {
		    console.log("colorizing segment with ID " + segment);
		    // collect tags, i.e. RDF classes attributed to the annotations at the segment
		    var css: { [key: string]: string } = {}
		    var highestPriority: number = -1;
		    // a segment may be targeted by multiple annotations, so
		    // iterate over annotations at the segment
		    for (const annotId of annotsPerSegment[segment]) {
			console.log("annotation on segment " + segment + ": " + annotId);
			// get the annotation by ID
			const annotationCss: { [priority: number]: CSSDefinition } = cssPerAnnotation[annotId];
			console.log("annotation", annotationCss);
			// an annotation may have multiple predicates with multiple objects
			// iterate over the predicates
			for (const priority in annotationCss) {
			    const priorityTyped: number = +priority;
			    console.log("testing priority", priority);
			    // iterate over array of RDF objects
			    //const cssWithPriority = annotationCss[priority];
			    if (priorityTyped > highestPriority) {
				console.log("priority over CSS already seen");
				// if the current css has priority, add all its definitions to the collected css
				for (const prop in annotationCss[priority]) {
				    console.log("overwriting CSS property with higher priority", prop);
				    css[prop] = annotationCss[priority][prop];
				}
			    } else {
				// otherwise add its definitions, as long as they are not yet in the collected css
				for (const prop in annotationCss[priority]) {
				    if (!css.hasOwnProperty(prop)) {
					console.log("appending unprecedented CSS class with lower priority", prop);
					css[prop] = annotationCss[priority][prop];
				    }
				}

			    }
			}
		    }
		    console.log("setting CSS properties on segment", segment, css);
		    const segmentTyped: string = segment;
		    cssPerSegment[segmentTyped] = css;
		} else {
		    console.warn("bad segment ID %s in text widget %s", segment, textWidget);
		}
	    }
	    dispatch(setCssForAllSegments({textWidgetId: textWidget, cssPerSegment: cssPerSegment}));
	}
    }
}
