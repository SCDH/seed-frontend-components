// This sets up sending and receiving scroll information through the post message channel.
// Make sure to create a msg object before, e.g., seed-synopsis-meta.js!

// scroll blocks (per default div elements) and their Y positions
if (typeof scrollBlockQuerySelector === "undefined") {
    var scrollBlockQuerySelector = "div";
}
let scrollBlocks = [];
let scrollBlocksY = [];
function getScrollBlocksYPositions() {
    scrollBlocksY = scrollBlocks.map(d => d.offsetTop);
}

// callback for scroll events: send position through postMessage channel
function notifyScrolled() {
    console.log("scrolled");
    let y = window.scrollY;
    // get the first div that is visible
    for (i=0; i < scrollBlocks.length; i++) {
        if (scrollBlocksY[i] >= y && scrollBlocks[i].id != "") {
            console.log("scrolled to " + i + "th div: " + scrollBlocks[i].id);
            // pass a message using the postMessage channel, cf. https://davidwalsh.name/window-iframe
            window.parent.postMessage({ ...msg, 'event': 'scrolled', 'top': scrollBlocks[i].id }, window.parent.location.href);
            break;
        }
    }
}
// register callback for scroll events
let scrollTimeout = null;
window.addEventListener("scroll", (event) => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(notifyScrolled, 250);
});

// callback for scroll-sync message
// we cannot set location.href when iframe.srcdoc is used. Using window.scroll instead
function notifySyncScroll(e) {
    if (e.data?.event == "sync") {
	const y = document.getElementById(e.data?.scrollTarget ?? "unknown")?.offsetTop;
	console.debug("scrolling to " + e.data?.scrollTarget + " at height " + y);
	if (y !== null) {
	    window.scroll(0, y);
	}
    }
}

window.addEventListener("message", notifySyncScroll);

// get scroll blocks on window onload and resize events
window.addEventListener("load", (event) => {
    scrollBlocks = Array.from(document.querySelectorAll(scrollBlockQuerySelector));
    getScrollBlocksYPositions();
    notifyScrolled();
});
window.addEventListener("resize", (event) => {
    getScrollBlocksYPositions();
    notifyScrolled();
});
