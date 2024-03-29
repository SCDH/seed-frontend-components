import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { deepmerge } from "deepmerge-ts";

import log from "./logging";
import { Statements } from "./rdfTypes";


/*
 * The {OntologyState} are RDF {Statements}.
 */
export interface OntologyState extends Statements {}

const initialState: OntologyState = {}

/*
 * Fetches an ontology from a given URL and merges it in the ontology state slice.
 */
export const fetchResourceCenteredJson = createAsyncThunk<OntologyState, string>(
    "ontology/fetchResourceCenteredJson",
    async (url:string): Promise<OntologyState> => {
	log.info("fetching ontology from " + url);
	const response = await fetch(url);
	return response.json().then((result: OntologyState) => {
	    log.debug("ontology loaded", result);
	    return result;
	});
    }
);

const ontologySlice = createSlice({
    name: "ontology",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
	builder
	    .addCase(
		fetchResourceCenteredJson.fulfilled,
		(state, action: PayloadAction<OntologyState>) => {
		    // return action.payload;
		    return deepmerge(state, action.payload);
		})
	    .addCase(
		fetchResourceCenteredJson.rejected,
		() => {
		    log.error("failed to load ontology");
		}
	    );
    },
});

export default ontologySlice.reducer;
