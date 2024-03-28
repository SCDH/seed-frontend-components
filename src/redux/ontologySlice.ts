import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { deepmerge } from "deepmerge-ts";
import { Graph } from '@entryscape/rdfjson';
import { immerable } from "immer";

// import { Statements } from "./rdfTypes";




/*
 * The {OntologyState} are RDF {Statements}.
 */
export class OntologyState extends Graph {

    [immerable] = true;

    constructor(g: any) {
	super(g);
    }

}

const initialState: OntologyState = new OntologyState({});

/*
 * Fetches an ontology from a given URL and merges it in the ontology state slice.
 */
export const fetchResourceCenteredJson = createAsyncThunk<OntologyState, string>(
    "ontology/fetchResourceCenteredJson",
    async (url:string): Promise<OntologyState> => {
	console.log("fetching ontology from " + url);
	const response = await fetch(url);
	return response.json().then((result) => {
	    console.log("ontology loaded", result);
	    return new OntologyState(result);
	}).catch(() => {
	    console.error("failed to load ontology " + url);
	    return initialState;
	});
    }
);

const ontologySlice = createSlice({
    name: "ontology",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
	builder.addCase(
	    fetchResourceCenteredJson.fulfilled,
	    (state, action: PayloadAction<OntologyState>) => {
		// return action.payload;
		return deepmerge(state, action.payload);
	    }
	)

    },
});

export default ontologySlice.reducer;
