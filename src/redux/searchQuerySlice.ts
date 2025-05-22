import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchQuery, initialSearchQuery } from "./searchTypes";

export const searchQuerySlice = createSlice({
    name: "searchQuery",
    initialState: initialSearchQuery,
    reducers: {
        setCollection: (state: SearchQuery, action: PayloadAction<string>) => {
            state.collection = action.payload;
        },
        addFl: (state: SearchQuery, action: PayloadAction<Array<string>>) => {
            state.fl = state.fl.concat(action.payload);
        },
        setFl: (state: SearchQuery, action: PayloadAction<Array<string>>) => {
            if (action.payload.includes("id")) {
                state.fl = action.payload;
            } else {
                state.fl = [...action.payload, "id"];
            }
        },
        simpleQuery: (state: SearchQuery, action: PayloadAction<string>) => {
            state.q = action.payload;
        },
        resetQuery: (state: SearchQuery, _action: PayloadAction<void>) => {
            state.q = initialSearchQuery.q;
        },
        setDefaultField: (
            state: SearchQuery,
            action: PayloadAction<string>,
        ) => {
            state.df = action.payload;
        },
        resetDefaultField: (
            state: SearchQuery,
            _action: PayloadAction<void>,
        ) => {
            state.df = undefined;
        },
        addFacetFields: (
            state: SearchQuery,
            action: PayloadAction<Array<string>>,
        ) => {
            const s = new Set(state.facet_fields);
            const n = new Set(action.payload);
            const union = new Set([...s, ...n]);
            state.facet_fields = Array.from(union);
        },
        addFilter: (
            state: SearchQuery,
            action: PayloadAction<{ field: string; term: string }>,
        ) => {
            if (state._fq_faceted === undefined) {
                state._fq_faceted = {};
                state._fq_faceted[action.payload.field] = [action.payload.term];
            } else {
                if (state._fq_faceted.hasOwnProperty(action.payload.field)) {
                    const s = new Set(state._fq_faceted[action.payload.field]);
                    state._fq_faceted[action.payload.field] = Array.from(
                        s.add(action.payload.term),
                    );
                } else {
                    state._fq_faceted[action.payload.field] = [
                        action.payload.term,
                    ];
                }
            }
        },
        removeFilter: (
            state: SearchQuery,
            action: PayloadAction<{ field: string; term: string }>,
        ) => {
            if (
                state._fq_faceted !== undefined &&
                state._fq_faceted.hasOwnProperty(action.payload.field)
            ) {
                state._fq_faceted[action.payload.field] = state._fq_faceted[
                    action.payload.field
                ].filter((t) => t !== action.payload.term);
                if (state._fq_faceted[action.payload.field].length == 0) {
                    delete state._fq_faceted[action.payload.field];
                }
            }
        },
        addSingleDocFilter: (
            state: SearchQuery,
            action: PayloadAction<string>,
        ) => {
            state._fq_id = action.payload;
        },
        removeSingleDocFilter: (
            state: SearchQuery,
            _action: PayloadAction<void>,
        ) => {
            state._fq_id = undefined;
        },
    },
});

export const {
    setCollection,
    addFl,
    setFl,
    simpleQuery,
    resetQuery,
    setDefaultField,
    resetDefaultField,
    addFacetFields,
    addFilter,
    removeFilter,
    addSingleDocFilter,
    removeSingleDocFilter,
} = searchQuerySlice.actions;

export default searchQuerySlice.reducer;
