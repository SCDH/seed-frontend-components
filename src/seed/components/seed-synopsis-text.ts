import { html, css, LitElement } from 'lit'
import { CSSResult, query } from 'lit-element'
import { customElement, property } from 'lit/decorators.js'

// define the web component
@customElement("seed-synopsis-text")
export class SeedSynopsisText extends LitElement {

    @property({ type: String })
    content: string = "";

    @property({ type: String })
    source: string = "";

    @property({ type: String })
    id: string = "";

    @property({ type: String })
    position: string = "";

    @property({ type: String })
    displayType: string = "";

    connectedCallback() {
	super.connectedCallback();
	window.addEventListener("message", this.handleMessage);
    }

    disconnectedCallback() {
	window.removeEventListener("message", this.handleMessage);
	super.disconnectedCallback();
    }

    styleTemplate() {
	return html`<style>:host { display: inline-block; width: 33%; height: 100%; }</style>`;
    }

    headerTemplate() {
	return html`<div><span>${this.id}:</span> <span>${this.source}</span>`;
    }

    iframeTemplate() {
	return html`<div class="content-container" id="${this.id}-content-container"><iframe src="${this.content}" id="${this.id}-content" width="98%" height="100%" allowfullscreen="allowfullscreen"></iframe></div>`;
    }

    footerTemplate() {
	return html`<div>Position: <span>${this.position} <button @click="${this.syncOthers}">sync others</botton></div>`;
    }

    render() {
	return html`${this.styleTemplate()}<div class="synopsis-text-container">${this.headerTemplate()}${this.iframeTemplate()}${this.footerTemplate()}</div>`;
    }

    getDisplayType() : String {
	return "inline-block";
    }

    @query("iframe")
    iframes!: Array<HTMLIFrameElement>;

    getContentUrl() : URL {
	let iframe: HTMLIFrameElement | null = this.renderRoot?.querySelector("iframe") ?? null;
	if (iframe !== null) {
	    return new URL(this.content, iframe.contentWindow?.location.href);
	} else {
	    return new URL(this.content, window.location.href);
	}
    }

    handleMessage=(e: MessageEvent) => {
	if (e.data?.href == this.getContentUrl().toString()) {
	    console.log("text in " + this.id + " was scrolled: " + e.data);
	    this.position = e.data?.top;
	}
    }

    syncOthers = (_e: Event) => {
	console.log("syncing others");
	var msg = { "event": "sync", "filename": this.content, "source": this.source, "id": this.id, "position": this.position };
	// for sending a message to an iframe, we have to post it on the iframe's content window,
	// cf. https://stackoverflow.com/questions/61548354/how-to-postmessage-into-iframe
	this.dispatchEvent(new CustomEvent('seed-synopsis-sync-scroll', { detail: msg, bubbles: true, composed: true }));
    }


    static styles : CSSResult = css`
:host {
  border: 1px solid lightblue;
}
div.synopsis-text-container {
  height: 100%;
}
div.content-container {
  height: 90%;
}
iframe {
  border: 1px solid silver;
}`

}


declare global {
    interface HTMLElementTagNameMap {
	"seed-synopsis-text": SeedSynopsisText;
    }
}
