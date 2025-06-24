import { LitElement, HTMLTemplateResult, html, CSSResultArray, css } from "lit";
import { customElement, query, property, state } from "lit/decorators.js";
import SimpleKeyboard from "simple-keyboard";

import { SimpleKeyboardLayouts } from "simple-keyboard-layouts";

//import * as keyboardStyles from "simple-keyboard/build/css/index.css";
import { keyboardStyles } from "./css/simple-keyboard.styles";
import log from "./logging";

/**
 * The `<seed-keyboard>` custom element allows users to type on a
 * virtual keyboard based on the famous simple-keyboard. Languages are
 * determined by `<seed-keyboard-language>` child elements in the
 * *main* slot.
 *
 * The the shown keyboard icon can be changed by passing content to
 * the `toggle` slot.
 *
 */
@customElement("seed-keyboard")
export class SeedKeyboard extends LitElement {
    @query("#language-chooser")
    private langChooser!: HTMLUListElement;

    @query("#keyboard")
    private keyboardContainer!: HTMLDivElement;

    private keyboard: SimpleKeyboard | undefined = undefined;

    @state()
    private languages: Array<SeedKeyboardLanguage> = [];

    /**
     * Callback called whenever the language chooser button is
     * clicked.
     */
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

    /**
     * @inheritdoc
     */
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
            <button
                class="btn unicode-icon keyboard-language-chooser"
                @click="${this.toggleLangChooser}"
            >
                <slot name="toggle">⌨&nbsp;⏷</slot>
            </button>
            <ul id="language-chooser" style="display:none" class="dropdown">
                ${this.languages.map((l) => {
                    return html`<li>
                        <a @click="${this.createKeyboard(l)}">${l.innerHTML}</a>
                    </li>`;
                })}
            </ul>
            <div id="keyboard" style="display:none" class="keyboard"></div>
            <slot id="languageSlot" @slotchange="${this.setupLanguages}"></slot>
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
    protected createKeyboard(lang: SeedKeyboardLanguage) {
        return (e: Event) => {
            log.debug("setting up keyboard", e.target, lang);
            // hide language chooser
            this.langChooser.style.display = "none";
            // setup keyboard
            const layout = new SimpleKeyboardLayouts().get(lang.layout);
            this.keyboard = new SimpleKeyboard(this.keyboardContainer, {
                onChange: log.info,
                onKeyPress: log.info,
                ...layout,
            });
            log.debug("keyboard set up", this.keyboard.keyboardDOM);
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
            #languageSlot {
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

/**
 * The `<seed-keyboard-language>` is a child element for
 * `<seed-keyboard>` and used for setting the languages of the
 * keyboards.
 */
@customElement("seed-keyboard-language")
export class SeedKeyboardLanguage extends LitElement {
    /**
     * The layout.
     */
    @property()
    layout!: string;
}

declare global {
    interface HTMLElementTagNameMap {
        "seed-keyboard": SeedKeyboard;
        "seed-keyboard-language": SeedKeyboardLanguage;
    }
}
