import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import log from "./logging";


export interface TextPosition {

    textId: string;

    textViewId: string;

    segmentIds: Array<string>;

}

export interface MappingAlignment {

    [sourceTextId: string]: { [sourceSegmentId: string]: { [targetTextId: string]: string } };

}

export interface RegexAlignment {

    [sourceTextId: string]: { [targetTextId: string]: Array<{
	matchPattern: string;
	replacementPattern: string;
    }>}

}

export interface SynopsisSlice {

    currentPosition: TextPosition | null;

    mappingAlignment: MappingAlignment | undefined;

    regexAlignment: RegexAlignment | undefined;

}

const initialState: SynopsisSlice = {
    currentPosition: null,
    mappingAlignment: undefined,
    regexAlignment: undefined,
}

/*
 * An async thunk for loading an alignment mapping from an `url`.
 */
export const fetchMappingAlignment = createAsyncThunk<any, string>(
    "synopsis/fetchMappingAlignment",
    async (url: string): Promise<MappingAlignment> => {
	log.info("fetching mapping alignment from ", url);
	const response = await fetch(url);
	return response.json().then((result) => {
	    return result;
	});
    }
);

/*
 * An async thunk for loading an regex alignment from an `url`.
 */
export const fetchRegexAlignment = createAsyncThunk<any, string>(
    "synopsis/fetchRegexAlignment",
    async (url: string): Promise<RegexAlignment> => {
	log.info("fetching regex alignment from ", url);
	const response = await fetch(url);
 return response.json().then((result) => {
	    return result;
	});
    }
 );

const synopsisSlice = createSlice({
    name: "synopsis",
    initialState,
    reducers: {
	/*
	 * A reducer/an action that may cause other texts to scroll to
	 * the according position.
	 */
	scrolled: (state, action: PayloadAction<TextPosition>) => {
	    state.currentPosition = action.payload;
	},
	/*
	 * A reducer/an action that causes other texts to scroll to
	 * the according position.
	 */
	syncOthers: (state, action: PayloadAction<TextPosition>) => {
	    state.currentPosition = action.payload;
	},
    },
    extraReducers: (builder) => {
	builder
	    .addCase(
		fetchMappingAlignment.fulfilled,
		(state, action: PayloadAction<MappingAlignment>) => {
		    // return action.payload;
		    state.mappingAlignment = action.payload;
		})
	    .addCase(
		fetchMappingAlignment.rejected,
		() => {
		    log.error("failed to load mapping alignment");
		}
	    )
	    .addCase(
		fetchRegexAlignment.fulfilled,
		(state, action: PayloadAction<RegexAlignment>) => {
		    // return action.payload;
		    state.regexAlignment = action.payload;
		})
	    .addCase(
		fetchRegexAlignment.rejected,
		() => {
		    log.error("failed to load regex alignment");
		}
	    );
    },
});

export const { scrolled, syncOthers } = synopsisSlice.actions;

export default synopsisSlice.reducer;
