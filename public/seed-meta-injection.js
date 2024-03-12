// assert that we have a documentMetadata variable
if (typeof documentMetadata === 'undefined') {
    var documentMetadata = {};
}
// make a msg object with metadata; it is used in postMessage channel to identify the source of various events
let msg = { ...documentMetadata, 'origin': window.location.origin, 'href': window.location.href, 'pathname': window.location.pathname };
// add canonical URL if present
let canonicalURL = document.querySelector("link[rel='canonical']");
if (canonicalURL) {
    msg = { ...msg, 'canonicalUrl': canonicalURL.getAttribute("href") };
}
let title = document.querySelector("title");
if (canonicalURL) {
    msg = { ...msg, 'title': title.innerHTML };
}

window.addEventListener("load", (e) => {
    parent.postMessage({ ...msg, 'event': 'meta' });
});
