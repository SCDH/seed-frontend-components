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

    @property({ type: String, attribute: false })
    position!: string;

    @property({ type: String })
    displayType: string = "";

    @property({ type: Object, attribute: false })
    contentMeta!: Object;

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
	return html`<div>Position: <span class="scroll-position">${this.position} <button @click="${this.syncOthers}">sync others</botton></div>`;
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
	let url: string | null = iframe?.contentWindow?.location.href ?? null;
	if (url !== null) {
	    return new URL(url);
	} else {
	    console.log("no valid location in iframe, using parent location");
	    return new URL(this.content, window.location.href);
	}
    }

    handleMessage=(e: MessageEvent) => {
	// console.log("filtering message: ", e, this.getContentUrl().toString());
	if (this.stripFragment(e.data?.href) == this.stripFragment(this.getContentUrl().toString())) {
	    console.log("text in " + this.id + " was scrolled: ", e.data);
	    this.contentMeta = e.data;
	    this.position = e.data.top;
	}
    }

    stripFragment(url: string): string {
	let pos = url.indexOf("#");
	if (pos >= 0) {
	    return url.substring(0, pos);
	} else {
	    return url;
	}
    }

    syncOthers = (_e: Event) => {
	console.log("syncing others");
	// for sending a message to an iframe, we have to post it on the iframe's content window,
	// cf. https://stackoverflow.com/questions/61548354/how-to-postmessage-into-iframe
	this.dispatchEvent(new CustomEvent('seed-synopsis-sync-scroll', { detail: { ...this.contentMeta, "event": "sync" }, bubbles: true, composed: true }));
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
