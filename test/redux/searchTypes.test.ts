import { expect, test } from "vitest";

import {
    initialSearchQuery,
    solrSearchQuery,
} from "../../src/redux/searchTypes";

test("should return default query", () => {
    var qs = solrSearchQuery(initialSearchQuery);
    expect(qs).toContain("?defType=edismax");
    expect(qs).toContain("&q=*");
    expect(qs).toContain("&q.op=OR");
    expect(qs).toContain("&facet=true");
    expect(qs).toContain("&params=");
    expect(qs).toEqual(
        "?defType=edismax&q=*&q.op=OR&fl=id,&facet=true&params=",
    );
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
    expect(qs).toContain("OR");
    expect(qs).toContain("Major");
    expect(qs).toContain("Sergant");
});

test("should have filter query parameter from _fq_facets parameter with single term", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { persons: ["Major"] };
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).not.toContain(" OR ");
    expect(qs).toContain("Major");
    expect(qs).toContain("&fq=persons:(");
});

test("should have filter query parameter from _fq_facets parameter with multiple facets", () => {
    var query2 = initialSearchQuery;
    query2._fq_faceted = { persons: ["Major"], places: ["Kairo"] };
    var qs = solrSearchQuery(query2);
    expect(qs).toContain("&fq=");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).not.toContain(" OR ");
    expect(qs).toContain("Major");
    expect(qs).toContain("&fq=persons:(");
    expect(qs).toContain("&fq=places:(");
    expect(qs).toContain("Kairo");
    expect(qs).toContain("&fq=places:(");
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

test("should change query parser parameter defType", () => {
    var query4 = initialSearchQuery;
    var qs4 = solrSearchQuery(query4);
    expect(qs4).toContain("?defType=edismax");
    query4.defType = "dismax";
    qs4 = solrSearchQuery(query4);
    expect(qs4).toContain("?defType=dismax");
});

test("should have default field or query fields depending on parameter defType", () => {
    var query5 = initialSearchQuery;
    query5.defType = undefined; // why needed? initialSearchQuery set by test before?
    var qs5 = solrSearchQuery(query5);
    expect(qs5).toContain("?defType=lucene");
    query5.defType = "dismax";
    qs5 = solrSearchQuery(query5);
    expect(qs5).toContain("?defType=dismax");
    expect(qs5).not.toContain("&df=");
    expect(qs5).not.toContain("&qf=");
    query5.df = "about_hts_de";
    query5.qf = ["about_hts_de", "about_hts_en^3.1515"];
    qs5 = solrSearchQuery(query5);
    //expect(qs5).toContain("&qf=\"about_hts_de about_hts_en^3.1515 \"");
    expect(qs5).not.toContain("&df=");
    query5.defType = "lucene";
    qs5 = solrSearchQuery(query5);
    //expect(qs5).not.toContain("&qf=");
    expect(qs5).toContain("&df=about_hts_de");
});
