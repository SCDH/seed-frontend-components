import { expect, test } from "vitest";

import {
    initialSearchQuery,
    solrSearchQuery,
} from "../../src/redux/searchTypes";

test("should return default query", () => {
    var qs = solrSearchQuery(initialSearchQuery);
    expect(qs).toContain("?q=*%3A*");
    expect(qs).toContain("&q.op=OR");
    expect(qs).toContain("&facet=true");
    expect(qs).toContain("&params=");
    expect(qs).toEqual("?q=*%3A*&q.op=OR&fl=id,&facet=true&params=");
});

test("should have filter query parameter from fq property", () => {
    var query = initialSearchQuery;
    query.fq = "pi:3.14";
    var qs = solrSearchQuery(query);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=pi:3.14");
});

test("should have filter query parameter from _fq_facets parameter", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { persons: ["Major", "Sergant"] };
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).toContain(" OR ");
    expect(qs).toContain('"Major"');
    expect(qs).toContain('"Sergant"');
});

test("should have filter query parameter from _fq_facets parameter with single term", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { persons: ["Major"] };
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).not.toContain(" OR ");
    expect(qs).toContain('"Major"');
    expect(qs).toContain('&fq=persons:("Major")');
});

test("should have filter query parameter from _fq_facets parameter with multiple facets", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { persons: ["Major"], places: ["Kairo"] };
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).not.toContain(" OR ");
    expect(qs).toContain('"Major"');
    expect(qs).toContain('&fq=persons:("Major")');
    expect(qs).toContain("&fq=places:(");
    expect(qs).toContain('"Kairo"');
    expect(qs).toContain('&fq=places:("Kairo")');
});

test("should have filter query parameter from _fq_id", () => {
    var query3 = initialSearchQuery;
    var qs3 = solrSearchQuery(query3);
    expect(qs3).not.toContain("fq=id:dial911");
    query3._fq_id = "dial911";
    qs3 = solrSearchQuery(query3);
    expect(qs3).toContain("fq=id:dial911");
    // facets should be deactivated
    query3._fq_faceted = { persons: ["Major"] };
    qs3 = solrSearchQuery(query3);
    expect(qs3).not.toContain("Major");
    // fq for id should go away again
    query3._fq_id = undefined;
    qs3 = solrSearchQuery(query3);
    // facets should be active again
    expect(qs3).not.toContain("fq=id:dial911");
    expect(qs3).toContain("Major");
});
