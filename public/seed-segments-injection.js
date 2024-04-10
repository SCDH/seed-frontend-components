// add event listener for mouse events on segments/spans
function seedRegisterOnSegmentEvents() {
    console.debug("add event listener for mouse over and mouse out events");
    document.body.addEventListener("mouseover", seedPostMessageOnSegmentEvent("mouse-over-segment"));
    document.body.addEventListener("mouseout", seedPostMessageOnSegmentEvent("mouse-out-segment"));
    document.body.addEventListener("click", seedPostMessageOnSegmentEvent("click-segment"));
}
window.addEventListener("load", (event) => {
    seedRegisterOnSegmentEvents();
});
// this returns the function to be fired on the event
const seedPostMessageOnSegmentEvent = (eventType) => {
    return function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	var ids = seedAncestorOrSelfIds(targetElement, []);
	parent.postMessage({ ...msg, "event": eventType, "segmentIds": ids }, window.location.href);
    };
}
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
