import { TextViewsSlice, AnnotationsPerSegment, setCssForAllSegments } from "./textViewsSlice";
import { AnnotationsSlice, AnnotationId, Annotation, setCssForAllAnnotations } from "./annotationsSlice";
import { OntologyState } from "./ontologySlice";
import { Predications } from "./rdfTypes";
import { CSSDefinition } from "./cssTypes";
import log from "./logging";

export const preferredColorPredicate: string = "https://intertextuality.org/annotation#preferredCssColor";
export const colorPriorityPredicate: string = "https://intertextuality.org/annotation#colorPriority";

export const defaultColor: string = "yellow";

/*
 * A thunk for setting the CSS for all annotations. This will update
 * `AnnotationsSlice.cssPerAnnotation`.
 *
 * USAGE:
 * `store.dispatch(setCssAnnotationsThunk())`
 */
export const setCssAnnotationsThunk = () => {
    return (dispatch: any, getState: any) => {
	log.debug("dispatched setCssAnnotationsThunk");
	const state: { ontology: OntologyState, annotations: AnnotationsSlice } = getState();
	const { ontology, annotations } = state;
	const annots: { [key: AnnotationId]: Annotation } = annotations.annotations;
	if (annots !== undefined && Object.keys(ontology).length > 0) {
	    var css: { [key: string]: { [priority: number]: CSSDefinition } } = {};
	    // iterate over annotations to colorize
	    for (const annotId in annots) {
		log.debug("setting CSS for annotation : " + annotId);
		// get the annotation by ID
		const annotation = annots[annotId];
		css[annotId] = {};
		// collect attributed RDF classes into the tags variable
		var tags: any = {}
		// an annotation may have multiple predicates with multiple objects
		// iterate over the predicates
		for (const pred in annotation.predications) {
		    log.debug("testing predicate is annotation class", pred);
		    // iterate over array of RDF objects
		    for (const obj of annotation.predications[pred]) {
			log.debug("rdf object", obj);
			if (obj.type === "resource") {
			    const clasUri = obj.value;
			    log.debug("rdf class", clasUri);
			    if (ontology.hasOwnProperty(clasUri)) {
				log.debug("rdf class in ontology", clasUri, ontology[clasUri]);
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
		log.debug("annotation rdf tags", tags);
	    }
	    dispatch(setCssForAllAnnotations(css));
	}
    }
}

/*
 * A thunk for setting the CSS for all segments of a text view.
 */
export const setCssForAllSegmentsThunk = (textWidget: string) => {
    return (dispatch: any, getState: any) => {
	const { textViews, annotations }: { textViews: TextViewsSlice, annotations: AnnotationsSlice }  = getState();
	const annotsPerSegment: AnnotationsPerSegment | undefined = textViews[textWidget].annotationsPerSegment;
	const cssPerAnnotation: { [key: string]: { [priority: number]: CSSDefinition } } = annotations.cssPerAnnotation;
	if (annotsPerSegment !== undefined && Object.keys(cssPerAnnotation).length > 0) {
	    const cssPerSegment: { [segmentId: string]: CSSDefinition } = {};
	    // iterate over segments to colorize
	    for (const segment in annotsPerSegment) {
		if (segment !== undefined && segment !== "") {
		    log.debug("colorizing segment with ID " + segment);
		    // collect tags, i.e. RDF classes attributed to the annotations at the segment
		    var css: { [key: string]: string } = {}
		    var highestPriority: number = -1;
		    // a segment may be targeted by multiple annotations, so
		    // iterate over annotations at the segment
		    for (const annotId of annotsPerSegment[segment]) {
			log.debug("annotation on segment " + segment + ": " + annotId);
			// get the annotation by ID
			const annotationCss: { [priority: number]: CSSDefinition } = cssPerAnnotation[annotId];
			log.debug("annotation", annotationCss);
			// an annotation may have multiple predicates with multiple objects
			// iterate over the predicates
			for (const priority in annotationCss) {
			    const priorityTyped: number = +priority;
			    log.debug("testing priority", priority);
			    // iterate over array of RDF objects
			    //const cssWithPriority = annotationCss[priority];
			    if (priorityTyped > highestPriority) {
				log.debug("priority over CSS already seen");
				// if the current css has priority, add all its definitions to the collected css
				for (const prop in annotationCss[priority]) {
				    log.debug("overwriting CSS property with higher priority", prop);
				    css[prop] = annotationCss[priority][prop];
				}
			    } else {
				// otherwise add its definitions, as long as they are not yet in the collected css
				for (const prop in annotationCss[priority]) {
				    if (!css.hasOwnProperty(prop)) {
					log.debug("appending unprecedented CSS class with lower priority", prop);
					css[prop] = annotationCss[priority][prop];
				    }
				}

			    }
			}
		    }
		    log.debug("setting CSS properties on segment", segment, css);
		    const segmentTyped: string = segment;
		    cssPerSegment[segmentTyped] = css;
		} else {
		    log.warn("bad segment ID %s in text widget %s", segment, textWidget);
		}
	    }
	    dispatch(setCssForAllSegments({viewId: textWidget, cssPerSegment: cssPerSegment}));
	}
    }
}
