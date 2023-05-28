// callback for hover events: post a message to the parent window
function notifyMouseOverAnnotated(e) {
    console.log("mouse over annotated element", e, e.target.id);
    parent.postMessage({ ...msg, "event": "mouse-over-annotated", "annotated-element-id": e.target.id }, window.location.href);
}
// callback for hover events: post a message to the parent window
function notifyMouseOutAnnotated(e) {
    console.log("mouse out annotated element", e, e.target.id);
    parent.postMessage({ ...msg, "event": "mouse-out-annotated", "annotated-element-id": e.target.id }, window.location.href);
}
// register callback to annotated elements
function registerMouseOverAnnotated() {
    console.log("registering mouse over callbacks for annotated elements");
    let annotatableElements = Array.from(document.querySelectorAll("span"));
    //console.log("annotatable elements:", annotatableElements.length);
    for (i = 0; i < annotatableElements.length; i++) {
	// TODO: find other filter than having a background color
	let styles = window.getComputedStyle(annotatableElements[i]);
	let comparison = window.getComputedStyle(document.body).getPropertyValue("background-color");
	if (styles.getPropertyValue("background-color") !== comparison) {
	    console.log("registering mouse over and out callbacks for annotated element", annotatableElements[i].id);
	    annotatableElements[i].addEventListener("mouseover", notifyMouseOverAnnotated)
	    annotatableElements[i].addEventListener("mouseout", notifyMouseOutAnnotated)
	}
    }
}

window.addEventListener("load", (event) => {
    registerMouseOverAnnotated();
});
