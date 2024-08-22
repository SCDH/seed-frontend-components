// notify the parent window that the text (document) is fully loaded
window.addEventListener("load", () => {window.parent.postMessage({"event": "loaded"}, window.parent?.location?.href);});
