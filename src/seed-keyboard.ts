import { LitElement, HTMLTemplateResult, html, CSSResultArray, css } from "lit";
import { customElement, query, property, state } from "lit/decorators.js";
import SimpleKeyboard from "simple-keyboard";

import * as keyboardStyles from "simple-keyboard/build/css/index.css";
import log from "./logging";

@customElement("seed-keyboard")
export class SeedKeyboard extends LitElement {
    @query("#language-chooser")
    langChooser!: HTMLUListElement;

    @query("#keyboard")
    keyboardContainer!: HTMLDivElement;

    private keyboard: SimpleKeyboard | undefined = undefined;

    @state()
    languages: Array<SeedKeyboardLanguage> = [];

    private toggleLangChooser() {
        // also use this method to destroy an open keyboard
        if (this.keyboard !== undefined) {
            this.destroyKeyboard();
        } else if (this.langChooser.style.display == "none") {
            this.langChooser.style.display = "block";
        } else {
            this.langChooser.style.display = "none";
        }
    }

    protected render(): HTMLTemplateResult {
        const ls: Array<Element> | undefined = this.shadowRoot
            ?.querySelector("slot")
            ?.assignedElements();
        log.debug(
            "rendering keyboard with languages",
            this.languages,
            ls,
            this.shadowRoot?.querySelector("slot"),
        );
        return html`
            <button class="btn unicode-icon" @click="${this.toggleLangChooser}">
                ⌨&nbsp;⏷
            </button>
            <ul id="language-chooser" style="display:none" class="dropdown">
                <li>arabic</li>
                ${this.languages.map((l) => {
                    return html`<li>
                        <a @click="${this.showKeyboard(l)}">${l.innerHTML}</a>
                    </li>`;
                })}
            </ul>
            <div id="keyboard" style="display:none" class="keyboard"></div>
            <slot @slotchange="${this.setupLanguages}"></slot>
        `;
    }

    /**
     * Setup languages when the slot is first rendered.
     */
    protected setupLanguages(e: Event): void {
        const ls: Array<Element> = (e.target as HTMLSlotElement)
            .assignedElements()
            .filter((e) => e.tagName.toLowerCase() == "seed-keyboard-language");
        log.debug("keyboard set up with languages:", ls);
        this.languages = ls as Array<SeedKeyboardLanguage>;
    }

    /**
     * Method for creating a keyboard.
     *
     * This is called when a language has been selected.
     */
    protected showKeyboard(lang: SeedKeyboardLanguage) {
        return (e: Event) => {
            log.debug("setting up keyboard", e.target, lang);
            // hide language chooser
            this.langChooser.style.display = "none";
            // setup keyboard
            this.keyboard = new SimpleKeyboard(this.keyboardContainer, {
                onChange: log.info,
                onKeyPress: log.info,
            });
            log.info("keyboard set up", this.keyboard.keyboardDOM);
            // show keyboard
            this.keyboardContainer.style.display = "block";
        };
    }

    /**
     * Method for destroying the keyboard.
     */
    protected destroyKeyboard() {
        if (this.keyboard !== undefined) {
            // destroy
            this.keyboard.destroy();
            this.keyboard = undefined;
            // hide container
            this.keyboardContainer.style.display = "none";
        }
    }

    static styles: CSSResultArray = [
        keyboardStyles,
        css`
            slot {
                display: none;
            }
            .btn {
                background-color: #ffffff;
                border: none;
            }
            .dropdown,
            .keyboard {
                position: absolute;
                z-index: 1000;
                border: 1px solid var(--dropdown-border-color, lightgray);
                border-radius: 2px;
                background-color: #ffffff;
                padding: 5px;
                font-size: 14px;
                text-align: left;
                list-style: none;
            }
            .dropdown li {
                list-style-image: none;
                list-style-position: outside;
                list-style-type: none;
                padding: 2px 10px;
            }
            .dropdown li:hover {
                background-color: var(--dropdown-hover-bg, lightgray);
            }
            .keyboard {
                max-width: 30em;
            }
        `,
    ];
}

@customElement("seed-keyboard-language")
export class SeedKeyboardLanguage extends LitElement {
    @property()
    layout!: string;
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-keyboard": SeedKeyboard;
        "seed-keyboard-language": SeedKeyboardLanguage;
    }
}
