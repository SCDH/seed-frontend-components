import { expect, test } from 'vitest';

import { initialSearchQuery, solrSearchQuery } from '../../src/redux/searchTypes';

test("should return default query", () => {
    var qs = solrSearchQuery(initialSearchQuery);
    expect(qs).toContain("?q=*%3A*");
    expect(qs).toContain("&q.op=OR");
    expect(qs).toContain("&facet=true");
    expect(qs).toContain("&params=");
    expect(qs).toEqual("?q=*%3A*&q.op=OR&fl=id,&facet=true&params=");
})

test("should have filter query parameter from fq property", () => {
    var query = initialSearchQuery;
    query.fq="pi:3.14";
    var qs = solrSearchQuery(query);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=pi:3.14");
})

test("should have filter query parameter from _fq_facets parameter", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { "persons": new Set(["Major", "Sergant"])};
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).toContain(" OR ");
    expect(qs).toContain("\"Major\"");
    expect(qs).toContain("\"Sergant\"");
})

test("should have filter query parameter from _fq_facets parameter with single term", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { "persons": new Set(["Major"])};
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).not.toContain(" OR ");
    expect(qs).toContain("\"Major\"");
    expect(qs).toContain("&fq=persons:(\"Major\")");
})

test("should have filter query parameter from _fq_facets parameter with multiple facets", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { "persons": new Set(["Major"]), "places": new Set(["Kairo"]) };
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).not.toContain(" OR ");
    expect(qs).toContain("\"Major\"");
    expect(qs).toContain("&fq=persons:(\"Major\")");
    expect(qs).toContain("&fq=places:(");
    expect(qs).toContain("\"Kairo\"");
    expect(qs).toContain("&fq=places:(\"Kairo\")");
})
