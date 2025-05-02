import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PrimitiveParamValue = string | number | null;

export type ParamValue = PrimitiveParamValue | Array<PrimitiveParamValue>;

export interface Route {
    params: Record<string, ParamValue>;
    pathname: string;
}

export interface RouterSlice {
    currentRoute?: Route;
    previousRoute?: Route;
}

const initialState: RouterSlice = {};

export const routerSlice = createSlice({
    name: "routes",
    initialState,
    reducers: {
        to: (state, action: PayloadAction<Route>) => {
            state.previousRoute = state.currentRoute;
            state.currentRoute = action.payload;
            return state;
        },
    },
});

export default routerSlice.reducer;

export const { to } = routerSlice.actions;
