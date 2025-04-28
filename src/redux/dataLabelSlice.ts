import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import log from "./logging";

/*
 * A data label is a label for an identifier used in the data.
 *
 * @example
 *
 * In an digital scholarly edition, named entities are conciliated
 * (mapped to global identifiers from an authority file). At some
 * places, e.g., facet terms, these identifiers are provided by the
 * backend. This slice provides human readable labels, i.e., the
 * names, to the user in the frontend.
 */
export interface DataLabel {
    /*
     * The default label (fallback). Used, when current language is
     * not provided or no language is provided at all.
     */
    default: string;

    /*
     * A mapping of languages to translations of the data label.
     */
    languages: { [lang: string]: string };
}

export interface DataLabelSlice {
    /*
     * A mapping of identifiers to data labels.
     */
    [id: string]: DataLabel;
}

/*
 * Make a `DataLabel` with a default label only or "unknown".
 *
 * @param s - optionally the default label
 */
export function mkDefaultLabel(s?: string): DataLabel {
    if (s !== undefined) {
        return { default: s, languages: {} };
    } else {
        return { default: "unknown", languages: {} };
    }
}

const initialState: DataLabelSlice = {};

/*
 * An async thunk for fetching the data labels from a URL.
 *
 * @example
 * ```
 * dispatch(fetchDataLabels(MyURL))
 * ```
 */
export const fetchDataLabels = createAsyncThunk<
    DataLabelSlice,
    { url: string }
>("dataLabel/fetchDataLabels", async ({ url }): Promise<DataLabelSlice> => {
    log.info("Fetching data labels from", url);
    const response = await fetch(url);
    return response.json().then((obj) => {
        return obj;
    });
});

export const dataLabelSlice = createSlice({
    name: "dataLabel",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                fetchDataLabels.fulfilled,
                (_state, action: PayloadAction<DataLabelSlice>) => {
                    _state = action.payload;
                },
            )
            .addCase(fetchDataLabels.rejected, () => {
                log.error("failed to fetch data labels");
            });
    },
});

export default dataLabelSlice.reducer;
