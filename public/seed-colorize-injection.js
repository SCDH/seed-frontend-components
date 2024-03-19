// make sure that msg exists before


function seedColorize(e) {
    console.log("seedColorize testing event type: ", e.data?.event);
    if (e.data?.event == "colorize") {
	// get payload from message
	const annotationsPerSegment = e.data.annotationsPerSegment;
	const ontology = e.data.ontology;
	const annotations = e.data.annotations;
	console.log("colorizing " + window.location.href + " with ", annotationsPerSegment);
	// iterate over segments to colorize
	for (const segment in annotationsPerSegment) {
	    console.log("colorizing segment with ID " + segment);
	    const el = document.getElementById(segment);
	    // collect tags, i.e. RDF classes attributed to the annotations at the segment
	    var tags = {}
	    // a segment may be targeted by multiple annotations, so
	    // iterate over annotations at the segment
	    for (const annotId of annotationsPerSegment[segment]) {
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
	    el.style["background-color"] = "orange"; // TODO
	}
    }
}

window.addEventListener("message", seedColorize);
