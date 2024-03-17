import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { Statements } from "./rdfTypes";


/*
 * The {OntologyState} are RDF {Statements}.
 */
export interface OntologyState extends Statements {}

const initialState: OntologyState = {}

/*
 * Fetches an ontology from a given URL and stores it in the ontology state slice.
 */
export const fetchOntology = createAsyncThunk<OntologyState, string>(
    "ontology/fetchResourceCenteredJson",
    async (url:string): Promise<OntologyState> => {
	console.log("fetching ontology from " + url);
	const response = await fetch(url);
	return response.json().then((result) => {
	    return result;
	}).catch(() => {
	    return {};
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
	    fetchOntology.fulfilled,
	    (state, action: PayloadAction<OntologyState>) => {
		//state = action.payload;
		state = { ...state, ...action.payload };
	    }
	)

    },
});

export default ontologySlice.reducer;
