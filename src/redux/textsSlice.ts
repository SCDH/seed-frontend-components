import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*
 * The state of a single text widget.
 */
export interface TextState {

    /*
     * The position (id of a fragment) which the text is actually
     * scrolled to.
     */
    scrollPosition: string;
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
	addText: (state, action: PayloadAction<{id: string, text: TextState}>) => {
	    state[action.payload.id] = action.payload.text;
	},
	scrolledTo: (state, action: PayloadAction<{id: string, position: string}>) => {
	    state[action.payload.id].scrollPosition = action.payload.position;
	},
    },
});

export const { addText, scrolledTo } = textsSlice.actions;

export default textsSlice.reducer;
