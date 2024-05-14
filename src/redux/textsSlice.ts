import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import log from "./logging";

export type TextId = string;

/*
 * The state of a single text widget.
 *
 * TODO: replace or make conform to some emerging standard, like
 * TextAPI (SUB Göttingen).
 */
export interface TextState {

    /*
     * The origin URL, obtained by {Document.location.toString()}.
     *
     * Note: This cannot be of type {Location}, since we have to use a
     * serializable type.
     */
    location: string | null;

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

    doc: string | undefined;
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

export const fetchText = createAsyncThunk<{ textId: string, location: string, doc: string }, { textId: string, location: string}>(
    "texts/fetchText",
    async ({ textId, location }): Promise<{textId: string, location: string, doc: string }> => {
	log.info("fetching text", location);
	const response = await fetch(location);
	return response.text().then((t) => {
	    return { textId: textId, location: location, doc: t };
	});
    }
);

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
		doc: undefined,
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
    extraReducers: (builder) => {
	builder
	    .addCase(
		fetchText.fulfilled,
		(state, action: PayloadAction<{textId: string, location: string, doc: string}>) => {
		    if (state.hasOwnProperty(action.payload.textId)) {
			state[action.payload.textId].location = action.payload.location;
			state[action.payload.textId].doc = action.payload.doc;
		    } else {
			state[action.payload.textId] = {
			    location: action.payload.location,
			    canonicalUrl: undefined,
			    title: undefined,
			    author: undefined,
			    doc: action.payload.doc,
			};
		    }
		})
	    .addCase(
		fetchText.rejected,
		() => {
		    log.error("failed to fetch text");
		})
    }
});

export const { initText, setText } = textsSlice.actions;

export default textsSlice.reducer;
