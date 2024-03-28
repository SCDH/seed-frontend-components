import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export type TextId = string;

/*
 * The state of a single text widget.
 *
 * TODO: replace or make conform to some emerging standard, like
 * TextAPI (SUB Göttingen).
 */
export interface TextState {

    /*
     * The origin URL, obtained by `window.location.origin`.
     */
    location: Location | null;

    /*
     * The canonical URL has present in the header.
     */
    canonicalUrl: string | undefined;

    /*
     * The title of the text.
     */
    title: string | undefined;

    /*
     * The author of the text.
     */
    author: string | undefined;
}

/*
 * The {TextsSlice} is a slice of the redux state for keeping state of the
 * texts displayed in the app. The type of it is a mapping of
 * identifiers to {TextState}. So, the state of a text can be accessed by
 * `state.texts[identifier]`.
 *
 * What to use as identifiers? The canonical URL is a good candidate.
 */
export interface TextsSlice {
    [textId: TextId]: TextState
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
	 * The {initText} action adds a text of type
	 * {TextState} to the slice. The properties of {TextState} are
	 * all `null` or `undefined`. This action can be called early in the
	 * initialization process, to make sure, that a property with
	 * the ID of the text is present in the slice.
	 */
	initText: (state, action: PayloadAction<{textId: TextId}>) => {
	    state[action.payload.textId] = {
		location: null,
		canonicalUrl: undefined,
		title: undefined,
		author: undefined,
	    };
	},
	/*
	 * The {setText} action adds meta data of a text to the
	 * slice's property for a text ID.
	 */
	setText: (state, action: PayloadAction<{textId: TextId, text: TextState}>) => {
	    state[action.payload.textId] = action.payload.text;
	},
    },
});

export const { initText, setText } = textsSlice.actions;

export default textsSlice.reducer;
