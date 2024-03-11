import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";


/*
 * A segments state is a mapping of segment IDs to annotation IDs for
 * fast lookup which annotations are present on a segment of text.
 */
export interface SegmentsState {

    [segmentId: string]: Array<string>

}

/*
 * The segments state slice stores SegmentStates per text widget.
 */
export interface SegmentsSlice {
    [textWidgetId: string]: SegmentsState
}


const initialState: SegmentsSlice = {}


/*
 * An async action for getting the SegmentState for a text widget's
 * from the backend.
 */
export const getAnnotationsPerSegment = createAsyncThunk(
    "segments/getAnnotationsPerSegment",
    async (textWidgetId: string): Promise<{textWidgetId: string, segments: SegmentsState}> => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	var segs: SegmentsState = {}; // TODO
	return { textWidgetId: textWidgetId, segments: segs };
    }
)


const segmentsSlice = createSlice({
    name: "segments",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
	// when using addCase, the type parameter of the promise
	// returned by the async thunk and the type paramter of the
	// payload action must be the same.
	builder.addCase(
	    getAnnotationsPerSegment.fulfilled,
	    (state, action: PayloadAction<{textWidgetId: string, segments: SegmentsState}>) => {
		state[action.payload.textWidgetId] = action.payload.segments;
	});
    },
});


export default segmentsSlice.reducer;
