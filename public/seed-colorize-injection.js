// make sure that msg exists before


function seedColorize(e) {
    console.log("seedColorize testing event type: ", e.data?.event);
    if (e.data?.event == "colorize") {
	// get payload from message
	const cssPerSegment = e.data.cssPerSegment;
	console.log("injected colorizing " + window.location.href + " with ", cssPerSegment);
	// iterate over segments to colorize
	for (const segment in cssPerSegment) {
	    console.log("colorizing segment with ID " + segment);
	    var el = document.getElementById(segment);
	    for (const prop in cssPerSegment[segment]) {
		console.log("setting css property %s on segment (%s) with ID %s to %s.", prop, el, segment, cssPerSegment[segment][prop]);
		el.style.setProperty(prop, cssPerSegment[segment][prop], "important");
	    }
	}
    }
}

window.addEventListener("message", seedColorize);
