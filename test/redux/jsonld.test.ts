import { expect, test } from "vitest";

import type { JsonLD } from "../../src/redux/jsonld";
import { graphToResourceObjects } from "../../src/redux/jsonld";

test("transforms JSON-LD graph array to object", () => {
    var cas: JsonLD = {
        "@graph": [
            {
                id: "a",
                counter: 1,
            },
            {
                id: "b",
                counter: 2,
            },
        ],
        "@context": {},
    };
    expect(graphToResourceObjects(cas, "id")).toHaveProperty("a");
    expect(graphToResourceObjects(cas, "id")).toHaveProperty("b");
    expect(graphToResourceObjects(cas, "id")).not.toHaveProperty("@graph");
    expect(graphToResourceObjects(cas, "id")).not.toHaveProperty("@context");
});
