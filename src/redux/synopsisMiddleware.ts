import { UnknownAction, ListenerEffectAPI } from "@reduxjs/toolkit";

import { SeedState, SeedDispatch } from "./seed-store";


export type PositionChangedEffect = (_action: UnknownAction, _listenerApi: ListenerEffectAPI<SeedState, SeedDispatch, unknown>) => void | Promise<void>;


/*
 * A thunk that returns an function to be used as an effect for
 * middleware that listens to changes on the text position stored in
 * the {synopsisSlice}.
 *
 * USAGE: store.dispatch(addAppListener({actionCreator: scrolled, effect: setScrollTarget(this.id, scrollCallback)}))
 */
export const setScrollTarget = (textViewId: string, scroll: (scrollTo: string) => void): PositionChangedEffect => {
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
		    scroll(sourceSegmentId.replace(re, pattern.replacementPattern));
		    return; // done
		}
	    }
	}
	// possible by mappingAlignment?
	const map = synopsisSlice?.mappingAlignment?.[sourceTextId];
	if (map === undefined) return;
	for (const sourceSegmentId of sourceSegmentIds) {
	    if (map.hasOwnProperty(sourceSegmentId)) {
		scroll(map[sourceSegmentId]?.[targetTextId]);
		return; // done
	    }
	}
    }
}
