import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchQuery, initialSearchQuery } from './searchTypes';


export const searchQuerySlice = createSlice({
    name: "searchQuery",
    initialState: initialSearchQuery,
    reducers: {
	setCollection: (state: SearchQuery, action: PayloadAction<string>) => {
	    state.collection = action.payload;
	},
	addFacetFields: (state: SearchQuery, action: PayloadAction<Array<string>>) => {
	    const s = new Set(state.facet_fields);
	    const n = new Set(action.payload);
	    const union = new Set([...s, ...n]);
	    state.facet_fields = Array.from(union);
	},
    }
});

export const { setCollection, addFacetFields } = searchQuerySlice.actions;

export default searchQuerySlice.reducer;
