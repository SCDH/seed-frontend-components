// add event listener for mouse events on segments with ID: post messages on these events
function postMessageOnSegmentEvent() {
    console.log("add event listener for mouse over and mouse out events: post messages on these events");
    document.body.addEventListener("mouseover", function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	if (targetElement.hasAttribute('id')) {
	    var idsInSubtree = seedAncestorOrSelfIds(targetElement, []);
	    parent.postMessage({ ...msg, "event": "mouse-over-segment", "segmentId": targetElement.id, "subtreeIds": idsInSubtree }, window.location.href);
	}
    });
    document.body.addEventListener("mouseout", function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	if (targetElement.hasAttribute('id')) {
	    var idsInSubtree = seedAncestorOrSelfIds(targetElement, []);
	    parent.postMessage({ ...msg, "event": "mouse-out-segment", "segmentId": targetElement.id, "subtreeIds": idsInSubtree }, window.location.href);
	}
    });
    document.body.addEventListener("click", function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	if (targetElement.hasAttribute('id')) {
	    var idsInSubtree = seedAncestorOrSelfIds(targetElement, []);
	    parent.postMessage({ ...msg, "event": "click-segment", "segmentId": targetElement.id, "subtreeIds": idsInSubtree }, window.location.href);
	}
    });
}
window.addEventListener("load", (event) => {
    postMessageOnSegmentEvent();
});
/*
 * Recursively collects the IDs from the element and its
 * ancestors. The IDs from ancestors are of interest, since
 * annotations may be nested or attributed to whole paragraphs or
 * divisions.
 */
function seedAncestorOrSelfIds(element, ids) {
    if (! (element instanceof HTMLElement))
        return ids;
    if (element.hasAttribute('id'))
        ids.push(element.id);
    if (! element.parentNode)
        return ids;
    return seedAncestorOrSelfIds(element.parentNode, ids);
}
