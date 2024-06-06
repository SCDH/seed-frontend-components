import { UnknownAction, ListenerEffectAPI } from "@reduxjs/toolkit";

import { SeedState, SeedDispatch } from "./seed-store";


export type PositionChangedEffect = (_action: UnknownAction, _listenerApi: ListenerEffectAPI<SeedState, SeedDispatch, unknown>) => void | Promise<void>;

export interface WithScrollTarget {

    /* 
     * A property where the text is to scroll to. This may be a reactive property.
     */
    scrollTarget: string | undefined;

}

/*
 * A thunk that returns an function to be used as an effect for
 * middleware that listens to changes on the text position stored in
 * the {synopsisSlice}.
 *
 * USAGE: store.dispatch(addAppListener({actionCreator: scrolled, effect: setScrollTarget(this, this.id)}))
 */
export const setScrollTarget = (view: WithScrollTarget, textViewId: string): PositionChangedEffect => {
    return (_action: UnknownAction, listenerApi: ListenerEffectAPI<SeedState, SeedDispatch, unknown>): void => {
	const synopsisSlice = listenerApi.getState().synopsis;
	if (synopsisSlice.currentPosition === undefined) return;
	// if the current synopsis position comes from this view: quit
	if (synopsisSlice?.currentPosition?.textViewId === textViewId) return;
	// lookup text ID in current view
	const textViewsSlice = listenerApi.getState().textViews;
	const targetTextId: string | undefined = textViewsSlice?.[textViewId]?.textId;
	if (targetTextId === undefined) return;
	// get scroll position of the text to be synced with
	const sourceTextId: string = synopsisSlice?.currentPosition?.textId ?? "unknown";
	const sourceSegmentIds: Array<string> = synopsisSlice?.currentPosition?.segmentIds ?? [];
	// possible by regexAlignment?
	const patterns = synopsisSlice?.regexAlignment?.[sourceTextId]?.[targetTextId] ?? [];
	for (const pattern of patterns) {
	    const re = new RegExp(pattern.matchPattern);
	    for (const sourceSegmentId of sourceSegmentIds) {
		if (re.test(sourceSegmentId)) {
		    view.scrollTarget = sourceSegmentId.replace(re, pattern.replacementPattern);
		    return; // done
		}
	    }
	}
	// possible by mappingAlignment?
	const map = synopsisSlice?.mappingAlignment?.[sourceTextId];
	if (map === undefined) return;
	for (const sourceSegmentId of sourceSegmentIds) {
	    if (map.hasOwnProperty(sourceSegmentId)) {
		view.scrollTarget = map[sourceSegmentId]?.[targetTextId];
		return; // done
	    }
	}
    }
}
