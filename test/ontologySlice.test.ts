import { expect, test, describe, vi } from 'vitest';
import { AsyncThunkAction, Dispatch } from '@reduxjs/toolkit';

import { Statements } from '../src/redux/rdfTypes';
import reducer, { fetchResourceCenteredJson } from '../src/redux/ontologySlice';

const defaultState: Statements = {
    "scdh": {
	"macht": [
	    { type: "literal", value: "dev", datatype: "string", lang: undefined },
	    { type: "literal", value: "web-ed", datatype: "string", lang: undefined }
	],
	"macht-nicht": [
	    { type: "literal", value: "ops", datatype: "string", lang: undefined }
	]
    }
};

const extraStatement: Statements = {
    "scdh": {
	"macht-nicht": [
	    { type: "literal", value: "print", datatype: "string", lang: undefined },
	]
    }
};

const sameStatement: Statements = {
    "scdh": {
	"macht-nicht": [
	    { type: "literal", value: "ops", datatype: "string", lang: undefined },
	]
    }
};

const expectedState: Statements = {
    "scdh": {
	"macht": [
	    { type: "literal", value: "dev", datatype: "string", lang: undefined },
	    { type: "literal", value: "web-ed", datatype: "string", lang: undefined }
	],
	"macht-nicht": [
	    { type: "literal", value: "ops", datatype: "string", lang: undefined },
	    { type: "literal", value: "print", datatype: "string", lang: undefined },
	]
    }

};


test("should return the initial state", () => {
    expect(reducer(undefined, { type: "" })).toEqual({});
})


// testing extra reducers is explained in
// https://github.com/reduxjs/redux-toolkit/issues/535

test("should return the ontology passed in", () => {
    const action = { type: fetchResourceCenteredJson.fulfilled.type, payload: defaultState };
    expect(reducer({}, action)).toEqual(defaultState);
})

test("add other object to the previous ontology state", () => {
    const action = { type: fetchResourceCenteredJson.fulfilled.type, payload: extraStatement };
    expect(reducer(defaultState, action)).toEqual(expectedState);
})

// PENDING
test.skip("add same object to the previous ontology state", () => {
    const action = { type: fetchResourceCenteredJson.fulfilled.type, payload: sameStatement };
    expect(reducer(defaultState, action)).toEqual(defaultState);
})

test("what is the type anyway?", () => {
    expect(fetchResourceCenteredJson.fulfilled.type).toEqual("ontology/fetchResourceCenteredJson/fulfilled");
})
