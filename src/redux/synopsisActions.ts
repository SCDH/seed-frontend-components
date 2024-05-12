import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

import { TextPosition } from './synopsisSlice';
import { TextViewsSlice } from './textViewsSlice';
import log from "./logging";

/*
 * A thunk that sets the current position in the {synopsisSlice} from
 * a text view Identifier and segment Identifiers as needed in a text
 * view.
 *
 * USAGE: scrolledTextViewThunk(scrolled, "myViewId", ["mySegmentContainer", "mySegment"])
 *
 * where `action` is a reference to a action exported by the synopsis slice.
 */
export const scrolledTextViewThunk = (action: ActionCreatorWithPayload<TextPosition, string>, textViewId: string, segmentIds: Array<string>) => {
    return (dispatch: any, getState: any) => {
	let state: { textViews: TextViewsSlice } = getState();
	const { textViews } = state;
	const textId: string | undefined = textViews?.[textViewId]?.textId;
	if (textId === undefined) {
	    log.error("no text found for textId ", textId);
	    return;
	} else {
	    const position: TextPosition = {
		textId: textId,
		segmentIds: segmentIds,
	    };
	    dispatch(action(position));
	}
    };
}
