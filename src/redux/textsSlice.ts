import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*
 * The state of a single text widget.
 */
export interface TextState {

    /*
     * The position (id of a fragment) which the text is actually
     * scrolled to.
     */
    scrollPosition: string | null;

    /*
     * The origin URL, obtained by `window.location.origin`.
     */
    origin: string | null;

    /*
     * The href, obtained by `window.location.href`.
     */
    href: string | null;

    /*
     * The pathname, obtained by `window.location.pathname`.
     */
    pathname: string | null;

    /*
     * The canonical URL has present in the header.
     */
    canonicalUrl: string | null;

    /*
     * The title has present in the header.
     */
    title: string | null;
}

/*
 * The {TextsSlice} is a slice of the redux state for keeping state of the
 * texts displayed in the app. The type of it is a mapping of
 * identifiers to {TextState}. So, the state of a text can be accessed by
 * `state.texts[identifier]`.
 *
 * What to use as identifiers? Using the canonical URL would mean that
 * we could not keep different states of two displays of the same
 * text. So the identifier of the text widget would be a better
 * candidate.
 */
interface TextsSlice {
    [key: string]: TextState
}


/*
 * The initial state of the text slice is the empty mapping (empty
 * object).
 */
const initialState: TextsSlice = {
};

const textsSlice = createSlice({
    name: "texts",
    initialState,
    reducers: {
	/*
	 * The {initTextWidget} action adds a text widget of type
	 * {TextState} to the slice. The properties of {TextState} are
	 * all `null`. This action can be called early in the
	 * initialization process, to make sure, that a property with
	 * the ID of the text widget is present in the slice.
	 */
	initTextWidget: (state, action: PayloadAction<{id: string}>) => {
	    state[action.payload.id] = {
		scrollPosition: null,
		origin: null,
		href: null,
		pathname: null,
		canonicalUrl: null,
		title: null };
	},
	/*
	 * The {addText} action adds meta data of a text to the
	 * slice's property for a text widget.
	 */
	addText: (state, action: PayloadAction<{id: string, text: TextState}>) => {
	    state[action.payload.id] = {
		...action.payload.text,
		// The scroll position is to be left untouched. For
		// the {scrolledTo} action might have be called before.
		scrollPosition: state[action.payload.id].scrollPosition
	    };
	},
	/*
	 * The {scrolledTo} action updates the scroll position of a text widget.
	 */
	scrolledTo: (state, action: PayloadAction<{id: string, position: string}>) => {
	    state[action.payload.id].scrollPosition = action.payload.position;
	},
    },
});

export const { initTextWidget, addText, scrolledTo } = textsSlice.actions;

export default textsSlice.reducer;
