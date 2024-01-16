// assert that we have a documentMetadata variable
if (typeof documentMetadata === 'undefined') {
    var documentMetadata = {};
}
// make a msg object with metadata; it is used in postMessage channel to identify the source of various events
let msg = { ...documentMetadata, 'origin': window.location.origin, 'href': window.location.href, 'pathname': window.location.pathname };
// add canonical URL if present
let canonicalURL = document.querySelector("link[rel='canonical']");
if (canonicalURL) {
    msg = { ...msg, 'canonical': canonicalURL.getAttribute("href") };
}

// scroll blocks (per default div elements) and their Y positions
if (typeof scrollBlockQuerySelector === "undefined") {
    var scrollBlockQuerySelector = "div";
}
let scrollBlocks;
let scrollBlocksY;
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
            parent.postMessage({ ...msg, 'event': 'scrolled', 'top': scrollBlocks[i].id }, window.location.href);
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
function notifySyncScroll(e) {
    if (e.data?.event == "sync" && e.data?.href !== msg.href) {
        let newPos =  makeScrollTarget(e.data?.top, e.data);
        console.log("performing a sync for " + msg.filename + " aka " + e.data?.source + ", scrolling to: " + newPos);
        location.href = "#"; // bug fix for webkit
        location.href = "#" + newPos;
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
