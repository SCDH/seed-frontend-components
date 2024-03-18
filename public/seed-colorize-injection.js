// make sure that msg exists before


function seedColorize(e) {
    console.log("seedColorize testing event type: ", e.data?.event);
    if (e.data?.event == "colorize") {
	annotationsPerSegment = e.data.annotationsPerSegment;
	ontology = e.data.ontology;
	console.log("colorizing " + window.location.href + " with ", annotationsPerSegment);
	for (const segment in annotationsPerSegment) {
	    console.log("colorizing segment with ID " + segment);
	    const el = document.getElementById(segment);
	    el.style["background-color"] = "orange"; // TODO
	}
    }
}

window.addEventListener("message", seedColorize);
