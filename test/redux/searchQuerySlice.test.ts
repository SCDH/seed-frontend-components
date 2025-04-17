import { expect, test } from "vitest";

import { SearchQuery, initialSearchQuery } from "../../src/redux/searchTypes";
import reducer, {
    addFilter,
    removeFilter,
    addFl,
} from "../../src/redux/searchQuerySlice";

test("should return the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual(initialSearchQuery);
});

test("should add search filters", () => {
    var newState: SearchQuery = reducer(
        initialSearchQuery,
        addFilter({ field: "person", term: "Major" }),
    );
    expect(newState).toHaveProperty("_fq_faceted");
    expect(newState?._fq_faceted?.person ?? []).toContain("Major");
    expect(newState._fq_faceted).toEqual({ person: ["Major"] });
    newState = reducer(newState, addFilter({ field: "person", term: "Tom" }));
    expect(newState?._fq_faceted?.person ?? []).toContain("Major");
    expect(newState?._fq_faceted?.person ?? []).toContain("Tom");
});

test("should remove search filters", () => {
    var newState: SearchQuery = reducer(
        initialSearchQuery,
        addFilter({ field: "person", term: "Major" }),
    );
    newState = reducer(newState, addFilter({ field: "person", term: "Tom" }));
    expect(newState?._fq_faceted).toHaveProperty("person");
    expect(newState?._fq_faceted?.person ?? []).toContain("Major");
    expect(newState?._fq_faceted?.person ?? []).toContain("Tom");
    newState = reducer(
        newState,
        removeFilter({ field: "person", term: "Tom" }),
    );
    expect(newState?._fq_faceted).toHaveProperty("person");
    expect(newState?._fq_faceted?.person ?? []).toContain("Major");
    expect(newState?._fq_faceted?.person ?? []).not.toContain("Tom");
    newState = reducer(
        newState,
        removeFilter({ field: "person", term: "Major" }),
    );
    expect(newState?._fq_faceted).not.toHaveProperty("person");
});

test("should add search fields", () => {
    var newState: SearchQuery = reducer(undefined, { type: "unknown" });
    expect(newState.fl).toContain("id");
    expect(newState.fl).toHaveLength(1);
    newState = reducer(newState, addFl(["author"]));
    expect(newState.fl).toContain("id");
    expect(newState.fl).toContain("author");
    expect(newState.fl).toHaveLength(2);
    newState = reducer(newState, addFl(["title", "genre"]));
    expect(newState.fl).toContain("id");
    expect(newState.fl).toContain("author");
    expect(newState.fl).toContain("title");
    expect(newState.fl).toContain("genre");
    expect(newState.fl).toHaveLength(4);
});
