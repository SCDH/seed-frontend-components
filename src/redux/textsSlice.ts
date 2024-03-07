import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*
 * The state of a single text widget.
 */
interface TextState {

    /*
     * The position (id of a fragment) which the text is actually
     * scrolled to.
     */
    scrollPosition: string | null;
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
    texts: { [id: string]: TextState };
}


/*
 * The initial state of the text slice is the empty mapping (empty
 * object).
 */
const initialState: TextsSlice = {
    texts: {},
};

const textsSlice = createSlice({
    name: "texts",
    initialState,
    reducers: {
	addText: (state, action: PayloadAction<{id: string, text: TextState}>) => {
	    const singleton: {[key: string]: TextState} = {};
	    singleton[action.payload.id] = action.payload.text;
	    state.texts = {...state.texts, ...singleton};
	},
	scrolledTo: (state, action: PayloadAction<{id: string, position: string}>) => {
	    state.texts[action.payload.id].scrollPosition = action.payload.position;
	},
    },
});

export const { addText, scrolledTo } = textsSlice.actions;

export default textsSlice.reducer;
