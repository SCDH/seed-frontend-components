import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum WindowSize {
    /*
     * Determined/Calculated by the container.
     */
    Container,
    /*
     * Minimized.
     */
    Minimized,
    /*
     * Disposed.
     */
    Disposed
}

export interface WidgetState {

    /*
     * The class name of the widget, as obtained by `my-widget-instance.constructor.name`.
     */
    widgetConstructor: string;

    /*
     * A controlled value describing the state of the window.
     */
    windowSize?: WindowSize;

    /*
     * Width of the widget in px.
     */
    width: number;

    /*
     * Height of the widget in px.
     */
    height: number;

    /*
     * widget Id of the parent widget.
     */
    parentId: string;

    /*
     * Whether or not the widget processes/determines parts of the
     * widget state of its children.
     */
    processesChildren: boolean;

}


export interface WidgetsSlice {

    [widgetId: string]: WidgetState
}

const initialState: WidgetsSlice = {};

const widgetsSlice = createSlice({
    name: "widgets",
    initialState,
    reducers: {
	initWidget: (state, action: PayloadAction<{widgetId: string, widgetState: WidgetState}>) => {
	    state[action.payload.widgetId] = action.payload.widgetState;
	},
	windowSizeUpdated: (state, action: PayloadAction<{widgetId: string, windowSize: WindowSize}>) => {
	    state[action.payload.widgetId].windowSize = action.payload.windowSize;
	},
	sizeUpdated: (state, action: PayloadAction<{widgetId: string, width: number, height: number}>) => {
	    state[action.payload.widgetId].width = action.payload.width;
	    state[action.payload.widgetId].height = action.payload.height;
	}
    },
});

export const { initWidget } = widgetsSlice.actions;

export default widgetsSlice.reducer;
