// add event listener for mouse events on segments with ID: post messages on these events
function postMessageOnSegmentEvent() {
    console.log("add event listener for mouse over and mouse out events: post messages on these events");
    document.body.addEventListener("mouseover", function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	if (targetElement.hasAttribute('id')) {
	    parent.postMessage({ ...msg, "event": "mouse-over-segment", "segment-id": targetElement.id }, window.location.href);
	}
    });
    document.body.addEventListener("mouseout", function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	if (targetElement.hasAttribute('id')) {
	    parent.postMessage({ ...msg, "event": "mouse-out-segment", "segment-id": targetElement.id }, window.location.href);
	}
    });
    document.body.addEventListener("click", function(e) {
	e = e || window.event;
	var targetElement = e.target || e.srcElement;
	if (targetElement.hasAttribute('id')) {
	    parent.postMessage({ ...msg, "event": "click-segment", "segment-id": targetElement.id }, window.location.href);
	}
    });
}
window.addEventListener("load", (event) => {
    postMessageOnSegmentEvent();
});
