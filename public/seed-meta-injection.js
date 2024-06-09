// Add event listener for sending meta data through the post message channel
// Make sure, that msg object is created first.
window.addEventListener("load", (e) => {
    // add metadata if present
    let canonicalURL = document.querySelector("link[rel='canonical']");
    if (canonicalURL) {
	msg = { ...msg, 'canonicalUrl': canonicalURL.getAttribute("href") };
    }
    let canonicalSource = document.querySelector("link[rel='canonicalSource']");
    if (canonicalSource) {
	msg = { ...msg, 'canonicalSource': canonicalSource.getAttribute("href") };
    }
    let source = document.querySelector("link[rel='source']");
    if (canonicalSource) {
	msg = { ...msg, 'source': source.getAttribute("href") };
    }
    let title = document.querySelector("title");
    if (canonicalURL) {
	msg = { ...msg, 'title': title.innerHTML };
    }

    window.parent.postMessage({ ...msg, 'event': 'meta' }, window.parent.location.href);
});
